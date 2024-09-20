/* eslint-disable prettier/prettier */

import { Avatar } from '@rneui/themed';
import { router } from 'expo-router';
import { FlatList, Pressable, View } from 'react-native';

import { MyText } from './Ui/MyText';

import { TopSearch } from '~/constants/types';
import { useStoreSearch } from '~/hooks/useStoreSearch';

type Props = {
  data: TopSearch[];
};

export const TSearch = ({ data }: Props): JSX.Element => {
  return (
    <View>
      <MyText poppins="Bold" fontSize={20}>
        Top Searches
      </MyText>
      <FlatList
        data={data}
        renderItem={({ item }) => <Item item={item} />}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 10 }}
      />
    </View>
  );
};

const Item = ({ item }: { item: TopSearch }) => {
  const storeOrgs = useStoreSearch((state) => state.storeOrgs);
  const onPress = () => {
    storeOrgs({ name: item.name!, id: item.id.toString()! });
    // @ts-ignore
    router.push(`reception/${item.id}?search=true`);
  };
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: pressed ? 0.5 : 1,
        flex: 1,

        alignItems: 'center',
      })}>
      <Avatar source={{ uri: item.avatar! }} size={60} rounded />
      <MyText poppins="Light" fontSize={14} style={{ textAlign: 'center', maxWidth: 80 }}>
        {item.name}
      </MyText>
    </Pressable>
  );
};
