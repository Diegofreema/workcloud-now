import { v } from 'convex/values';

import { Id } from '~/convex/_generated/dataModel';
import { mutation, query, QueryCtx } from '~/convex/_generated/server';

export const getUserWorkspaceOrNull = query({
  args: { workerId: v.id('workers') },
  handler: async (ctx, args) => {
    const res = await ctx.db
      .query('workspaces')
      .filter((q) => q.eq(q.field('workerId'), args.workerId))
      .first();
    if (!res) return null;
    const organization = await organisationByWorkSpaceId(ctx, res?.organizationId);

    return {
      ...res,
      organization,
    };
  },
});

const organisationByWorkSpaceId = async (ctx: QueryCtx, organizationId: Id<'organizations'>) => {
  const organization = await ctx.db.get(organizationId);
  if (!organization || !organization.avatar) return null;
  if (organization.avatar.startsWith('https')) {
    return organization;
  }
  const avatar = await ctx.storage.getUrl(organization.avatar as Id<'_storage'>);
  return {
    ...organization,
    avatar,
  };
};

export const getRoles = query({
  handler: async (ctx) => {
    return await ctx.db.query('roles').collect();
  },
});
// mutation

export const createWorkspace = mutation({
  args: {
    ownerId: v.id('users'),
    organizationId: v.id('organizations'),
    role: v.string(),
    personal: v.boolean(),
    workerId: v.optional(v.id('workers')),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert('workspaces', {
      personal: args.personal,
      role: args.role,
      ownerId: args.ownerId,
      organizationId: args.organizationId,
      locked: !args.personal,
      active: false,
      leisure: false,
      signedIn: false,
      waitlistCount: 0,
      workerId: args.workerId,
    });

    // update worker table with workspace id and boss id
  },
});

export const deleteWorkspace = mutation({
  args: {
    id: v.id('workspaces'),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// helper
// const updateWorkerTableWithBossIdAndWorkspaceId = async (
//   ctx: QueryCtx,
//   bossId: Id<'users'>,
//   workspaceId: Id<'workspaces'>,
//   workerId: Id<'users'>
// ) => {};
