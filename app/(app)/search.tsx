import { AntDesign } from '@expo/vector-icons';
import { Avatar, SearchBar } from '@rneui/themed';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useDebounce } from 'use-debounce';

import { HStack } from '~/components/HStack';
import { RecentSearch } from '~/components/RecentSearch';
import { TSearch } from '~/components/TopSearch';
import { Container } from '~/components/Ui/Container';
import { ErrorComponent } from '~/components/Ui/ErrorComponent';
import { LoadingComponent } from '~/components/Ui/LoadingComponent';
import { MyText } from '~/components/Ui/MyText';
import VStack from '~/components/Ui/VStack';
import { ServicePointWithOrg } from '~/constants/types';
import { useDarkMode } from '~/hooks/useDarkMode';
import { useStoreSearch } from '~/hooks/useStoreSearch';
import { useSearch, useSearchName, useTopSearch } from '~/lib/queries';

const Search = () => {
  const [value, setValue] = useState('');
  const [val] = useDebounce(value, 1000);
  const { data, refetch, isPaused, isPending, isError } = useSearch(val);

  const { data: topSearch, isError: isErrorSearch, isPending: isPendingSearch } = useTopSearch();
  const {
    data: nameData,
    refetch: refetchName,
    isPaused: isPausedName,
    isPending: isPendingName,
    isError: isErrorName,
  } = useSearchName(val);
  const handleRefetch = () => {
    refetchName();
    refetch();
  };
  if (isError || isPaused || isErrorName || isPausedName || isErrorSearch) {
    return (
      <View style={styles.container}>
        <SearchHeader value={value} setValue={setValue} />
        <ErrorComponent refetch={handleRefetch} />
      </View>
    );
  }

  if (isPendingSearch) {
    return (
      <Container>
        <SearchHeader value={value} setValue={setValue} />
        <LoadingComponent />
      </Container>
    );
  }

  const uniqueOrgs = [
    ...new Set(
      [...(nameData?.org ?? []), ...(data?.organization ?? [])].map((item) => JSON.stringify(item))
    ),
  ].map((item) => JSON.parse(item));

  const isFetching = isPendingName || isPending;
  return (
    <Container>
      <SearchHeader value={value} setValue={setValue} />
      <TSearch data={topSearch} />
      <RecentSearch />
      {isFetching ? (
        <View style={{ height: 200, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      ) : (
        <FlatList
          ListHeaderComponent={() => (
            <MyText
              poppins="Medium"
              style={{
                fontSize: 14,
                marginBottom: 20,
              }}>
              Results
            </MyText>
          )}
          style={{ marginTop: 20 }}
          showsVerticalScrollIndicator={false}
          data={uniqueOrgs}
          keyExtractor={(item, index) => item?.id.toString() + index}
          renderItem={({ item }) => {
            return <OrganizationItem item={item} />;
          }}
          ListEmptyComponent={() => (
            <Text style={{ color: 'white', fontFamily: 'PoppinsBold' }}>No results found</Text>
          )}
        />
      )}
    </Container>
  );
};

export default Search;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    marginHorizontal: 20,
  },
});

const SearchHeader = ({ value, setValue }: { value: string; setValue: (text: string) => void }) => {
  const { darkMode } = useDarkMode();
  const router = useRouter();
  const onPress = () => {
    if (value === '') {
      router.back();
    }
  };
  return (
    <SearchBar
      placeholderTextColor="black"
      inputStyle={{ backgroundColor: 'transparent', borderWidth: 0 }}
      containerStyle={{
        backgroundColor: 'transparent',
        borderTopWidth: 0,
        borderBottomWidth: 0,
      }}
      inputContainerStyle={{ backgroundColor: 'transparent', borderWidth: 1, borderBottomWidth: 1 }}
      placeholder="Search by description"
      onChangeText={setValue}
      value={value}
      searchIcon={
        <AntDesign
          name={value === '' ? 'arrowleft' : 'search1'}
          size={25}
          color={darkMode === 'dark' ? 'white' : 'black'}
          onPress={onPress}
        />
      }
      round
    />
  );
};

const OrganizationItem = ({ item }: { item: ServicePointWithOrg }) => {
  const storeOrgs = useStoreSearch((state) => state.storeOrgs);
  const router = useRouter();
  const onPress = () => {
    storeOrgs({ id: item.organizationId.id.toString()!, name: item.organizationId.name! });
    // @ts-ignore
    router.push(`reception/${item.organizationId.id}`);
  };
  return (
    <Pressable
      style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1, marginBottom: 10 }]}
      // @ts-ignore
      onPress={onPress}>
      <HStack alignItems="center" gap={10}>
        <Avatar rounded source={{ uri: item.organizationId.avatar }} size={50} />
        <VStack>
          <MyText poppins="Bold" fontSize={14}>
            {item?.name}
          </MyText>
          <MyText poppins="Medium" fontSize={12}>
            {item?.description}
          </MyText>
        </VStack>
      </HStack>
    </Pressable>
  );
};
