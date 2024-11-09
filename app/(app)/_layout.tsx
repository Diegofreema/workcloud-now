import { useUser } from '@clerk/clerk-expo';
import { Redirect, Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// import { StreamChat } from 'stream-chat';
// import { DeepPartial, Theme } from 'stream-chat-expo';
import { useDarkMode } from '~/hooks/useDarkMode';
// import { useChatClient } from '~/useChatClient';

// const api = 'cnvc46pm8uq9';
// const client = StreamChat.getInstance('cnvc46pm8uq9');

export default function AppLayout() {
  // const { clientIsReady } = useChatClient();

  const { isSignedIn } = useUser();
  const { darkMode } = useDarkMode();

  const segment = useSegments();
  console.log(segment);

  // const chatTheme: DeepPartial<Theme> = {
  //   channel: {
  //     selectChannel: {
  //       color: darkMode === 'dark' ? 'white' : 'black',
  //     },
  //   },
  //   channelListSkeleton: {
  //     container: {
  //       backgroundColor: darkMode === 'dark' ? 'black' : 'white',
  //     },
  //     background: {
  //       backgroundColor: darkMode === 'dark' ? 'white' : 'black',
  //     },
  //   },
  //
  //   channelPreview: {
  //     container: {
  //       backgroundColor: 'transparent',
  //     },
  //     title: {
  //       fontFamily: 'PoppinsBold',
  //       fontSize: 13,
  //       color: darkMode === 'dark' ? 'white' : 'black',
  //     },
  //     message: {
  //       fontFamily: 'PoppinsMedium',
  //       fontSize: 10,
  //       color: darkMode === 'dark' ? 'white' : 'black',
  //     },
  //   },
  //
  //   overlay: {
  //     container: {
  //       backgroundColor: darkMode === 'dark' ? 'black' : 'white',
  //     },
  //   },
  // };

  if (!isSignedIn) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar
        style={darkMode === 'dark' ? 'light' : 'dark'}
        backgroundColor={darkMode === 'dark' ? 'black' : 'white'}
      />
      {/* <StreamVideo client={clientVideo}> */}
      {/*<AppProvider>*/}
      {/*<VideoProvider>*/}
      {/*  <CallProvider>*/}
      {/*<OverlayProvider value={{ style: chatTheme }}>*/}
      {/*<Chat client={client}>*/}
      <Stack screenOptions={{ headerShown: false }} initialRouteName="(atabs)" />
      {/*</Chat>*/}
      {/*</OverlayProvider>*/}
      {/*  </CallProvider>*/}
      {/*</VideoProvider>*/}
      {/*</AppProvider>*/}
      {/* </StreamVideo> */}
    </GestureHandlerRootView>
  );
}
