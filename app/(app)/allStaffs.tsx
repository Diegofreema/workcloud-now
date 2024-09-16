import { useAuth } from '@clerk/clerk-expo';
import React, { useEffect, useState } from 'react';
import { FlatList, View } from 'react-native';

import { EmptyText } from '~/components/EmptyText';
import { HeaderNav } from '~/components/HeaderNav';
import { Container } from '~/components/Ui/Container';
import { ErrorComponent } from '~/components/Ui/ErrorComponent';
import { LoadingComponent } from '~/components/Ui/LoadingComponent';
import { UserPreviewWithBio } from '~/components/Ui/UserPreviewWithBio';
import { Workers } from '~/constants/types';
import { useDetailsToAdd } from '~/hooks/useDetailsToAdd';
import { useGetOtherWorkers } from '~/lib/queries';

const AllStaffs = () => {
  const { role } = useDetailsToAdd();
  const { userId } = useAuth();
  const [staffs, setStaffs] = useState<Workers[]>();
  console.log(role, 'role');

  const { data, isPending, isError, isPaused, refetch, isRefetching } = useGetOtherWorkers(userId);

  useEffect(() => {
    if (data?.worker) {
      const filteredData = data.worker.filter((worker) => worker?.userId?.userId !== userId);
      setStaffs(filteredData);
    }
  }, [data]);

  // const {
  //   data: pendingData,
  //   isPending: isPendingData,
  //   isError: isErrorData,
  //   isPaused: isPausedData,
  //   refetch: refetchData,
  //   isRefetching: isRefetchingData,
  //   isRefetchError: isRefetchErrorData,
  // } = usePendingWorkers();

  const handleRefetch = () => {
    refetch();
  };
  if (isPaused || isError) {
    return <ErrorComponent refetch={handleRefetch} />;
  }

  if (isPending) {
    return <LoadingComponent />;
  }

  const onRefreshing = isRefetching;

  return (
    <Container>
      <HeaderNav title="Add staff" />
      <FlatList
        showsVerticalScrollIndicator={false}
        onRefresh={handleRefetch}
        refreshing={onRefreshing}
        data={data.worker}
        renderItem={({ item }) => (
          <UserPreviewWithBio
            id={item?.userId?.userId}
            imageUrl={item?.userId?.avatar}
            name={item?.userId?.name}
            bio={item?.experience!}
            skills={item?.skills}
          />
        )}
        style={{ marginTop: 20 }}
        contentContainerStyle={{ paddingBottom: 50 }}
        ItemSeparatorComponent={() => <View style={{ height: 20 }} />}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={() => <EmptyText text="No staff yet" />}
      />
    </Container>
  );
};

export default AllStaffs;
