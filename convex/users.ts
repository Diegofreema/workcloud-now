import { v } from 'convex/values';

import { Id } from '~/convex/_generated/dataModel';
import { internalMutation, mutation, query, QueryCtx } from '~/convex/_generated/server';

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
    first_name: v.optional(v.string()),
    last_name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('users', {
      ...args,
    });
  },
});

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

        return {
          createdAt: connection._creationTime,
          id: connection._id,
          organisation,
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
    first_name: v.string(),
    last_name: v.string(),
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
    const worker = await ctx.db
      .query('workers')
      .filter((q) => q.eq(q.field('userId'), args.id))
      .unique();
    if (!worker) return null;
    const user = await getUserForWorker(ctx, worker.userId);
    const organisation = await getOrganisations(ctx, worker?.organizationId!);
    let orgs = null;
    if(organisation?.avatar.startsWith('http')){
      orgs = organisation
    }else{
      const organizationImg = await ctx.storage.getUrl(organisation?.avatar as Id<'_storage'>)
      orgs = {
        ...organisation,
        avatar: organizationImg
      }
    }
    if (!user) return null;
    const { _creationTime, imageUrl, ...rest } = user;

    if (imageUrl && imageUrl.startsWith('http')) {
      return {
        user: {
          imageUrl,
          ...rest,
        },
        ...worker,
        organization: orgs,
      };
    } else {
      const url = await ctx.storage.getUrl(user.imageUrl as Id<'_storage'>);

      return {
        user: {
          imageUrl: url,
          ...rest,
        },
        ...worker,
        organization: orgs,
      };
    }
  },
});

const getUserForWorker = async (ctx: QueryCtx, userId: Id<'users'>) => {
  return await ctx.db.get(userId);
};
