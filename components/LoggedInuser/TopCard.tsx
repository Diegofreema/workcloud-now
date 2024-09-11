import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors } from '../../constants/Colors';
import { HStack } from '../HStack';
import { MyText } from '../Ui/MyText';
import { UserPreview } from '../Ui/UserPreview';
import VStack from '../Ui/VStack';

import { useDarkMode } from '~/hooks/useDarkMode';
type Props = {
  id?: string;
  image?: string;
  name?: string | null;
  ownedWks?: number;
  assignedWk?: any;
  workspaceId?: number;
};

export const TopCard = ({
  image,
  name,
  ownedWks,
  assignedWk,
  workspaceId,
  id,
}: Props): JSX.Element => {
  const router = useRouter();

  const { darkMode } = useDarkMode();
  const navigate = () => {
    if (!workspaceId) return;

    router.replace(`/wk/${workspaceId}`);
  };

  const onEditProfile = () => {
    router.push('/edit-profile');
  };
  return (
    <View style={{ backgroundColor: darkMode === 'dark' ? 'black' : 'white' }}>
      <View
        style={[styles.absolute, { backgroundColor: darkMode === 'dark' ? 'black' : 'white' }]}
      />
      <View
        style={[
          styles.topCard,
          {
            backgroundColor: darkMode === 'dark' ? 'black' : 'white',
            shadowColor: darkMode === 'dark' ? '#fff' : '#000',
          },
        ]}>
        <UserPreview imageUrl={image} name={name} id={id} />
        <HStack alignItems="center" justifyContent="space-between" mt={15}>
          <VStack justifyContent="center" alignItems="center">
            <MyText poppins="Medium">Owned WS</MyText>
            <MyText poppins="Bold" fontSize={14}>
              {ownedWks}
            </MyText>
          </VStack>
          <Pressable
            onPress={navigate}
            style={({ pressed }) => [{ paddingHorizontal: 4, opacity: pressed ? 0.5 : 1 }]}>
            <VStack justifyContent="center" alignItems="center">
              <MyText poppins="Medium">Assigned WS</MyText>
              <MyText poppins="Bold" fontSize={14}>
                {assignedWk}
              </MyText>
            </VStack>
          </Pressable>

          <Pressable
            style={{
              backgroundColor: colors.dialPad,
              padding: 10,
              borderRadius: 5,
            }}
            onPress={onEditProfile}>
            <MyText poppins="Medium" fontSize={15} style={{ color: 'white' }}>
              Edit Profile
            </MyText>
          </Pressable>
        </HStack>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  topCard: {
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: 'white',
    paddingBottom: 20,
    borderBottomRightRadius: 25,
    borderBottomLeftRadius: 25,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,

    elevation: 6,
  },
  absolute: {
    position: 'absolute',
    top: -5,
    right: 0,
    left: 0,
    width: '100%',
    height: 10,
    backgroundColor: 'white',
    zIndex: 1,
  },
});
