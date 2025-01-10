import { useAuth } from '@clerk/clerk-expo';
import { FontAwesome } from '@expo/vector-icons';
import { Divider } from '@rneui/themed';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import Modal from 'react-native-modal';
import { toast } from 'sonner-native';

import { colors } from '../../constants/Colors';
import { useSelectNewRow } from '../../hooks/useSelectNewRow';
import { HStack } from '../HStack';
import { MyText } from '../Ui/MyText';

import { Profile } from '~/constants/types';
import { useDarkMode } from '~/hooks/useDarkMode';
import { useDetailsToAdd } from '~/hooks/useDetailsToAdd';
import { supabase } from '~/lib/supabase';

const roles = [
  'Manager',
  'Consultant',
  'Team Leader',
  'Business Analyst',
  'Project Manager',
  'Developer',
  'Designer',
  'Dentist',
  'Content Creator',
  'Marketer',
  'Sales Representative',
  'Customer Support',
  'Human Resources Manager',
  'Finance Manager',
  'IT Support Specialist',
  'Operations Manager',
  'Legal Counsel',
  'Quality Assurance Analyst',
  'Data Analyst',
  'Researcher',
  'Trainer',
  'Executive',
  'Agent',
  'Advisor',
  'Therapist',
  'Health Consultant',
  'Entrepreneur',
  'Publicist',
  'Risk Manager',
  'Control',
  'Auditor',
  'Account Officer',
  'Help Desk',
  'Complaint Desk',
  'ICT Support',
  'Customers Support',
];
export const SelectNewRow = ({ id }: { id: string }) => {
  const { isOpen, onClose } = useSelectNewRow();
  const { getData } = useDetailsToAdd();
  const { userId } = useAuth();
  const { darkMode } = useDarkMode();
  const [profile, setProfile] = useState<Profile | null>(null);

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
  }, [id]);

  const router = useRouter();

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
      onClose();
      // getData({ role:item, workspaceId: data?.id, profile?.organizationId?.id });
      router.push(`/allStaffs`);
    }
    if (error) {
      console.log(error, 'dnfkjnjsd');
      onClose();
      toast.error('Error', {
        description: 'Something went wrong',
      });
    }
  };

  return (
    <View>
      <Modal
        hasBackdrop={false}
        onDismiss={onClose}
        animationIn="slideInDown"
        isVisible={isOpen}
        onBackButtonPress={onClose}
        onBackdropPress={onClose}>
        <View
          style={[
            styles.centeredView,
            {
              backgroundColor: darkMode === 'dark' ? 'black' : 'white',
              shadowColor: darkMode === 'dark' ? '#fff' : '#000',
            },
          ]}>
          <MyText poppins="Medium" fontSize={15}>
            Select role
          </MyText>
          <Pressable
            style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }, styles.button]}
            onPress={onClose}>
            <FontAwesome name="times" size={20} color={darkMode === 'dark' ? 'white' : 'black'} />
          </Pressable>
          <Divider
            style={[
              styles.divider,
              { marginBottom: -10, backgroundColor: darkMode === 'dark' ? 'transparent' : '#ccc' },
            ]}
          />
          <View style={{ marginTop: 20, width: '100%', gap: 14 }}>
            <FlatList
              showsVerticalScrollIndicator={false}
              data={roles}
              ItemSeparatorComponent={() => (
                <Divider
                  style={[
                    styles.divider,
                    { backgroundColor: darkMode === 'dark' ? 'transparent' : '#ccc' },
                  ]}
                />
              )}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => navigate(item)}
                  style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }]}>
                  <HStack justifyContent="space-between" alignItems="center" p={10}>
                    <MyText fontSize={13} poppins="Medium">
                      {item}
                    </MyText>
                  </HStack>
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    backgroundColor: 'white',
    paddingVertical: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,

    borderRadius: 15,
  },
  trash: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    padding: 4,
    borderRadius: 15,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: colors.gray,
    marginVertical: 6,
  },
  button: {
    position: 'absolute',
    top: 7,
    right: 15,
    padding: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 20,
    borderWidth: 1,
    borderColor: colors.gray10,
    padding: 10,
    borderRadius: 10,
    borderStyle: 'dashed',
  },
});
