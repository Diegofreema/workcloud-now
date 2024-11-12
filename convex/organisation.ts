import { v } from 'convex/values';

import { Id } from '~/convex/_generated/dataModel';
import { mutation, query, QueryCtx } from '~/convex/_generated/server';

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

    const [avatarUrl, owner, workspaces] = await Promise.all([
      ctx.storage.getUrl(result.avatar),
      getUserByOwnerId(ctx, result.ownerId),
      getWorkspacesByOrganizationId(ctx, result._id),
    ]);
    return {
      ...result,
      avatar: avatarUrl,
      owner,
      workspaces,
    };
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
