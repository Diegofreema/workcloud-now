import { useAuth } from '@clerk/clerk-expo';
import { Avatar, BottomSheet, Icon, Switch } from '@rneui/themed';
import { useStreamVideoClient } from '@stream-io/video-react-native-sdk';
import { useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import * as Crypto from 'expo-crypto';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { toast } from 'sonner-native';

import { AddToCall } from '~/components/Dialogs/AddToCall';
import { WaitListModal } from '~/components/Dialogs/WaitListModal';
import { HStack } from '~/components/HStack';
import { HeaderNav } from '~/components/HeaderNav';
import { Container } from '~/components/Ui/Container';
import { ErrorComponent } from '~/components/Ui/ErrorComponent';
import { LoadingComponent } from '~/components/Ui/LoadingComponent';
import { MyButton } from '~/components/Ui/MyButton';
import { MyText } from '~/components/Ui/MyText';
import { UserPreview } from '~/components/Ui/UserPreview';
import VStack from '~/components/Ui/VStack';
import { colors } from '~/constants/Colors';
import { WaitList } from '~/constants/types';
import { useDarkMode } from '~/hooks/useDarkMode';
import { useToken } from '~/hooks/useToken';
import { useGetWaitList, useGetWk } from '~/lib/queries';
import { supabase } from '~/lib/supabase';

const Work = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [showMenu, setShowMenu] = useState(false);
  const { userId } = useAuth();
  const [customerId, setCustomerId] = useState('');
  const [leaving, setLeaving] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isLeisure, setIsLeisure] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const { getWorkspaceId } = useToken();
  const queryClient = useQueryClient();
  const { darkMode } = useDarkMode();
  const client = useStreamVideoClient();
  const { data, isPaused, isPending, isError, refetch, isRefetchError } = useGetWk(id);
  const {
    data: waitListData,
    isPaused: isPausedWaitList,
    isPending: isPendingWaitList,
    isError: isErrorWaitList,
    refetch: refetchWaitList,
  } = useGetWaitList(id);
  useEffect(() => {
    if (data) {
      setIsActive(data?.wks?.active);
      setIsLeisure(data?.wks?.leisure);
    }
  }, [data]);
  useEffect(() => {
    const channel = supabase
      .channel('workspace')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
        },
        (payload) => {
          if (payload) {
            queryClient.invalidateQueries({ queryKey: ['wk', id] });
            queryClient.invalidateQueries({ queryKey: ['waitList', id] });
            queryClient.invalidateQueries({
              queryKey: ['pending_requests'],
            });
            queryClient.invalidateQueries({
              queryKey: ['myStaffs', userId],
            });
          }
          console.log('Change received!', payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  const onLongPress = useCallback((customerId: string) => {
    if (userId !== data?.wks?.workerId?.userId && userId !== customerId) return;
    setCustomerId(customerId);
    setShowMenu(true);
  }, []);
  const onHideWaitList = useCallback(() => {
    setShowMenu(false);
  }, []);
  const onRemove = async () => {
    setLeaving(true);
    try {
      const { error } = await supabase
        .from('waitList')
        .delete()
        .eq('workspace', data?.wks.id!)
        .eq('customer', customerId);
      if (error) {
        toast.error('Failed to remove from lobby', {
          description: 'Something went wrong',
        });
      }
      if (!error) {
        toast.success('Removed from lobby', {
          description: 'You have successfully removed someone from your lobby',
        });
        onHideWaitList();
      }
    } catch (error) {
      console.log(error);
      toast.error('Failed to remove from lobby', {
        description: 'Something went wrong',
      });
    } finally {
      setLeaving(false);
    }
  };
  console.log(data?.wks.id, customerId);

  const onLeave = async () => {
    if (userId !== customerId) return;
    setLeaving(true);
    try {
      const { error } = await supabase
        .from('waitList')
        .delete()
        .eq('workspace', Number(data?.wks.id!))
        .eq('customer', customerId);
      if (error) {
        console.log(error.message);

        toast.error('Failed to leave the lobby', {
          description: 'Something went wrong',
        });
      }
      if (!error) {
        toast.success('You have successfully left the lobby');
        onHideWaitList();
        router.back();
      }
    } catch (error) {
      console.log(error);
      toast.error('Failed to leave the lobby', {
        description: 'Something went wrong',
      });
    } finally {
      setLeaving(false);
    }
  };

  const onHandleRemove = useCallback(() => {
    if (userId === data?.wks?.workerId?.userId) {
      onRemove();
    } else {
      onLeave();
    }
  }, [userId, data?.wks?.workerId?.userId]);

  const removeText = useMemo(() => {
    if (userId === data?.wks?.workerId?.userId) {
      return 'Remove from lobby';
    }
    return 'Leave from lobby';
  }, [userId, data?.wks?.workerId?.userId]);
  const handleRefetch = () => {
    refetch();
    refetchWaitList();
  };
  if (isError || isRefetchError || isPaused || isPausedWaitList || isErrorWaitList) {
    return <ErrorComponent refetch={handleRefetch} />;
  }

  if (isPending || isPendingWaitList) {
    return <LoadingComponent />;
  }
  const showModal = () => {
    setIsVisible(true);
  };
  const onProcessors = () => {};

  const onSignOff = async () => {
    if (!id) return;
    try {
      const { error: err } = await supabase
        .from('workspace')
        .update({ active: false, signedIn: false })
        .eq('id', +id);
      if (err) {
        toast.error('Failed to sign off', {
          description: 'Something went wrong',
        });
      }

      if (!err) {
        toast.success('See you soon', {
          description: 'Signed off successfully',
        });
      }
    } catch (error) {
      console.log(error);

      toast.error('Something went wrong', {
        description: 'Failed to sign off',
      });
    } finally {
      setLoading(false);
    }
  };
  const onSignIn = async () => {
    if (!id) return;
    try {
      const { error: err } = await supabase
        .from('workspace')
        .update({ active: true, signedIn: true })
        .eq('id', +id);
      if (err) {
        toast.error('Failed to sign in', {
          description: 'Please again later',
        });
      }

      if (!err) {
        toast.success('Sign in successful', {
          description: 'Welcome back',
        });
      }
    } catch (error) {
      console.log(error);

      toast.error('Something went wrong', {
        description: 'Failed to sign in',
      });
    } finally {
      setLoading(false);
    }
  };
  const toggleSignIn = async () => {
    setLoading(true);
    if (wks.signedIn) {
      onSignOff();
    } else {
      onSignIn();
    }
  };
  const onClose = () => {
    setIsVisible(false);
  };
  const { wks } = data;

  const { waitList } = waitListData;

  const onAddToCall = async (item: WaitList) => {
    getWorkspaceId(item?.id);
    console.log({ workerId: wks?.workerId?.userId, customerId: item?.customer.userId });
    if (userId === wks?.workerId?.userId) {
      const call = client?.call('default', Crypto.randomUUID());
      await call?.getOrCreate({
        ring: true,
        data: {
          members: [
            { user_id: wks?.workerId?.userId, role: 'admin' },
            { user_id: item?.customer.userId },
          ],
        },
      });
    }
  };

  return (
    <>
      <AddToCall />
      <WaitListModal
        showMenu={showMenu}
        onClose={onHideWaitList}
        onRemove={onHandleRemove}
        text={removeText}
        loading={leaving}
      />
      <Container>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
          style={styles.container}>
          <HeaderNav title="Workspace" subTitle={`${wks.organizationId.name} lobby`} />
          <View style={{ marginTop: 20 }} />
          <UserPreview
            name={wks.workerId.name}
            imageUrl={wks.workerId.avatar}
            subText={wks.role}
            workspace
            active={wks.active}
          />
          {userId === wks?.workerId?.userId && (
            <Buttons
              signedIn={wks.signedIn}
              onShowModal={showModal}
              onProcessors={onProcessors}
              onSignOff={toggleSignIn}
              loading={loading}
            />
          )}

          <FlatList
            contentContainerStyle={{
              flexGrow: 1,
              gap: 10,
              width: '100%',
            }}
            columnWrapperStyle={{ gap: 10 }}
            numColumns={3}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={() => (
              <HStack gap={5} alignItems="center" my={20}>
                <Text
                  style={{
                    color: darkMode === 'dark' ? 'white' : 'black',
                    fontFamily: 'PoppinsBold',
                  }}>
                  {userId === wks?.workerId?.userId ? 'Waiting in your lobby' : 'Waiting in lobby'}
                </Text>
                <View style={styles.rounded}>
                  <Text
                    style={{
                      color: 'white',
                      fontFamily: 'PoppinsMedium',
                      fontSize: 12,
                    }}>
                    {waitList?.length}
                  </Text>
                </View>
              </HStack>
            )}
            scrollEnabled={false}
            data={waitList}
            renderItem={({ item }) => (
              <Profile
                item={item}
                onAddToCall={onAddToCall}
                onLongPress={() => onLongPress(item.customer.userId)}
              />
            )}
          />
          <BottomActive
            id={id}
            onClose={onClose}
            active={isActive}
            leisure={isLeisure}
            isVisible={isVisible}
          />
        </ScrollView>
      </Container>
    </>
  );
};

export default Work;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    color: 'black',
    fontSize: 17,
    fontFamily: 'PoppinsBold',
  },
  text: { color: 'black', fontFamily: 'PoppinsLight' },
  rounded: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'blue',
    alignItems: 'center',
  },
});

