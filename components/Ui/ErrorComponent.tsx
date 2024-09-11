import { useState } from 'react';
import { Text, View } from 'react-native';

import { MyButton } from './MyButton';
import { defaultStyle } from '../../constants/index';
import { useDarkMode } from '../../hooks/useDarkMode';

type Props = {
  refetch: any;
};

export const ErrorComponent = ({ refetch }: Props): JSX.Element => {
  const { darkMode } = useDarkMode();
  const [error, setError] = useState(false);
  const handleRefetch = () => {
    setError((prev) => !prev);
    refetch();
  };
  return (
    <View
      style={{
        flex: 1,
        ...defaultStyle,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        backgroundColor: darkMode === 'dark' ? 'black' : 'white',
      }}>
      <Text
        style={{
          color: darkMode === 'dark' ? 'white' : 'black',
          fontFamily: 'PoppinsBold',
          fontSize: 20,
          textAlign: 'center',
        }}>
        Something went wrong, please try again
      </Text>
      <MyButton onPress={handleRefetch}>Retry</MyButton>
    </View>
  );
};
