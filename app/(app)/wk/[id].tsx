import { Avatar, BottomSheet, Icon, Switch } from '@rneui/themed';
import { useMutation, useQuery } from 'convex/react';
import { formatDistanceToNow } from 'date-fns';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { toast } from 'sonner-native';

import { AddToCall } from '~/components/Dialogs/AddToCall';
import { WaitListModal } from '~/components/Dialogs/WaitListModal';
import { HStack } from '~/components/HStack';
import { HeaderNav } from '~/components/HeaderNav';
import { Container } from '~/components/Ui/Container';
import { LoadingComponent } from '~/components/Ui/LoadingComponent';
import { MyButton } from '~/components/Ui/MyButton';
import { MyText } from '~/components/Ui/MyText';
import { UserPreview } from '~/components/Ui/UserPreview';
import VStack from '~/components/Ui/VStack';
import { colors } from '~/constants/Colors';
import { WaitList } from '~/constants/types';
import { api } from '~/convex/_generated/api';
import { Id } from '~/convex/_generated/dataModel';
import { useDarkMode } from '~/hooks/useDarkMode';
import { useGetUserId } from '~/hooks/useGetUserId';
import { useToken } from '~/hooks/useToken';
import { supabase } from '~/lib/supabase';

const Work = () => {
  const { id } = useLocalSearchParams<{ id: Id<'workspaces'> }>();
  const [showMenu, setShowMenu] = useState(false);
  const { id: loggedInUser } = useGetUserId();
  const [customerId, setCustomerId] = useState('');
  const [leaving, setLeaving] = useState(false);

  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const { getWorkspaceId } = useToken();

  const { darkMode } = useDarkMode();

  const data = useQuery(api.workspace.getWorkspaceWithWaitingList, { workspaceId: id });

  const isLocked = useMemo(() => data?.workspace.locked || false, [data?.workspace.locked]);
  const isWorker = data?.worker?._id === loggedInUser;
  const isActive = useMemo(() => {
    if (!data || !data?.workspace?.active) return false;
    return data?.workspace?.active;
  }, [data?.workspace?.active]);
  const isLeisure = useMemo(() => {
    if (!data || !data?.workspace?.leisure) return false;
    return data?.workspace?.leisure;
  }, [data?.workspace?.active]);
  // ? useEffect to check if the user is in the wait list
  const isInWaitList = useMemo(() => {
    if (!data) return true;
    return !!data.waitlist.find((w) => w?.customerId === loggedInUser);
  }, [data, loggedInUser]);

  // ? useEffect to subscribe to the workspace channel

  const onLongPress = useCallback(
    (customerId: string) => {
      if (!isWorker) return;
      setCustomerId(customerId);
      setShowMenu(true);
    },
    [isWorker]
  );
  const onHideWaitList = useCallback(() => {
    setShowMenu(false);
  }, []);
  if (isLocked) {
    toast.info('Workspace has been locked', {
      description: 'Please wait for admin to unlock it',
    });
    return <Redirect href="/" />;
  }
  if (!isWorker && !isInWaitList) {
    toast.info('You have been removed from this lobby', {
      description: `We hope to see you again`,
    });
    return <Redirect href="/" />;
  }
  const onRemove = async () => {
    setLeaving(true);
    try {
    } catch (error) {
      console.log(error);
      toast.error('Failed to remove from lobby', {
        description: 'Something went wrong',
      });
    } finally {
      setLeaving(false);
    }
  };

  const onLeave = async () => {
    setLeaving(true);
    try {
      // If we reach here, it means the deletion was successful
      toast.success('You have left the lobby', {
        description: 'Hope to see you back soon!',
      });
      onHideWaitList();
      router.back();
    } catch (error) {
      console.log(error);
      toast.error('Failed to leave the lobby', {
        description: 'Something went wrong',
      });
    } finally {
      setLeaving(false);
    }
  };

  if (!data) {
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
  const { workspace, waitlist, organization, worker } = data;
  const toggleSignIn = async () => {
    setLoading(true);
    if (workspace?.signedIn) {
      await onSignOff();
    } else {
      await onSignIn();
    }
  };
  const onClose = () => {
    setIsVisible(false);
  };

  const onAddToCall = async (item: WaitList) => {
    getWorkspaceId(item?.customerId);
  };

  return (
    <>
      <AddToCall />
      <WaitListModal
        showMenu={showMenu}
        onClose={onHideWaitList}
        onRemove={onRemove}
        text="Remove from lobby"
        loading={leaving}
      />
      <Container>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
          style={styles.container}>
          <HeaderNav title="Workspace" subTitle={`${organization?.name} lobby`} />
          <View style={{ marginTop: 20 }} />
          <UserPreview
            name={worker?.name}
            imageUrl={worker?.imageUrl!}
            subText={workspace?.role}
            workspace
            active={workspace?.active}
          />
          {isWorker && (
            <Buttons
              signedIn={workspace?.signedIn}
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
                  {isWorker ? 'Waiting in your lobby' : 'Waiting in lobby'}
                </Text>
                <View style={styles.rounded}>
                  <Text
                    style={{
                      color: 'white',
                      fontFamily: 'PoppinsMedium',
                      fontSize: 12,
                    }}>
                    {waitlist?.length}
                  </Text>
                </View>
              </HStack>
            )}
            scrollEnabled={false}
            data={waitlist}
            renderItem={({ item }) => (
              <Profile
                item={item}
                onAddToCall={onAddToCall}
                onLongPress={() => onLongPress(item?._id)}
              />
            )}
          />
          {!isWorker && (
            <View
              style={{
                marginBottom: 20,
              }}>
              <MyButton onPress={onLeave} loading={leaving}>
                <Text style={{ color: colors.white, fontFamily: 'PoppinsMedium', fontSize: 15 }}>
                  Exit Lobby
                </Text>
              </MyButton>
            </View>
          )}
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
    <HStack gap={10} mt={15} width="100%">
      <MyButton
        onPress={onShowModal}
        style={{
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: colors.dialPad,
          flex: 1,
        }}
        containerStyle={{ minWidth: '30%' }}
        labelStyle={{ color: colors.white, fontSize: 10 }}>
        Set status
      </MyButton>
      <MyButton
        onPress={onProcessors}
        style={{
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: colors.dialPad,
          flex: 1,
        }}
        containerStyle={{ minWidth: '30%' }}
        labelStyle={{ color: colors.white, fontSize: 10 }}>
        Processors
      </MyButton>
      <MyButton
        disabled={loading}
        onPress={onSignOff}
        style={{
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: signedIn ? 'red' : colors.openBackgroundColor,
          flex: 1,
        }}
        containerStyle={{ minWidth: '30%' }}
        labelStyle={{ color: signedIn ? 'red' : colors.white, fontSize: 10 }}>
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
        <Avatar rounded size={50} source={{ uri: item?.customer?.imageUrl! }} />
        <MyText poppins="Medium" fontSize={13}>
          {item?.customer?.name.split(' ')[0]}
        </MyText>
        <MyText poppins="Light" fontSize={10} style={{ textAlign: 'center' }}>
          {formatDistanceToNow(item?._creationTime)}
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
  id: Id<'workspaces'>;
}) => {
  const { darkMode } = useDarkMode();
  const toggleActiveStatus = useMutation(api.workspace.toggleWorkspaceStatus);
  const toggleActive = async () => {
    try {
      await toggleActiveStatus({ workspaceId: id, type: 'active' });
      toast.success('Active status updated', {
        description: 'Your active status has been updated',
      });
    } catch {
      toast.error('Failed to update active status', {
        description: 'Something went wrong',
      });
    }
  };

  const toggleLeisure = async () => {
    try {
      await toggleActiveStatus({ workspaceId: id, type: 'leisure' });
      toast.success('Leisure status updated', {
        description: 'Your leisure status has been updated',
      });
    } catch {
      toast.error('Failed to update leisure status', {
        description: 'Something went wrong',
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
          <VStack style={{ flex: 1 }}>
            <Text style={[styles.header, { color: darkMode === 'dark' ? 'white' : 'black' }]}>
              Active
            </Text>
            <Text style={[styles.text, { color: darkMode === 'dark' ? 'white' : 'black' }]}>
              This shows if you are active or not active
            </Text>
          </VStack>
          <VStack style={{ alignSelf: 'flex-end' }}>
            <Switch value={active} onValueChange={toggleActive} />
          </VStack>
        </HStack>
        <HStack alignItems="center" gap={10}>
          <VStack flex={1}>
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
