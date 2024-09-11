// useChatClient.js

import { useUser } from '@clerk/clerk-expo';
import { useEffect, useState } from 'react';
import { StreamChat } from 'stream-chat';

import { chatApiKey } from './chatConfig';
import { useProfile } from './lib/queries';

const chatClient = StreamChat.getInstance(chatApiKey);

export const useChatClient = () => {
  const { user } = useUser();
  const { data, isPending } = useProfile(user?.id);

  const userData = {
    id: user?.id as string,
    name: user?.fullName!,
    image: user?.imageUrl!,
  };
  console.log(data?.profile?.streamToken, userData);

  const [clientIsReady, setClientIsReady] = useState(false);
  useEffect(() => {
    if (!data?.profile?.streamToken) return;
    const setupClient = async () => {
      try {
        chatClient.connectUser(userData, data?.profile?.streamToken);
        if (!isPending) {
          setClientIsReady(true);
        }
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
  }, [data?.profile?.streamToken, isPending]);
  return {
    clientIsReady,
  };
};
