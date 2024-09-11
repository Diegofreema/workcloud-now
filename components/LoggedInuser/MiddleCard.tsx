import { useRouter } from 'expo-router';
import { FlatList, Pressable, View } from 'react-native';

import { EmptyText } from '../EmptyText';
import { HeadingText } from '../Ui/HeadingText';

import { ConnectionType } from '~/constants/types';
import { Avatar } from '@rneui/themed';

export const MiddleCard = ({ connections }: { connections: ConnectionType[] }): JSX.Element => {
  const firstSix = (connections?.length && connections?.slice(0, 6)) || [];
  return (
    <View>
      <>
        {connections?.length > 0 && <HeadingText link="/connections" />}
        <View style={{ marginTop: 10 }} />
        <FlatList
          showsHorizontalScrollIndicator={false}
          horizontal
          contentContainerStyle={{
            gap: 15,
          }}
          data={firstSix}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => {
            return <Images item={item} />;
          }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={() => <EmptyText text="No connections" />}
        />
      </>
    </View>
  );
};

const Images = ({ item }: { item: ConnectionType }) => {
  const router = useRouter();
  const startChannel = async () => {
    router.push(`/reception/${item?.connectedTo?.id}`);
  };
  return (
    <Pressable onPress={startChannel}>
      <Avatar size={50} source={{ uri: item?.connectedTo?.avatar }} />
    </Pressable>
  );
};
