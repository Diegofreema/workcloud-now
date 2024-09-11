import { useCalls } from '@stream-io/video-react-native-sdk';
import { router, usePathname } from 'expo-router';
import { PropsWithChildren, useEffect } from 'react';
import { Pressable, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CallProvider({ children }: PropsWithChildren) {
  const calls = useCalls();
  const call = calls?.[0];
  const pathname = usePathname();
  const isNotOnVideoScreen = pathname !== '/video';
  const { top } = useSafeAreaInsets();
  useEffect(() => {
    if (!call) return;
    if (isNotOnVideoScreen && call.state.callingState === 'ringing') {
      router.push('/video');
    }
  }, [call]);
  const onGoToCall = () => {
    router.push(`/video`);
  };

  return (
    <>
      {children}
      {call && isNotOnVideoScreen && (
        <Pressable
          onPress={onGoToCall}
          style={{
            position: 'absolute',
            width: '100%',
            left: 0,
            right: 0,
            top: top + 40,
            padding: 10,
            backgroundColor: 'lightgreen',
          }}>
          <Text style={{ color: 'white' }}>Active call, join</Text>
        </Pressable>
      )}
    </>
  );
}
