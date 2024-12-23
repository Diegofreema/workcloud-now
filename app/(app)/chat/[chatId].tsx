import { EvilIcons, Feather, FontAwesome } from '@expo/vector-icons';
import { Avatar } from '@rneui/themed';
import { router, useLocalSearchParams } from 'expo-router';
import { EllipsisVertical } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInputProps, View } from 'react-native';
import { Channel as ChannelType } from 'stream-chat';
import {
  AutoCompleteInput,
  Channel,
  FileAttachment,
  FileUploadPreview,
  Gallery,
  ImageUploadPreview,
  MessageInput,
  MessageList,
  useMessageContext,
  useMessageInputContext,
} from 'stream-chat-expo';

import { HStack } from '~/components/HStack';
import { LoadingComponent } from '~/components/Ui/LoadingComponent';
import { MyText } from '~/components/Ui/MyText';
import VStack from '~/components/Ui/VStack';
import { colors } from '~/constants/Colors';
import { useDarkMode } from '~/hooks/useDarkMode';
import { useMembers } from '~/hooks/useMembers';
import { useGetWorkerProfile } from '~/lib/queries';

const SingleChat = () => {
  const { chatId } = useLocalSearchParams<{ chatId: string }>();

  const { darkMode } = useDarkMode();
  const [channel, setChannel] = useState<ChannelType>();

  useEffect(() => {
    const fetchChannel = async () => {};
    fetchChannel();
  }, [chatId]);
  if (!channel) return <LoadingComponent />;
  return (
    <Channel
      // DateHeader={(date) => <DateHeader dateString={format(date, 'm')} />}
      MessageSimple={CustomMessage}
      Input={CustomInput}
      channel={channel}>
      <MessageList
        FooterComponent={() => <CustomHeaderComponent channel={channel} chatId={chatId} />}
        additionalFlatListProps={{
          contentContainerStyle: {
            backgroundColor: darkMode === 'dark' ? 'black' : 'white',
            flexGrow: 1,
          },
          style: {
            backgroundColor: darkMode === 'dark' ? 'white' : 'white',
          },

          ListFooterComponentStyle: {
            position: 'absolute',
            bottom: 5,
            zIndex: 5,
            left: 0,
            right: 0,
          },
        }}
      />
      <MessageInput />
    </Channel>
  );
};

export default SingleChat;

const CustomMessage = () => {
  const { message, isMyMessage, members } = useMessageContext();
  const getMembers = useMembers((state) => state.getMembers);
  const m = Object.values(members);
  console.log(m.length);
  useEffect(() => {
    getMembers(m);
  }, [members]);
  return message.text ? (
    <View
      style={{
        alignSelf: isMyMessage ? 'flex-end' : 'flex-start',
        backgroundColor: isMyMessage ? colors?.dialPad : '#DAE4FF',
        padding: 10,
        margin: 10,
        marginBottom: 5,
        borderRadius: 7,
        borderBottomRightRadius: isMyMessage ? 0 : 7,
        borderBottomLeftRadius: isMyMessage ? 7 : 0,
        width: '70%',
      }}>
      <Text
        style={{
          color: isMyMessage ? 'white' : 'black',
          fontFamily: 'PoppinsLight',
        }}>
        {message.text}
      </Text>
    </View>
  ) : (
    message?.attachments?.map((item, index) =>
      item.type === 'image' ? (
        <View key={index} style={{ alignSelf: isMyMessage ? 'flex-end' : 'flex-start' }}>
          {item.image_url && <Gallery />}
        </View>
      ) : (
        <FileAttachment
          key={index}
          attachment={item}
          attachmentSize={40}
          styles={{
            container: { alignSelf: isMyMessage ? 'flex-end' : 'flex-start' },
          }}
        />
      )
    )
  );
};

