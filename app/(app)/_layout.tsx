import { useUser } from '@clerk/clerk-expo';
import { Redirect, Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useDarkMode } from '~/hooks/useDarkMode';

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

      <Stack screenOptions={{ headerShown: false }} />
    </GestureHandlerRootView>
  );
}
