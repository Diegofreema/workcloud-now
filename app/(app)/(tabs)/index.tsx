import { useAuth } from '@clerk/clerk-expo';
import { useQuery } from 'convex/react';
import { ErrorBoundaryProps } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect } from 'react';
import { FlatList, View } from 'react-native';

import { EmptyText } from '~/components/EmptyText';
import { Header } from '~/components/Header';
import { Item } from '~/components/Item';
import { OrganizationModal } from '~/components/OrganizationModal';
import { ProfileHeader } from '~/components/ProfileHeader';
import { Container } from '~/components/Ui/Container';
import { ErrorComponent } from '~/components/Ui/ErrorComponent';
import { HeadingText } from '~/components/Ui/HeadingText';
import { LoadingComponent } from '~/components/Ui/LoadingComponent';
import { api } from '~/convex/_generated/api';
import { useOrganizationModal } from '~/hooks/useOrganizationModal';

export function ErrorBoundary({ retry }: ErrorBoundaryProps) {
  return <ErrorComponent refetch={retry} />;
}

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
  const headerText = connections.length > 10 ? 'See all connections' : '';
  return (
    <Container>
      <OrganizationModal />

      <Header />
      <ProfileHeader id={data?._id!} avatar={data?.imageUrl!} name={data?.name} />

      <View style={{ marginVertical: 10 }}>
        <HeadingText link="/connections" rightText={headerText} />
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
          // @ts-expect-error
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
