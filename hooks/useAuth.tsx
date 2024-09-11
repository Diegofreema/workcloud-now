import { useUser } from '@clerk/clerk-expo';
import { useQuery } from '@tanstack/react-query';

import { useData } from './useData';

import { UserProfile } from '~/constants/types';
import { checkIfUserExistsFn, createToken, createUser } from '~/lib/helper';

export const useAuth = () => {
  const { user } = useUser();
  const { getUser, user: userData } = useData();
  return useQuery<UserProfile | null>({
    queryKey: ['profile', user],
    queryFn: async () => {
      try {
        const checkIfUserExists = await checkIfUserExistsFn(user?.emailAddresses[0]?.emailAddress!);
        if (checkIfUserExists) {
          getUser({
            avatar: checkIfUserExists.avatar!,
            email: checkIfUserExists.email!,
            id: checkIfUserExists.userId!,
            name: checkIfUserExists.name!,
            streamToken: checkIfUserExists.streamToken!,
          });
          return checkIfUserExists;
        } else {
          const token = await createToken(user?.id!);
          if (!token) {
            console.log('failed to create token');

            throw new Error('Failed to create token');
          }
          const newUser = await createUser({
            streamToken: token,
            email: user?.emailAddresses[0]?.emailAddress!,
            name: user?.firstName || '' + user?.lastName || '',
            phoneNumber: user?.phoneNumbers[0]?.phoneNumber!,
            avatar: user?.imageUrl || '',
            userId: user?.id!,
          });
          if (newUser) {
            getUser({
              avatar: newUser.avatar!,
              email: newUser.email!,
              id: newUser.userId!,
              name: newUser.name!,
              streamToken: newUser.streamToken!,
            });
          }
          return newUser;
        }
      } catch (error) {
        console.log(JSON.stringify(error, null, 1));
        throw Error('Failed to get user');
      }
    },
    retry: 5,
    refetchOnWindowFocus: userData?.id ? false : true,
    refetchOnMount: userData?.id ? false : true,
  });
};
