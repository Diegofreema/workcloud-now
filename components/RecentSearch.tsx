/* eslint-disable prettier/prettier */

import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import { FlatList, Pressable, StyleSheet } from 'react-native';

import { MyText } from './Ui/MyText';

import { useStoreSearch } from '~/hooks/useStoreSearch';

export const RecentSearch = (): JSX.Element => {
  const recentSearchedOrgs = useStoreSearch((state) => state.orgs);
  return (
    <FlatList
      data={recentSearchedOrgs}
      ListHeaderComponent={
        <MyText poppins="Medium" fontSize={16}>
          Recent Searches
        </MyText>
      }
      scrollEnabled={false}
      renderItem={({ item }) => <SearchItem item={item} />}
      contentContainerStyle={{ gap: 10 }}
    />
  );
};

const SearchItem = ({ item }: { item: { name: string; id: string } }) => {
  const onPress = () => {
    // @ts-ignore
    router.push(`reception/${item.id}?search=true`);
  };
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.container, { opacity: pressed ? 0.5 : 1 }]}>
      <MyText poppins="Bold" fontSize={14}>
        {item.name}
      </MyText>
      <FontAwesome name="close" size={20} color="black" />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 10,
  },
});
