import { useMutation } from 'convex/react';
import { SendIcon } from 'lucide-react-native';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { Bubble, GiftedChat, Send, SystemMessage } from 'react-native-gifted-chat';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyChat } from '~/components/EmptyChat';
import { colors } from '~/constants/Colors';
import { DataType, StatusType } from '~/constants/types';
import { api } from '~/convex/_generated/api';
import { Id } from '~/convex/_generated/dataModel';

type Props = {
  loggedInUserId: Id<'users'>;
  otherUserId: Id<'users'>;
  conversationId: Id<'conversations'>;
  data: DataType[];
  status: StatusType;
  loadMore: (numItems: number) => void;
  otherUserName: string;
  createdAt: number;
};
export const ChatComponent = ({
  loggedInUserId,
  otherUserId,
  conversationId,
  data,
  loadMore,
  status,
  createdAt,
  otherUserName,
}: Props) => {
  const createMessage = useMutation(api.conversation.createMessages);
  const [text, setText] = useState('');
  const insets = useSafeAreaInsets();
  const hasItem = data?.length > 0;
  const messages = hasItem
    ? [
        ...data?.map((message) => {
          return {
            _id: message?._id,
            text: message?.content,
            createdAt: new Date(message?._creationTime),
            user: {
              _id: message?.senderId,
              name: message.senderId === loggedInUserId ? 'You' : otherUserName,
            },
          };
        }),
        {
          _id: 0,
          system: true,
          text: '',
          createdAt: new Date(createdAt),
          user: {
            _id: 0,
            name: 'Bot',
          },
        },
      ]
    : [];

  const onSend = async () => {
    await createMessage({
      content: text.trim(),
      senderId: loggedInUserId,
      recipient: otherUserId,
      conversationId,
    });
  };
  const onLoadMore = () => {
    loadMore(5);
  };
  const loadEarlier = status === 'CanLoadMore';
  return (
    <View style={{ flex: 1 }}>
      <GiftedChat
        messages={messages}
        alignTop
        alwaysShowSend={false}
        keyboardShouldPersistTaps="always"
        onSend={onSend}
        onInputTextChanged={setText}
        user={{
          _id: loggedInUserId,
        }}
        renderSystemMessage={(props) => (
          <SystemMessage {...props} textStyle={{ color: colors.gray }} />
        )}
        bottomOffset={insets.bottom}
        renderAvatar={null}
        maxComposerHeight={100}
        textInputProps={styles.input}
        scrollToBottom
        renderUsernameOnMessage
        infiniteScroll
        loadEarlier={loadEarlier}
        renderChatEmpty={() => <EmptyChat />}
        onLoadEarlier={onLoadMore}
        renderUsername={(user) => (
          <Text style={{ fontSize: 10, color: colors.black, paddingLeft: 7 }}>{user.name}</Text>
        )}
        renderBubble={(props) => {
          return (
            <Bubble
              onLongPress={console.log}
              onPress={() => console.warn('Press')}
              {...props}
              textStyle={{
                right: {
                  color: '#fff',
                },
                left: {
                  color: '#000',
                },
              }}
              wrapperStyle={{
                left: {
                  backgroundColor: colors.otherChatBubble,
                  borderRadius: 10,
                  borderBottomLeftRadius: 0,
                },
                right: {
                  borderRadius: 10,
                  backgroundColor: colors.dialPad,
                  borderBottomRightRadius: 0,
                },
              }}
            />
          );
        }}
        renderSend={(props) => (
          <Send {...props} containerStyle={[{ justifyContent: 'center' }, styles.send]}>
            <SendIcon color={colors.white} size={25} />
          </Send>
        )}
      />
      {Platform.OS === 'android' && <KeyboardAvoidingView behavior="padding" />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  messagesContainer: {
    padding: 10,
  },

  messageBubble: {
    maxWidth: '80%',
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#FFFFFF',
  },
  input: {
    flex: 1,
    minHeight: 50,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 5,
    paddingHorizontal: 15,
    marginRight: 10,
    backgroundColor: '#E5E5E5',
    justifyContent: 'center',
    textAlignVertical: 'center',
    paddingTop: Platform.OS === 'ios' ? 10 : 0,
  },
  sendButton: {
    backgroundColor: '#007AFF',
    borderRadius: 7777,
    padding: 15,
  },

  send: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.dialPad,
    paddingHorizontal: 14,
    width: 50,
    borderRadius: 50,
    marginBottom: 7,
  },
});
