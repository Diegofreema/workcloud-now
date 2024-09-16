import { useAuth } from '@clerk/clerk-expo';
import { Divider } from '@rneui/themed';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet } from 'react-native';
import { toast } from 'sonner-native';

import { AddRole } from '~/components/AddRole';
import { HStack } from '~/components/HStack';
import { HeaderNav } from '~/components/HeaderNav';
import { Container } from '~/components/Ui/Container';
import { ErrorComponent } from '~/components/Ui/ErrorComponent';
import { LoadingComponent } from '~/components/Ui/LoadingComponent';
import { MyText } from '~/components/Ui/MyText';
import { colors } from '~/constants/Colors';
import { Profile } from '~/constants/types';
import { useDetailsToAdd } from '~/hooks/useDetailsToAdd';
import { useRoles } from '~/lib/queries';
import { supabase } from '~/lib/supabase';

const Role = () => {
  const { getData } = useDetailsToAdd();
  const { userId } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const { data, isPending, isError, refetch } = useRoles();
  const queryClient = useQueryClient();

  useEffect(() => {
    const getFn = async () => {
      try {
        const getProfile = async () => {
          const { data } = await supabase
            .from('user')
            .select(`name, avatar, streamToken, email, userId, organizationId (*), workerId (*)`)
            .eq('userId', userId!)
            .single();
          // @ts-ignore
          setProfile(data);
          return data;
        };
        const res = await queryClient.fetchQuery({
          queryKey: ['profile', userId],
          queryFn: getProfile,
        });

        return res;
      } catch (error) {
        console.log(error);
        return {};
      }
    };
    getFn();
  }, [userId]);

  const router = useRouter();

  if (isError) {
    return <ErrorComponent refetch={refetch} />;
  }

  if (isPending) {
    return <LoadingComponent />;
  }

  const navigate = async (item: string) => {
    if (!profile) return;

    const { data, error } = await supabase
      .from('workspace')
      .insert({
        ownerId: userId,
        role: item,
        organizationId: profile.organizationId?.id,
      })
      .select()
      .single();

    if (!error) {
      router.back();
      getData(item, data.id, profile.organizationId?.id);
      router.push(`/allStaffs`);
    }
    if (error) {
      router.back();
      toast.error('Something went wrong');
    }
  };
  return (
    <Container>
      <HeaderNav title="Select a role" />
      <FlatList
        showsVerticalScrollIndicator={false}
        data={data}
        ItemSeparatorComponent={() => <Divider style={[styles.divider]} />}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => navigate(item.role!)}
            style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }]}>
            <HStack justifyContent="space-between" alignItems="center" p={10}>
              <MyText fontSize={13} poppins="Medium">
                {item.role}
              </MyText>
            </HStack>
          </Pressable>
        )}
        ListFooterComponent={() => <AddRole onNavigate={navigate} />}
      />
    </Container>
  );
};

export default Role;

const styles = StyleSheet.create({
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: colors.black,
    marginVertical: 6,
  },
});
