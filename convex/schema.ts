import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export const User = {
  email: v.string(),
  clerkId: v.string(),
  imageUrl: v.optional(v.string()),
  name: v.string(),
  pushToken: v.optional(v.string()),
  organizationId: v.optional(v.id('organizations')),
  workerId: v.optional(v.id('workers')),
  phoneNumber: v.optional(v.string()),
  date_of_birth: v.optional(v.string()),
  isOnline: v.optional(v.boolean()),
  lastSeen: v.optional(v.string()),
};

export const Organization = {
  avatar: v.union(v.id('_storage'), v.string()),
  category: v.string(),
  description: v.string(),
  email: v.string(),
  end: v.string(),
  followers: v.optional(v.array(v.id('users'))),
  followersCount: v.number(),
  location: v.string(),
  name: v.string(),
  ownerId: v.id('users'),
  start: v.string(),
  website: v.string(),
  workDays: v.string(),
  workspaceCount: v.number(),
  has_group: v.boolean(),
  workers: v.optional(v.array(v.id('workers'))),
  searchCount: v.number(),
};

export const Worker = {
  userId: v.id('users'),
  experience: v.string(),
  location: v.string(),
  organizationId: v.optional(v.id('organizations')),
  qualifications: v.string(),
  servicePointId: v.optional(v.id('servicePoints')),
  skills: v.string(),
  workspaceId: v.optional(v.id('workspaces')),
  role: v.optional(v.string()),
  bossId: v.optional(v.id('users')),
  gender: v.string(),
  email: v.string(),
};
export const Post = {
  image: v.union(v.id('_storage'), v.string()),
  organizationId: v.id('organizations'),
};
export const Role = {
  role: v.string(),
};
export const Request = {
  from: v.id('users'),
  to: v.id('users'),
  role: v.string(),
  salary: v.string(),
  responsibility: v.string(),
  qualities: v.string(),
  accepted: v.boolean(),
  unread: v.boolean(),
  pending: v.boolean(),
};
export const Workspace = {
  active: v.boolean(),
  leisure: v.boolean(),
  organizationId: v.id('organizations'),
  ownerId: v.id('users'),
  responsibility: v.optional(v.string()),
  salary: v.optional(v.string()),
  waitlistCount: v.number(),
  role: v.string(),
  workerId: v.optional(v.id('workers')),
  servicePointId: v.optional(v.id('servicePoints')),
  locked: v.boolean(),
  signedIn: v.boolean(),
  personal: v.boolean(),
};
export const Connection = {
  ownerId: v.id('users'),
  connectedTo: v.id('organizations'),
  connectedAt: v.string(),
};

export const WaitList = {
  customerId: v.id('users'),
  workspaceId: v.id('workspaces'),
  joinedAt: v.string(),
};

export const Conversation = {
  name: v.optional(v.string()),
  type: v.string(),
  lastMessage: v.optional(v.string()),
  participants: v.array(v.id('users')),
  lastMessageTime: v.optional(v.number()),
  lastMessageSenderId: v.optional(v.id('users')),
};

export const Message = {
  senderId: v.id('users'),
  recipient: v.id('users'),
  conversationId: v.id('conversations'),
  isEdited: v.optional(v.boolean()),
  content: v.string(),
  contentType: v.string(),
  seenId: v.array(v.id('users')),
  parentMessageId: v.optional(v.id('messages')),
};

export const ServicePoints = {
  description: v.string(),
  externalLink: v.optional(v.boolean()),
  form: v.optional(v.boolean()),
  name: v.string(),
  organizationId: v.id('organizations'),
  service: v.boolean(),
  staff: v.id('workers'),
};

export default defineSchema({
  users: defineTable(User)
    .index('by_workerId', ['workerId'])
    .index('clerkId', ['clerkId'])
    .searchIndex('name', {
      searchField: 'name',
    }),
  organizations: defineTable(Organization)
    .index('ownerId', ['ownerId'])
    .index('by_search_count', ['searchCount']),
  workers: defineTable(Worker).index('by_org_id', ['organizationId']),
  workspaces: defineTable(Workspace)
    .index('workspace', ['organizationId', 'ownerId'])
    .index('personal', ['organizationId', 'personal']),
  connections: defineTable(Connection)
    .index('by_ownerId_orgId', ['ownerId', 'connectedTo'])
    .index('by_createdAt', ['connectedAt']),
  waitlists: defineTable(WaitList).index('by_customer_id_workspace_id', [
    'workspaceId',
    'customerId',
  ]),
  servicePoints: defineTable(ServicePoints)
    .searchIndex('description', {
      searchField: 'description',
    })
    .index('by_organisation_id', ['organizationId']),
  roles: defineTable(Role),
  posts: defineTable(Post).index('by_org_id', ['organizationId']),
  requests: defineTable(Request),
  conversations: defineTable(Conversation),
  messages: defineTable(Message)
    .index('by_conversationId', ['conversationId'])
    .index('by_conversationId_recipient', ['conversationId', 'recipient']),
});
