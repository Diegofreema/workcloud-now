import { DimensionValue, StyleProp, View, ViewStyle } from 'react-native';

type Props = {
  children: React.ReactNode;
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
  pr?: number;
  py?: number;
  bg?: string;
  px?: number;
  rounded?: number;
};

export const HStack = ({
  children,
  justifyContent,
  alignItems,
  gap,
  p,
  m,
  style,
  width,
  mt,
  mb,
  mx,
  pr,
  py,
  bg,
  px,
  rounded,
}: Props) => {
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          justifyContent,
          alignItems,
          gap,
          padding: p,
          margin: m,
          width,
          marginTop: mt,
          marginBottom: mb,
          marginHorizontal: mx,
          paddingRight: pr,
          paddingVertical: py,
          backgroundColor: bg,
          paddingHorizontal: px,
          borderRadius: rounded,
        },
        style,
      ]}>
      {children}
    </View>
  );
};