type ButtonProps = {
  onShowModal: () => void;
  onProcessors: () => void;
  onSignOff: () => void;
  loading: boolean;
  signedIn: boolean;
};
const Buttons = ({ onShowModal, onProcessors, onSignOff, loading, signedIn }: ButtonProps) => {
  return (
    <HStack gap={10} mt={15}>
      <MyButton
        onPress={onShowModal}
        style={{
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: colors.dialPad,
        }}
        labelStyle={{ color: colors.white }}>
        Set status
      </MyButton>
      <MyButton
        onPress={onProcessors}
        style={{
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: colors.dialPad,
        }}
        labelStyle={{ color: colors.white }}>
        Processors
      </MyButton>
      <MyButton
        disabled={loading}
        onPress={onSignOff}
        style={{
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: signedIn ? 'red' : colors.openBackgroundColor,
        }}
        labelStyle={{ color: signedIn ? 'red' : colors.white }}>
        {signedIn ? 'Sign off' : 'Sign in'}
      </MyButton>
    </HStack>
  );
};

const Profile = ({
  item,
  onAddToCall,
  onLongPress,
}: {
  item: WaitList;
  onAddToCall: (item: WaitList) => void;
  onLongPress: () => void;
}) => {
  return (
    <Pressable style={{ width: '30%' }} onPress={() => onAddToCall(item)} onLongPress={onLongPress}>
      <VStack flex={1} alignItems="center" justifyContent="center">
        <Avatar rounded size={50} source={{ uri: item?.customer?.avatar }} />
        <MyText poppins="Medium" fontSize={13}>
          {item?.customer?.name.split(' ')[0]}
        </MyText>
        <MyText poppins="Light" fontSize={10} style={{ textAlign: 'center' }}>
          {formatDistanceToNow(item.created_at)}
        </MyText>
      </VStack>
    </Pressable>
  );
};

