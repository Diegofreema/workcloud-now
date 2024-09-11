import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { useDarkMode } from '../hooks/useDarkMode';
import { PartialUser } from '../hooks/useData';
import { MyText } from './Ui/MyText';

export const ProfileHeader = (user: PartialUser): JSX.Element | undefined => {
  const { darkMode } = useDarkMode();
  return (
    <Link asChild href="/profile-edit">
      <Pressable
        style={{
          marginTop: 10,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        }}>
        <Image style={styles.image} source={user?.avatar} contentFit="cover" />
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
