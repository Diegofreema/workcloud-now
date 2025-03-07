import { StyleSheet, View } from 'react-native';
import Modal from 'react-native-modal';

import { HStack } from '../HStack';
import { MyButton } from '../Ui/MyButton';
import { MyText } from '../Ui/MyText';

import { useToken } from '~/hooks/useToken';

export const AddToCall = () => {
  const { isOpen, onClose } = useToken();

  return (
    <View style={styles.centeredView}>
      <Modal hasBackdrop={false} onDismiss={onClose} animationIn="slideInDown" isVisible={isOpen}>
        <View>
          <MyText poppins="Medium" fontSize={15} style={{ marginBottom: 30 }}>
            Type the correct code below to join the call
          </MyText>

          <HStack width="100%" justifyContent="space-between" gap={10} mt={20}>
            <MyButton
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
