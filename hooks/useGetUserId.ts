import { useAuth } from '@clerk/clerk-expo';
import { useQuery } from 'convex/react';

import { api } from '~/convex/_generated/api';

export const useGetUserId = () => {
  const { userId: clerkId } = useAuth();
  const data = useQuery(api.users.getUserByClerkId, { clerkId: clerkId! });

  return { id: data?._id, organizationId: data?.organizationId, worker: data?.workerId, clerkId };
};
