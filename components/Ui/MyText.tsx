import { StyleProp, Text, TextStyle, useWindowDimensions } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';

import { fontFamily } from '../../constants';
import { useDarkMode } from '../../hooks/useDarkMode';

type Props = {
  style?: StyleProp<TextStyle>;
  children: React.ReactNode;
  poppins: 'Bold' | 'Light' | 'Medium' | 'BoldItalic' | 'LightItalic';
  fontSize?: number;
};

export const MyText = ({ children, poppins, style, fontSize = 10 }: Props): JSX.Element => {
  const { darkMode } = useDarkMode();
  const { height } = useWindowDimensions();
  return (
    <Text
      style={[
        {
          fontFamily: fontFamily[poppins],
          fontSize: RFValue(fontSize, height),
          color: darkMode === 'dark' ? 'white' : 'black',
        },
        style,
      ]}>
      {children}
    </Text>
  );
};
