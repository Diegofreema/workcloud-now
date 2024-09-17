import { useUser } from '@clerk/clerk-expo';
import { useQueryClient } from '@tanstack/react-query';
import { Redirect, Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StreamChat } from 'stream-chat';
import { Chat, DeepPartial, OverlayProvider, Theme } from 'stream-chat-expo';

import { AppProvider } from '~/AppContext';
import { LoadingComponent } from '~/components/Ui/LoadingComponent';
import { useDarkMode } from '~/hooks/useDarkMode';
import { onRefresh } from '~/lib/helper';
import { supabase } from '~/lib/supabase';
import CallProvider from '~/providers/CallProvider';
import VideoProvider from '~/providers/VideoProvider';
import { useChatClient } from '~/useChatClient';

// const api = 'cnvc46pm8uq9';
const client = StreamChat.getInstance('cnvc46pm8uq9');

export default function AppLayout() {
  const { clientIsReady } = useChatClient();
  const queryClient = useQueryClient();
  const { isSignedIn } = useUser();
  const { darkMode } = useDarkMode();

  const segment = useSegments();
  console.log(segment);
  useEffect(() => {
    const channel = supabase
      .channel('workcloud')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
        },
        (payload: any) => {
          if (payload) {
            queryClient.invalidateQueries({ queryKey: ['myStaffs'] });
            queryClient.invalidateQueries({ queryKey: ['organization'] });
            queryClient.invalidateQueries({ queryKey: ['assignedWk'] });
            queryClient.invalidateQueries({ queryKey: ['connections'] });
            queryClient.invalidateQueries({ queryKey: ['request'] });
            queryClient.invalidateQueries({ queryKey: ['pending_requests'] });
            queryClient.invalidateQueries({ queryKey: ['pending_worker'] });
            queryClient.invalidateQueries({ queryKey: ['workspace_no_worker'] });
            onRefresh();
          }
          console.log('Change received!', payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  const chatTheme: DeepPartial<Theme> = {
    channel: {
      selectChannel: {
        color: darkMode === 'dark' ? 'white' : 'black',
      },
    },
    channelListSkeleton: {
      container: {
        backgroundColor: darkMode === 'dark' ? 'black' : 'white',
      },
      background: {
        backgroundColor: darkMode === 'dark' ? 'white' : 'black',
      },
    },

    channelPreview: {
      container: {
        backgroundColor: 'transparent',
      },
      title: {
        fontFamily: 'PoppinsBold',
        fontSize: 13,
        color: darkMode === 'dark' ? 'white' : 'black',
      },
      message: {
        fontFamily: 'PoppinsMedium',
        fontSize: 10,
        color: darkMode === 'dark' ? 'white' : 'black',
      },
    },

    overlay: {
      container: {
        backgroundColor: darkMode === 'dark' ? 'black' : 'white',
      },
    },
  };

  if (!isSignedIn) {
    return <Redirect href="/(auth)/login" />;
  }
  if (!clientIsReady) {
    return <LoadingComponent />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar
        style={darkMode === 'dark' ? 'light' : 'dark'}
        backgroundColor={darkMode === 'dark' ? 'black' : 'white'}
      />
      {/* <StreamVideo client={clientVideo}> */}
      <AppProvider>
        <VideoProvider>
          <CallProvider>
            <OverlayProvider value={{ style: chatTheme }}>
              <Chat client={client}>
                <Stack screenOptions={{ headerShown: false }} initialRouteName="(atabs)" />
              </Chat>
            </OverlayProvider>
          </CallProvider>
        </VideoProvider>
      </AppProvider>
      {/* </StreamVideo> */}
    </GestureHandlerRootView>
  );
}
