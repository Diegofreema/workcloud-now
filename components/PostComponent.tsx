import { FontAwesome } from '@expo/vector-icons';
import { PostgrestError } from '@supabase/supabase-js';
import { QueryObserverResult, RefetchOptions } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { FlatList, Pressable, View } from 'react-native';

import { EmptyText } from './EmptyText';
import { PostType } from '../constants/types';
import { useDeletePost } from '../hooks/useDeletePost';

type Props = {
  imgUrls: PostType[];
  refetch: (options?: RefetchOptions | undefined) => Promise<
    QueryObserverResult<
      {
        imgUrls: PostType[];
        error: PostgrestError | null;
      },
      Error
    >
  >;
  isRefetching: boolean;
};

export const PostComponent = ({ imgUrls, isRefetching, refetch }: Props): JSX.Element => {
  return (
    <FlatList
      onRefresh={refetch}
      refreshing={isRefetching}
      data={imgUrls}
      renderItem={({ item }) => <PostItem {...item} />}
      keyExtractor={(item) => item.id.toString()}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 50 }}
      ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
      ListEmptyComponent={() => <EmptyText text="No posts yet" />}
    />
  );
};

const PostItem = ({ postUrl, id }: PostType) => {
  const { getId, onOpen } = useDeletePost();
  const handleDelete = () => {
    getId(id);
    onOpen();
  };
  return (
    <View>
      <Image
        source={{ uri: postUrl }}
        style={{ width: '100%', height: 200, borderRadius: 10 }}
        contentFit="cover"
      />
      <Pressable
        onPress={handleDelete}
        style={({ pressed }) => ({
          position: 'absolute',
          top: 10,
          right: 10,
          padding: 5,
          opacity: pressed ? 0.5 : 1,
        })}>
        <FontAwesome name="trash" color="red" size={25} />
      </Pressable>
    </View>
  );
};
