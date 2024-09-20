import { useAuth } from '@clerk/clerk-expo';
import { FontAwesome6 } from '@expo/vector-icons';
import { Avatar } from '@rneui/themed';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { router, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { toast } from 'sonner-native';
import { useChatContext } from 'stream-chat-expo';

import { EmptyText } from '~/components/EmptyText';
import { HStack } from '~/components/HStack';
import { HeaderNav } from '~/components/HeaderNav';
import { Container } from '~/components/Ui/Container';
import { ErrorComponent } from '~/components/Ui/ErrorComponent';
import { LoadingComponent } from '~/components/Ui/LoadingComponent';
import { MyText } from '~/components/Ui/MyText';
import VStack from '~/components/Ui/VStack';
import { colors } from '~/constants/Colors';
import { WorkerWithWorkspace } from '~/constants/types';
import { useDarkMode } from '~/hooks/useDarkMode';
import { useGetOrg, useGetPosts, useOrgsWorkers } from '~/lib/queries';
import { supabase } from '~/lib/supabase';

const Reception = () => {
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  const { id, search } = useLocalSearchParams<{ id: string; search: string }>();
  const { data, isPending, error, refetch, isPaused } = useGetOrg(id!);

  const {
    data: posts,
    isPending: isPendingPosts,

    refetch: refetchPosts,
    isPaused: isPausedPosts,
    isError,
    isRefetchError,
  } = useGetPosts(data?.org?.id);
  const {
    data: workers,
    isPending: isPendingWorkers,
    error: errorWorkers,
    refetch: refetchWorkers,
    isPaused: isPausedWorkers,
  } = useOrgsWorkers(data?.org?.id);
  const { width } = useWindowDimensions();

  useEffect(() => {
    const onIncreaseSearchCount = async () => {
      if (data?.org?.search_count !== undefined) {
        const { error } = await supabase
          .from('organization')
          .update({ search_count: data.org.search_count + 1 })
          .eq('id', id);
        queryClient.invalidateQueries({
          queryKey: ['top_search'],
        });
        if (error) {
          console.error('Error updating search count:', error);
        }
      }
    };
    if (search === 'true') {
      console.log('search');
      onIncreaseSearchCount();
    }
  }, [search, id, data?.org?.search_count]);

  useEffect(() => {
    if (!id || !userId || !workers?.workers) return;
    const createConnection = async () => {
      const { data } = await supabase
        .from('connections')
        .select('connectedTo, id')
        .eq('owner', userId!);

      const connected = data?.find((item) => item?.connectedTo?.toString() === id);

      if (connected) {
        await supabase
          .from('connections')
          .update({
            created_at: format(new Date(), 'dd/MM/yyyy HH:mm'),
          })
          .eq('id', connected?.id);
      } else {
        await supabase.from('connections').insert({
          owner: userId,
          connectedTo: +id,
        });
      }

      if (error) {
        console.log(error);
      }
      if (!error) {
        queryClient.invalidateQueries({
          queryKey: ['connections', userId],
        });
      }
    };
    const loggedInUserIsNotAWorker = !workers?.workers?.some(
      (worker) => worker.userId.userId === userId
    );
    if (data?.org?.ownerId !== userId && loggedInUserIsNotAWorker) createConnection();
  }, [id, userId, workers?.workers]);

  const handleRefetch = () => {
    refetch();
    refetchWorkers();
    refetchPosts();
  };
  if (
    error ||
    isPausedWorkers ||
    isPaused ||
    errorWorkers ||
    isError ||
    isRefetchError ||
    isPausedPosts
  ) {
    return <ErrorComponent refetch={handleRefetch} />;
  }
  if (isPending || isPendingWorkers || isPendingPosts) {
    return <LoadingComponent />;
  }

  const { org } = data;
  const { workers: staffs } = workers;

  return (
    <Container>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20, flexGrow: 1 }}
        style={{ flex: 1 }}>
        <HeaderNav
          title={org?.name}
          subTitle={org?.category}
          RightComponent={ReceptionRightHeader}
        />
        <HStack gap={10} alignItems="center" my={10}>
          <Avatar rounded source={{ uri: org?.avatar }} size={50} />
          <VStack>
            <MyText poppins="Medium" style={{ color: colors.nine }}>
              Opening hours:
            </MyText>

            <HStack gap={20} mb={10} alignItems="center">
              <MyText poppins="Medium">Monday - Friday</MyText>
              <HStack alignItems="center">
                <View style={styles.subCon}>
                  <MyText
                    poppins="Bold"
                    style={{
                      color: colors.openBackgroundColor,
                    }}>
                    {org?.start}
                  </MyText>
                </View>
                <Text style={{ marginBottom: 5 }}> - </Text>
                <View style={[styles.subCon, { backgroundColor: colors.closeBackgroundColor }]}>
                  <MyText
                    poppins="Bold"
                    style={{
                      color: colors.closeTextColor,
                    }}>
                    {org?.end}
                  </MyText>
                </View>
              </HStack>
            </HStack>
          </VStack>
        </HStack>

        <View>
          {posts?.imgUrls?.length > 0 && (
            <Carousel
              loop
              width={width}
              height={150}
              autoPlay
              data={posts?.imgUrls}
              scrollAnimationDuration={1500}
              renderItem={({ index, item }) => (
                <View
                  style={{
                    width: width * 0.98,
                    height: 150,
                    borderRadius: 5,
                    overflow: 'hidden',
                  }}>
                  <Image src={item.postUrl} style={styles.image} resizeMode="cover" />
                </View>
              )}
            />
          )}
        </View>
        <MyText
          poppins="Bold"
          style={{
            fontSize: 12,
            marginVertical: 20,
          }}>
          Representatives
        </MyText>
        <Representatives data={staffs} />
      </ScrollView>
    </Container>
  );
};

