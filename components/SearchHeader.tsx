import { router } from 'expo-router';
import { SearchIcon } from 'lucide-react-native';
import { StyleSheet, TextInput, TouchableOpacity } from 'react-native';

import { colors } from '~/constants/Colors';
import { useDarkMode } from '~/hooks/useDarkMode';

type Props = {
  placeholder: string;
  search?: boolean;
  query?: string;
  handleChange?: (value: string) => void;
};
export const SearchHeader = ({ placeholder, search, query, handleChange }: Props) => {
  const { darkMode } = useDarkMode();
  const color = darkMode === 'dark' ? colors.white : colors.black;
  return (
    <TouchableOpacity
      activeOpacity={search ? 1 : 0.5}
      disabled={search}
      onPress={() => router.push('/search-chat')}
      style={styles.textInputContainer}>
      <TextInput
        style={styles.textInput}
        value={query}
        onChangeText={handleChange}
        editable={false}
        placeholder={placeholder}
      />
      <SearchIcon size={30} color={color} strokeWidth={1.5} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  textInput: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  textInputContainer: {
    borderWidth: 1,
    borderColor: colors.gray,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginHorizontal: 15,
  },
});
