import { useAuth } from '@clerk/clerk-expo';
import { useHeaderHeight } from '@react-navigation/elements';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, useWindowDimensions, View } from 'react-native';
import type { Channel } from 'stream-chat';
import {
  ChannelList,
  ChannelPreview,
  ChannelPreviewMessenger,
  ChannelPreviewMessengerProps,
  DefaultStreamChatGenerics,
  EmptyStateProps,
} from 'stream-chat-expo';
import { useDarkMode } from '../../../hooks/useDarkMode';

import { NewGroupModal } from '~/components/Dialogs/NewGroupModal';
import { InputComponent } from '~/components/InputComponent';
import { NewGroup } from '~/components/NewGroup';
import { MyText } from '~/components/Ui/MyText';
import { colors } from '~/constants/Colors';
import { useUnread } from '~/hooks/useUnread';
import { useGetMyStaffs, usePersonalOrgs } from '~/lib/queries';

const Messages = () => {
  const { userId } = useAuth();
  const [channels, setChannels] = useState<Channel<DefaultStreamChatGenerics>[]>([]);
  console.log(channels);

  const headerHeight = useHeaderHeight();
  const { darkMode } = useDarkMode();
  const { data } = useGetMyStaffs(userId);
  const { data: orgs } = usePersonalOrgs(userId);
  const router = useRouter();

  const onSelect = (id: any) => {
    router.push(`/chat/${id}`);
  };
  const staffsIsMoreThanOne = data?.staffs && data?.staffs?.length > 1;
  const hasOrganization = orgs?.organizations && orgs?.organizations?.length > 0;
  const organizationHasGroup = orgs?.organizations && orgs?.organizations[0]?.has_group;
  console.log({ organizationHasGroup });
  const [value, setValue] = useState('');
  const handleSearch = useCallback((text: string) => {
    setValue(text);
  }, []);

  return (
    <View style={{ flex: 1, paddingTop: headerHeight }}>
      <NewGroupModal data={data?.staffs || []} id={userId!} />
      {/* <InputComponent
        value={value}
        onChangeText={handleSearch}
        placeholder="Search"
        placeholderTextColor={colors.buttonBlue}
      /> */}
    </View>
  );
};

export default Messages;

const EmptyComponent = ({ listType }: EmptyStateProps) => {
  const { darkMode } = useDarkMode();
  const { height } = useWindowDimensions();
  return (
    <View
      style={{
        height: height * 0.8,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: darkMode === 'dark' ? 'black' : 'white',
      }}>
      <MyText poppins="Bold" fontSize={20}>
        No messages yet
      </MyText>
    </View>
  );
};
const ErrorComponent = () => {
  return (
    <View>
      <MyText poppins="Bold" fontSize={15}>
        There was an error loading this chat
      </MyText>
    </View>
  );
};

const Preview = (props: ChannelPreviewMessengerProps) => {
  const { unread } = props;
  const { getUnread } = useUnread();

  useEffect(() => {
    getUnread(unread || 0);
  }, [unread]);

  return (
    <View>
      <ChannelPreview
        {...props}
        Preview={(items) => (
          <ChannelPreviewMessenger {...items} PreviewTitle={items?.PreviewTitle} />
        )}
      />
    </View>
  );
};
