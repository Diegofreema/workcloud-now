import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export const User = {
  email: v.string(),
  clerkId: v.string(),
  imageUrl: v.optional(v.string()),
  first_name: v.optional(v.string()),
  last_name: v.optional(v.string()),
  pushToken: v.optional(v.string()),
  organizationId: v.optional(v.id('organizations')),
  workerId: v.optional(v.id('workers')),
  phoneNumber: v.optional(v.string()),
  date_of_birth: v.optional(v.string()),
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
};

export const WaitList = {
  customerId: v.id('users'),
  workspaceId: v.id('workspaces'),
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
  users: defineTable(User),
  organizations: defineTable(Organization)
    .index('ownerId', ['ownerId'])
    .index('by_search_count', ['searchCount']),
  workers: defineTable(Worker),
  workspaces: defineTable(Workspace)
    .index('workspace', ['organizationId', 'ownerId'])
    .index('personal', ['organizationId', 'personal']),
  connections: defineTable(Connection),
  waitlists: defineTable(WaitList),
  servicePoints: defineTable(ServicePoints)
    .searchIndex('description', {
      searchField: 'description',
    })
    .index('by_organisation_id', ['organizationId']),
  roles: defineTable(Role),
  posts: defineTable(Post),
  requests: defineTable(Request),
});
