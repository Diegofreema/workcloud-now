import React, { PropsWithChildren, useEffect, useState } from 'react';
import { StreamChat } from 'stream-chat';
import { Chat, OverlayProvider } from 'stream-chat-expo';

import { LoadingComponent } from '~/components/Ui/LoadingComponent';
import { useGetUserId } from '~/hooks/useGetUserId';

const client = StreamChat.getInstance(process.env.EXPO_PUBLIC_STREAM_API_KEY!);
export const ChatWrapper = ({ children }: PropsWithChildren) => {
  const { user, id, isLoading } = useGetUserId();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!id || !user) {
      return;
    }

    const connect = async () => {
      await client.connectUser(
        {
          id,
          name: user.name,
          image: user.image,
        },
        user.streamToken
      );
      setIsReady(true);
    };

    connect();

    return () => {
      if (isReady) {
        client.disconnectUser();
      }
      setIsReady(false);};
  }, [id, user.name, user.image]);
  if (isLoading || !isReady) {
    return <LoadingComponent />;
  }

  return (
    <OverlayProvider>
      <Chat client={client} enableOfflineSupport>
        {children}
      </Chat>
    </OverlayProvider>
  );
};
