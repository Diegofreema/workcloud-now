import { QueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { router } from 'expo-router';
import { toast } from 'sonner-native';

import { supabase } from './supabase';
import { ChatDateGroup, DataType, Org } from '../constants/types';
import { ImagePickerAsset } from 'expo-image-picker';
import { parse } from 'date-fns';
import { Id } from '~/convex/_generated/dataModel';

const queryClient = new QueryClient();
type User = {
  email: string;
  userId: string;
  name: string;
  phoneNumber: string;
  streamToken: string;
  avatar: string;
};
export const createOrg = async (orgData: Org) => {
  try {
    const { data } = await axios.post(
      'https://workserver-plum.vercel.app/organization/create',
      orgData
    );

    return data;
  } catch (error: any) {
    return { error: error.response.data.error };
  }
};

export const createToken = async (userId: string) => {
  try {
    const { data: axiosData } = await axios.post(
      'https://workcloud-server-1.onrender.com/create-token',
      {
        id: userId,
      }
    );

    return axiosData.streamToken;
  } catch (error) {
    console.log(JSON.stringify(error, null, 1));
  }
};
export const checkIfUserExistsFn = async (email: string) => {
  try {
    const { data: dt } = await supabase.from('user').select().eq('email', email).single();

    return dt;
  } catch (error: any) {
    console.log(error);

    return null;
  }
};

export const createUser = async (user: User) => {
  try {
    const { data } = await supabase.from('user').insert(user).select().single();
    return data;
  } catch (error) {
    console.log(error);
    return null;
  }
};
export const updateOrg = async (orgData: Org) => {
  try {
    const { data } = await axios.post(
      'https://workserver-plum.vercel.app/organization/update',
      orgData
    );

    return data;
  } catch (error: any) {
    return { error: error.response.data.error };
  }
};

export const checkLength = (value: string) => {
  if (!value) return '';
  if (value.length > 25) {
    return value.substring(0, 25) + '...';
  } else {
    return value;
  }
};

export const uploadPostImage = async (postUrl: string, organizationId: string) => {
  const { error } = await supabase
    .from('posts')
    .insert({ postUrl, organizationId: Number(organizationId) });
  if (error) {
    throw error.message;
  }
};

export const deletePost = async (id: number) => {
  const { error } = await supabase.from('posts').delete().eq('id', id);
  if (error) {
    throw error.message;
  }
};

export const exitWaitList = async (workspaceId: number, customerId: string) => {
  const { error: err, data } = await supabase
    .from('waitList')
    .select('*')
    .eq('workspaceId', workspaceId);
  if (!err) {
    const customerToRemove = data.find((item) => item?.customer === customerId);
    await supabase
      .from('waitList')
      .delete()
      .eq('customer', customerToRemove?.customer as string);
  }

  router.back();
};

export const onDeleteImage = async (path: string) => {
  try {
    const { error } = await supabase.storage.from('avatars').remove([path]);
    if (error) {
      console.log(error);
      throw error.message;
    }
  } catch (error) {
    console.log(error);
  }
};

const queryKey = [
  'wk',
  'waitList',
  'pending_requests',
  'myStaffs',
  'connections',
  'organization',
  'assignedWk',
  'profile',
  'posts',
  'wks',
  'wk',
  'personal',
  'search',
  'search_name',
  'workers',
  'personal_workers',
  'other_workers',
  'pending_worker',
  'pending_requests',
  'worker',
  'request',
  'single',
  'single_orgs',
  'get_single_orgs',
  'use_organization',
  'followers',
];
export const onRefresh = async () => {
  queryClient.invalidateQueries({
    predicate: (query) => {
      queryKey.forEach((key) => {
        if (query.queryKey?.includes(key)) {
          return true;
        }
      });
      return false;
    },
  });
};

export const onFollow = async (id: number, name: string, userId: string) => {
  try {
    const { error } = await supabase.from('followers').insert({
      organizationId: id,
      followerId: userId,
    });
    if (error) {
      console.log('following error', error);
      toast.error('Failed to follow', {
        description: 'Please try again later',
      });
    } else {
      queryClient.invalidateQueries({
        queryKey: ['followers', id],
      });
      queryClient.invalidateQueries({
        queryKey: ['use_organization'],
      });
      toast.success(`You are now following ${name}`);
    }
  } catch (error) {
    console.log(error);

    toast.error('Failed to follow', {
      description: 'Please try again later',
    });
  }
};

export const onUnFollow = async (id: number, name: string, userId: string) => {
  try {
    const { error } = await supabase
      .from('followers')
      .delete()
      .eq('organizationId', id)
      .eq('followerId', userId);
    if (error) {
      console.log('unfollowing error', error);

      toast.error('Failed to unfollow', {
        description: 'Please try again later',
      });
    } else {
      queryClient.invalidateQueries({
        queryKey: ['followers', id],
      });
      queryClient.invalidateQueries({
        queryKey: ['use_organization'],
      });
      toast.success(`You are no longer following ${name}`);
    }
  } catch (error) {
    console.log(error);

    toast.error('Failed to unfollow', {
      description: 'Please try again later',
    });
  }
};

export const checkIfEmployed = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('workspace')
      .select()
      .eq('workerId', userId)
      .single();

    if (error) {
      console.log(error, 'error');
    }

    if (!error && data?.workerId) {
      return data;
    }
  } catch (error: any) {
    console.log(error, 'error');
  }
};

