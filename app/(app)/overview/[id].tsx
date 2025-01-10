import { EvilIcons } from '@expo/vector-icons';
import { useMutation, useQuery } from 'convex/react';
import { Image } from 'expo-image';
import * as Linking from 'expo-linking';
import { useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { toast } from 'sonner-native';

import { HeaderNav } from '~/components/HeaderNav';
import { ServicePointLists } from '~/components/ServicePointLists';
import { Container } from '~/components/Ui/Container';
import { LoadingComponent } from '~/components/Ui/LoadingComponent';
import { MyButton } from '~/components/Ui/MyButton';
import { MyText } from '~/components/Ui/MyText';
import { colors } from '~/constants/Colors';
import { api } from '~/convex/_generated/api';
import { Id } from '~/convex/_generated/dataModel';
import { useDarkMode } from '~/hooks/useDarkMode';
import { useGetUserId } from '~/hooks/useGetUserId';

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
            color: darkMode === 'dark' ? colors?.lightBlue : colors.buttonBlue,

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
const Overview = () => {
  const { id } = useLocalSearchParams<{ id: Id<'organizations'> }>();
  const [following, setFollowing] = useState(false);

  const { id: loggedInUser } = useGetUserId();
  const { darkMode } = useDarkMode();

  const { width } = useWindowDimensions();
  const data = useQuery(api.organisation.getOrganisationWithServicePoints, { organizationId: id });
  const handleFollow = useMutation(api.organisation.handleFollow);
  if (!data) {
    return <LoadingComponent />;
  }
  const isFollowing = data?.organization?.followers?.includes(loggedInUser!) ?? false;

  const onHandleFollow = async () => {
    setFollowing(true);
    try {
      await handleFollow({ organizationId: id, userId: loggedInUser! });
    } catch (error) {
      console.log(error);
      toast.error(`Failed to ${isFollowing ? 'Leave' : 'Join'}`, {
        description: 'Please try again later',
      });
    } finally {
      setFollowing(false);
    }
  };

  const { organization, servicePoints } = data;

  const startDay = organization?.workDays?.split('-')[0];
  const endDay = organization?.workDays?.split('-')[1];
  const unfollowingText = following ? 'Leaving...' : 'Leave';
  const followingText = following ? 'Joining...' : 'Join';
  return (
    <Container>
      <HeaderNav title={organization?.name!} subTitle={organization?.category} />

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
              source={{ uri: organization?.avatar! }}
            />
            <View>
              <Text
                style={{
                  fontFamily: 'PoppinsBold',
                  maxWidth: width * 0.7,
                  fontSize: 12,
                  color: darkMode === 'dark' ? colors.white : colors.black,
                }}>
                {organization?.description}
              </Text>
            </View>
          </View>
        </View>
        <View
          style={{
            marginTop: 10,
            borderTopColor: darkMode ? colors.black : colors.gray,
            borderTopWidth: 1,
            paddingTop: 10,
          }}>
          <MyText
            poppins="Light"
            style={{
              fontSize: 13,
            }}>
            Opening hours:
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
              <Text style={{ marginBottom: 4 }}> — </Text>
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
        <View style={{ marginTop: 10, marginBottom: 20, width: '100%' }}>
          <MyButton
            onPress={onHandleFollow}
            disabled={following}
            contentStyle={{ height: 50 }}
            buttonStyle={{ width: '100%' }}>
            {isFollowing ? unfollowingText : followingText}
          </MyButton>
        </View>
        <ServicePointLists data={servicePoints} />
      </ScrollView>
    </Container>
  );
};

export default Overview;
