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
  avatar: v.string(),
  category: v.string(),
  created_at: v.string(),
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
};

export const Worker = {
  userId: v.id('users'),
  experience: v.string(),
  location: v.string(),
  organizationId: v.id('organizations'),
  qualifications: v.string(),
  servicePointId: v.id('servicePoints'),
  skills: v.string(),
  workspaceId: v.id('workspaces'),
  role: v.string(),
  bossId: v.id('users'),
  gender: v.string(),
};

export const Workspace = {
  active: v.boolean(),
  leisure: v.boolean(),
  organizationId: v.id('organizations'),
  ownerId: v.id('users'),
  responsibility: v.string(),
  salary: v.string(),
  waitlistCount: v.number(),
  role: v.string(),
  workerId: v.id('users'),
  servicePointId: v.id('servicePoints'),
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
  staff: v.string(),
};

export default defineSchema({
  users: defineTable(User),
  organizations: defineTable(Organization),
  workers: defineTable(Worker),
  workspaces: defineTable(Workspace),
  connections: defineTable(Connection),
  waitlists: defineTable(WaitList),
  servicePoints: defineTable(ServicePoints),
});
