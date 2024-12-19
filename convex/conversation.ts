import { paginationOptsValidator } from 'convex/server';
import { v } from 'convex/values';

import { mutation, query, QueryCtx } from './_generated/server';

import { Id } from '~/convex/_generated/dataModel';
import { getUserByWorker } from '~/convex/users';

export const getConversations = query({
  args: {
    userId: v.id('users'),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const conversations = await ctx.db
      .query('conversations')
      .filter((q) =>
        q.and(q.neq(q.field('lastMessage'), undefined), q.eq(q.field('type'), 'single'))
      )
      .order('desc')
      .paginate(args.paginationOpts);
    const page = await Promise.all(
      conversations.page
        .filter((m) => m.participants.includes(args.userId))
        .map(async (c) => {
          const otherUserId = c.participants.find((p) => p !== args.userId);
          const otherUser = await getUserByWorker(ctx, otherUserId);
          return {
            id: c._id,
            lastMessage: c.lastMessage,
            name: c.name,
            lastMessageTime: c.lastMessageTime,
            otherUser,
            lastMessageSenderId: c.lastMessageSenderId,
          };
        })
    );
    return {
      ...conversations,
      page,
    };
  },
});

export const getUnreadMessages = query({
  args: {
    conversationId: v.id('conversations'),
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query('messages')
      .withIndex('by_conversationId_recipient', (q) => q.eq('conversationId', args.conversationId))
      .filter((q) => q.neq(q.field('senderId'), args.userId))
      .collect();
    const unseenMessages = messages.filter((m) => !m.seenId.includes(args.userId));

    return unseenMessages.length || 0;
  },
});
export const getUnreadAllMessages = query({
  args: {
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .filter((q) => q.eq(q.field('clerkId'), args.clerkId))
      .first();
    if (!user) return 0;
    const conversations = await ctx.db.query('conversations').collect();
    if (!conversations) return 0;
    const conversationThatLoggedInUserIsIn = conversations.filter((c) =>
      c.participants.includes(user?._id)
    );
    const messagesThatUserHasNotRead = conversationThatLoggedInUserIsIn.map(async (m) => {
      return await getMessagesUnreadCount(ctx, m._id, user?._id);
    });
    const unread = await Promise.all(messagesThatUserHasNotRead);

    return unread.reduce((acc, curr) => acc + curr, 0);
  },
});

export const getSingleConversationWithMessages = query({
  args: {
    loggedInUserId: v.id('users'),
    otherUserId: v.id('users'),
  },
  handler: async (ctx, args) => {
    const conversations = await ctx.db.query('conversations').collect();
    if (!conversations) return null;
    console.log(conversations.length);
    const conversation = conversations.find(
      (c) =>
        (c.participants.length === 2 &&
          c.participants[0] === args.loggedInUserId &&
          c.participants[1] === args.otherUserId) ||
        (c.participants[1] === args.loggedInUserId && c.participants[0] === args.otherUserId)
    );

    if (!conversation) return null;
    const otherUser = await getParticipants(ctx, args.otherUserId);
    return { conversation, otherUser };
  },
});
export const getMessages = query({
  args: {
    conversationId: v.optional(v.id('conversations')),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query('messages')
      .withIndex('by_conversationId', (q) => q.eq('conversationId', args.conversationId!))
      .order('desc')
      .paginate(args.paginationOpts);

    return {
      ...messages,
      page: messages.page.map((m) => ({
        _id: m._id,
        _creationTime: m._creationTime,
        content: m.content,
        contentType: m.contentType,
        conversationId: m.conversationId,
        isEdited: m.isEdited,
        parentMessageId: m.parentMessageId,
        senderId: m.senderId,
        seenId: m.seenId,
        recipient: m.recipient,
      })),
    };
  },
});
export const getMessagesTanstack = query({
  args: {
    conversationId: v.optional(v.id('conversations')),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('messages')
      .withIndex('by_conversationId', (q) => q.eq('conversationId', args.conversationId!))
      .collect();
  },
});
// mutations

export const createSingleConversation = mutation({
  args: {
    loggedInUserId: v.id('users'),
    otherUserId: v.id('users'),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('conversations', {
      participants: [args.loggedInUserId, args.otherUserId],
      type: 'single',
    });
  },
});
export const addSeenId = mutation({
  args: {
    messages: v.array(v.id('messages')),
    id: v.id('users'),
  },
  handler: async (ctx, args) => {
    const updatePromises = args.messages.map(async (m) => {
      const message = await ctx.db.get(m);
      if (!message) return;

      // Use Set to ensure unique IDs
      const uniqueSeenIds = Array.from(new Set([...message.seenId, args.id]));

      await ctx.db.patch(m, {
        seenId: uniqueSeenIds,
      });
    });

    await Promise.all(updatePromises);
  },
});
export const createMessages = mutation({
  args: {
    senderId: v.id('users'),
    recipient: v.id('users'),
    conversationId: v.id('conversations'),
    content: v.string(),
    parentMessageId: v.optional(v.id('messages')),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert('messages', {
      ...args,
      contentType: 'text',
      seenId: [args.senderId],
    });
    await ctx.db.patch(args.conversationId, {
      lastMessage: args.content,
      lastMessageTime: Date.now(),
      lastMessageSenderId: args.senderId,
    });
  },
});

// helpers
const getParticipants = async (ctx: QueryCtx, userId: Id<'users'>) => {
  return await ctx.db.get(userId);
};

const getMessagesUnreadCount = async (
  ctx: QueryCtx,
  conversationId: Id<'conversations'>,
  userId: Id<'users'>
) => {
  const messages = await ctx.db
    .query('messages')
    .filter((q) => q.eq(q.field('conversationId'), conversationId))
    .collect();
  const unreadMessages = messages.filter((m) => !m.seenId.includes(userId));
  return unreadMessages.length || 0;
};
