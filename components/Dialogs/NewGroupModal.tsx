import { useAuth } from '@clerk/clerk-expo';
import { Button } from '@rneui/themed';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Modal from 'react-native-modal';
import { toast } from 'sonner-native';
import { useChatContext } from 'stream-chat-expo';

import { colors } from '../../constants/Colors';
import { HStack } from '../HStack';
import { InputComponent } from '../InputComponent';
import { MyText } from '../Ui/MyText';

import { WorkType } from '~/constants/types';
import { useDarkMode } from '~/hooks/useDarkMode';
import { useGroupName } from '~/hooks/useGroupName';

export const NewGroupModal = ({ data }: { data: WorkType[] }) => {
  const { isOpen, onClose } = useGroupName();
  const { userId } = useAuth();
  const { client } = useChatContext();
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState('');
  const { darkMode } = useDarkMode();

  const handlePress = async () => {
    if (data?.length === 0) return;
    setLoading(true);
    try {
      const channel = client.channel('messaging', {
        members: [userId as string, ...data?.map((staff) => staff.userId?.userId as string)],
        name: value,
      });
      await channel.watch();
      toast.success('Success', {
        description: 'Group created',
      });
    } catch (error) {
      console.log(error);
      toast.error('Failed', {
        description: 'Could not create group',
      });
    } finally {
      setLoading(false);
      onClose();
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
            Create group
          </MyText>
          <View style={{ width: '100%' }}>
            <InputComponent value={value} onChangeText={setValue} placeholder="Group name..." />
          </View>
          <HStack gap={10}>
            <Button
              disabled={loading || value === ''}
              titleStyle={{ fontFamily: 'PoppinsMedium' }}
              buttonStyle={{
                backgroundColor: colors.closeTextColor,
                borderRadius: 5,
                width: 120,
              }}
              onPress={handlePress}>
              Proceed
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
