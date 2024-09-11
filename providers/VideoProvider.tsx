import { StreamVideo, StreamVideoClient, User } from '@stream-io/video-react-native-sdk';
import { PropsWithChildren, useEffect, useState } from 'react';
import { ActivityIndicator } from 'react-native';

export default function VideoProvider({ children }: PropsWithChildren) {
  const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(null);

  const user: User = {
    id: 'user_2lqdLuqt1S6TJVCG0fOWdCZTLNC',
    image:
      'https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ29vZ2xlL2ltZ18ybHFkTHhBdDFCa1VHVW4wNENaNEU2eFIxRnEifQ',
    name: 'Diego',
  };
  useEffect(() => {
    const initVideoClient = async () => {
      const client = new StreamVideoClient({
        apiKey: 'cnvc46pm8uq9',
        user,
        token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoidXNlcl8ybHFkTHVxdDFTNlRKVkNHMGZPV2RDWlRMTkMifQ.uHYphxC7QIR9GRh9CHCj4-KlzDEasEh_JaEuQ51nm5c',
      });

      setVideoClient(client);
    };

    initVideoClient();

    return () => {
      if (videoClient) {
        videoClient.disconnectUser();
      }
    };
  }, ['user_2lqdLuqt1S6TJVCG0fOWdCZTLNC']);

  if (!videoClient) {
    return <ActivityIndicator />;
  }
  return <StreamVideo client={videoClient}>{children}</StreamVideo>;
}
