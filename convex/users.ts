import { v } from 'convex/values';

import { Id } from '~/convex/_generated/dataModel';
import { internalMutation, mutation, query, QueryCtx } from '~/convex/_generated/server';
import { getImageUrl } from '~/convex/organisation';

export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('users').collect();
  },
});

export const createUser = internalMutation({
  args: {
    email: v.string(),
    clerkId: v.string(),
    imageUrl: v.optional(v.string()),
    name: v.string(),
    isOnline: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('users', {
      ...args,
    });
  },
});
// export const setOnline = internalMutation({
//   args: {
//     id: v.id('users'),
//   },
//   handler: async (ctx, args) => {
//     return await ctx.db.patch(args.id, {
//       isOnline: true,
//     });
//   },
// });

export const getUserByClerkId = query({
  args: {
    clerkId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .filter((q) => q.eq(q.field('clerkId'), args.clerkId))
      .unique();
    if (!user?.imageUrl || user.imageUrl.startsWith('http')) {
      return user;
    }

    const url = await ctx.storage.getUrl(user.imageUrl as Id<'_storage'>);

    return {
      ...user,
      imageUrl: url,
    };
  },
});
export const getUserById = query({
  args: {
    id: v.id('users'),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.id);
    if (!user?.imageUrl || user.imageUrl.startsWith('http')) {
      return user;
    }

    const url = await ctx.storage.getUrl(user.imageUrl as Id<'_storage'>);

    return {
      ...user,
      imageUrl: url,
    };
  },
});

export const getUserConnections = query({
  args: {
    ownerId: v.optional(v.id('users')),
  },
  handler: async (ctx, args) => {
    const connections = await ctx.db
      .query('connections')
      .filter((q) => q.eq(q.field('ownerId'), args.ownerId))
      .order('desc')
      .collect();
    return await Promise.all(
      connections.map(async (connection) => {
        const organisation = await getOrganisations(ctx, connection.connectedTo);
        const avatar = await getImageUrl(ctx, organisation?.avatar as Id<'_storage'>);
        return {
          connectedAt: connection.connectedAt,
          id: connection._id,
          organisation: {
            ...organisation,
            avatar,
          },
        };
      })
    );
  },
});

const getOrganisations = async (ctx: QueryCtx, organizationId: Id<'organizations'>) => {
  if (!organizationId) return null;
  return await ctx.db.get(organizationId);
};

export const updateUserById = mutation({
  args: {
    _id: v.id('users'),
    name: v.string(),
    phoneNumber: v.optional(v.string()),
    imageUrl: v.optional(v.id('_storage')),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args._id, { ...args });
  },
});

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const updateImage = mutation({
  args: { storageId: v.id('_storage'), _id: v.id('users') },
  handler: async (ctx, args) => {
    await ctx.db.patch(args._id, {
      imageUrl: args.storageId,
    });
  },
});

export const createWorkerProfile = mutation({
  args: {
    userId: v.id('users'),
    experience: v.string(),
    location: v.string(),
    skills: v.string(),
    gender: v.string(),
    email: v.string(),
    qualifications: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('workers', { ...args });
  },
});

export const updateWorkerIdOnUserTable = mutation({
  args: {
    workerId: v.id('workers'),
    _id: v.id('users'),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args._id, { workerId: args.workerId });
  },
});
export const updateWorkerProfile = mutation({
  args: {
    _id: v.id('workers'),
    experience: v.string(),
    location: v.string(),
    skills: v.string(),
    gender: v.string(),
    qualifications: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args._id, {
      experience: args.experience,
      location: args.location,
      skills: args.skills,
      qualifications: args.qualifications,
      gender: args.gender,
    });
  },
});
export const getWorkerProfileWithUser = query({
  args: {
    id: v.id('users'),
  },
  handler: async (ctx, args) => {
    // Fetch worker
    const worker = await ctx.db
      .query('workers')
      .filter((q) => q.eq(q.field('userId'), args.id))
      .first();

    if (!worker) return null;

    // Fetch user
    const user = await getUserForWorker(ctx, worker.userId);
    if (!user) return null;

    // Fetch and process organization
    const organisation = await getOrganisations(ctx, worker?.organizationId!);
    const processedOrganization = organisation
      ? organisation.avatar.startsWith('http')
        ? organisation
        : {
            ...organisation,
            avatar: await ctx.storage.getUrl(organisation.avatar as Id<'_storage'>),
          }
      : null;

    // Process user image
    const { _creationTime, imageUrl, ...userRest } = user;
    const processedImageUrl = imageUrl?.startsWith('http')
      ? imageUrl
      : imageUrl
        ? await ctx.storage.getUrl(imageUrl as Id<'_storage'>)
        : null;

    // Return processed data
    return processedImageUrl
      ? {
          user: {
            imageUrl: processedImageUrl,
            ...userRest,
          },
          ...worker,
          organization: processedOrganization,
        }
      : null;
  },
});

export const getUserForWorker = async (ctx: QueryCtx, userId: Id<'users'>) => {
  return await ctx.db.get(userId);
};
export const getWorkerProfile = async (ctx: QueryCtx, userId: Id<'users'>) => {
  return await ctx.db
    .query('workers')
    .filter((q) => q.eq(q.field('userId'), userId))
    .first();
};
export const getUserByWorkerIdA = async (ctx: QueryCtx, userId: Id<'users'>) => {
  const user = await ctx.db.get(userId);
  if (!user) return null;
  if (user?.imageUrl && user?.imageUrl.startsWith('http')) return user;
  const imageUrl = await getImageUrl(ctx, user.imageUrl as Id<'_storage'>);
  return {
    ...user,
    imageUrl,
  };
};
export const getUserByWorker = async (ctx: QueryCtx, userId?: Id<'users'>) => {
  if (!userId) return null;
  const user = await ctx.db.get(userId);
  if (!user) return null;
  if (user?.imageUrl && user?.imageUrl.startsWith('http')) return user;
  const imageUrl = await getImageUrl(ctx, user.imageUrl as Id<'_storage'>);
  return {
    ...user,
    imageUrl,
  };
};

export const getOrganisationWithoutImageByWorker = async (
  ctx: QueryCtx,
  organizationId: Id<'organizations'>
) => {
  if (!organizationId) return null;
  return await ctx.db.get(organizationId);
};
