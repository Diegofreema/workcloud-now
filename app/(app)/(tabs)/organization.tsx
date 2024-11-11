import { useUser } from '@clerk/clerk-expo';
import { FontAwesome } from '@expo/vector-icons';
import { Avatar } from '@rneui/themed';
import { router } from 'expo-router';
import React from 'react';
import { FlatList, Pressable, View } from 'react-native';
import { toast } from 'sonner-native';

import { EmptyText } from '../../../components/EmptyText';
import { ErrorComponent } from '../../../components/Ui/ErrorComponent';
import { LoadingComponent } from '../../../components/Ui/LoadingComponent';
import { WorkCloudHeader } from '../../../components/WorkCloudHeader';
import { WorkspaceItem } from '../../../components/WorkspaceItem';
import { useDarkMode } from '../../../hooks/useDarkMode';
import { useOtherOrgs, usePersonalOrgs } from '../../../lib/queries';

import { HStack } from '~/components/HStack';
import { Container } from '~/components/Ui/Container';
import { MyText } from '~/components/Ui/MyText';
import VStack from '~/components/Ui/VStack';
import { colors } from '~/constants/Colors';
import { WK } from '~/constants/types';

const Organization = () => {
  const { user } = useUser();
  const { data, isPending, refetch, isError, isPaused, error } = usePersonalOrgs(user?.id);
  const { darkMode } = useDarkMode();
  const {
    data: otherOrgs,
    isPending: isPendingOther,
    refetch: refetchOther,
    isError: isErrorOther,
    isPaused: isPausedOther,
    isRefetching,
  } = useOtherOrgs(user?.id);

  const handleRefetch = () => {
    refetch();
    refetchOther();
  };
  if (error) {
    console.log(error.name, error.message);
  }
  if (isError || isPaused || isPausedOther || isErrorOther) {
    return <ErrorComponent refetch={handleRefetch} />;
  }
  if (isPending || isPendingOther) {
    return <LoadingComponent />;
  }

  const { organizations } = data;
  const organization = organizations[0];

  return (
    <Container>
      <View style={[{ flexDirection: 'row', justifyContent: 'space-between' }]}>
        <MyText style={{ fontSize: 15 }} poppins="Medium">
          Organization
        </MyText>
        <Pressable
          onPress={() => router.push('/search')}
          style={({ pressed }) => pressed && { opacity: 0.5 }}>
          <FontAwesome
            name="search"
            size={20}
            color={darkMode === 'dark' ? colors.white : colors.black}
          />
        </Pressable>
      </View>
      <View style={{ marginVertical: 14 }}>
        {!data.organizations.length ? (
          <WorkCloudHeader />
        ) : (
          <View style={{ gap: 15 }}>
            <WorkspaceItem item={organization} onPress={() => router.push(`/my-org`)} />
          </View>
        )}
      </View>

      <View style={{ marginTop: data === null ? 20 : 0 }}>
        <MyText
          style={{
            fontSize: 13,
          }}
          poppins="Medium">
          Assigned workspace
        </MyText>

        <FlatList
          data={otherOrgs?.workspace}
          renderItem={({ item }) => <Workspace item={item} />}
          keyExtractor={(item) => item.id.toString()}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          onRefresh={handleRefetch}
          refreshing={isRefetching}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => <EmptyText text="No assigned workspace yet" />}
          contentContainerStyle={{ paddingBottom: 50 }}
        />
      </View>
    </Container>
  );
};

export default Organization;

const Workspace = ({ item }: { item: WK }) => {
  console.log(item.id, item.locked);

  const handlePress = () => {
    if (item?.locked) {
      toast('This workspace is locked', {
        description: 'Please wait till the admin unlocks it',
      });
      return;
    }
    router.replace(`/wk/${item?.id}`);
  };

  const imgUrl = item?.personal ? item?.ownerId?.avatar : item?.organizationId?.avatar;

  return (
    <Pressable
      onPress={handlePress}
      style={{
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
      }}>
      <HStack gap={10} alignItems="center">
        <Avatar rounded source={{ uri: imgUrl }} size={50} />
        <VStack>
          <MyText poppins="Bold" style={{ fontSize: 13 }}>
            {item?.role}
          </MyText>
          <View
            style={{
              backgroundColor: item?.active ? colors.openTextColor : colors.closeBackgroundColor,
              paddingHorizontal: 2,
              borderRadius: 3,
              alignItems: 'center',
            }}>
            <MyText
              poppins="Light"
              style={{
                color: item?.active ? colors.openBackgroundColor : colors.closeTextColor,
              }}>
              {item?.active ? 'Active' : 'Not active'}
            </MyText>
          </View>
        </VStack>
      </HStack>

      {item?.locked && (
        <HStack gap={5} alignItems="center" bg={colors.closeBackgroundColor} px={5} rounded={6}>
          <FontAwesome name="lock" size={20} color={colors.closeTextColor} />
          <MyText poppins="Bold" style={{ color: colors.closeTextColor }}>
            Locked
          </MyText>
        </HStack>
      )}
    </Pressable>
  );
};
