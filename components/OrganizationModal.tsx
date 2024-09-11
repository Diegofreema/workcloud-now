import { Feather } from '@expo/vector-icons';
import { Button } from '@rneui/themed';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import Modal from 'react-native-modal';

import { colors } from '../constants/Colors';
import { useOrganizationModal } from '../hooks/useOrganizationModal';
import { MyText } from './Ui/MyText';

import { useDarkMode } from '~/hooks/useDarkMode';

export const OrganizationModal = (): JSX.Element => {
  const { isOpen, onClose } = useOrganizationModal();
  const router = useRouter();
  const { darkMode } = useDarkMode();

  const createOrganization = () => {
    router.push('/create-workspace');
    onClose();
  };
  const connectToOrganization = () => {
    router.push('/organizations');
    onClose();
  };

  const createWorkerProfile = () => {
    router.push('/create-worker-profile');
    onClose();
  };
  return (
    <Modal
      hasBackdrop={false}
      onDismiss={onClose}
      animationIn="slideInDown"
      isVisible={isOpen}
      onBackButtonPress={onClose}
      onBackdropPress={onClose}>
      <View style={[styles.dialog, { backgroundColor: darkMode === 'dark' ? 'black' : 'white' }]}>
        <View style={{ alignItems: 'center' }}>
          <MyText poppins="Bold" fontSize={17} style={{ textAlign: 'center', marginTop: 15 }}>
            Hi, start your journey on workcloud
          </MyText>
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              { opacity: pressed ? 0.5 : 1 },
              { position: 'absolute', right: 15, top: -8 },
            ]}>
            <Feather name="x" size={20} />
          </Pressable>
        </View>
        <View
          style={{
            height: 0.5,
            width: '100%',
            backgroundColor: 'white',
            marginTop: 10,
          }}
        />
        <View style={{ padding: 10, alignItems: 'center' }}>
          <View style={{ gap: 15, marginTop: 20 }}>
            <Button
              color={colors.buttonBlue}
              onPress={createOrganization}
              titleStyle={{ fontFamily: 'PoppinsLight', color: 'white' }}
              title="Create An Organization"
            />

            <Button
              color="#C0D1FE"
              onPress={connectToOrganization}
              titleStyle={{ fontFamily: 'PoppinsBold', fontSize: 12, color: colors.buttonBlue }}
              containerStyle={{
                width: '100%',
              }}
              title="Connect To An Organization"
            />

            <Button
              color={colors.lightBlue}
              onPress={createWorkerProfile}
              titleStyle={{ fontFamily: 'PoppinsLight', color: colors.buttonBlue }}
              title="Register as a worker"
            />
          </View>
        </View>
        <View style={{ justifyContent: 'center' }}>
          <Button
            titleStyle={{ verticalAlign: 'middle', fontFamily: 'PoppinsBold', color: 'blue' }}
            onPress={onClose}
            title="Cancel"
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  dialog: {
    backgroundColor: 'white',
    paddingHorizontal: 10,
  },
});
