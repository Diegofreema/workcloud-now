import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { MyText } from './Ui/MyText';

import { useDarkMode } from '~/hooks/useDarkMode';

type PartUser = {
  id: string;
  name: string;
  avatar: string;
};
export const ProfileHeader = (user: PartUser): JSX.Element | undefined => {
  const { darkMode } = useDarkMode();
  return (
    <Link asChild href={`/profile-edit?id=${user?.id}`}>
      <Pressable
        style={{
          marginTop: 10,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        }}>
        <Image
          style={styles.image}
          source={user?.avatar}
          contentFit="cover"
          placeholder={require('~/assets/images/boy.png')}
          placeholderContentFit="cover"
        />
        <View>
          <MyText
            poppins="Bold"
            fontSize={17}
            style={{
              fontFamily: 'PoppinsBold',
              fontSize: 17,
              color: darkMode === 'dark' ? 'white' : 'black',
            }}>
            Hi {user?.name}
          </MyText>
          <MyText
            poppins="Light"
            fontSize={15}
            style={{
              color: '#666666',
              fontFamily: 'PoppinsLight',
            }}>
            Good to have you here
          </MyText>
        </View>
      </Pressable>
    </Link>
  );
};

const styles = StyleSheet.create({
  image: {
    width: 50,
    height: 50,
    borderRadius: 50,
  },
});