export const trimText = (text: string, maxLength: number = 20) => {
  if (text.length > maxLength) {
    return text.substring(0, maxLength) + '...';
  }

  return text;
};

export const uploadProfilePicture = async (
  selectedImage: ImagePickerAsset | null,
  generateUploadUrl: any
) => {
  const uploadUrl = await generateUploadUrl();
  if (!selectedImage) return;
  const response = await fetch(selectedImage?.uri);
  const blob = await response.blob();
  const result = await fetch(uploadUrl, {
    method: 'POST',
    body: blob,
    headers: { 'Content-Type': selectedImage.mimeType! },
  });
  const { storageId } = await result.json();

  return storageId;
};

export function convertTimeToDateTime(timeString: string) {
  // Use current date as base, then parse the time
  const currentDate = new Date();
  return parse(
    `${currentDate.toISOString().split('T')[0]} ${timeString}`,
    'yyyy-MM-dd HH:mm',
    currentDate
  );
}

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }

  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }

  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

export function transformChatData(
  messages: DataType[],
  currentUserId: Id<'users'>
): ChatDateGroup[] {
  // Sort messages by creation time in descending order
  const groupedMessages: Record<string, ChatDateGroup> = {};

  messages.forEach((message) => {
    // Convert creation time to Date object
    const messageDate = new Date(message._creationTime);
    const formattedDate = messageDate.toISOString().split('T')[0];

    // Determine if the message is from the current user
    const isCurrentUser = message.senderId === currentUserId;

    // Create message object
    const transformedMessage = {
      id: message._id,
      text: message.content,
      isCurrentUser,
      timestamp: messageDate.toISOString(),
      _creationTime: message._creationTime, // Keep original creation time for sorting
    };

    // Add to grouped messages
    if (!groupedMessages[formattedDate]) {
      groupedMessages[formattedDate] = {
        title: formattedDate,
        data: [],
      };
    }

    groupedMessages[formattedDate].data.push(transformedMessage);
  });

  // Convert grouped messages to array, sort by date, and order messages chronologically
  return Object.values(groupedMessages)
    .sort((a, b) => new Date(b.title).getTime() - new Date(a.title).getTime())
    .map((group) => ({
      ...group,
      // @ts-expect-error
      data: group.data.sort((a, b) => a._creationTime - b._creationTime),
    }));
}
