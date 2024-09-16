import { useUser } from '@clerk/clerk-expo';
import { Icon } from '@rneui/themed';
import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { HeaderNav } from '~/components/HeaderNav';
import { BottomCard } from '~/components/LoggedInuser/BottomCard';
import { MiddleCard } from '~/components/LoggedInuser/MiddleCard';
import { TopCard } from '~/components/LoggedInuser/TopCard';
import { ErrorComponent } from '~/components/Ui/ErrorComponent';
import { LoadingComponent } from '~/components/Ui/LoadingComponent';
import { defaultStyle } from '~/constants';
import { useDarkMode } from '~/hooks/useDarkMode';
import { useGetConnection, useProfile } from '~/lib/queries';

const ProfileEdit = () => {
  const { user } = useUser();
  const { darkMode } = useDarkMode();
  const { data, isError, isPending, refetch } = useProfile(user?.id);
  const {
    data: connections,
    isError: isConnectionError,
    isPending: isPendingConnections,
    refetch: refetchConnections,
  } = useGetConnection(user?.id);
  console.log(connections);
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
  const assignedWk = data.profile?.workerId?.workspaceId ? 1 : 0;
  const numberOfWorkspace = data.profile?.workspace?.length || 0;

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: darkMode === 'dark' ? 'black' : 'white',
      }}>
      <View
        style={[styles.container, { backgroundColor: darkMode === 'dark' ? 'black' : 'white' }]}>
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
      <View style={{ marginTop: 'auto', ...defaultStyle, marginBottom: 15 }}>
        <BottomCard workId={data.profile?.workerId?.id} />
      </View>
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
