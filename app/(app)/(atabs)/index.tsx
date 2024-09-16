import { useAuth } from '@clerk/clerk-expo';
import * as SecureStore from 'expo-secure-store';
import { useEffect } from 'react';
import { FlatList, View } from 'react-native';

import { Header } from '../../../components/Header';
import { OrganizationModal } from '../../../components/OrganizationModal';
import { ProfileHeader } from '../../../components/ProfileHeader';
import { HeadingText } from '../../../components/Ui/HeadingText';
import { useOrganizationModal } from '../../../hooks/useOrganizationModal';
import { useGetConnection, useProfile } from '../../../lib/queries';

import { EmptyText } from '~/components/EmptyText';
import { Item } from '~/components/Item';
import { Container } from '~/components/Ui/Container';
import { ErrorComponent } from '~/components/Ui/ErrorComponent';
import { LoadingComponent } from '~/components/Ui/LoadingComponent';
import { useData } from '~/hooks/useData';

export default function TabOneScreen() {
  const { userId } = useAuth();
  const { user } = useData();
  const { data, isError, isPending, refetch } = useProfile(userId);

  const loaded = !!SecureStore.getItem('loaded');
  console.log(data);

  useEffect(() => {
    if (loaded) return;
    if (!data) return;

    if (!data?.profile?.organizationId && !data?.profile?.workerId) {
      onOpen();
    }
  }, [data?.profile?.organizationId, data?.profile?.workerId, loaded]);
  const {
    data: connections,
    refetch: refetchConnections,
    isRefetching: isRefetchingConnections,
    isError: isErrorConnections,
    isPending: isPendingConnections,

    isPaused: isConnectionsPaused,
  } = useGetConnection(userId || '');
  SecureStore.setItem('loaded', '1');
  const { onOpen } = useOrganizationModal();
  const handleRefetch = () => {
    refetch();
    refetchConnections();
  };

  if (isError || isErrorConnections || isConnectionsPaused) {
    return <ErrorComponent refetch={refetch} />;
  }

  if (isPending || isPendingConnections) {
    return <LoadingComponent />;
  }

  const { connections: connectionsData } = connections;

  const firstTen = connectionsData?.slice(0, 10);

  return (
    <Container>
      <OrganizationModal />

      <Header />
      <ProfileHeader
        id={user?.id!}
        avatar={user?.avatar!}
        name={user?.name!}
        email={user?.email!}
      />

      <View style={{ marginVertical: 10 }}>
        <HeadingText link="/connections" />
      </View>

      <FlatList
        onRefresh={handleRefetch}
        refreshing={isRefetchingConnections}
        contentContainerStyle={{
          gap: 5,
          paddingBottom: 50,
        }}
        data={firstTen}
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
    </Container>
  );
}
