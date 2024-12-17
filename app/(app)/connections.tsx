import { useAuth } from '@clerk/clerk-expo';
import { EvilIcons } from '@expo/vector-icons';
import { useQuery } from 'convex/react';
import React from 'react';
import { FlatList, View } from 'react-native';

import { EmptyText } from '~/components/EmptyText';
import { HeaderNav } from '~/components/HeaderNav';
import { Item } from '~/components/Item';
import { LoadingComponent } from '~/components/Ui/LoadingComponent';
import { defaultStyle } from '~/constants';
import { api } from '~/convex/_generated/api';
import { useDarkMode } from '~/hooks/useDarkMode';
import { useGetUserId } from '~/hooks/useGetUserId';

const Connections = () => {
  const { darkMode } = useDarkMode();
  const { userId } = useAuth();
  const { id } = useGetUserId(userId!);
  const connections = useQuery(api.users.getUserConnections, { ownerId: id });

  if (!connections) {
    return <LoadingComponent />;
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: darkMode === 'dark' ? 'black' : 'white',
        ...defaultStyle,
      }}>
      <HeaderNav title="All Connections" RightComponent={SearchComponent} />
      <FlatList
        contentContainerStyle={{
          gap: 15,
          paddingBottom: 50,
        }}
        data={connections}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => {
          const lastIndex = [1, 2, 3].length - 1;
          const isLastItemOnList = index === lastIndex;
          return <Item {...item} isLastItemOnList={isLastItemOnList} />;
        }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => {
          return <EmptyText text="No Connections yet" />;
        }}
      />
    </View>
  );
};

const SearchComponent = () => {
  const { darkMode } = useDarkMode();
  return <EvilIcons name="search" color={darkMode === 'dark' ? 'white' : 'black'} size={24} />;
};
export default Connections;
