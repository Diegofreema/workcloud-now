import { ButtonProps, Button } from '@rneui/themed';
import { StyleProp, TextStyle, ViewStyle } from 'react-native';

import { colors } from '../../constants/Colors';
import { fontFamily } from '../../constants/index';

type Props = ButtonProps & {
  children: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  buttonColor?: string;
  textColor?: string;
  style?: StyleProp<ViewStyle>;
  labelStyle?: StyleProp<TextStyle>;
  loading?: boolean;
};

export const MyButton = ({
  children,
  contentStyle,
  buttonColor = colors.dialPad,
  textColor = 'white',
  style,
  labelStyle,
  loading,
  ...props
}: Props): JSX.Element => {
  return (
    <Button
      {...props}
      loading={loading}
      buttonStyle={[{ height: 50, alignItems: 'center' }, contentStyle]}
      titleStyle={[
        {
          color: textColor,
          fontFamily: fontFamily.Medium,
          fontSize: 14,

          width: '100%',
        },
        labelStyle,
      ]}
      color={buttonColor}
      style={[
        {
          borderRadius: 5,
          height: 50,
          alignItems: 'center',
        },
        style,
      ]}>
      {children}
    </Button>
  );
};
