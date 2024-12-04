import { v } from 'convex/values';

import { mutation, query } from '~/convex/_generated/server';
import { getUserByWorkerIdA, getWorkerProfile } from '~/convex/users';
import {
  getOrganizationByOwnerId,
  getOrganizationByWorkerOrganizationId,
} from '~/convex/organisation';

export const getPendingRequestsAsBoolean = query({
  args: {
    from: v.id('users'),
    to: v.id('users'),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('requests')
      .filter((q) => q.and(q.eq(q.field('from'), args.from), q.eq(q.field('to'), args.to)))
      .first();
  },
});

export const getPendingStaffsWithoutOrganization = query({
  args: {
    id: v.id('users'),
  },
  handler: async (ctx, args) => {
    const res = await ctx.db
      .query('requests')
      .filter((q) => q.and(q.eq(q.field('from'), args.id), q.eq(q.field('pending'), true)))
      .collect();

    return await Promise.all(
      res.map(async (r) => {
        const user = await getUserByWorkerIdA(ctx, r.to);
        const worker = await getWorkerProfile(ctx, r.to);
        return {
          request: r,
          user,
          worker,
        };
      })
    );
  },
});
export const getPendingRequestsWithOrganization = query({
  args: {
    id: v.id('users'),
  },
  handler: async (ctx, args) => {
    const res = await ctx.db
      .query('requests')
      .filter((q) => q.and(q.eq(q.field('to'), args.id), q.eq(q.field('pending'), true)))
      .collect();

    return await Promise.all(
      res.map(async (r) => {
        const organisation = await getOrganizationByOwnerId(ctx, r.from);
        return {
          request: r,
          organisation,
        };
      })
    );
  },
});
// mutations

export const cancelPendingRequests = mutation({
  args: {
    id: v.id('requests'),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

export const createRequest = mutation({
  args: {
    from: v.id('users'),
    to: v.id('users'),
    role: v.string(),
    salary: v.string(),
    responsibility: v.string(),
    qualities: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('requests', {
      ...args,
      accepted: false,
      unread: true,
      pending: true,
    });
  },
});
