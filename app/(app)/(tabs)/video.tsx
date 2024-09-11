import { RingingCallContent, StreamCall, useCalls } from '@stream-io/video-react-native-sdk';
import { useRouter } from 'expo-router';

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
      <RingingCallContent />
    </StreamCall>
  );
};

export default Video;
