import { useAuth } from '@clerk/clerk-expo';
import { useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { View } from 'react-native';
import { toast } from 'sonner-native';

import { HStack } from '~/components/HStack';
import { HeaderNav } from '~/components/HeaderNav';
import { Container } from '~/components/Ui/Container';
import { ErrorComponent } from '~/components/Ui/ErrorComponent';
import { LoadingComponent } from '~/components/Ui/LoadingComponent';
import { MyButton } from '~/components/Ui/MyButton';
import { MyText } from '~/components/Ui/MyText';
import VStack from '~/components/Ui/VStack';
import { useGetRequest } from '~/lib/queries';
import { supabase } from '~/lib/supabase';

const Request = () => {
  const { requestId } = useLocalSearchParams();
  const { userId: id } = useAuth();
  const queryClient = useQueryClient();
  const {
    data,
    isPaused,
    isPending,
    isError,
    refetch,

    isRefetchError,
  } = useGetRequest(requestId);
  const [cancelling, setCancelling] = useState(false);
  const [accepting, setAccepting] = useState(false);

  if (isError || isRefetchError || isPaused || data?.error) {
    return <ErrorComponent refetch={refetch} />;
  }

  if (isPending) {
    return <LoadingComponent />;
  }

  const { request } = data;
  const acceptRequest = async () => {
    setAccepting(true);
    try {
      const { error } = await supabase
        .from('workspace')
        .update({
          salary: request?.salary,
          responsibility: request?.responsibility,
          workerId: request?.to?.userId,
        })
        .eq('id', request?.workspaceId);

      const { error: err } = await supabase
        .from('worker')
        .update({
          role: request?.role,
          bossId: request?.from?.userId,
          workspaceId: +request?.workspaceId,
          organizationId: request?.from?.organizationId?.id,
        })
        .eq('id', request.to.workerId);
      if (!error && !err) {
        toast.success('Request has been accepted');
        queryClient.invalidateQueries({
          queryKey: [
            'request',
            'single',
            'worker',
            'pending_requests',
            'pending_worker',
            'myStaffs',
          ],
        });
        router.replace(`/wk/${data?.request?.workspaceId}`);
      }
      if (error || err) {
        toast.error('Something went wrong');

        console.log(error || err);
      }
    } catch (error) {
      console.log(error);
      toast.error('Something went wrong');
    } finally {
      setAccepting(false);
    }
  };

  const rejectRequest = async () => {
    setCancelling(true);
    try {
      const { error } = await supabase.from('request').delete().eq('id', requestId);

      if (!error) {
        toast.success('Request Canceled');

        queryClient.invalidateQueries({
          queryKey: ['request'],
        });
        queryClient.invalidateQueries({
          queryKey: ['single', requestId],
        });
        queryClient.invalidateQueries({
          queryKey: ['pending_requests', id],
        });

        router.back();
      }

      if (error) {
        toast.error('Something went wrong');
      }
    } catch (error) {
      console.log(error);

      toast.error('Something went wrong');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <Container>
      <HeaderNav title="Request" />
      <VStack>
        <View style={{ marginBottom: 20 }}>
          <Image
            source={request?.from?.organizationId?.avatar}
            style={{ width: '100%', height: 200, borderRadius: 6 }}
            contentFit="cover"
          />
        </View>
        <MyText fontSize={18} poppins="Medium" style={{ textTransform: 'capitalize' }}>
          {formatDistanceToNow(request?.created_at)} ago
        </MyText>
        <MyText fontSize={18} poppins="Medium">
          From : {request?.from?.organizationId?.name}
        </MyText>
        <MyText fontSize={18} poppins="Medium">
          Responsibilities : {request?.responsibility}
        </MyText>
        <MyText fontSize={18} poppins="Medium">
          Salary : {request?.salary}
        </MyText>
        <MyText fontSize={18} poppins="Medium">
          Role : {request?.role}
        </MyText>
      </VStack>
      <HStack mt="auto" mb={30} gap={10}>
        <MyButton
          loading={cancelling}
          buttonColor="red"
          style={{ width: '50%' }}
          onPress={rejectRequest}>
          Decline
        </MyButton>
        <MyButton loading={accepting} style={{ width: '50%' }} onPress={acceptRequest}>
          Accept
        </MyButton>
      </HStack>
    </Container>
  );
};

export default Request;
