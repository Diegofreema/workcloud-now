import { v } from 'convex/values';

import { Id } from '~/convex/_generated/dataModel';
import { query, QueryCtx } from '~/convex/_generated/server';

export const getUserWorkspaceOrNull = query({
  args: { workerId: v.id('users') },
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
