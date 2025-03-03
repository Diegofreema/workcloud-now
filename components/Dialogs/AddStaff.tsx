import { FontAwesome } from '@expo/vector-icons';
import { Divider } from '@rneui/themed';
import { useMutation } from 'convex/react';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import Modal from 'react-native-modal';
import { toast } from 'sonner-native';

import { HStack } from '../HStack';
import { MyText } from '../Ui/MyText';

import { colors } from '~/constants/Colors';
import { api } from '~/convex/_generated/api';
import { useAddStaff } from '~/hooks/useAddStaff';
import { useDarkMode } from '~/hooks/useDarkMode';
import { useHandleStaff } from '~/hooks/useHandleStaffs';
import { useRemoveUser } from '~/hooks/useRemoveUser';

const roles = [{ role: 'Add new staff' }];
export const AddStaff = () => {
  const { isOpen, onClose } = useAddStaff();
  const { darkMode } = useDarkMode();

  const router = useRouter();

  const onOpenSelectRow = () => {
    router.push('/role');
  };

  return (
    <View>
      <Modal
        hasBackdrop={false}
        onDismiss={onClose}
        animationIn="slideInDown"
        isVisible={isOpen}
        onBackButtonPress={onClose}
        onBackdropPress={onClose}>
        <View style={styles.centeredView}>
          <MyText poppins="Medium" fontSize={15}>
            Add Staff
          </MyText>
          <Pressable
            style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }, styles.button]}
            onPress={onClose}>
            <FontAwesome name="times" size={20} color="black" />
          </Pressable>
          <Divider
            style={[
              styles.divider,
              { marginBottom: -10, backgroundColor: darkMode === 'dark' ? 'transparent' : '#ccc' },
            ]}
          />
          <View style={{ marginTop: 20, width: '100%', gap: 14 }}>
            <FlatList
              showsVerticalScrollIndicator={false}
              data={roles}
              ItemSeparatorComponent={() => (
                <Divider
                  style={[
                    styles.divider,
                    { backgroundColor: darkMode === 'dark' ? 'transparent' : '#ccc' },
                  ]}
                />
              )}
              keyExtractor={(item) => item.role}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => onOpenSelectRow()}
                  style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }]}>
                  <HStack justifyContent="space-between" alignItems="center" p={10}>
                    <MyText fontSize={13} poppins="Medium">
                      {item.role}
                    </MyText>
                  </HStack>
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

type Props = {
  isVisible: boolean;
  setIsVisible: (value: boolean) => void;
  array: ({ icon: React.ComponentProps<typeof FontAwesome>['name']; text: string } | undefined)[];
  onBottomOpen: () => void;
};

export const Menu = ({ isVisible, setIsVisible, array, onBottomOpen }: Props) => {
  const { onOpen } = useRemoveUser();
  const toggleWorkspace = useMutation(api.workspace.toggleWorkspace);
  const router = useRouter();
  const { item } = useHandleStaff();
  const { darkMode } = useDarkMode();
  const onClose = () => {
    setIsVisible(false);
  };
  const onViewProfile = () => {
    router.push(`/workerProfile/${item?._id}`);
    onClose();
  };

  const onRemoveStaff = async () => {
    onOpen();
    onClose();
  };

  const onSendMessage = async () => {
    router.push(`/chat/${item?.user._id}`);
    onClose();
  };

  const onUnlockWorkspace = async () => {
    try {
      await toggleWorkspace({ workspaceId: item?.workspaceId! });
      toast.success('Success', { description: 'Updated workspace' });
    } catch (e) {
      console.log(e);
      toast.error('Something went wrong', { description: 'Failed to update workspace' });
    } finally {
      setIsVisible(false);
    }
  };
  const handlePress = (text: string) => {
    switch (text) {
      case 'View profile':
        onViewProfile();
        break;
      case 'Remove staff':
        onRemoveStaff();
        break;
      case 'Send message':
        onSendMessage();
        break;
      case 'Unlock workspace':
        onUnlockWorkspace();
        break;
      case 'Lock workspace':
        onUnlockWorkspace();
        break;
      case 'Assign workspace':
        onBottomOpen();
        break;
      default:
        break;
    }
  };
  return (
    <View>
      <Modal
        hasBackdrop
        onDismiss={onClose}
        animationIn="slideInDown"
        isVisible={isVisible}
        onBackButtonPress={onClose}
        onBackdropPress={onClose}
        style={{ alignItems: 'center', justifyContent: 'center' }}>
        <View
          style={[
            styles.centeredView,
            {
              backgroundColor: darkMode === 'dark' ? 'black' : 'white',
              shadowColor: darkMode === 'dark' ? '#fff' : '#000',
            },
          ]}>
          <View style={{ marginTop: 20, width: '100%', gap: 14 }}>
            {array.map((item, index) =>
              item?.text ? (
                <Pressable
                  key={index}
                  style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }]}
                  onPress={() => handlePress(item?.text!)}>
                  <HStack gap={15} alignItems="center" p={10}>
                    {item?.icon && (
                      <FontAwesome
                        name={item?.icon}
                        size={28}
                        color={
                          item?.text === 'Remove staff'
                            ? 'red'
                            : darkMode === 'dark'
                              ? '#fff'
                              : 'black'
                        }
                      />
                    )}
                    {item?.text && (
                      <MyText
                        poppins="Medium"
                        fontSize={13}
                        style={{
                          color:
                            item?.text === 'Remove staff'
                              ? 'red'
                              : darkMode === 'dark'
                                ? '#fff'
                                : 'black',
                        }}>
                        {item?.text}
                      </MyText>
                    )}
                  </HStack>
                </Pressable>
              ) : null
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    backgroundColor: 'white',
    width: 200,
    paddingVertical: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,

    borderRadius: 10,
  },
  trash: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    padding: 4,
    borderRadius: 15,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: colors.gray,
    marginVertical: 6,
  },
  button: {
    position: 'absolute',
    top: 7,
    right: 15,
    padding: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 20,
    borderWidth: 1,
    borderColor: colors.gray10,
    padding: 10,
    borderRadius: 10,
    borderStyle: 'dashed',
  },
});
