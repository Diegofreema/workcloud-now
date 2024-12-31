import React from 'react';

import { HStack } from '~/components/HStack';
import { MyButton } from '~/components/Ui/MyButton';
import { colors } from '~/constants/Colors';
import { WorkspaceButtonProps } from '~/constants/types';

export const WorkspaceButtons = ({
  onShowModal,
  onProcessors,
  onSignOff,
  loading,
  signedIn,
}: WorkspaceButtonProps) => {
  return (
    <HStack gap={10} mt={15} width="100%">
      <MyButton
        onPress={onShowModal}
        style={{
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: colors.dialPad,
          flex: 1,
        }}
        containerStyle={{ minWidth: '30%' }}
        labelStyle={{ color: colors.white, fontSize: 10 }}>
        Set status
      </MyButton>
      <MyButton
        onPress={onProcessors}
        style={{
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: colors.dialPad,
          flex: 1,
        }}
        containerStyle={{ minWidth: '30%' }}
        labelStyle={{ color: colors.white, fontSize: 10 }}>
        Processors
      </MyButton>
      <MyButton
        disabled={loading}
        onPress={onSignOff}
        style={{
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: signedIn ? 'red' : colors.openBackgroundColor,
          flex: 1,
        }}
        containerStyle={{ minWidth: '30%' }}
        labelStyle={{ color: signedIn ? 'red' : colors.white, fontSize: 10 }}>
        {signedIn ? 'Sign off' : 'Sign in'}
      </MyButton>
    </HStack>
  );
};
