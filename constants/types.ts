import { Id } from '~/convex/_generated/dataModel';
import { Database } from '~/supabase';

export type connections =
  | {
      name: string;
      image: string;
      id: any;
      time: string;
    }[]
  | null;
export type OwnerType = {
  clerkId: string;
  email: string;
  imageUrl?: string | null;
  name: string;
  organizationId?: string;
  phoneNumber?: string;
  workerId?: Id<'workers'>;
  _creationTime: number;
  _id: Id<'users'>;
};
export type User = {
  _id: Id<'users'>;
  email: string;
  clerkId: string;
  imageUrl?: string | undefined | null;
  name: string;
  pushToken?: string;
  organizationId?: Id<'organizations'>;
  workerId?: Id<'workers'>;
  phoneNumber?: string;
  date_of_birth?: string;
};
export type Organization = {
  _id: Id<'organizations'> | undefined;
  avatar: string | null;
  category: string;
  _creationTime?: number;
  created_at?: string;
  description: string;
  email: string;
  end: string;
  followers?: Id<'users'>[];
  followersCount: number;
  location: string;
  name: string;
  ownerId: Id<'users'>;
  start: string;
  website: string;
  workDays: string;
  workspaceCount: number;
  has_group: boolean;
  searchCount: number;
};

export type WorkSpace = {
  _id: Id<'workspaces'>;
  organization: Organization;
  active: boolean;
  leisure: boolean;
  organizationId: Id<'organizations'>;
  ownerId: Id<'users'>;
  responsibility: string;
  salary: string;
  waitlistCount: number;
  role: string;
  workerId: Id<'users'>;
  servicePointId: Id<'servicePoints'>;
  locked: boolean;
  signedIn: boolean;
  personal: boolean;
};

export type WorkspaceWithoutOrganization = Omit<WorkSpace, 'organization'>;
export type TopSearch = Database['public']['Tables']['organization']['Row'];

export type Connection = {
  id: Id<'connections'>;
  connectedAt: string;
  organisation: Organization | null;
};
export type FullOrgsType = {
  _id: Id<'organizations'>;
  avatar: string | Id<'_storage'>;
  category: string;
  description: string;
  email: string;
  end: string;
  followers?: Id<'users'>[];
  followersCount: number;
  location: string;
  name: string;
  ownerId: Id<'users'>;
  start: string;
  website: string;
  workDays: string;
  workspaceCount: number;
  has_group: boolean;
  workers?: Id<'workers'>[];
  searchCount: number;
};
export type SearchType = {
  id: Id<'organizations'>;
  name: string;
  ownerId: Id<'users'>;
  avatar: string | null;
};
export type Org = {
  subTitle?: string;
  avatar: string;
  category: string;
  created_at: string;
  description: string;
  email: string;
  end: string;
  folllowers: string[];
  followers: number[];
  id: number;
  location: string;
  name: string;
  ownerId: string;
  start: string;
  website: string;
  workDays: string;
  workspaces: number[];
  search_count: number;
};

export type PostType = {
  image: string | null;
  _id: Id<'posts'>;
  organizationId: Id<'organizations'>;
  _creationTime: number;
};
export type Profile = {
  avatar: string;
  birthday?: string;
  created_at?: string;
  email: string;
  id?: number;
  name: string;
  organizationId?: {
    id: number;
    avatar: string;
    category: string;
    created_at?: string;
    description: string;
    email: string;
    end: string;
    folllowers: string[];
    followers: number[];

    location: string;
    name: string;
    ownerId: string;
    start: string;
    website: string;
    workDays: string;
    workspaces: number[];
  };
  phoneNumber?: string;
  posts?: number[];
  streamToken: string;
  userId: string;
  workerId?: {
    created_at: string;
    experience: string;
    id: number;
    location: string;
    organizationId: number;
    qualifications: string;
    servicePointId: number;
    skills: string;
    userId: number;
    workspaceId: number;
  } | null;

  workspace?: {
    active: boolean | null;
    created_at: string;
    id: number;
    leisure: boolean | null;
    organizationId: number | null;
    ownerId: number | null;
    responsibility: string | null;
    salary: string | null;
    waitlist: number[] | null;
  }[];
};

export type Wks = {
  _id: Id<'workspaces'>;
  active: boolean;
  leisure: boolean;
  organizationId: Id<'organizations'>;
  ownerId: Id<'users'>;
  responsibility?: string;
  salary?: string;
  waitlistCount: number;
  role: string;
  workerId?: Id<'workers'>;
  servicePointId?: Id<'servicePoints'>;
  locked: boolean;
  signedIn: boolean;
  personal: boolean;
};

export type Workers = {
  created_at: string;
  experience?: string;
  id?: number;
  location?: string;
  organizationId?: Organization;
  qualifications?: string;
  servicePointId?: number;
  skills: string;
  userId: Profile;
  workspaceId?: number;
  role: string;
  bossId: string;
  gender: string;
};
// type UserWthWorkerProfile = {
//   avatar: string;
//   birthday: string;
//   created_at: string;
//   email: string;
//   id: number;
//   name: string;
//   organizationId: number;
//   phoneNumber: string;
//   posts: number[];
//   streamToken: string;
//   userId: string;
//   workerId: Workers;
//   workspaces: number[];
// };

