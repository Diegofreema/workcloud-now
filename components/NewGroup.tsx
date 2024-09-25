/* eslint-disable prettier/prettier */

import { Plus } from 'lucide-react-native';
import { Pressable } from 'react-native';

import { colors } from '~/constants/Colors';
import { useGroupName } from '~/hooks/useGroupName';

export const NewGroup = (): JSX.Element => {
  const open = useGroupName((state) => state.onOpen);

  return (
    <Pressable
      onPress={open}
      style={({ pressed }) => ({
        position: 'absolute',
        bottom: 20,
        right: 10,
        backgroundColor: colors.buttonBlue,
        borderRadius: 100,
        width: 70,
        height: 70,
        justifyContent: 'center',
        alignItems: 'center',
        opacity: pressed ? 0.5 : 1,
      })}>
      <Plus color="white" size={30} />
    </Pressable>
  );
};
