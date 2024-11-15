import { useAuth } from '@clerk/clerk-expo';
import { useQuery } from 'convex/react';
import * as SecureStore from 'expo-secure-store';
import { useEffect } from 'react';
import { FlatList, View } from 'react-native';

import { EmptyText } from '~/components/EmptyText';
import { Header } from '~/components/Header';
import { Item } from '~/components/Item';
import { OrganizationModal } from '~/components/OrganizationModal';
import { ProfileHeader } from '~/components/ProfileHeader';
import { Container } from '~/components/Ui/Container';
import { HeadingText } from '~/components/Ui/HeadingText';
import { LoadingComponent } from '~/components/Ui/LoadingComponent';
import { api } from '~/convex/_generated/api';
import { useOrganizationModal } from '~/hooks/useOrganizationModal';

export default function TabOneScreen() {
  const { userId } = useAuth();
  const data = useQuery(api.users.getUserByClerkId, { clerkId: userId! });
  const connections = useQuery(api.users.getUserConnections, { ownerId: data?._id });
  const loaded = !!SecureStore.getItem('loaded');

  useEffect(() => {
    if (loaded) return;
    if (!data) return;

    if (!data?.organizationId && !data?.workerId) {
      onOpen();
    }
  }, [data?.organizationId, data?.organizationId, loaded]);

  SecureStore.setItem('loaded', '1');
  const { onOpen } = useOrganizationModal();

  if (!data || !connections) {
    return <LoadingComponent />;
  }

  const firstTen = connections?.slice(0, 10);

  return (
    <Container>
      <OrganizationModal />

      <Header />
      <ProfileHeader
        id={data?._id!}
        avatar={data?.imageUrl!}
        name={data?.first_name + ' ' + data?.last_name}
      />

      <View style={{ marginVertical: 10 }}>
        <HeadingText link="/connections" />
      </View>

      <FlatList
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