export type WorkerWithWorkspace = {
  _creationTime: number;
  experience?: string;
  _id?: Id<'workers'>;
  location?: string;
  qualifications?: string;
  servicePointId?: Id<'servicePoints'>;
  skills: string;
  user: User | null;
  workspace?: Wks | null | undefined;
  role?: string;
  bossId?: Id<'users'>;
};
export type Requests = {
  _creationTime: number;
  from: Id<'users'>;
  _id: Id<'requests'>;
  responsibility: string;
  role: string;
  salary: string;
  to: Id<'users'>;
  pending: boolean;
  qualities: string;
  accepted: boolean;
  unread: boolean;
};
export type PendingRequests = {
  request: Requests;
  organisation: Organization | null;
};
export type WK = {
  bossId: string;
  created_at: string;
  experience: string;
  gender: string;
  id: number;
  location: string;
  organizationId: Org;
  qualifications: string;
  role: string;
  servicePointId: number;
  skills: string;
  userId: string;
  workspaceId: number;
  workerId: Profile;
  active: boolean;
  leisure: boolean;
  locked: boolean;
  signedIn: boolean;
  personal: boolean;
  ownerId: Profile;
};
export type Person = {
  user: {
    avatarUrl: string;
    dateOfBirth: string | null;
    email: string;
    followers: number;
    id: string;
    name: string;
    organizations: { _id: string };
    posts: number;
    streamToken: string;
    workspace: number;
    worker: { _id: string };
    phoneNumber: string;
  };
};
export type Followers = {
  id: string;
  organizationId: string;
  followerId: string;
};

export type WorkType = {
  _creationTime?: number;
  experience?: string;
  _id?: Id<'workers'>;
  location?: string;
  organizationId?: Id<'organizations'>;
  qualifications?: string;
  servicePointId?: Id<'servicePoints'>;
  skills?: string;
  user: User;
  organization: Organization | null;
  workspace: WorkspaceWithoutOrganization;
  userId?: Id<'users'>;
  workspaceId?: Id<'workspaces'>;
  bossId: Id<'users'>;
  role: string;
};

export type Workspace = {
  active: boolean;
  created_at: string;
  id: number;
  leisure: boolean;
  organizationId: number;
  ownerId: string;
  responsibility: string;
  role: string;
  salary: string;
  waitlist: number[];
  workerId: string;
  locked: boolean;
  signedIn: boolean;
};

export type WaitList = {
  customer: User | null;
  _id: Id<'waitlists'>;
  _creationTime: number;
  workspaceId: Id<'workspaces'>;
  customerId: Id<'users'>;
};
export type ServicePointType = {
  _id: Id<'servicePoints'>;
  _creationTime: number;
  externalLink?: boolean | undefined;
  form?: boolean | undefined;
  organizationId: Id<'organizations'>;
  description: string;
  name: string;
  service: boolean;
  staff: string;
};

export type SearchServicePoints = {
  name: string;
  avatar: string | null;
  id: Id<'organizations'>;
  ownerId: Id<'users'>;
  description: string;
};

export type Message = {
  id: string;
  text: string;
  isCurrentUser: boolean;
  timestamp: string;
};

export type MessageSection = {
  title: string;
  data: Message[];
};

export type MessageData = {
  _id: Id<'messages'>;
  _creationTime: number;
  isEdited?: boolean | undefined;
  parentMessageId?: Id<'messages'> | undefined;
  senderId: Id<'users'>;
  recipient: Id<'users'>;
  conversationId: Id<'conversations'>;
  content: string;
  contentType: string;
  seenId: Id<'users'>[];
};

export type Conversation = {
  _id: Id<'conversations'>;
  _creationTime: number;
  name?: string | undefined;
  lastMessage?: string | undefined;
  lastMessageTime?: number | undefined;
  lastMessageSenderId?: Id<'users'> | undefined;
  type: string;
  participants: Id<'users'>[];
};

export type ConversationAndUserType = {
  conversation: Conversation;
  otherUser: User | null;
};

export type ResultType = {
  id: Id<'conversations'>;
  lastMessage: string | undefined;
  name: string | undefined;
  lastMessageTime: number | undefined;
  otherUser: User | null;
  lastMessageSenderId: Id<'users'> | undefined;
};

export type DataType = {
  _id: Id<'messages'>;
  _creationTime: number;
  isEdited?: boolean | undefined;
  parentMessageId?: Id<'messages'> | undefined;
  senderId: Id<'users'>;
  recipient: Id<'users'>;
  conversationId: Id<'conversations'>;
  content: string;
  contentType: string;
  seenId: Id<'users'>[];
};

export type ChatMessage = {
  id: string;
  text: string;
  isCurrentUser: boolean;
  timestamp: string;
};

export type ChatDateGroup = {
  title: string;
  data: ChatMessage[];
};

export type StatusType = 'LoadingFirstPage' | 'CanLoadMore' | 'LoadingMore' | 'Exhausted';

export type GiftChatType = {
  _id: number | Id<'messages'>;
  system?: boolean;
  text: string;
  _creationTime: Date;
  user: {
    _id: number | Id<'users'>;
    name?: string;
  };
};
