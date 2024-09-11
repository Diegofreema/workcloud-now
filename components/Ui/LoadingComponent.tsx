import { ActivityIndicator, View } from 'react-native';

import { defaultStyle } from '../../constants/index';

import { useDarkMode } from '~/hooks/useDarkMode';

export const LoadingComponent = (): JSX.Element => {
  const { darkMode } = useDarkMode();
  return (
    <View
      style={{
        flex: 1,
        ...defaultStyle,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: darkMode === 'dark' ? 'black' : 'white',
      }}>
      <ActivityIndicator size="large" color={darkMode === 'dark' ? 'white' : 'black'} />
    </View>
  );
};