const CustomInput = () => {
  const { sendMessage, text, toggleAttachmentPicker, imageUploads, fileUploads } =
    useMessageInputContext();
  const isDisabled = !text && !imageUploads.length && !fileUploads.length;
  const additionalTextInputProps: TextInputProps = useMemo(() => {
    return {
      selectionColor: 'pink',
      style: {
        color: 'black',
        fontFamily: 'PoppinsLight',
        fontSize: 12,
        flex: 1,
      },
    };
  }, []);
  return (
    <View style={[styles.fullWidth]}>
      <ImageUploadPreview />
      <FileUploadPreview />
      <HStack gap={5}>
        <View style={[styles.fullWidth, styles.inputContainer]}>
          <AutoCompleteInput additionalTextInputProps={additionalTextInputProps} />
          <Pressable
            // style={styles.send}
            onPress={toggleAttachmentPicker}>
            <EvilIcons name="image" size={30} color="#9E9E9E" />
          </Pressable>
        </View>
        <Pressable
          style={[styles.send, { opacity: isDisabled ? 0.5 : 1 }]}
          onPress={() => sendMessage()}
          disabled={isDisabled}>
          <Feather name="send" size={24} color="white" />
        </Pressable>
      </HStack>
    </View>
  );
};

const CustomHeaderComponent = ({ chatId, channel }: { chatId: string; channel: ChannelType }) => {
  const { workerId } = useLocalSearchParams<{ workerId: string }>();
  const members = useMembers((state) => state.members);

  const { data, isPending, isError, isPaused } = useGetWorkerProfile(workerId);
  const { darkMode } = useDarkMode();

  const onGoToDetails = () => {
    router.push(`/groupDetails?chatId=${chatId}`);
  };
  const handleBack = () => {
    router.back();
  };
  if (isError || isPaused) {
    return (
      <HStack h={70} alignItems="center" px={15} mb={10} justifyContent="space-between">
        <Pressable onPress={handleBack}>
          <FontAwesome
            name="angle-left"
            color={darkMode === 'dark' ? 'white' : 'black'}
            size={30}
          />
        </Pressable>
      </HStack>
    );
  }

  if (isPending) {
    return (
      <HStack h={70} alignItems="center" justifyContent="center" px={15} mb={10}>
        <ActivityIndicator color={darkMode === 'dark' ? 'white' : 'black'} />
      </HStack>
    );
  }

  const { worker } = data;
  const isMoreThanTwoMembers = members.length > 2;
  return (
    <HStack h={70} px={15} mb={10} gap={10} justifyContent="space-between" alignItems="center">
      <HStack gap={10}>
        <Pressable onPress={handleBack}>
          <FontAwesome
            name="angle-left"
            color={darkMode === 'dark' ? 'white' : 'black'}
            size={30}
          />
        </Pressable>
        <HStack gap={6}>
          {!isMoreThanTwoMembers && (
            <Avatar rounded source={{ uri: members[1]?.user?.image }} size={40} />
          )}
          <VStack>
            <MyText poppins="Bold" style={{ fontFamily: 'PoppinsBold', fontSize: 14 }}>
              {worker?.organizationId?.name}
            </MyText>
            {!isMoreThanTwoMembers && (
              <MyText
                poppins="Medium"
                style={{
                  fontFamily: 'PoppinsMedium',

                  fontSize: 8,
                  color: colors.closeTextColor,
                }}>
                Active
              </MyText>
            )}
          </VStack>
        </HStack>
      </HStack>
      <Pressable style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })} onPress={onGoToDetails}>
        <EllipsisVertical color={darkMode === 'dark' ? 'white' : 'black'} size={30} />
      </Pressable>
    </HStack>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  fullWidth: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputContainer: {
    height: 40,
    backgroundColor: '#EEEEEE',
    borderRadius: 5,
    padding: 5,
    flexDirection: 'row',
  },
  send: {
    backgroundColor: colors.dialPad,
    height: 40,
    width: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 7,
  },
});
