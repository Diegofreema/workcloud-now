import { StreamVideo, StreamVideoClient } from '@stream-io/video-react-native-sdk';
import { PropsWithChildren, useEffect, useState } from 'react';
import { useGetUserId } from '~/hooks/useGetUserId';
import { LoadingComponent } from '~/components/Ui/LoadingComponent';

const apiKey = process.env.EXPO_PUBLIC_STREAM_API_KEY!;

export default function VideoProvider({ children }: PropsWithChildren) {
  const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(null);
  const { user: userData, id, isLoading } = useGetUserId();

  useEffect(() => {
    if (isLoading || !id || !userData.streamToken || !userData.name || !userData.image) {
      return;
    }
    const user = {
      id,
      name: userData.name as string,
      image: userData.image as string,
    };

    const tokenProvider = () => Promise.resolve(userData.streamToken) as Promise<string>;
    const myClient = StreamVideoClient.getOrCreateInstance({
      apiKey,
      user,
      tokenProvider,
    });
    setVideoClient(myClient);

    return () => {
      if (videoClient) {
        videoClient.disconnectUser();
        setVideoClient(null);
      }
    };
  }, [id, userData.streamToken, userData.name, userData.image, isLoading]);

  if (!videoClient) {
    return <LoadingComponent />;
  }

  return <StreamVideo client={videoClient}>{children}</StreamVideo>;
}
