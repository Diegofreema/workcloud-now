import { useQuery } from 'convex/react';

import { api } from '~/convex/_generated/api';

export const useGetUserId = (clerkId: string) => {
  const data = useQuery(api.users.getUserByClerkId, { clerkId });

  return data?._id;
};
