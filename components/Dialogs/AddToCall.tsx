import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Modal from 'react-native-modal';
import { toast } from 'sonner-native';

import { HStack } from '../HStack';
import { InputComponent } from '../InputComponent';
import { MyButton } from '../Ui/MyButton';
import { MyText } from '../Ui/MyText';

import { useToken } from '~/hooks/useToken';
import { supabase } from '~/lib/supabase';

export const AddToCall = (): JSX.Element => {
  const { isOpen, onClose, workspaceId } = useToken();
  const [value, setValue] = useState('');
  const router = useRouter();
  const leaveRoom = async () => {
    const { error } = await supabase.from('waitList').delete().eq('id', workspaceId);
    if (!error) {
      toast('Hope to see you again', {
        description: 'Do have a nice day',
      });

      onClose();
      router.replace('/');
      setValue('');
    }
  };
  const joinCall = () => {
    onClose();
    // router.replace(`/video/call/${value}`);
    setValue('');
  };
  return (
    <View>
      <Modal hasBackdrop={false} onDismiss={onClose} animationIn="slideInDown" isVisible={isOpen}>
        <View style={styles.centeredView}>
          <MyText poppins="Medium" fontSize={15} style={{ marginBottom: 30 }}>
            Type the correct code below to join the call
          </MyText>

          <InputComponent placeholder="Code" value={value} onChangeText={setValue} />
          <HStack width="100%" justifyContent="space-between" gap={10} mt={20}>
            <MyButton
              onPress={leaveRoom}
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                borderWidth: 1,
                borderColor: 'red',
              }}
              labelStyle={{ color: 'red' }}
              contentStyle={{ flex: 1 }}>
              Leave lobby
            </MyButton>

            <MyButton
              onPress={joinCall}
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                borderWidth: 1,
                borderColor: 'blue',
              }}
              labelStyle={{ color: 'blue' }}>
              Join call
            </MyButton>
          </HStack>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    backgroundColor: 'white',
    paddingVertical: 20,
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
});
