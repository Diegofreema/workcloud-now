import { EvilIcons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, View } from 'react-native';

import { HeaderNav } from '../../components/HeaderNav';
import { defaultStyle } from '../../constants/index';
import { useDarkMode } from '../../hooks/useDarkMode';

import { EmptyText } from '~/components/EmptyText';
import { Item } from '~/components/Item';
import { ErrorComponent } from '~/components/Ui/ErrorComponent';
import { LoadingComponent } from '~/components/Ui/LoadingComponent';
import { useData } from '~/hooks/useData';
import { useGetConnection } from '~/lib/queries';

const Connections = () => {
  const { darkMode } = useDarkMode();
  const { user } = useData();
  const {
    data: connections,
    refetch: refetchConnections,
    isRefetching: isRefetchingConnections,
    isError: isErrorConnections,
    isPending: isPendingConnections,

    isPaused: isConnectionsPaused,
  } = useGetConnection(user?.id);
  if (isErrorConnections || isConnectionsPaused) {
    return <ErrorComponent refetch={refetchConnections} />;
  }

  if (isPendingConnections) {
    return <LoadingComponent />;
  }

  const { connections: allConnections } = connections;
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: darkMode === 'dark' ? 'black' : 'white',
        ...defaultStyle,
      }}>
      <HeaderNav title="All Connections" RightComponent={SearchComponent} />
      <FlatList
        onRefresh={refetchConnections}
        refreshing={isRefetchingConnections}
        contentContainerStyle={{
          gap: 15,
          paddingBottom: 50,
        }}
        data={allConnections}
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
