import { useMutation, useQuery } from 'convex/react';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { toast } from 'sonner-native';

import { AddToCall } from '~/components/Dialogs/AddToCall';
import { WaitListModal } from '~/components/Dialogs/WaitListModal';
import { HeaderNav } from '~/components/HeaderNav';
import { BottomActive } from '~/components/Ui/BottomActive';
import { Container } from '~/components/Ui/Container';
import { LoadingComponent } from '~/components/Ui/LoadingComponent';
import { MyButton } from '~/components/Ui/MyButton';
import { UserPreview } from '~/components/Ui/UserPreview';
import { Waitlists } from '~/components/Ui/Waitlists';
import { WorkspaceButtons } from '~/components/Ui/WorkspaceButtons';
import { colors } from '~/constants/Colors';
import { WaitList } from '~/constants/types';
import { api } from '~/convex/_generated/api';
import { Id } from '~/convex/_generated/dataModel';
import { useGetUserId } from '~/hooks/useGetUserId';
import { useToken } from '~/hooks/useToken';
import { supabase } from '~/lib/supabase';

const Work = () => {
  const { id } = useLocalSearchParams<{ id: Id<'workspaces'> }>();
  const [showMenu, setShowMenu] = useState(false);
  const { id: loggedInUser } = useGetUserId();
  const [leaving, setLeaving] = useState(false);
  const [customerLeaving, setCustomerLeaving] = useState(false);
  const [customerToRemove, setCustomerToRemove] = useState<Id<'users'> | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const { getWorkspaceId } = useToken();

  const data = useQuery(api.workspace.getWorkspaceWithWaitingList, { workspaceId: id });
  const leaveLobby = useMutation(api.workspace.existLobby);
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

  const onLongPress = useCallback(
    (id: Id<'users'>) => {
      if (!isWorker) return;
      setCustomerLeaving(false);
      setCustomerToRemove(id);
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
  if (!isWorker && !isInWaitList && !customerLeaving) {
    return <Redirect href="/?removed=removed" />;
  }
  const onRemove = async () => {
    setLeaving(true);
    if (!customerToRemove) return;
    try {
      await leaveLobby({ customerId: customerToRemove!, workspaceId: id });
    } catch (error) {
      console.log(error);
      toast.error('Failed to remove from lobby', {
        description: 'Something went wrong',
      });
    } finally {
      setLeaving(false);
      setCustomerToRemove(null);
      onHideWaitList();
    }
  };

  const onLeave = async () => {
    setLeaving(true);

    try {
      await leaveLobby({ customerId: loggedInUser!, workspaceId: id });
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
  const handleExit = async () => {
    if (customerLeaving) {
      await onLeave();
    } else {
      await onRemove();
    }
  };
  const onShowExitModal = () => {
    setCustomerLeaving(true);
    setShowMenu(true);
  };
  const modalText = customerLeaving ? 'Exist lobby' : 'Remove from lobby';

  return (
    <>
      <AddToCall />
      <WaitListModal
        showMenu={showMenu}
        onClose={onHideWaitList}
        onRemove={handleExit}
        text={modalText}
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
            <WorkspaceButtons
              signedIn={workspace?.signedIn}
              onShowModal={showModal}
              onProcessors={onProcessors}
              onSignOff={toggleSignIn}
              loading={loading}
            />
          )}

          <Waitlists
            waitlists={waitlist}
            isWorker={isWorker}
            onLongPress={onLongPress}
            onAddToCall={onAddToCall}
          />
          {!isWorker && (
            <View
              style={{
                marginBottom: 20,
              }}>
              <MyButton onPress={onShowExitModal} loading={leaving}>
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
});
