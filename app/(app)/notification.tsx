import { useAuth } from '@clerk/clerk-expo';
import { convexQuery } from '@convex-dev/react-query';
import { Divider } from '@rneui/themed';
import { useQuery } from '@tanstack/react-query';
import { useMutation } from 'convex/react';
import React, { useState } from 'react';
import { FlatList } from 'react-native';
import { toast } from 'sonner-native';

import { MyModal } from '~/components/Dialogs/MyModal';
import { EmptyText } from '~/components/EmptyText';
import { HeaderNav } from '~/components/HeaderNav';
import { Container } from '~/components/Ui/Container';
import { ErrorComponent } from '~/components/Ui/ErrorComponent';
import { LoadingComponent } from '~/components/Ui/LoadingComponent';
import { WorkPreview } from '~/components/Ui/UserPreview';
import { api } from '~/convex/_generated/api';
import { useDarkMode } from '~/hooks/useDarkMode';
import { useInfos } from '~/hooks/useGetInfo';
import { useGetUserId } from '~/hooks/useGetUserId';

const Notification = () => {
  const { userId } = useAuth();
  const { id } = useGetUserId(userId!);
  const info = useInfos((state) => state.infoIds);
  const [isLoading, setIsLoading] = useState(false);
  const { darkMode } = useDarkMode();
  const { data, isPaused, isPending, isError, refetch, isRefetching, isRefetchError } = useQuery(
    convexQuery(api.request.getPendingRequestsWithOrganization, { id: id! })
  );
  const acceptOffer = useMutation(api.worker.acceptOffer);
  if (isError || isRefetchError || isPaused) {
    return <ErrorComponent refetch={refetch} />;
  }

  if (isPending) {
    return <LoadingComponent />;
  }

  const onPress = async () => {
    if (!info._id || !info.to || !info.from || !info.organizationId) return;
    const organisation = data.find(
      (d) => d?.organisation?._id === info.organizationId
    )?.organisation;
    setIsLoading(true);
    try {
      await acceptOffer({
        from: info.from,
        _id: info._id,
        to: info.to,
        role: info.role,
        organizationId: info.organizationId,
      });
      toast.success('You have accepted the offer', {
        description: `From ${organisation?.name} as an ${info.role}`,
      });
    } catch (error) {
      console.log(error);
      toast.error('Something went wrong', {
        description: 'Could not accept the offer',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <MyModal
        title="This means you are resigning from your previous position"
        onPress={onPress}
        isLoading={isLoading}
      />
      <Container>
        <HeaderNav title="Notifications" />

        <FlatList
          style={{ marginTop: 10 }}
          ListEmptyComponent={() => <EmptyText text="No pending notifications" />}
          ItemSeparatorComponent={() => (
            <Divider
              style={{
                height: 10,
                backgroundColor: darkMode === 'dark' ? 'transparent' : '#ccc',
                width: '100%',
              }}
            />
          )}
          onRefresh={refetch}
          refreshing={isRefetching}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 50,
            flexGrow: 1,
          }}
          data={data}
          renderItem={({ item }) => <WorkPreview item={item} />}
          keyExtractor={(item) => item?.request._id.toString()}
        />
      </Container>
    </>
  );
};

export default Notification;
