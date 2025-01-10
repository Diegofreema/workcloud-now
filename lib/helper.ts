import axios from 'axios';
import { format, formatDistanceToNow, isWithinInterval, parse } from 'date-fns';
import { DocumentPickerResult } from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { ImagePickerAsset } from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { Platform } from 'react-native';

import { supabase } from './supabase';

import { ChatDateGroup, DataType } from '~/constants/types';
import { Id } from '~/convex/_generated/dataModel';

type User = {
  email: string;
  userId: string;
  name: string;
  phoneNumber: string;
  streamToken: string;
  avatar: string;
};

export const uriToBase64 = async (uri: string): Promise<string> => {
  try {
    const downloadResult = await FileSystem.downloadAsync(
      uri,
      FileSystem.cacheDirectory + 'temp_image.jpg'
    );
    const localUri = downloadResult.uri;

    // Read the file and convert to base64
    const base64 = await FileSystem.readAsStringAsync(localUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Clean up temporary file if we downloaded it

    await FileSystem.deleteAsync(localUri);

    return base64;
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw error;
  }
};

async function saveFile(uri: string, filename: string, mimeType: string) {
  if (Platform.OS === 'android') {
    const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

    if (permissions.granted) {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await FileSystem.StorageAccessFramework.createFileAsync(
        permissions.directoryUri,
        filename,
        mimeType
      )
        .then(async (uri) => {
          await FileSystem.writeAsStringAsync(uri, base64, {
            encoding: FileSystem.EncodingType.Base64,
          });
        })
        .catch((e) => console.log(e));
    }
  }
}
export async function download(imgUrl: string) {
  const filename = 'image.png';
  const result = await FileSystem.downloadAsync(imgUrl, FileSystem.documentDirectory + filename);

  // Log the download result
  console.log({ result });

  // Save the downloaded file
  await saveFile(result.uri, filename, result.headers['Content-Type']);
}
export const saveImageToGallery = async (imageUri: string): Promise<boolean> => {
  let isDownloaded = false;
  try {
    // Request permissions
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Permission not granted');
    }
    const downloadResult = await FileSystem.downloadAsync(
      imageUri,
      FileSystem.cacheDirectory + 'temp_image.jpg'
    );
    const localUri = downloadResult.uri;

    // Read the file and convert to base64
    const base64 = await FileSystem.readAsStringAsync(localUri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    // Clean up temporary file if we downloaded it

    await FileSystem.deleteAsync(localUri);

    // Generate unique filename
    const filename = `${Date.now()}.jpg`;

    // Define save path based on platform
    const destinationUri = Platform.select({
      ios: `${FileSystem.documentDirectory}${filename}`,
      android: `${FileSystem.cacheDirectory}${filename}`,
    });

    if (!destinationUri) {
      throw new Error('Could not determine file path');
    }

    // Download or copy the image
    await FileSystem.copyAsync({
      from: base64,
      to: destinationUri,
    });

    // Save to device gallery
    const asset = await MediaLibrary.createAssetAsync(destinationUri);
    await MediaLibrary.createAlbumAsync('workcloud', asset, false);

    // Clean up temporary file
    await FileSystem.deleteAsync(destinationUri);
    isDownloaded = true;
    return isDownloaded;
  } catch (error) {
    console.error('Error saving image:', error);
    throw error;
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

export const checkLength = (value: string) => {
  if (!value) return '';
  if (value.length > 25) {
    return value.substring(0, 25) + '...';
  } else {
    return value;
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
): Promise<{ storageId: Id<'_storage'>; uploadUrl: string }> => {
  const uploadUrl = await generateUploadUrl();

  const response = await fetch(selectedImage?.uri!);
  const blob = await response.blob();
  const result = await fetch(uploadUrl, {
    method: 'POST',
    body: blob,
    headers: { 'Content-Type': selectedImage?.mimeType! },
  });
  const { storageId } = await result.json();

  return { storageId, uploadUrl };
};
export const uploadDoc = async (
  selectedDoc: DocumentPickerResult | null,
  generateUploadUrl: any
): Promise<{ storageId: Id<'_storage'>; uploadUrl: string }> => {
  const uploadUrl = await generateUploadUrl();

  const response = await fetch(selectedDoc?.assets?.[0]?.uri!);
  const blob = await response.blob();
  const result = await fetch(uploadUrl, {
    method: 'POST',
    body: blob,
    headers: { 'Content-Type': selectedDoc?.assets?.[0]?.mimeType! },
  });
  const { storageId } = await result.json();

  return { storageId, uploadUrl };
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
