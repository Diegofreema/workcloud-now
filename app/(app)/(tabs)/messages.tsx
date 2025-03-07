import { useRouter } from 'expo-router';
import React, { useContext, useMemo } from 'react';
import { AscDesc, Channel } from 'stream-chat';
import { ChannelList } from 'stream-chat-expo';

import { chatUserId } from '~/chatConfig';
import { AppContext } from '~/components/AppContext';
import { SearchHeader } from '~/components/SearchHeader';
import { Container } from '~/components/Ui/Container';
import { useGetUserId } from '~/hooks/useGetUserId';

const filters = {
  members: { $in: [chatUserId] },
  type: 'messaging',
};
const sort = { last_updated: -1 as AscDesc };
const options = {
  state: true,
  watch: true,
};

const Messages = () => {
  const { id } = useGetUserId();
  console.log({ id });
  const memoizedFilters = useMemo(() => filters, []);
  const router = useRouter();
  const { setChannel } = useContext(AppContext);
  const onPress = (channel: Channel) => {
    setChannel(channel);
    // @ts-ignore
    router.push(`/channel/${channel.cid}`);
  };
  return (
    <Container noPadding>
      <SearchHeader placeholder="Search by name" />
      <ChannelList filters={memoizedFilters} options={options} sort={sort} onSelect={onPress} />
    </Container>
  );
};

export default Messages;