export default Reception;
const styles = StyleSheet.create({
  subCon: {
    paddingHorizontal: 7,
    borderRadius: 3,
    backgroundColor: colors.openTextColor,
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 5,
  },
});

const Representatives = ({ data }: { data: WorkerWithWorkspace[] }) => {
  return (
    <FlatList
      scrollEnabled={false}
      data={data}
      contentContainerStyle={{
        paddingBottom: 30,
        flexDirection: 'row',
        gap: 15,
      }}
      renderItem={({ item }) => <RepresentativeItem item={item} />}
      ListEmptyComponent={() => <EmptyText text="No representatives yet" />}
    />
  );
};

const RepresentativeItem = ({ item }: { item: WorkerWithWorkspace }) => {
  const router = useRouter();
  const { userId: id } = useAuth();
  const { client } = useChatContext();
  const handlePress = async () => {
    if (id === item.userId.userId) return;
    const { data, error: err } = await supabase
      .from('waitList')
      .select()
      // @ts-ignore
      .eq('workspace', item?.workspaceId?.id);

    if (!err) {
      const customerInWaitList = data?.find((c) => c.customer === id);
      if (customerInWaitList) {
        await supabase.from('waitList').delete().eq('id', customerInWaitList?.id);
        const { error: er } = await supabase.from('waitList').insert({
          workspace: item?.workspaceId?.id,
          customer: id,
        });
        if (er) {
          console.log(er);

          toast.error('Something went wrong', {
            description: 'Please try joining again',
          });
        }

        if (!er) {
          toast.success('Welcome back to our workspace', {
            description: 'Please be in a quiet place',
          });

          router.replace(`/wk/${item?.workspaceId?.id}`);
        }
      } else {
        const { error } = await supabase.from('waitList').insert({
          workspace: item?.workspaceId?.id,
          customer: id,
        });

        if (error) {
          console.log(error);

          toast.error('Something went wrong', {
            description: 'Please try joining again',
          });
        }

        if (!error) {
          toast.success('Welcome to our workspace', {
            description: 'Please be in a quiet place',
          });
          router.replace(`/wk/${item?.workspaceId?.id}`);
        }
      }
    }
  };

  const onPress = async () => {
    const channel = client.channel('messaging', {
      members: [id!, item?.userId?.userId!],
    });

    await channel.watch();
    // @ts-ignore
    router.push(`/chat/${channel.id}?workerId=${item?.userId?.userId}`);
  };

  return (
    <Pressable
      style={({ pressed }) => [
        {
          opacity: pressed ? 0.5 : 1,
          marginBottom: 10,
        },
      ]}
      onPress={handlePress}>
      <VStack alignItems="center" justifyContent="center" gap={2}>
        <Avatar rounded source={{ uri: item?.userId.avatar }} size={50} />
        <MyText poppins="Medium" fontSize={11} style={{ textAlign: 'center' }}>
          {item?.role}
        </MyText>

        {item?.workspaceId && item?.workspaceId?.active && (
          <View
            style={{
              backgroundColor: colors.openTextColor,
              borderRadius: 20,
              alignItems: 'center',
              justifyContent: 'center',
              padding: 3,
            }}>
            <MyText poppins="Bold" style={{ color: colors.openBackgroundColor }}>
              Active
            </MyText>
          </View>
        )}
        {item?.workspaceId && !item?.workspaceId?.active && (
          <>
            <View
              style={{
                backgroundColor: colors.closeBackgroundColor,
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center',
                padding: 3,
              }}>
              <MyText poppins="Bold" style={{ color: colors.closeTextColor }}>
                Inactive
              </MyText>
            </View>

            {item?.userId?.userId !== id && (
              <Pressable
                onPress={onPress}
                style={{
                  backgroundColor: '#C0D1FE',
                  padding: 7,
                  marginTop: 5,
                  borderRadius: 5,
                }}>
                <MyText poppins="Medium" style={{ color: colors.dialPad }}>
                  Message
                </MyText>
              </Pressable>
            )}
          </>
        )}
      </VStack>
    </Pressable>
  );
};

const ReceptionRightHeader = () => {
  const { darkMode } = useDarkMode();
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <Pressable
      style={({ pressed }) => ({ padding: 5, opacity: pressed ? 0.5 : 1 })}
      onPress={() => router.push(`/overview/${id}`)}>
      <FontAwesome6
        name="building-columns"
        size={24}
        color={darkMode === 'dark' ? colors.white : colors.black}
      />
    </Pressable>
  );
};
