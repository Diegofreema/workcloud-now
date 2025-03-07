import { useHeaderHeight } from '@react-navigation/elements';
import { Stack } from 'expo-router';
import React, { useContext, useEffect } from 'react';
import { SafeAreaView } from 'react-native';
import { Channel, MessageInput, MessageList, useAttachmentPickerContext } from 'stream-chat-expo';

import { AppContext } from '~/components/AppContext';
import { LoadingComponent } from '~/components/Ui/LoadingComponent';

export default function ChannelScreen() {
  const { channel } = useContext(AppContext);
  const { setTopInset } = useAttachmentPickerContext();
  const headerHeight = useHeaderHeight();

  useEffect(() => {
    setTopInset(headerHeight);
  }, [headerHeight, setTopInset]);

  if (!channel) {
    return <LoadingComponent />;
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Stack.Screen options={{ title: 'Channel Screen' }} />
      {channel ? (
        <Channel channel={channel} keyboardVerticalOffset={headerHeight}>
          <MessageList />
          <MessageInput />
        </Channel>
      ) : null}
    </SafeAreaView>
  );
}
