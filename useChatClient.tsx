// useChatClient.js

import { useUser } from '@clerk/clerk-expo';
import { useEffect, useState } from 'react';
import { StreamChat } from 'stream-chat';

import { chatApiKey } from './chatConfig';
import { useAuth } from './hooks/useAuth';

const chatClient = StreamChat.getInstance(chatApiKey);

export const useChatClient = () => {
  const { user } = useUser();
  const { data, isPending, error } = useAuth();
  // const { data, isPending, error } = useProfile(user?.id);
  console.log({ isPending, error });

  const userData = {
    id: user?.id as string,
    name: user?.fullName!,
    image: user?.imageUrl!,
  };
  console.log(data?.streamToken, userData);

  const [clientIsReady, setClientIsReady] = useState(false);
  console.log(clientIsReady);

  useEffect(() => {
    if (!data?.streamToken) return;
    const setupClient = async () => {
      try {
        chatClient.connectUser(userData, data?.streamToken);
        setClientIsReady(true);
      } catch (error) {
        if (error instanceof Error) {
          console.error(`An error occurred while connecting the user: ${error.message}`);
        }
      }
    };

    // If the chat client has a value in the field `userID`, a user is already connected
    // and we can skip trying to connect the user again.
    if (!chatClient.userID) {
      setupClient();
    }
  }, [data?.streamToken, isPending]);
  return {
    clientIsReady,
  };
};
