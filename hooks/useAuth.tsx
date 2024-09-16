import { useUser } from '@clerk/clerk-expo';
import { useQuery } from '@tanstack/react-query';

import { useData } from './useData';

import { checkIfUserExistsFn, createToken, createUser } from '~/lib/helper';

export const useAuth = () => {
  const { user } = useUser();
  const { getUser } = useData();
  return useQuery({
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
        } else if (!checkIfUserExists) {
          const token = await createToken(user?.id!);
          if (token) {
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
          return {};
        } else {
          throw Error('Failed to get user');
        }
      } catch (error) {
        console.log(JSON.stringify(error, null, 1));
        throw Error('Failed to get user');
      }
    },
  });
};
