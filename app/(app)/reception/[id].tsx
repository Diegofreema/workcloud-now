import { useAuth } from '@clerk/clerk-expo';
import { convexQuery } from '@convex-dev/react-query';
import { FontAwesome6 } from '@expo/vector-icons';
import { Avatar } from '@rneui/themed';
import { useQuery as useQueryTanstack, useQueryClient } from '@tanstack/react-query';
import { useMutation, useQuery } from 'convex/react';
import { format } from 'date-fns';
import { ErrorBoundaryProps, router, useLocalSearchParams, useRouter } from 'expo-router';
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
import { api } from '~/convex/_generated/api';
import { Id } from '~/convex/_generated/dataModel';
import { useDarkMode } from '~/hooks/useDarkMode';
import { useGetUserId } from '~/hooks/useGetUserId';
import { supabase } from '~/lib/supabase';

export function ErrorBoundary({ retry }: ErrorBoundaryProps) {
  return <ErrorComponent refetch={retry} />;
}

const Reception = () => {
  const { id } = useLocalSearchParams<{ id: Id<'organizations'> }>();
  const { userId } = useAuth();
  const { id: from } = useGetUserId(userId!);
  const data = useQuery(api.organisation.getOrganisationsWithPostAndWorkers, { id });
  const {
    data: connection,
    isPending,
    isError,
    refetch,
  } = useQueryTanstack(convexQuery(api.connection.getConnection, { to: id, from: from! }));
  const createConnection = useMutation(api.connection.createConnection);
  const updateConnection = useMutation(api.connection.updateConnection);
  const { width } = useWindowDimensions();

  // ? useEffect for creating connections
  useEffect(() => {
    if (!id || !data?.workers || !connection || !from) return;
    const now = format(new Date(), 'dd/MM/yyy HH:mm');
    const onConnect = async () => {
      try {
        if (!isPending && !connection) {
          await createConnection({
            connectedAt: now,
            from,
            to: id,
          });
        } else {
          await updateConnection({
            id: connection?._id,
            time: now,
          });
        }
      } catch (e) {
        console.log(e);
      }
    };
    const isWorker = data.workers.find((w) => w?.user?._id === from);
    const isBoss = data?.ownerId === from;
    if (!isWorker && !isBoss) onConnect().catch((e) => console.log(e));
  }, [id, data?.workers, connection, isPending, from]);

  if (isError) {
    return <ErrorComponent refetch={refetch} />;
  }

  if (!data || isPending) {
    return <LoadingComponent />;
  }

  return (
    <Container>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20, flexGrow: 1 }}
        style={{ flex: 1 }}>
        <HeaderNav
          title={data?.name}
          subTitle={data?.category}
          RightComponent={ReceptionRightHeader}
        />
        <HStack gap={10} alignItems="center" my={10}>
          <Avatar rounded source={{ uri: data?.avatar }} size={50} />
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
                    {data?.start}
                  </MyText>
                </View>
                <Text style={{ marginBottom: 5 }}> - </Text>
                <View style={[styles.subCon, { backgroundColor: colors.closeBackgroundColor }]}>
                  <MyText
                    poppins="Bold"
                    style={{
                      color: colors.closeTextColor,
                    }}>
                    {data?.end}
                  </MyText>
                </View>
              </HStack>
            </HStack>
          </VStack>
        </HStack>

        <View>
          {data?.posts?.length > 0 && (
            <Carousel
              loop
              width={width}
              height={150}
              autoPlay
              data={data?.posts}
              scrollAnimationDuration={1500}
              renderItem={({ item }) => (
                <View
                  style={{
                    width: width * 0.98,
                    height: 150,
                    borderRadius: 5,
                    overflow: 'hidden',
                  }}>
                  <Image src={item!} style={styles.image} resizeMode="cover" />
                </View>
              )}
              vertical={false}
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
        <Representatives data={data?.workers} />
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
        gap: 15,
        flexGrow: 1,
      }}
      renderItem={({ item }) => <RepresentativeItem item={item} />}
      ListEmptyComponent={() => <EmptyText text="No representatives yet" />}
      columnWrapperStyle={{ gap: 5 }}
      numColumns={3}
    />
  );
};

const RepresentativeItem = ({ item }: { item: WorkerWithWorkspace }) => {
  const router = useRouter();
  const { userId: id } = useAuth();

  const queryClient = useQueryClient();
  const handlePress = async () => {
    if (id === item.user?.clerkId) return;
    if (!item?.workspace?.active) {
      toast.error('This workspace is currently inactive', {
        description: 'Please try joining another workspace',
      });
      return;
    }
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
          // @ts-ignore
          workspace: item?.workspace?._id,
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
          queryClient.invalidateQueries({ queryKey: ['waitList'] });
          router.replace(`/wk/${item?.workspace?._id}`);
        }
      } else {
        const { error } = await supabase.from('waitList').insert({
          // @ts-ignore
          workspace: item?.workspace?._id,
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
          queryClient.invalidateQueries({ queryKey: ['waitList'] });

          router.replace(`/wk/${item?.workspace?._id}`);
        }
      }
    }
  };

  const onPress = async () => {
    // @ts-ignore
    router.push(`/chat/${channel.id}?workerId=${item?.userId?.userId}`);
  };

  return (
    <Pressable
      style={({ pressed }) => [
        {
          opacity: pressed ? 0.5 : 1,
          marginBottom: 10,

          width: '33%',
        },
      ]}
      onPress={handlePress}>
      <VStack alignItems="center" justifyContent="center" gap={2}>
        <Avatar rounded source={{ uri: item?.user?.imageUrl! }} size={50} />
        <MyText poppins="Medium" fontSize={11} style={{ textAlign: 'center' }}>
          {item?.role}
        </MyText>

        {item?.workspace && item?.workspace?.active && (
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
        {item?.workspace && !item?.workspace?.active && (
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

            {item?.user?.clerkId !== id && (
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
