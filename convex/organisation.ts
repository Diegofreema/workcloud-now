import { v } from 'convex/values';

import { Id } from '~/convex/_generated/dataModel';
import { mutation, query, QueryCtx } from '~/convex/_generated/server';
import { getUserForWorker } from '~/convex/users';

export const getOrganisationsOrNull = query({
  args: {
    ownerId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const orgs = await ctx.db
      .query('organizations')
      .filter((q) => q.eq(q.field('ownerId'), args.ownerId))
      .first();
    if (!orgs) return null;
    let orgsAvatarUrl = null;
    if (orgs.avatar.startsWith('https')) {
      return {
        ...orgs,
        created_at: orgs._creationTime.toString(),
      };
    }
    if (orgs?.avatar) {
      orgsAvatarUrl = await ctx.storage.getUrl(orgs?.avatar as Id<'_storage'>);
    }
    return {
      _id: orgs._id,
      category: orgs.category,
      created_at: orgs._creationTime.toString(),
      description: orgs.description,
      email: orgs.email,
      end: orgs.end,
      followers: orgs.followers,
      followersCount: orgs.followersCount,
      location: orgs.location,
      name: orgs.name,
      ownerId: orgs.ownerId,
      start: orgs.start,
      website: orgs.website,
      workDays: orgs.workDays,
      workspaceCount: orgs.workspaceCount,
      has_group: orgs.has_group,
      avatar: orgsAvatarUrl,
    };
  },
});

export const getOrganisationById = query({
  args: {
    organisationId: v.id('organizations'),
  },
  handler: async (ctx, args) => {
    const organisation = await ctx.db.get(args.organisationId);
    if (!organisation) return null;
    if (organisation.avatar.startsWith('https')) {
      return organisation;
    }

    const imageUrl = await getImageUrl(ctx, organisation.avatar as Id<'_storage'>);
    return {
      ...organisation,
      avatar: imageUrl,
    };
  },
});
export const getOrganizationWithOwnerAndWorkspaces = query({
  args: {
    ownerId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const result = await ctx.db
      .query('organizations')
      .filter((q) => q.eq(q.field('ownerId'), args.ownerId))
      .first();

    if (!result) return null;

    const [owner, workspaces] = await Promise.all([
      getUserByOwnerId(ctx, result.ownerId),
      getWorkspacesByOrganizationId(ctx, result._id),
    ]);
    if (result.avatar.startsWith('https')) {
      return {
        ...result,
        owner,
        workspaces,
      };
    }

    const avatarUrl = await ctx.storage.getUrl(result.avatar as Id<'_storage'>);
    return {
      ...result,
      avatar: avatarUrl,
      owner,
      workspaces,
    };
  },
});
export const getPostsByOrganizationId = query({
  args: {
    organizationId: v.id('organizations'),
  },
  handler: async (ctx, args) => {
    const res = await ctx.db
      .query('posts')
      .filter((q) => q.eq(q.field('organizationId'), args.organizationId))
      .collect();

    if (!res) return null;
    const data = await Promise.all(
      res.map(async (r) => {
        if (r.image.startsWith('https')) {
          return r;
        }
        const imageUrl = await getImageUrl(ctx, r.image as Id<'_storage'>);

        return {
          ...r,
          image: imageUrl,
        };
      })
    );

    return data;
  },
});

export const getStaffsByBossId = query({
  args: {
    bossId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const res = await ctx.db
      .query('workers')
      .filter((q) =>
        q.and(q.eq(q.field('bossId'), args.bossId), q.neq(q.field('userId'), args.bossId))
      )
      .collect();
    return await Promise.all(
      res.map(async (worker) => {
        const userProfile = await getUserForWorker(ctx, worker.userId);
        const organization = await getOrganizationByWorkerOrganizationId(
          ctx,
          worker.organizationId!
        );
        const workspace = await getWorkspaceByWorkerWorkspaceId(ctx, worker.workspaceId!);
        if (userProfile?.imageUrl?.startsWith('https')) {
          return {
            ...worker,
            user: userProfile,
            organization,
            workspace,
          };
        }
        const imageUrl = await getImageUrl(ctx, userProfile?.imageUrl as Id<'_storage'>);
        return {
          ...worker,
          user: {
            ...userProfile,
            imageUrl,
          },
          organization,
          workspace,
        };
      })
    );
  },
});
//  mutations

