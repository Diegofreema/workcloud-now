import { useAuth } from '@clerk/clerk-expo';
import { AntDesign, EvilIcons, MaterialCommunityIcons, SimpleLineIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, View } from 'react-native';

import { HStack } from '~/components/HStack';
import { HeaderNav } from '~/components/HeaderNav';
import { Container } from '~/components/Ui/Container';
import { ErrorComponent } from '~/components/Ui/ErrorComponent';
import { LoadingComponent } from '~/components/Ui/LoadingComponent';
import { MyButton } from '~/components/Ui/MyButton';
import { MyText } from '~/components/Ui/MyText';
import { UserPreview } from '~/components/Ui/UserPreview';
import VStack from '~/components/Ui/VStack';
import { colors } from '~/constants/Colors';
import { useDarkMode } from '~/hooks/useDarkMode';
import { useGetWorkerProfile } from '~/lib/queries';

const Profile = () => {
  const { userId: id } = useAuth();

  const { darkMode } = useDarkMode();

  const router = useRouter();
  const { data, isPaused, isPending, isError, refetch, isRefetchError } = useGetWorkerProfile(id);
  console.log('🚀 ~ Profile ~ data:', data);

  if (isError || isRefetchError || isPaused) {
    return <ErrorComponent refetch={refetch} />;
  }

  if (isPending) {
    return <LoadingComponent />;
  }
  console.log(data);
  const { worker } = data;
  const formattedSkills = (text: string) => {
    const arrayOfSkills = text.split(',');
    const finishedText = arrayOfSkills.map((skill, index) => (
      <View key={index} style={{ width: '100%' }}>
        <MyText poppins="Bold" style={{ color: colors.nine }}>
          {index + 1}. {skill}
        </MyText>
      </View>
    ));
    return finishedText;
  };

  return (
    <Container>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 50, flexGrow: 1 }}>
        <HeaderNav title="Profile" />
        <View style={{ marginTop: 10 }}>
          <UserPreview
            imageUrl={worker?.userId?.avatar}
            name={worker?.userId?.name}
            roleText={worker?.role}
            personal
          />
        </View>

        <VStack mt={20} gap={15}>
          <HStack gap={5} alignItems="center">
            <AntDesign name="calendar" size={24} color={colors.grayText} />
            <MyText fontSize={12} poppins="Medium" style={{ color: colors.grayText }}>
              Joined since {format(worker?.created_at, 'do MMMM yyyy')}
            </MyText>
          </HStack>
          <HStack gap={5} alignItems="center">
            <EvilIcons name="location" size={24} color={colors.grayText} />
            <MyText fontSize={12} poppins="Medium" style={{ color: colors.grayText }}>
              {worker?.location}
            </MyText>
          </HStack>
        </VStack>

        <VStack mt={20}>
          <MyText poppins="Bold" style={{ marginBottom: 10 }} fontSize={16}>
            Qualifications
          </MyText>

          <HStack
            gap={10}
            alignItems="center"
            pb={40}
            style={{ borderBottomColor: colors.gray, borderBottomWidth: 1 }}>
            <SimpleLineIcons
              name="graduation"
              size={24}
              color={darkMode === 'dark' ? 'white' : 'black'}
            />
            <MyText poppins="Medium" fontSize={12}>
              {worker?.qualifications}
            </MyText>
          </HStack>
        </VStack>
        <VStack mt={20}>
          <MyText poppins="Bold" style={{ marginBottom: 10 }} fontSize={16}>
            Experience and Specialization
          </MyText>

          <HStack
            gap={10}
            alignItems="center"
            pb={40}
            style={{ borderBottomColor: colors.gray, borderBottomWidth: 1 }}>
            <SimpleLineIcons
              name="graduation"
              size={24}
              color={darkMode === 'dark' ? 'white' : 'black'}
            />
            <MyText poppins="Medium" fontSize={12}>
              {worker?.experience}
            </MyText>
          </HStack>
        </VStack>

        <VStack mt={20}>
          <MyText poppins="Bold" style={{ marginBottom: 10 }} fontSize={16}>
            Skills
          </MyText>

          <HStack gap={10} pb={40} style={{ borderBottomColor: colors.gray, borderBottomWidth: 1 }}>
            <MaterialCommunityIcons
              name="clipboard-list-outline"
              size={24}
              color={darkMode === 'dark' ? 'white' : 'black'}
            />

            <VStack gap={5} alignItems="flex-start">
              {formattedSkills(worker?.skills)}
            </VStack>
          </HStack>
        </VStack>
        <View style={{ marginTop: 'auto', gap: 10 }}>
          <MyButton onPress={() => router.push(`/myWorkerProfile/edit/${id}`)}>
            <MyText poppins="Bold" style={{ color: colors.white }} fontSize={12}>
              Edit work profile
            </MyText>
          </MyButton>
        </View>
      </ScrollView>
    </Container>
  );
};

export default Profile;
