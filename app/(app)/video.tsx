import {
  CallContent,
  IncomingCall,
  OutgoingCall,
  RingingCallContent,
  StreamCall,
  useCalls,
} from '@stream-io/video-react-native-sdk';
import { useRouter } from 'expo-router';
import React from 'react';

const Video = () => {
  const calls = useCalls();
  const call = calls[0];
  const router = useRouter();
  if (!call) {
    if (router.canGoBack()) {
      router.back();
    }
    return;
  }

  return (
    <StreamCall call={call}>
      <RingingCallContent
        IncomingCall={IncomingCall}
        OutgoingCall={OutgoingCall}
        CallContent={CallContent}
      />
    </StreamCall>
  );
};

export default Video;
