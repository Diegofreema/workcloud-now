import { useAuth } from '@clerk/clerk-expo';
import { EvilIcons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as Linking from 'expo-linking';
import { useLocalSearchParams } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { toast } from 'sonner-native';

import { ErrorComponent } from '../../../components/Ui/ErrorComponent';
import { LoadingComponent } from '../../../components/Ui/LoadingComponent';
import { colors } from '../../../constants/Colors';
import { useDarkMode } from '../../../hooks/useDarkMode';
import { useGetFollowers, useOrg, useServicePoints } from '../../../lib/queries';

import { HeaderNav } from '~/components/HeaderNav';
import { ServicePointLists } from '~/components/ServicePointLists';
import { Container } from '~/components/Ui/Container';
import { MyButton } from '~/components/Ui/MyButton';
import { MyText } from '~/components/Ui/MyText';
import { onFollow, onUnFollow } from '~/lib/helper';

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
  const { id } = useLocalSearchParams<{ id: string }>();
  const [following, setFollowing] = useState(false);

  const { userId } = useAuth();
  const { darkMode } = useDarkMode();
  const [loading, setLoading] = useState(false);

  const { width } = useWindowDimensions();
  const { data, isPending, error, refetch, isPaused } = useOrg(id);
  const {
    data: servicePoints,
    isPending: isPendingServicePoints,
    refetch: refetchServicePoints,
    isPaused: isPausedServicePoints,
    isError: isErrorServicePoints,
  } = useServicePoints(data?.organization?.id!);
  const {
    data: followersData,
    isPending: isPendingFollowers,
    refetch: refetchFollowers,
    isPaused: isPausedFollowers,
    isError,
  } = useGetFollowers(id);
  const isFollowingMemo = useMemo(() => {
    if (!followersData) return false;

    const isFollowing = followersData?.followers.find((f) => f?.followerId === userId);
    if (isFollowing) {
      return true;
    } else {
      return false;
    }
  }, [followersData]);

  const handleRefetch = () => {
    refetch();
    refetchFollowers();
    refetchServicePoints();
  };

  if (
    error ||
    isPaused ||
    isError ||
    isPausedFollowers ||
    isErrorServicePoints ||
    isPausedServicePoints
  ) {
    return <ErrorComponent refetch={handleRefetch} />;
  }
  if (isPending || isPendingFollowers || isPendingServicePoints) {
    return <LoadingComponent />;
  }

  const { followers } = followersData;

  const onHandleFollow = async () => {
    setLoading(true);
    try {
      if (isFollowingMemo) {
        await onUnFollow(organization?.id, organization?.name, userId!);
        setFollowing(false);
      } else {
        onFollow(organization?.id, organization?.name, userId!);
        setFollowing(true);
      }
    } catch (error) {
      console.log(error);
      toast.error(`Failed to ${isFollowingMemo ? 'Leave' : 'Join'}`, {
        description: 'Please try again later',
      });
    } finally {
      setLoading(false);
    }
  };

  const { organization } = data;

  const startDay = organization?.workDays?.split('-')[0];
  const endDay = organization?.workDays?.split('-')[1];
  const unfollowingText = loading ? 'Leaving...' : 'Leave';
  const followingText = loading ? 'Joining...' : 'Join';
  return (
    <Container>
      <HeaderNav title={organization?.name} subTitle={organization?.category} />

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
            Members {followers?.length}
          </Text>
        </View>
        <View style={{ marginTop: 10, marginBottom: 20 }}>
          <MyButton onPress={onHandleFollow} disabled={loading} contentStyle={{ height: 50 }}>
            {isFollowingMemo ? unfollowingText : followingText}
          </MyButton>
        </View>
        <ServicePointLists data={servicePoints} />
      </ScrollView>
    </Container>
  );
};

export default Overview;
