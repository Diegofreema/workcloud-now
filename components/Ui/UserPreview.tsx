import { useAuth } from '@clerk/clerk-expo';
import { Button } from '@rneui/themed';
import { useQueryClient } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { router, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { toast } from 'sonner-native';

import { colors } from '../../constants/Colors';
import { Requests } from '../../constants/types';
import { useInfos } from '../../hooks/useGetInfo';
import { useOpen } from '../../hooks/useOpen';
import { checkIfEmployed } from '../../lib/helper';
import { supabase } from '../../lib/supabase';
import { HStack } from '../HStack';
import { MyText } from './MyText';
import VStack from './VStack';

type PreviewWorker = {
  name: any;
  imageUrl?: string;

  subText?: string | boolean;
  id?: any;
  navigate?: boolean;
  roleText?: string;
  workspaceId?: string | null;
  personal?: boolean;
  hide?: boolean;
  workPlace?: string;
  profile?: boolean;
  active?: boolean;
  workspace?: boolean;
};
export const UserPreview = ({
  id,
  imageUrl,
  subText,
  navigate,
  name,
  roleText,

  workPlace,
  profile,
  active,
  workspace,
}: PreviewWorker) => {
  const router = useRouter();
  const onPress = () => {
    if (!navigate) return;
    router.push(`/workerProfile/${id}`);
  };
  console.log(id);

  return (
    <Pressable onPress={onPress}>
      <HStack gap={10} alignItems="center">
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={{ width: 60, height: 60, borderRadius: 9999 }}
            contentFit="cover"
          />
        ) : (
          <Image
            source={require('~/assets/images/boy.png')}
            style={{ width: 60, height: 60, borderRadius: 9999 }}
            contentFit="cover"
          />
        )}
        <VStack>
          <MyText poppins="Bold" fontSize={16}>
            {name}
          </MyText>
          {subText && (
            <MyText poppins="Medium" fontSize={14}>
              {subText === true ? 'pending' : subText}
            </MyText>
          )}
          {roleText && (
            <MyText poppins="Medium" fontSize={14}>
              {roleText} at {workPlace}
            </MyText>
          )}

          {!roleText && profile && (
            <MyText poppins="Medium" fontSize={14}>
              Currently not with an organization
            </MyText>
          )}
          {active && workspace && (
            <View
              style={{
                backgroundColor: colors.openTextColor,
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <MyText poppins="Medium" fontSize={14} style={{ color: colors.openBackgroundColor }}>
                Active
              </MyText>
            </View>
          )}

          {!active && workspace && (
            <View
              style={{
                backgroundColor: colors.closeTextColor,
                borderRadius: 20,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <MyText style={{ color: colors.closeBackgroundColor }} poppins="Medium" fontSize={14}>
                Inactive
              </MyText>
            </View>
          )}
        </VStack>
      </HStack>
    </Pressable>
  );
};

export const WorkPreview = ({ item }: { item: Requests }) => {
  const { userId } = useAuth();
  const { onOpen } = useOpen();
  const { getInfoIds } = useInfos();
  const [cancelling, setCancelling] = useState(false);
  const [accepting, setAccepting] = useState(false);
  const queryClient = useQueryClient();
  const { id, role, from, to, workspaceId, salary, responsibility, qualities } = item;

  const acceptRequest = async () => {
    if (!userId) return;

    setAccepting(true);
    const isWorking = await checkIfEmployed(userId);

    const isWorkingBool = !!isWorking;
    if (isWorkingBool) {
      onOpen();
      getInfoIds({
        newWorkspaceId: workspaceId as string,
        requestId: id,
        workerId: isWorking?.workerId!,
        workspaceId: isWorking?.id.toString(),
      });
      console.log(isWorking);

      return;
    }
    try {
      if (workspaceId) {
        const { error } = await supabase
          .from('workspace')
          .update({
            salary,
            responsibility,
            workerId: to?.userId,
          })
          .eq('id', workspaceId);
        if (error) {
          toast.error('Something went wrong');
          return;
        }
      }

      const { error: err } = await supabase
        .from('worker')
        .update({
          role,
          bossId: from?.userId,
          workspaceId: +workspaceId || null,
          organizationId: from?.organizationId?.id,
        })
        .eq('id', to.workerId);
      if (!err) {
        const { error } = await supabase.from('request').update({ accepted: true }).eq('id', id);
        if (error) {
          toast.error('Something went wrong');
          return;
        } else {
          toast.success('Request has been accepted');
          router.push('/organization');
        }
      }
      if (err) {
        toast.error('Something went wrong');

        console.log(err);
      }
    } catch (error) {
      console.log(error);
      toast.error('Something went wrong');
    } finally {
      setAccepting(false);
      queryClient.invalidateQueries({ queryKey: ['pending_requests'] });
    }
  };

  const rejectRequest = async () => {
    setCancelling(true);
    try {
      const { error } = await supabase.from('request').update({ accepted: false }).eq('id', id);

      if (!error) {
        toast.success('Request Canceled');
      }

      if (error) {
        toast.error('Something went wrong');
      }
    } catch (error) {
      console.log(error);

      toast.error('Something went wrong');
    } finally {
      setCancelling(false);
      queryClient.invalidateQueries({ queryKey: ['pending_requests'] });
    }
  };

  return (
    <HStack pr={20} py={10} gap={6}>
      <Image
        source={{
          uri: from?.organizationId?.avatar || 'https://placehold.co/100x100',
        }}
        placeholder={require('~/assets/images/pl.png')}
        style={{ width: 60, height: 60, borderRadius: 9999 }}
        contentFit="cover"
      />
      <VStack mr={10} width="90%" justifyContent="space-between" gap={10}>
        <MyText style={{ width: '100%', paddingRight: 5 }} poppins="Medium" fontSize={12}>
          {from?.organizationId?.name} wants you to be a representative on their workspace
        </MyText>
        <MyText style={{}} poppins="Medium" fontSize={12}>
          Role : {role}
        </MyText>
        <MyText style={{}} poppins="Medium" fontSize={12}>
          Responsibility : {responsibility}
        </MyText>
        <MyText style={{}} poppins="Medium" fontSize={12}>
          Qualities : {qualities}
        </MyText>
        <MyText style={{}} poppins="Medium" fontSize={12}>
          Payment: {salary} naira
        </MyText>
        {item?.accepted && (
          <MyText style={{ color: 'green' }} poppins="Medium" fontSize={15}>
            Accepted
          </MyText>
        )}
        {!item?.accepted && item?.accepted !== null && (
          <MyText style={{ color: 'red' }} poppins="Medium" fontSize={15}>
            Declined
          </MyText>
        )}
        {item?.accepted === null && (
          <HStack gap={10} mt={20}>
            <Button
              buttonStyle={{ backgroundColor: '#C0D1FE', borderRadius: 5 }}
              style={{ borderRadius: 5 }}
              loading={cancelling}
              onPress={rejectRequest}
              titleStyle={{ color: '#0047FF', fontFamily: 'PoppinsMedium' }}>
              Decline
            </Button>
            <Button
              buttonStyle={{ backgroundColor: '#0047FF', borderRadius: 5 }}
              style={{ borderRadius: 5 }}
              loading={accepting}
              onPress={acceptRequest}
              titleStyle={{ color: 'white', fontFamily: 'PoppinsMedium' }}>
              Accept
            </Button>
          </HStack>
        )}
      </VStack>
    </HStack>
  );
};
