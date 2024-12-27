import { Id } from '~/convex/_generated/dataModel';
import { QueryCtx } from '~/convex/_generated/server';
import { getUserByUserId } from '~/convex/users';

// helper
export const getWaitlist = async ({
  ctx,
  workspaceId,
}: {
  ctx: QueryCtx;
  workspaceId: Id<'workspaces'>;
}) => {
  const waitlists = await ctx.db
    .query('waitlists')
    .filter((q) => q.eq(q.field('workspaceId'), workspaceId))
    .collect();
  if (!waitlists) return [];
  const usersInWaitlist = waitlists.map(async (waitlist) => {
    const customer = await getUserByUserId(ctx, waitlist.customerId);
    return {
      ...waitlist,
      customer,
    };
  });
  return await Promise.all(usersInWaitlist);
};
