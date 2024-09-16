import { useAuth } from '@clerk/clerk-expo';
import { StreamVideo, StreamVideoClient, User } from '@stream-io/video-react-native-sdk';
import { PropsWithChildren, useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';

import { useProfile } from '~/lib/queries';

export default function VideoProvider({ children }: PropsWithChildren) {
  const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(null);
  const { userId } = useAuth();
  const { data, isPending } = useProfile(userId);
  const user: User = {
    id: data?.profile?.userId!,
    image: data?.profile?.avatar!,
    name: data?.profile?.name!,
  };
  useEffect(() => {
    if (!data?.profile) return;
    const initVideoClient = async () => {
      const client = new StreamVideoClient({
        apiKey: 'cnvc46pm8uq9',
        user,
        token: data?.profile.streamToken,
      });

      setVideoClient(client);
    };

    initVideoClient();

    return () => {
      if (videoClient) {
        videoClient.disconnectUser();
      }
    };
  }, [data?.profile]);

  if (!videoClient || isPending) {
    return <ActivityIndicator />;
  }
  return <StreamVideo client={videoClient}>{children}</StreamVideo>;
}
