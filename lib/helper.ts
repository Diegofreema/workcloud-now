import { QueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { format, formatDistanceToNow, isWithinInterval, parse } from 'date-fns';
import { ImagePickerAsset } from 'expo-image-picker';
import { toast } from 'sonner-native';

import { supabase } from './supabase';

import { ChatDateGroup, DataType, Org } from '~/constants/types';
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
export const convertStringToDate = (dateString: string): string => {
  const date = parse(dateString, 'dd/MM/yyyy, HH:mm:ss', new Date());
  return formatDateToNowHelper(date);
};

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

export const formatDateToNowHelper = (date: Date): string => {
  const formattedDistance = formatDistanceToNow(date);

  const replacements: Record<string, string> = {
    'less than a minute': '1 min',
    '1 minute': '1 min',
    minutes: 'mins',
    '1 hour': '1 hr',
    hours: 'hrs',
  };

  return Object.entries(replacements).reduce(
    (result, [search, replace]) => result.replace(search, replace),
    formattedDistance
  );
};
export const now = format(Date.now(), 'dd/MM/yyyy, HH:mm:ss');

export const checkIfOpen = (open: string, end: string): boolean => {
  const now = new Date();

  const openTime = parse(open, 'HH:mm', now);

  const closeTime = parse(end, 'HH:mm', now);

  return isWithinInterval(now, {
    start: openTime,
    end: closeTime,
  });
};
