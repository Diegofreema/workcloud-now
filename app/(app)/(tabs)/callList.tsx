import { CallContent, StreamCall, useStreamVideoClient } from '@stream-io/video-react-native-sdk';
import React from 'react';

import { LoadingComponent } from '~/components/Ui/LoadingComponent';

const CallList = () => {
  const client = useStreamVideoClient();

  if (!client) return <LoadingComponent />;

  const callId = Math.random().toString(37).slice(2, 10);
  const call = client.call('default', callId);
  call.join({ create: true });
  return (
    <StreamCall call={call}>
      <CallContent />
    </StreamCall>
  );
};

export default CallList;
