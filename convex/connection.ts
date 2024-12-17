import { v } from 'convex/values';

import { mutation, query } from '~/convex/_generated/server';

export const getConnection = query({
  args: {
    from: v.id('users'),
    to: v.id('organizations'),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('connections')
      .withIndex('by_ownerId_orgId', (q) => q.eq('ownerId', args.from).eq('connectedTo', args.to))
      .first();
  },
});

// mutation
export const createConnection = mutation({
  args: {
    from: v.id('users'),
    to: v.id('organizations'),
    connectedAt: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('connections', {
      ownerId: args.from,
      connectedTo: args.to,
      connectedAt: args.connectedAt,
    });
  },
});

export const updateConnection = mutation({
  args: {
    id: v.id('connections'),
    time: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      connectedAt: args.time,
    });
  },
});
