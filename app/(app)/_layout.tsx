import { useUser } from '@clerk/clerk-expo';
import { ErrorBoundaryProps, Redirect, Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import CallProvider from '~/components/CallProvider';
import { ChatWrapper } from '~/components/ChatWrapper';
import { ErrorComponent } from '~/components/Ui/ErrorComponent';
import VideoProvider from '~/components/VideoProvider';
import { useDarkMode } from '~/hooks/useDarkMode';

export function ErrorBoundary({ retry }: ErrorBoundaryProps) {
  return <ErrorComponent refetch={retry} />;
}
export default function AppLayout() {
  const { isSignedIn } = useUser();
  const { darkMode } = useDarkMode();

  const segment = useSegments();
  console.log(segment);

  if (!isSignedIn) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar
        style={darkMode === 'dark' ? 'light' : 'dark'}
        backgroundColor={darkMode === 'dark' ? 'black' : 'white'}
      />
      <ChatWrapper>
        <VideoProvider>
          <CallProvider>
            <Stack screenOptions={{ headerShown: false }} />
          </CallProvider>
        </VideoProvider>
      </ChatWrapper>
    </GestureHandlerRootView>
  );
}
