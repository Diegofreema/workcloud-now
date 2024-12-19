import { useMutation } from 'convex/react';
import { useEffect, useState } from 'react';

import { ConversationAndUserType } from '~/constants/types';
import { api } from '~/convex/_generated/api';
import { Id } from '~/convex/_generated/dataModel';

type Props = {
  conversationData: ConversationAndUserType;
  id: Id<'users'>;
  loggedInUserId: Id<'users'>;
};
export const useCreateConvo = ({ conversationData, loggedInUserId, id }: Props) => {
  const createSingleConversation = useMutation(api.conversation.createSingleConversation);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (conversationData === null) {
      const createConvo = async () => {
        setLoading(true);
        try {
          await createSingleConversation({ loggedInUserId, otherUserId: id });
        } catch (e) {
          console.log(e);
          throw Error('Something went wrong');
        } finally {
          setLoading(false);
        }
      };

      createConvo();
    }
  }, [conversationData, createSingleConversation, loggedInUserId, id]);
  return loading;
};
