import { useAuth } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import { FlatList, View } from 'react-native';

import { AuthHeader } from '~/components/AuthHeader';
import { EmptyText } from '~/components/EmptyText';
import { Container } from '~/components/Ui/Container';
import { ErrorComponent } from '~/components/Ui/ErrorComponent';
import { LoadingComponent } from '~/components/Ui/LoadingComponent';
import { MyButton } from '~/components/Ui/MyButton';
import { MyText } from '~/components/Ui/MyText';
import { UserPreviewWithBio } from '~/components/Ui/UserPreviewWithBio';
import { User, useSelect } from '~/hooks/useSelect';
import { useGetMyStaffs } from '~/lib/queries';

const SelectStaff = () => {
  const { userId } = useAuth();
  const { onSelect } = useSelect();
  const { data, isPending, isError, refetch, isRefetching, isRefetchError } =
    useGetMyStaffs(userId);

  if (isError || isRefetchError) {
    return <ErrorComponent refetch={refetch} />;
  }

  if (isPending) {
    return <LoadingComponent />;
  }

  const onSelectStaff = (item: User) => {
    onSelect(item);
    router.back();
  };
  const { staffs } = data;
  return (
    <Container>
      <AuthHeader path="Select Staff" />
      <FlatList
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        onRefresh={refetch}
        refreshing={isRefetching}
        data={staffs}
        renderItem={({ item }) => (
          <UserPreviewWithBio
            id={item?.userId?.userId!}
            imageUrl={item?.userId?.avatar!}
            name={item?.userId?.name!}
            bio={item.experience!}
            skills={item.skills!}
            onPress={() =>
              onSelectStaff({
                id: item?.userId?.userId!,
                name: item?.userId?.name!,
                image: item?.userId?.avatar!,
                role: item.role,
              })
            }
          />
        )}
        ListEmptyComponent={() => (
          <View style={{ alignItems: 'center', gap: 10 }}>
            <EmptyText text="No staffs Yet" />
            <MyButton onPress={() => router.push('/allStaffs')}>
              <MyText poppins="Bold" style={{ color: 'white', fontSize: 15 }}>
                Add a new staff
              </MyText>
            </MyButton>
          </View>
        )}
      />
    </Container>
  );
};

export default SelectStaff;