const BottomActive = ({
  onClose,
  active,
  leisure,
  isVisible,
  id,
}: {
  onClose: () => void;
  active: boolean;
  leisure: boolean;
  isVisible: boolean;
  id: any;
}) => {
  const { darkMode } = useDarkMode();

  const toggleActive = async () => {
    const { error } = await supabase.from('workspace').update({ active: !active }).eq('id', id);
    if (error) {
      toast.error('Failed to update active status', {
        description: 'Something went wrong',
      });
    }

    if (!error) {
      toast.success('Active status updated', {
        description: 'Your active status has been updated',
      });
    }
  };

  const toggleLeisure = async () => {
    const { error } = await supabase.from('workspace').update({ leisure: !leisure }).eq('id', id);
    if (error) {
      toast.error('Failed to update leisure status', {
        description: 'Something went wrong',
      });
    }

    if (!error) {
      toast.success('Leisure status updated', {
        description: 'Your leisure status has been updated',
      });
    }
  };

  return (
    <BottomSheet
      modalProps={{}}
      onBackdropPress={onClose}
      scrollViewProps={{
        showsVerticalScrollIndicator: false,
        style: {
          backgroundColor: darkMode === 'dark' ? 'black' : 'white',
          padding: 10,
          borderTopRightRadius: 40,
          borderTopLeftRadius: 40,
          height: '40%',
        },
        contentContainerStyle: {
          height: '100%',
        },
      }}
      isVisible={isVisible}>
      <HStack width="100%" justifyContent="center" alignItems="center" gap={10} mt={20}>
        <Text
          style={{
            color: darkMode === 'dark' ? 'white' : 'black',
            textAlign: 'center',
            fontFamily: 'PoppinsBold',
            fontSize: 20,
            marginTop: 10,
          }}>
          Set status
        </Text>
        <Icon
          name="close"
          onPress={onClose}
          color="black"
          style={{ position: 'absolute', right: 5, top: -10 }}
        />
      </HStack>

      <VStack gap={10} mx={10} mt={20}>
        <HStack alignItems="center" gap={5}>
          <VStack>
            <Text style={[styles.header, { color: darkMode === 'dark' ? 'white' : 'black' }]}>
              Active
            </Text>
            <Text style={[styles.text, { color: darkMode === 'dark' ? 'white' : 'black' }]}>
              This shows if you are active or not active
            </Text>
          </VStack>
          <Switch value={active} onValueChange={toggleActive} />
        </HStack>
        <HStack alignItems="center" gap={10}>
          <VStack>
            <Text style={[styles.header, { color: darkMode === 'dark' ? 'white' : 'black' }]}>
              Leisure
            </Text>
            <Text style={[styles.text, { color: darkMode === 'dark' ? 'white' : 'black' }]}>
              This shows that you are not completely active, probably on a break
            </Text>
          </VStack>
          <Switch value={leisure} onValueChange={toggleLeisure} />
        </HStack>
      </VStack>
    </BottomSheet>
  );
};
