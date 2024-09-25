import { useAuth } from '@clerk/clerk-expo';
import { EvilIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Linking from 'expo-linking';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ErrorComponent } from '../../components/Ui/ErrorComponent';
import { LoadingComponent } from '../../components/Ui/LoadingComponent';
import { colors } from '../../constants/Colors';
import { useCreate } from '../../hooks/useCreate';
import { useDarkMode } from '../../hooks/useDarkMode';
import { useGetPersonalWk, usePersonalOrgs, useProfile } from '../../lib/queries';

import { AuthHeader } from '~/components/AuthHeader';
import { CreateWorkspaceModal } from '~/components/Dialogs/CreateWorkspace';
import { DeleteWksSpaceModal } from '~/components/Dialogs/DeleteWks';
import { SelectRow } from '~/components/Dialogs/SelectRow';
import { Container } from '~/components/Ui/Container';
import { MyText } from '~/components/Ui/MyText';
import { WorkspaceDetails } from '~/components/WorkspaceDetails';

const MyOrg = () => {
  const { userId: id } = useAuth();

  const {
    data: profileData,
    isError: isErrorData,
    isPending: isPendingData,
    refetch: refetchData,
  } = useProfile(id);

  const { onOpen } = useCreate();
  const { darkMode } = useDarkMode();

  const { data, isPending, error, refetch, isPaused } = usePersonalOrgs(id);

  const {
    data: workspaces,
    isPending: isPendingWks,
    isError,
    isPaused: isPausedWks,
  } = useGetPersonalWk(id);

  const handleRefetch = () => {
    refetch();
    refetchData();
  };

  if (error || isError || isPaused || isPausedWks || isErrorData) {
    return <ErrorComponent refetch={handleRefetch} />;
  }
  if (isPending || isPendingWks || isPendingData) {
    return <LoadingComponent />;
  }

  const { organizations } = data;

  const { wks } = workspaces;
  const { profile } = profileData;
  const organization = organizations[0];

  const startDay = organization?.workDays?.split('-')[0];
  const endDay = organization?.workDays?.split('-')[1];

  return (
    <Container>
      <CreateWorkspaceModal workspace={wks} />
      <SelectRow organizationId={organization?.id} profile={profile} />
      <DeleteWksSpaceModal />
      <AuthHeader style={{ alignItems: 'center' }} path="Manage Organizations" />
      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <View style={{ alignItems: 'center', flexDirection: 'row', gap: 10 }}>
            <Image
              style={{ width: 70, height: 70, borderRadius: 50 }}
              contentFit="cover"
              source={{ uri: organization?.avatar }}
            />
            <View>
              <Text
                style={{
                  fontFamily: 'PoppinsBold',

                  fontSize: 14,
                  color: darkMode === 'dark' ? colors.white : colors.black,
                }}>
                {organization?.name}
              </Text>
              <Text
                style={{
                  fontFamily: 'PoppinsMedium',
                  fontSize: 10,
                  color: darkMode === 'dark' ? colors.white : colors.black,
                }}>
                {organization?.ownerId?.name} | Admin
              </Text>
            </View>
          </View>
          {id === organization?.ownerId?.userId && (
            <Pressable
              style={({ pressed }) => ({
                padding: 5,
                opacity: pressed ? 0.5 : 1,
                backgroundColor: colors.buttonBlue,
                borderRadius: 5,
                width: 100,
                height: 40,
                justifyContent: 'center',
                alignItems: 'center',
              })}
              onPress={() => router.push(`/(app)/(organization)/edit/${organization?.id}`)}>
              <MyText poppins="Medium" fontSize={14} style={{ color: 'white' }}>
                Edit
              </MyText>
            </Pressable>
          )}
        </View>
        <View
          style={{
            marginTop: 10,
            borderTopColor: darkMode === 'dark' ? colors.black : colors.gray,
            borderTopWidth: StyleSheet.hairlineWidth,
            paddingTop: 10,
          }}>
          <MyText
            poppins="Light"
            style={{
              fontSize: 13,
            }}>
            {organization?.description}
          </MyText>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 20,
              marginTop: 10,
            }}>
            <Text
              style={{
                fontFamily: 'PoppinsBold',
                fontSize: 10,

                color: darkMode === 'dark' ? colors.white : colors.black,
                textTransform: 'uppercase',
              }}>
              {startDay} - {endDay}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View
                style={{
                  padding: 5,
                  borderRadius: 5,
                  backgroundColor: '#CCF2D9',
                }}>
                <Text
                  style={{
                    color: '#00C041',
                    fontFamily: 'PoppinsBold',
                    fontSize: 10,
                  }}>
                  {organization?.start}
                </Text>
              </View>
              <Text style={{ marginBottom: 8 }}> — </Text>
              <View
                style={{
                  backgroundColor: '#FFD9D9',

                  padding: 5,
                  borderRadius: 5,
                }}>
                <Text
                  style={{
                    color: '#D61B0C',
                    fontFamily: 'PoppinsBold',
                    fontSize: 10,
                  }}>
                  {organization?.end}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <View
          style={{
            gap: 10,
            marginTop: 15,
          }}>
          <OrganizationItems name="envelope" text={organization?.email} />
          <OrganizationItems name="location" text={organization?.location} />
          <OrganizationItems name="link" text={organization?.website} website />
          <Text
            style={{
              fontFamily: 'PoppinsBold',
              fontSize: 12,
              color: darkMode === 'dark' ? colors.white : colors.black,
            }}>
            Members {organization?.followers?.length || 0}
          </Text>
        </View>
        <View>
          <View
            style={{
              marginVertical: 20,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor: darkMode === 'dark' ? colors.black : colors.gray,
            }}
          />
        </View>

        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 15,
          }}>
          <WorkspaceDetails
            onPress={onOpen}
            darkMode={darkMode}
            uri={require('~/assets/images/workspace.png')}
            name="Workspaces"
          />

          <WorkspaceDetails
            onPress={() => router.push(`/staffs/${id}`)}
            darkMode={darkMode}
            uri={require('~/assets/images/staff.png')}
            name="Staffs"
          />
          <WorkspaceDetails
            onPress={() => router.push(`/(atabs)/messages`)}
            darkMode={darkMode}
            uri={require('~/assets/images/message.png')}
            name="Messages"
          />

          <WorkspaceDetails
            onPress={() => router.push(`/posts/${organization?.id}`)}
            darkMode={darkMode}
            uri={require('~/assets/images/post.png')}
            name="Posts"
          />
        </View>
        <View
          style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
          <WorkspaceDetails
            onPress={() => router.push(`/services?id=${organization?.id}`)}
            darkMode={darkMode}
            uri={require('~/assets/images/service.png')}
            name="Service point"
          />
        </View>
      </ScrollView>
    </Container>
  );
};

export default MyOrg;

type SubProps = {
  name: any;
  text: any;
  website?: boolean;
};
export const OrganizationItems = ({ name, text, website }: SubProps) => {
  const { darkMode } = useDarkMode();

  if (website) {
    return (
      <Pressable
        onPress={() => Linking.openURL('https://' + text)}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
        <EvilIcons
          color={darkMode === 'dark' ? colors.white : colors.textGray}
          name={name}
          size={24}
        />
        <MyText
          poppins="Bold"
          style={{
            color: colors.buttonBlue,

            fontSize: 10,
          }}>
          {text}
        </MyText>
      </Pressable>
    );
  }
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
      <EvilIcons
        color={darkMode === 'dark' ? colors.white : colors.textGray}
        name={name}
        size={24}
      />
      <Text
        style={{
          color: darkMode === 'dark' ? colors.white : colors.textGray,
          fontFamily: 'PoppinsBold',
          fontSize: 10,
        }}>
        {text}
      </Text>
    </View>
  );
};
