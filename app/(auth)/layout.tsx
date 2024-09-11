import { useUser } from '@clerk/clerk-expo';
import { Redirect, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { LoadingComponent } from '~/components/Ui/LoadingComponent';
import { useDarkMode } from '~/hooks/useDarkMode';

const AuthLayout = () => {
  const { isSignedIn, isLoaded } = useUser();
  const { darkMode } = useDarkMode();

  if (!isLoaded) {
    return <LoadingComponent />;
  }

  if (isSignedIn) {
    return <Redirect href="/home" />;
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
