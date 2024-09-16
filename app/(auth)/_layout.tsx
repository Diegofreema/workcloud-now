import { useUser } from '@clerk/clerk-expo';
import { Redirect, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { useDarkMode } from '~/hooks/useDarkMode';

const AuthLayout = () => {
  const { isSignedIn } = useUser();

  const { darkMode } = useDarkMode();

  if (isSignedIn) {
    return <Redirect href="/(app)/(atabs)/" />;
  }

  return (
    <>
      <StatusBar
        style={darkMode === 'dark' ? 'light' : 'dark'}
        backgroundColor={darkMode === 'dark' ? 'black' : 'white'}
      />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
};

export default AuthLayout;
