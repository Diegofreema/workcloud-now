import { useAuth } from '@clerk/clerk-expo';
import { router } from 'expo-router';
import { FlatList, Pressable, View } from 'react-native';

import { AuthHeader } from '~/components/AuthHeader';
import { EmptyText } from '~/components/EmptyText';
import { HStack } from '~/components/HStack';
import { Container } from '~/components/Ui/Container';
import { ErrorComponent } from '~/components/Ui/ErrorComponent';
import { LoadingComponent } from '~/components/Ui/LoadingComponent';
import { MyButton } from '~/components/Ui/MyButton';
import { MyText } from '~/components/Ui/MyText';
import { UserPreview } from '~/components/Ui/UserPreview';
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
          <HStack justifyContent="space-between" alignItems="center">
            <Pressable
              onPress={() =>
                onSelectStaff({
                  id: item.userId?.userId!,
                  image: item.userId?.avatar!,
                  name: item.userId?.name!,
                  role: item.role,
                })
              }
              style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}>
              <UserPreview
                id={item?.id}
                imageUrl={item?.userId?.avatar}
                name={item?.userId?.name}
                subText={item?.role}
              />
            </Pressable>
          </HStack>
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
