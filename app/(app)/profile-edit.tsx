import { useAuth, useUser } from '@clerk/clerk-expo';
import { Icon } from '@rneui/themed';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { StreamChat } from 'stream-chat';

import { chatApiKey } from '~/chatConfig';
import { HStack } from '~/components/HStack';
import { HeaderNav } from '~/components/HeaderNav';
import { LogOutSvg } from '~/components/LockSvg';
import { MiddleCard } from '~/components/LoggedInuser/MiddleCard';
import { TopCard } from '~/components/LoggedInuser/TopCard';
import { ErrorComponent } from '~/components/Ui/ErrorComponent';
import { LoadingComponent } from '~/components/Ui/LoadingComponent';
import { MyText } from '~/components/Ui/MyText';
import { OtherLinks } from '~/components/Ui/OtherLinks';
import { defaultStyle } from '~/constants';
import { useDarkMode } from '~/hooks/useDarkMode';
import { useGetConnection, useProfile } from '~/lib/queries';

const chatClient = StreamChat.getInstance(chatApiKey);

const ProfileEdit = () => {
  const { signOut } = useAuth();
  const { user } = useUser();
  const { darkMode } = useDarkMode();
  const { data, isError, isPending, refetch } = useProfile(user?.id);
  const {
    data: connections,
    isError: isConnectionError,
    isPending: isPendingConnections,
    refetch: refetchConnections,
  } = useGetConnection(user?.id);

  const handleRefetch = async () => {
    refetch();
    refetchConnections();
  };
  if (isError || isConnectionError) {
    return <ErrorComponent refetch={handleRefetch} />;
  }
  if (isPending || isPendingConnections) {
    return <LoadingComponent />;
  }

  const logout = async () => {
    chatClient.disconnectUser();
    signOut();
  };
  const assignedWk = data.profile?.workerId?.workspaceId ? 1 : 0;
  const numberOfWorkspace = data.profile?.workspace?.length || 0;
  const isDarkMode = darkMode === 'dark';
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: isDarkMode ? 'black' : 'white',
      }}>
      <View style={[styles.container, { backgroundColor: isDarkMode ? 'black' : 'white' }]}>
        <HeaderNav title="Profile" RightComponent={RightComponent} />
      </View>
      <TopCard
        id={data.profile?.userId}
        name={data.profile?.name}
        image={data.profile?.avatar}
        ownedWks={numberOfWorkspace}
        assignedWk={assignedWk}
        workspaceId={data.profile?.workerId?.id}
      />
      <View style={{ marginTop: 20, ...defaultStyle }}>
        <MiddleCard connections={connections?.connections} />
      </View>
      <OtherLinks workerId={data.profile?.workerId?.id?.toString()} />
      <Pressable
        style={({ pressed }) => ({
          marginTop: 'auto',
          marginHorizontal: 20,
          marginBottom: 50,
          opacity: pressed ? 0.5 : 1,
        })}
        onPress={logout}>
        <HStack
          width="100%"
          alignItems="center"
          justifyContent="center"
          bg={isDarkMode ? 'white' : '#F2F2F2'}
          p={10}
          rounded={10}
          gap={5}>
          <LogOutSvg height={30} width={30} />
          <MyText poppins="Bold" fontSize={16} style={{ color: 'black' }}>
            Log Out
          </MyText>
        </HStack>
      </Pressable>
    </View>
  );
};

export default ProfileEdit;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
  },
});
const RightComponent = () => {
  const { darkMode, toggleDarkMode } = useDarkMode();
  return (
    <Pressable
      onPress={toggleDarkMode}
      style={({ pressed }) => ({
        opacity: pressed ? 0.5 : 1,
        padding: 5,
        borderRadius: 5555,
        // backgroundColor: darkMode === 'dark' ? 'white' : 'black',
      })}>
      <View
        style={{
          backgroundColor: darkMode === 'dark' ? 'white' : 'black',
          padding: 10,
          borderRadius: 5555,
        }}>
        <Icon
          name={darkMode === 'dark' ? 'sun' : 'moon'}
          size={30}
          color={darkMode === 'dark' ? 'black' : 'white'}
          type="feather"

          // containerColor={darkMode === 'dark' ? 'white' : 'black'}
        />
      </View>
    </Pressable>
  );
};