export const createOrganization = mutation({
  args: {
    avatar: v.id('_storage'),
    category: v.string(),
    description: v.string(),
    email: v.string(),
    end: v.string(),
    location: v.string(),
    name: v.string(),
    ownerId: v.id('users'),
    start: v.string(),
    website: v.string(),
    workDays: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('organizations', {
      ...args,
      has_group: false,
      workspaceCount: 0,
      followersCount: 0,
    });
  },
});

export const updateUserTableWithOrganizationId = mutation({
  args: {
    userId: v.id('users'),
    organizationId: v.id('organizations'),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.userId, { organizationId: args.organizationId });
  },
});

export const updateOrganization = mutation({
  args: {
    organizationId: v.id('organizations'),
    avatar: v.union(v.id('_storage'), v.string()),
    category: v.string(),
    description: v.string(),
    email: v.string(),
    end: v.string(),
    location: v.string(),
    name: v.string(),
    start: v.string(),
    website: v.string(),
    workDays: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.organizationId, {
      avatar: args.avatar,
      location: args.location,
      email: args.email,
      description: args.description,
      name: args.name,
      start: args.start,
      end: args.end,
      website: args.website,
      workDays: args.workDays,
      category: args.category,
    });
  },
});

// posts
export const createPosts = mutation({
  args: {
    organizationId: v.id('organizations'),
    storageId: v.id('_storage'),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('posts', { image: args.storageId, organizationId: args.organizationId });
  },
});

export const deletePosts = mutation({
  args: {
    postId: v.id('posts'),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.postId);
  },
});

// helpers

export const getUserByOwnerId = async (ctx: QueryCtx, ownerId: Id<'users'>) => {
  const result = await ctx.db.get(ownerId);
  if (!result) return null;
  if (result.imageUrl?.startsWith('http')) return result;

  const userAvatarUrl = await ctx.storage.getUrl(result.imageUrl as Id<'_storage'>);
  return {
    ...result,
    imageUrl: userAvatarUrl,
  };
};

export const getWorkspacesByOrganizationId = async (
  ctx: QueryCtx,
  organizationId: Id<'organizations'>
) => {
  return await ctx.db
    .query('workspaces')
    .withIndex('personal', (q) => q.eq('organizationId', organizationId).eq('personal', true))
    .first();
};

export const getImageUrl = async (ctx: QueryCtx, storageId: Id<'_storage'>) => {
  return await ctx.storage.getUrl(storageId);
};

export const getOrganizationByWorkerOrganizationId = async (
  ctx: QueryCtx,
  organizationId: Id<'organizations'>
) => {
  const res = await ctx.db.get(organizationId);
  if (!res) return null;
  if (res.avatar.startsWith('https')) return res;
  const organizationAvatar = await ctx.storage.getUrl(res.avatar as Id<'_storage'>);
  return {
    ...res,
    avatar: organizationAvatar,
  };
};
export const getOrganizationByOwnerId = async (ctx: QueryCtx, id: Id<'users'>) => {
  const res = await ctx.db
    .query('organizations')
    .filter((q) => q.eq(q.field('ownerId'), id))
    .first();
  if (!res) return null;
  if (res.avatar.startsWith('https')) return res;
  const organizationAvatar = await ctx.storage.getUrl(res.avatar as Id<'_storage'>);
  return {
    ...res,
    avatar: organizationAvatar,
  };
};

export const getWorkspaceByWorkerWorkspaceId = async (
  ctx: QueryCtx,
  workspaceId: Id<'workspaces'>
) => {
  if (!workspaceId) return null;
  return await ctx.db.get(workspaceId);
};
