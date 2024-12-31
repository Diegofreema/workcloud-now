import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';

import { HStack } from '~/components/HStack';
import { Profile } from '~/components/Ui/WorkspaceProfile';
import { WaitList as WaitlistType } from '~/constants/types';
import { Id } from '~/convex/_generated/dataModel';
import { useDarkMode } from '~/hooks/useDarkMode';

type WaitlistsProps = {
  waitlists: WaitlistType[];
  isWorker: boolean;
  onLongPress: (customerId: Id<'users'>) => void;
  onAddToCall: (item: WaitlistType) => void;
};
export const Waitlists = ({ waitlists, isWorker, onLongPress, onAddToCall }: WaitlistsProps) => {
  const { darkMode } = useDarkMode();
  return (
    <FlatList
      contentContainerStyle={{
        flexGrow: 1,
        gap: 10,
        width: '100%',
      }}
      columnWrapperStyle={{ gap: 10 }}
      numColumns={3}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={() => (
        <HStack gap={5} alignItems="center" my={20}>
          <Text
            style={{
              color: darkMode === 'dark' ? 'white' : 'black',
              fontFamily: 'PoppinsBold',
            }}>
            {isWorker ? 'Waiting in your lobby' : 'Waiting in lobby'}
          </Text>
          <View style={styles.rounded}>
            <Text
              style={{
                color: 'white',
                fontFamily: 'PoppinsMedium',
                fontSize: 12,
              }}>
              {waitlists?.length}
            </Text>
          </View>
        </HStack>
      )}
      scrollEnabled={false}
      data={waitlists}
      renderItem={({ item }) => (
        <Profile
          item={item}
          onAddToCall={onAddToCall}
          onLongPress={() => onLongPress(item?.customerId)}
        />
      )}
    />
  );
};

const styles = StyleSheet.create({
  rounded: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'blue',
    alignItems: 'center',
  },
});
