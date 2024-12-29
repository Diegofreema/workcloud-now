import { convexQuery } from '@convex-dev/react-query';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BottomSheet, Divider } from '@rneui/themed';
import { useQuery } from '@tanstack/react-query';
import { useMutation } from 'convex/react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { toast } from 'sonner-native';

import { AuthHeader } from '~/components/AuthHeader';
import { AddStaff, Menu } from '~/components/Dialogs/AddStaff';
import { AddToWorkspace } from '~/components/Dialogs/AddToWorkspace';
import { RemoveUser } from '~/components/Dialogs/RemoveUser';
import { SelectNewRow } from '~/components/Dialogs/SelectNewRow';
import { EmptyText } from '~/components/EmptyText';
import { HStack } from '~/components/HStack';
import { Container } from '~/components/Ui/Container';
import { DottedButton } from '~/components/Ui/DottedButton';
import { ErrorComponent } from '~/components/Ui/ErrorComponent';
import { LoadingComponent } from '~/components/Ui/LoadingComponent';
import { MyText } from '~/components/Ui/MyText';
import { UserPreview } from '~/components/Ui/UserPreview';
import { colors } from '~/constants/Colors';
import { WorkType } from '~/constants/types';
import { api } from '~/convex/_generated/api';
import { Id } from '~/convex/_generated/dataModel';
import { useDarkMode } from '~/hooks/useDarkMode';
import { useHandleStaff } from '~/hooks/useHandleStaffs';

