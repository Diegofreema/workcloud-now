import { ReactNode } from 'react';
import { DimensionValue, StyleProp, View, ViewStyle } from 'react-native';

type Props = {
  children: ReactNode;
  justifyContent?:
    | 'flex-start'
    | 'flex-end'
    | 'center'
    | 'space-between'
    | 'space-around'
    | 'space-evenly';
  alignItems?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  gap?: number;
  p?: number;
  m?: number;
  style?: StyleProp<ViewStyle>;
  width?: DimensionValue;
  mt?: number;
  mb?: number;
  mx?: number;
  mr?: number;
  flex?: number;
};

const VStack = ({
  children,
  justifyContent,
  alignItems,
  gap,
  p,
  m,
  style,
  width,
  mr,
  flex,
}: Props) => {
  return (
    <View
      style={[
        {
          flexDirection: 'column',
          justifyContent,
          alignItems,
          gap,
          padding: p,
          margin: m,
          width,
          marginRight: mr,
          flex,
        },
        style,
      ]}>
      {children}
    </View>
  );
};
export default VStack;
