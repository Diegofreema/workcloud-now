import { Button } from '@rneui/themed';
import { useMutation } from 'convex/react';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Modal from 'react-native-modal';
import { toast } from 'sonner-native';

import { HStack } from '../HStack';
import { MyText } from '../Ui/MyText';

import { colors } from '~/constants/Colors';
import { api } from '~/convex/_generated/api';
import { useDarkMode } from '~/hooks/useDarkMode';
import { useHandleStaff } from '~/hooks/useHandleStaffs';
import { useRemoveUser } from '~/hooks/useRemoveUser';

export const RemoveUser = () => {
  const { onClose, isOpen } = useRemoveUser();
  const { darkMode } = useDarkMode();

  const [deleting, setDeleting] = useState(false);
  const { item } = useHandleStaff();
  const onRemoveUser = useMutation(api.workspace.removeFromWorkspace);
  const removeUser = async () => {
    setDeleting(true);
    try {
      await onRemoveUser({ workerId: item?._id!, workspaceId: item?.workspaceId! });
      toast.success('Staff has been removed successfully');

      onClose();
    } catch (error) {
      console.log(error);
      toast.error('Something went wrong');
    } finally {
      setDeleting(false);
    }
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
        <View
          style={[
            styles.centeredView,
            {
              backgroundColor: darkMode === 'dark' ? 'black' : 'white',
              shadowColor: darkMode === 'dark' ? '#fff' : '#000',
            },
          ]}>
          <MyText poppins="Bold" fontSize={17} style={{ textAlign: 'center', marginBottom: 15 }}>
            Are you sure you want to remove this staff?
          </MyText>

          <HStack gap={10}>
            <Button
              disabled={deleting}
              titleStyle={{ fontFamily: 'PoppinsMedium' }}
              buttonStyle={{
                backgroundColor: colors.closeTextColor,
                borderRadius: 5,
                width: 120,
              }}
              onPress={removeUser}>
              Remove
            </Button>

            <Button
              titleStyle={{ fontFamily: 'PoppinsMedium' }}
              buttonStyle={{
                backgroundColor: colors.dialPad,
                borderRadius: 5,
                width: 120,
              }}
              onPress={onClose}>
              Cancel
            </Button>
          </HStack>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    backgroundColor: 'white',
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,

    borderRadius: 15,
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
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    position: 'absolute',
    top: 10,
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
