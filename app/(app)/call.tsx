import {
  CallContent,
  CallingState,
  RingingCallContent,
  StreamCall,
  useCalls,
  CallControlProps,
  HangUpCallButton,
  ToggleAudioPublishingButton as ToggleMic,
  ToggleVideoPublishingButton as ToggleCamera,
  useCall,
} from '@stream-io/video-react-native-sdk';
import { useMutation } from 'convex/react';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { toast } from 'sonner-native';

import { api } from '~/convex/_generated/api';
import { useGetUserId } from '~/hooks/useGetUserId';
import { useWaitlistId } from '~/hooks/useWaitlistId';

export default function CallScreen() {
  const calls = useCalls();
  const call = calls[0];
  const { id: loggedInUser } = useGetUserId();
  const { waitlistId, removeId } = useWaitlistId();

  const removeFromWaitlist = useMutation(api.workspace.removeFromWaitlist);
  useEffect(() => {
    return () => {
      // cleanup the call on unmount if the call was not left already
      if (call?.state.callingState !== CallingState.LEFT) {
        call?.leave();
      }
    };
  }, [call]);
  if (!call) {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/');
    }
    return null;
  }

  const onHangUp = async () => {
    console.log('Pressed');
    if (!waitlistId) return;
    console.log('Pressed 2');
    router.back();
    try {
      await removeFromWaitlist({ waitlistId });
      removeId();
    } catch {
      toast.error('Something went wrong', { description: 'Failed to leave call' });
    }
  };

  return (
    <StreamCall call={call}>
      {call.state.callingState === 'ringing' ? (
        <RingingCallContent />
      ) : (
        <CallContent onHangupCallHandler={onHangUp} CallControls={CustomCallControls} />
      )}
    </StreamCall>
  );
}

const CustomCallControls = (props: CallControlProps) => {
  const call = useCall();
  return (
    <View style={styles.customCallControlsContainer}>
      <ToggleMic onPressHandler={call?.microphone.toggle} />
      <ToggleCamera onPressHandler={call?.camera.toggle} />
      <HangUpCallButton onHangupCallHandler={props.onHangupCallHandler} />
    </View>
  );
};

const styles = StyleSheet.create({
  customCallControlsContainer: {
    position: 'absolute',
    bottom: 40,
    paddingVertical: 10,
    width: '80%',
    marginHorizontal: 20,
    flexDirection: 'row',
    alignSelf: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'orange',
    borderRadius: 10,
    borderColor: 'black',
    borderWidth: 5,
    zIndex: 5,
  },
});
