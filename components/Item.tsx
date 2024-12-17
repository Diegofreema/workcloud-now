import { Avatar } from '@rneui/themed';
import { formatDistanceToNow, isBefore } from 'date-fns';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { HStack } from './HStack';
import { MyText } from './Ui/MyText';
import VStack from './Ui/VStack';

import { colors } from '~/constants/Colors';
import { Connection } from '~/constants/types';

export const Item = (item: Connection & { isLastItemOnList?: boolean }) => {
  const router = useRouter();
  if (!item.organisation) return null;
  const [hours, minutes] = item?.organisation?.end.split(':').map(Number);

  const date = new Date();
  date.setHours(hours);
  date.setMinutes(minutes);

  const isOpen = isBefore(new Date(), date);

  const startChannel = async () => {
    router.push(`/reception/${item?.organisation?._id}`);
  };
  return (
    <Pressable
      //@ts-ignore
      onPress={startChannel}
      style={({ pressed }) => [styles.item, pressed && { opacity: 0.3 }]}>
      <HStack justifyContent="space-between" alignItems="center">
        <HStack gap={7} alignItems="center">
          <Avatar size={40} rounded source={{ uri: item?.organisation?.avatar! }} />

          <VStack>
            <MyText poppins="Bold" fontSize={10}>
              {item?.organisation?.name}
            </MyText>
            {isOpen ? (
              <View
                style={{
                  backgroundColor: colors.openTextColor,
                  width: 45,
                  borderRadius: 9999,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <MyText
                  poppins="Medium"
                  style={{ color: colors.openBackgroundColor }}
                  fontSize={10}>
                  Open
                </MyText>
              </View>
            ) : (
              <View
                style={{
                  backgroundColor: colors.closeBackgroundColor,
                  width: 45,
                  borderRadius: 9999,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <MyText style={{ color: colors.closeTextColor }} poppins="Medium" fontSize={10}>
                  Closed
                </MyText>
              </View>
            )}
          </VStack>
        </HStack>
        <VStack>
          <MyText poppins="Light" fontSize={9}>
            Time
          </MyText>
          <MyText poppins="Light" fontSize={9}>
            {formatDistanceToNow(new Date(item?.connectedAt))} ago
          </MyText>
        </VStack>
      </HStack>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  item: {
    marginBottom: 10,
    paddingBottom: 20,
  },
});
