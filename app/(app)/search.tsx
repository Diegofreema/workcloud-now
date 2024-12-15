import { useAuth } from '@clerk/clerk-expo';
import { AntDesign } from '@expo/vector-icons';
import { Avatar, SearchBar } from '@rneui/themed';
import { useQuery } from 'convex/react';
import { ErrorBoundaryProps, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { FlatList, Pressable, Text } from 'react-native';
import { useDebounce } from 'use-debounce';

import { HStack } from '~/components/HStack';
import { RecentSearch } from '~/components/RecentSearch';
import { TSearch } from '~/components/TopSearch';
import { Container } from '~/components/Ui/Container';
import { ErrorComponent } from '~/components/Ui/ErrorComponent';
import { LoadingComponent } from '~/components/Ui/LoadingComponent';
import { MyText } from '~/components/Ui/MyText';
import VStack from '~/components/Ui/VStack';
import { SearchServicePoints } from '~/constants/types';
import { api } from '~/convex/_generated/api';
import { useDarkMode } from '~/hooks/useDarkMode';
import { useGetUserId } from '~/hooks/useGetUserId';
import { useStoreSearch } from '~/hooks/useStoreSearch';

export function ErrorBoundary({ retry }: ErrorBoundaryProps) {
  return <ErrorComponent refetch={retry} />;
}

const Search = () => {
  const [value, setValue] = useState('');
  const [val] = useDebounce(value, 1000);

  const { userId } = useAuth();
  const { id } = useGetUserId(userId!);
  const topSearch = useQuery(api.organisation.getTopSearches, { userId: id! });
  const searches = useQuery(api.organisation.getOrganisationsByServicePointsSearchQuery, {
    query: val,
    ownerId: id!,
  });

  if (!topSearch) {
    return (
      <Container>
        <SearchHeader value={value} setValue={setValue} />
        <LoadingComponent />
      </Container>
    );
  }

  const showResultText = val !== '' && searches;
  console.log({ searches });
  return (
    <Container>
      <SearchHeader value={value} setValue={setValue} />
      <TSearch data={topSearch} />
      <RecentSearch />
      <FlatList
        ListHeaderComponent={() =>
          showResultText ? (
            <MyText
              poppins="Medium"
              style={{
                fontSize: 14,
                marginBottom: 20,
              }}>
              Results
            </MyText>
          ) : null
        }
        style={{ marginTop: 20 }}
        showsVerticalScrollIndicator={false}
        data={searches}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => {
          return <OrganizationItem item={item!} />;
        }}
        ListEmptyComponent={() => (
          <Text style={{ color: 'white', fontFamily: 'PoppinsBold' }}>No results found</Text>
        )}
      />
    </Container>
  );
};

export default Search;

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
      placeholderTextColor="#ccc"
      inputStyle={{ backgroundColor: 'transparent', borderWidth: 0, color: 'black' }}
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

const OrganizationItem = ({ item }: { item: SearchServicePoints }) => {
  const storeOrgs = useStoreSearch((state) => state.storeOrgs);
  const router = useRouter();
  const onPress = () => {
    storeOrgs({ id: item.id, name: item.name });
    // @ts-ignore
    router.push(`reception/${item.organizationId.id}`);
  };
  return (
    <Pressable
      style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1, marginBottom: 10 }]}
      // @ts-ignore
      onPress={onPress}>
      <HStack alignItems="center" gap={10}>
        <Avatar rounded source={{ uri: item.avatar! }} size={50} />
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
