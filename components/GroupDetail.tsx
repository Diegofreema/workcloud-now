/* eslint-disable prettier/prettier */

import { useAuth } from '@clerk/clerk-expo';
import { Avatar } from '@rneui/themed';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { toast } from 'sonner-native';
import { Channel as ChannelType } from 'stream-chat';
import { useChatContext } from 'stream-chat-expo';

import { HStack } from './HStack';
import { MyButton } from './Ui/MyButton';
import { MyText } from './Ui/MyText';
import VStack from './Ui/VStack';

import { colors } from '~/constants/Colors';
import { ChatMember, useMembers } from '~/hooks/useMembers';
import { supabase } from '~/lib/supabase';

export const GroupDetail = (): JSX.Element => {
  const members = useMembers((state) => state.members);
  const { chatId } = useLocalSearchParams<{ chatId: string }>();
  const setMembers = useMembers((state) => state.getMembers);
  const [isDeleting, setIsDeleting] = useState(false);
  const [close, setClose] = useState(false);
  const { client } = useChatContext();
  const { userId } = useAuth();
  const [channel, setChannel] = useState<ChannelType>();
  console.log(chatId);

  useEffect(() => {
    const fetchChannel = async () => {
      const channel = await client.queryChannels({ id: { $eq: chatId } });
      setChannel(channel[0]);
    };
    fetchChannel();
  }, [chatId]);
  const admin = members.find((m) => m.role === 'owner');
  const isAdmin = userId === admin?.user?.id;

  const formattedArray = members.sort((a, b) => {
    if (a.role === 'owner') return -1;
    if (b.role !== 'owner') return 0;
    return 0;
  });

  const onRemoveMembers = () => {};

  const onCloseGroup = async () => {
    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from('organization')
        .update({ has_group: false })
        .eq('ownerId', userId!);
      if (error) {
        toast.error('Something went wrong', {
          description: 'Failed to delete group',
        });
      }
      if (!error) {
        const destroy = await channel?.delete();
        toast.success('Group has been deleted successfully', {
          description: 'Group deleted successfully',
        });
        console.log(destroy, 'bdsbbhd');

        if (destroy) {
          setMembers([]);
          setClose(false);
          router.replace('/messages');
        }
      }
    } catch (error) {
      console.log(error);

      toast.error('Something went wrong', {
        description: 'Failed to delete group',
      });
    } finally {
      setIsDeleting(false);
    }
  };
  const onClose = () => setClose(true);
  return (
    <View style={{ flex: 1 }}>
      <MyText poppins="Bold" fontSize={15} style={{ marginBottom: 10 }}>
        List of members
      </MyText>
      <FlatList
        data={formattedArray}
        renderItem={({ item }) => <MemberItem member={item} isAdmin={isAdmin} />}
        contentContainerStyle={{ gap: 15, flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        ListFooterComponentStyle={{ marginTop: 'auto', marginBottom: 20 }}
        ListFooterComponent={() =>
          close ? (
            <HStack width="100%" alignItems="center" gap={10}>
              <Pressable
                disabled={isDeleting}
                onPress={onCloseGroup}
                style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }, styles.close]}>
                <MyText poppins="Bold" fontSize={15} style={{ color: 'white' }}>
                  {isDeleting ? 'Closing...' : 'Proceed'}
                </MyText>
              </Pressable>
              <Pressable
                onPress={() => setClose(false)}
                style={({ pressed }) => [
                  { opacity: pressed ? 0.5 : 1 },
                  styles.close,
                  styles.cancel,
                ]}>
                <MyText poppins="Bold" fontSize={15} style={{ color: 'white' }}>
                  Cancel
                </MyText>
              </Pressable>
            </HStack>
          ) : (
            <MyButton onPress={onClose}>
              <MyText poppins="Bold" fontSize={15} style={{ color: 'white' }}>
                Close group
              </MyText>
            </MyButton>
          )
        }
      />
    </View>
  );
};

const MemberItem = ({ member, isAdmin }: { member: ChatMember; isAdmin: boolean }) => {
  const admin = member.role === 'owner';
  return (
    <HStack justifyContent="space-between" alignItems="center">
      <HStack gap={5} alignItems="center">
        <Avatar rounded source={{ uri: member?.user?.image }} size={50} />
        <VStack>
          <MyText poppins="Medium" fontSize={15}>
            {member.user?.name}
          </MyText>
          {admin && (
            <MyText poppins="Medium" fontSize={15}>
              Admin
            </MyText>
          )}
        </VStack>
      </HStack>
      {isAdmin && !admin && (
        <Pressable
          onPress={() => {}}
          style={({ pressed }) => ({
            opacity: pressed ? 0.5 : 1,
            padding: 5,
            backgroundColor: 'red',
            borderRadius: 5,
          })}>
          <MyText poppins="Medium" fontSize={15} style={{ color: 'white' }}>
            Remove
          </MyText>
        </Pressable>
      )}
    </HStack>
  );
};

const styles = StyleSheet.create({
  close: {
    backgroundColor: 'green',
    flex: 1,
    padding: 5,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
  },
  cancel: {
    backgroundColor: colors.buttonBlue,
  },
});