const allRoles = [
  'All',
  'Customer service',
  'Sales Representative',
  'Account opening',
  'Logistics',
  'ICT',
];
const Staffs = () => {
  const { id } = useLocalSearchParams<{ id: Id<'users'> }>();

  const [showBottom, setShowBottom] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [workspaceId, setWorkspaceId] = useState<Id<'workspaces'> | null>(null);

  // const {
  //   data: workspaces,
  //   isError: isErrorWorkspaces,
  //   refetch: refetchWorkspaces,
  //   isPending: isPendingWorkspace,
  // } = useWorkSpaceWithoutWorker(userId!);
  const [isVisible, setIsVisible] = useState(false);

  const { getItem, item: staff } = useHandleStaff();
  const onNavRole = () => {
    router.push('/allStaffs');
  };
  const [role, setRole] = useState('All');
  const router = useRouter();
  const { data, isPaused, isPending, isError, refetch, isRefetching, isRefetchError } = useQuery(
    convexQuery(api.organisation.getStaffsByBossId, { bossId: id! })
  );
  const {
    data: workspaces,
    isPending: isPendingWorkspace,
    isError: isErrorWorkspaces,
    refetch: refetchWorkspaces,
  } = useQuery(convexQuery(api.workspace.freeWorkspaces, { ownerId: id }));
  const { darkMode } = useDarkMode();
  const addToWorkspace = useMutation(api.workspace.addStaffToWorkspace);
  const workers = useMemo(() => {
    if (!data) return [];
    if (role === 'All') {
      return data;
    }

    return data?.filter((worker) => worker.role === role);
  }, [data, role]);

  const handleRefetch = async () => {
    await refetch();
    await refetchWorkspaces();
  };
  if (isError || isRefetchError || isPaused || isErrorWorkspaces) {
    return <ErrorComponent refetch={handleRefetch} />;
  }

  if (isPending || isPendingWorkspace) {
    return <LoadingComponent />;
  }

  const onShowBottom = () => setShowBottom(true);
  const onHideBottom = () => setShowBottom(false);

  const pendingStaffs = () => {
    router.push('/pending-staffs');
  };

  const showMenu = (item: WorkType) => {
    setIsVisible(true);
    getItem(item);
  };

  console.log({ workspaces });
  const array = [
    {
      icon: 'user-o',
      text: 'View profile',
    },
    {
      icon: 'send-o',
      text: 'Send message',
    },

    staff?.workspaceId
      ? {
          icon: staff?.workspace?.locked ? 'unlock-alt' : 'lock',
          text: staff?.workspace?.locked ? 'Unlock workspace' : 'Lock workspace',
        }
      : {
          icon: 'industry',
          text: 'Assign workspace',
        },
    staff?.workspaceId && {
      icon: 'trash-o',
      text: 'Remove staff',
    },
  ];
  const onBottomOpen = () => {
    setIsVisible(false);
    onShowBottom();
  };
  const onAddStaff = (id: Id<'workspaces'>) => {
    setWorkspaceId(id);
    setShowModal(true);
    onHideBottom();
  };
  // to update with convex function
  const handleAdd = async () => {
    setLoading(true);
    if (!workspaceId) return;
    try {
      await addToWorkspace({ workspaceId, workerId: staff?._id! });
      toast.success('Success', {
        description: 'Staff added successfully',
      });
      setShowModal(false);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  // @ts-ignore
  return (
    <Container>
      <AddStaff />
      <RemoveUser />
      <AddToWorkspace
        loading={loading}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onAdd={handleAdd}
      />
      <Menu
        onBottomOpen={onBottomOpen}
        isVisible={isVisible}
        setIsVisible={setIsVisible}
        // @ts-ignore
        array={array}
      />
      <SelectNewRow id={id} />
      <AuthHeader path="Staffs" />
      <View style={{ marginBottom: 15 }}>
        <FlatList
          horizontal
          style={{ marginBottom: 10 }}
          showsHorizontalScrollIndicator={false}
          data={allRoles}
          contentContainerStyle={{ gap: 20 }}
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [
                styles.buttonStyle,
                pressed && { opacity: 0.5 },
                role === item && styles.activeButton,
              ]}
              onPress={() => setRole(item)}>
              <MyText
                style={{ color: role === item ? 'white' : 'black' }}
                poppins="Medium"
                fontSize={13}>
                {item}
              </MyText>
            </Pressable>
          )}
          keyExtractor={(item) => item}
        />
        <HStack gap={10} justifyContent="center">
          <DottedButton text="Add New Staff" onPress={onNavRole} />
          <DottedButton isIcon={false} text="Pending Staffs" onPress={pendingStaffs} />
        </HStack>
      </View>
      <FlatList
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        onRefresh={refetch}
        refreshing={isRefetching}
        data={workers}
        renderItem={({ item }) => (
          <HStack justifyContent="space-between" alignItems="center">
            <UserPreview
              id={item?.userId}
              imageUrl={item?.user?.imageUrl!}
              name={item?.user?.name}
              subText={item?.role}
            />
            <Pressable
              // @ts-ignore
              onPress={() => showMenu(item)}
              style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}>
              <MaterialCommunityIcons
                name="dots-vertical"
                size={24}
                color={darkMode === 'dark' ? 'white' : 'black'}
              />
            </Pressable>
          </HStack>
        )}
        ListEmptyComponent={() => <EmptyText text="No staffs found" />}
      />
      <BottomSheet
        modalProps={{}}
        onBackdropPress={onHideBottom}
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
        isVisible={showBottom}>
        <FlatList
          style={{ marginTop: 30 }}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => (
            <Divider
              style={{
                height: 1,
                backgroundColor: darkMode === 'dark' ? 'transparent' : '#ccc',
                width: '100%',
              }}
            />
          )}
          data={workspaces}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => onAddStaff(item._id)}
              disabled={loading}
              style={({ pressed }) => [{ opacity: pressed || loading ? 0.5 : 1 }, styles.pressed]}>
              <MyText poppins="Medium" fontSize={20}>
                {item.role}
              </MyText>
            </Pressable>
          )}
          scrollEnabled={false}
          ListEmptyComponent={() => <EmptyText text="No empty workspaces found" />}
        />
      </BottomSheet>
    </Container>
  );
};

export default Staffs;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },

  buttonStyle: {
    backgroundColor: colors.buttonSmall,
    padding: 3,
    paddingHorizontal: 5,
    borderRadius: 5,
  },

  activeButton: {
    backgroundColor: colors.dialPad,
    padding: 3,
    paddingHorizontal: 5,
    borderRadius: 5,
  },
  pressed: {
    padding: 5,
  },
});
