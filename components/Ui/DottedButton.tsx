import { AntDesign } from '@expo/vector-icons';
import { Button } from '@rneui/themed';

import { colors } from '~/constants/Colors';
import { useDarkMode } from '~/hooks/useDarkMode';

type Props = {
  onPress: () => void;
  text: string;
  isIcon?: boolean;
};

export const DottedButton = ({ onPress, text, isIcon = true }: Props): JSX.Element => {
  const { darkMode } = useDarkMode();
  return (
    <Button
      buttonStyle={{
        borderWidth: 1,
        borderColor: colors.gray10,
        borderRadius: 10,
        borderStyle: 'dashed',
        marginTop: 20,
        flex: 1,
        height: 50,
      }}
      onPress={onPress}
      icon={
        isIcon && (
          <AntDesign name="plus" size={20} color={darkMode === 'dark' ? 'white' : 'black'} />
        )
      }
      iconRight
      titleStyle={{ color: darkMode === 'dark' ? 'white' : 'black', fontFamily: 'PoppinsLight' }}
      title={text}
    />
  );
};
