import React, { PropsWithChildren } from 'react';
import { Chat, OverlayProvider, useCreateChatClient } from 'stream-chat-expo';

import { chatApiKey, chatUserId, chatUserName, chatUserToken } from '~/chatConfig';
import { LoadingComponent } from '~/components/Ui/LoadingComponent';

const user = {
  id: chatUserId,
  name: chatUserName,
};

export const ChatWrapper = ({ children }: PropsWithChildren) => {
  const chatClient = useCreateChatClient({
    apiKey: chatApiKey,
    userData: user,
    tokenOrProvider: chatUserToken,
  });

  if (!chatClient) {
    return <LoadingComponent />;
  }

  return (
    <OverlayProvider>
      <Chat client={chatClient} enableOfflineSupport>{children}</Chat>
    </OverlayProvider>
  );
};
