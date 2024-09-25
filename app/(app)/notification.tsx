import { useAuth } from '@clerk/clerk-expo';
import { Divider } from '@rneui/themed';
import React, { useEffect, useState } from 'react';
import { FlatList } from 'react-native';

import { MyModal } from '~/components/Dialogs/MyModal';
import { EmptyText } from '~/components/EmptyText';
import { HeaderNav } from '~/components/HeaderNav';
import { Container } from '~/components/Ui/Container';
import { ErrorComponent } from '~/components/Ui/ErrorComponent';
import { LoadingComponent } from '~/components/Ui/LoadingComponent';
import { WorkPreview } from '~/components/Ui/UserPreview';
import { useDarkMode } from '~/hooks/useDarkMode';
import { usePendingRequest } from '~/lib/queries';
import { supabase } from '~/lib/supabase';

const Notification = () => {
  const { userId: id } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { darkMode } = useDarkMode();
  const { data, isPaused, isPending, isError, refetch, isRefetching, isRefetchError } =
    usePendingRequest(id);

  useEffect(() => {
    if (data) {
      const markAllAsRead = async () => {
        try {
          data.requests.forEach(async (request) => {
            if (request.unread) {
              await supabase.from('request').update({ unread: false }).eq('id', request.id);
            }
          });
        } catch (error) {
          console.log(error);
        }
      };
      markAllAsRead();
    }
  }, [data]);

  if (isError || isRefetchError || isPaused || data?.error) {
    return <ErrorComponent refetch={refetch} />;
  }

  if (isPending) {
    return <LoadingComponent />;
  }
  // 6602c083d9c51008cb52b02c
  const { requests } = data;

  const onPress = async () => {
    setIsLoading(true);
    const { error } = await supabase
      .from('workspace')
      .update({
        workerId: null,
        locked: true,
        active: false,
        signedIn: false,
        leisure: false,
      })
      .eq('id', id!);
    if (!error) {
    }

    // try {
    //   const { error } = await supabase
    //     .from('workspace')
    //     .update({
    //       salary: salary,
    //       responsibility: responsibility,
    //       workerId: to?.userId,
    //     })
    //     .eq('id', workspaceId);

    //   const { error: err } = await supabase
    //     .from('worker')
    //     .update({
    //       role: role,
    //       bossId: from?.userId,
    //       workspaceId: workspaceId,
    //       organizationId: from?.organizationId?.id,
    //     })
    //     .eq('id', to.workerId);
    //   if (!error && !err) {
    //     const { error } = await supabase
    //       .from('request')
    //       .delete()
    //       .eq('id', id);
    //     Toast.show({
    //       type: 'success',
    //       text1: 'Request has been accepted',
    //     });

    //     router.push('/organization');
    //   }
    //   if (error || err) {
    //     Toast.show({
    //       type: 'error',
    //       text1: 'Something went wrong',
    //     });
    //     console.log(error || err);
    //   }
    // } catch (error) {
    //   console.log(error);
    //   Toast.show({
    //     type: 'error',
    //     text1: 'Something went wrong',
    //   });
    // } finally {
    //   setAccepting(false);
    // }
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
          data={requests}
          renderItem={({ item }) => <WorkPreview item={item} />}
          keyExtractor={(item) => item?.id.toString()}
        />
      </Container>
    </>
  );
};

export default Notification;
