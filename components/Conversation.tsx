import { useAuth } from '@clerk/clerk-expo';
import { Avatar } from '@rneui/themed';
import { useQuery } from 'convex/react';
import { formatDistanceToNow } from 'date-fns';
import { router } from 'expo-router';
import { CheckCheck } from 'lucide-react-native';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { ChatPreviewSkeleton } from '~/components/ChatPreviewSkeleton';
import { HStack } from '~/components/HStack';
import { MyText } from '~/components/Ui/MyText';
import VStack from '~/components/Ui/VStack';
import { UnreadCount } from '~/components/Unread';
import { colors } from '~/constants/Colors';
import { ResultType } from '~/constants/types';
import { api } from '~/convex/_generated/api';
import { useGetUserId } from '~/hooks/useGetUserId';
import { trimText } from "~/lib/helper";

type Props = {
  conversation: ResultType;
};
export const Conversation = ({ conversation }: Props) => {
  const { id } = useGetUserId();
  const { otherUser, lastMessage, lastMessageTime } = conversation;
  const unread = useQuery(api.conversation.getUnreadMessages, {
    conversationId: conversation.id,
    userId: id!,
  });
  const onPress = () => {
    router.push(`/chat/${otherUser?._id}`);
  };

  const numberOfUnread = unread || 0;
  const isMine = conversation.lastMessageSenderId === id;
  if (unread === undefined) {
    return <ChatPreviewSkeleton />;
  }
  return (
    <TouchableOpacity onPress={onPress} style={styles.pressable}>
      <HStack justifyContent="space-between" alignItems="flex-start">
        <HStack gap={10} alignItems="center">
          <Avatar rounded size={50} source={{ uri: otherUser?.imageUrl! }} />
          <VStack>
            <MyText poppins="Medium" fontSize={12}>
              {otherUser?.first_name} {otherUser?.last_name}
            </MyText>
            <HStack alignItems="center" gap={3}>
              {isMine && <CheckCheck size={20} color={colors.buttonBlue} />}
              <MyText poppins="Medium" fontSize={14}>
                {trimText(lastMessage || '', 20)}
              </MyText>
            </HStack>
          </VStack>
        </HStack>
        <VStack gap={5} mt={10}>
          <MyText poppins="Medium" fontSize={10} style={{ color: colors.time }}>
            {formatDistanceToNow(lastMessageTime!, {
              includeSeconds: true,
            })}{' '}
            ago
          </MyText>
          {numberOfUnread > 0 && <UnreadCount unread={numberOfUnread} />}
        </VStack>
      </HStack>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  pressable: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    borderRadius: 10,
    paddingVertical: 15,
  },
});
