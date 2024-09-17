import { useAuth } from '@clerk/clerk-expo';
import { AntDesign } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Pressable } from 'react-native';
import { toast } from 'sonner-native';

import { DeletePostModal } from '~/components/Dialogs/DeletePost';
import { HeaderNav } from '~/components/HeaderNav';
import { PostComponent } from '~/components/PostComponent';
import { Container } from '~/components/Ui/Container';
import { ErrorComponent } from '~/components/Ui/ErrorComponent';
import { LoadingComponent } from '~/components/Ui/LoadingComponent';
import { useDarkMode } from '~/hooks/useDarkMode';
import { uploadPostImage } from '~/lib/helper';
import { useGetPosts } from '~/lib/queries';
import { supabase } from '~/lib/supabase';

const Posts = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isPending, isRefetching, refetch, isPaused, isError, isRefetchError } =
    useGetPosts(id);
  if (isError || isPaused || isRefetchError) {
    return <ErrorComponent refetch={refetch} />;
  }
  if (isPending) {
    return <LoadingComponent />;
  }

  const { imgUrls } = data;

  return (
    <>
      <Container>
        <HeaderNav title="Posts" RightComponent={RightComponent} />
        <DeletePostModal />
        <PostComponent isRefetching={isRefetching} refetch={refetch} imgUrls={imgUrls} />
      </Container>
    </>
  );
};

export default Posts;

const RightComponent = () => {
  const { darkMode } = useDarkMode();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { userId } = useAuth();
  const queryClient = useQueryClient();
  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const image = result.assets[0];

      const arraybuffer = await fetch(image.uri).then((res) => res.arrayBuffer());

      const fileExt = image.uri?.split('.').pop()?.toLowerCase() ?? 'jpeg';
      const path = `${Date.now()}.${fileExt}`;
      try {
        const { data, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(path, arraybuffer, {
            contentType: image.mimeType ?? 'image/jpeg',
          });

        if (uploadError) {
          toast.error('Something went wrong', {
            description: 'Failed to upload image',
          });
        }

        if (!uploadError) {
          uploadPostImage(
            `https://mckkhgmxgjwjgxwssrfo.supabase.co/storage/v1/object/public/avatars/${data.path}`,
            id
          );
          toast.success('Image uploaded successfully', {
            description: 'Your image has been uploaded',
          });

          queryClient.invalidateQueries({ queryKey: ['posts', userId] });
        }
      } catch (error) {
        console.log(error, 'error');

        toast.error('Something went wrong', {
          description: 'Failed to upload image',
        });
      }
    }
  };
  return (
    <Pressable onPress={pickImage} style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }]}>
      <AntDesign name="pluscircleo" size={24} color={darkMode === 'dark' ? 'white' : 'black'} />
    </Pressable>
  );
};
