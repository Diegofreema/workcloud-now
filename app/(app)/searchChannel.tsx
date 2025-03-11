import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Channel } from 'stream-chat';

import { SearchChannel } from '~/components/SearchChannel';
import { useFilterChannel } from '~/hooks/useFilterChannel';

const SearchChannelScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [query, setQuery] = useState('');

  const router = useRouter();
  const { filterChannels, loading } = useFilterChannel(id, query);
  const onClear = useCallback(() => setQuery(''), []);
  const onPress = useCallback((channel: Channel) => {
    router.push(`/channel/${channel.cid}`);
  }, []);

  const handleChange = (text: string) => {
    setQuery(text);
  };
  return (
    <SearchChannel
      filterChannels={filterChannels}
      handleChange={handleChange}
      onPress={onPress}
      query={query}
      onClear={onClear}
      loading={loading}
    />
  );
};
export default SearchChannelScreen;
