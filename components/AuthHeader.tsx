import { FontAwesome } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleProp, Text, ViewStyle } from 'react-native';

import { useDarkMode } from '../hooks/useDarkMode';

type Props = {
  path?: string;
  style?: StyleProp<ViewStyle>;
};

export const AuthHeader = ({ path, style }: Props) => {
  const router = useRouter();
  const { darkMode } = useDarkMode();
  const pathname = usePathname();

  const navigator = () => {
    if (pathname === '/login') {
      router.push('/(app)/(tabs)/home');
      return;
    }
    router.back();
  };

  return (
    <Pressable
      onPress={navigator}
      style={[
        {
          marginBottom: 14,
          marginTop: pathname === '/login' ? 20 : 0,
          flexDirection: 'row',
          gap: 10,
        },
        style,
      ]}>
      <FontAwesome name="angle-left" size={30} color={darkMode === 'dark' ? 'white' : 'black'} />
      {path && (
        <Text
          style={{
            color: darkMode === 'dark' ? 'white' : 'black',

            fontSize: 20,
            fontFamily: 'PoppinsBold',
          }}>
          {path}
        </Text>
      )}
    </Pressable>
  );
};
