import { PropsWithChildren } from 'react';
import { TouchableOpacity } from 'react-native';

type Props = {
  onPress: () => void;
};

export const CustomPressable = ({ children, onPress }: PropsWithChildren<Props>) => {
  return (
    <TouchableOpacity onPress={onPress} style={{ padding: 5 }} activeOpacity={0.5}>
      {children}
    </TouchableOpacity>
  );
};
