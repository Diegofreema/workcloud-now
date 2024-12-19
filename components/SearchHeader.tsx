import { SearchIcon } from 'lucide-react-native';
import { StyleSheet, TextInput, TouchableOpacity } from 'react-native';

import { colors } from '~/constants/Colors';
import { useDarkMode } from '~/hooks/useDarkMode';

type Props = {
  placeholder: string;
};
export const SearchHeader = ({ placeholder }: Props) => {
  const { darkMode } = useDarkMode();
  const color = darkMode === 'dark' ? colors.white : colors.black;
  return (
    <TouchableOpacity style={styles.textInputContainer}>
      <TextInput style={styles.textInput} editable={false} placeholder={placeholder} />
      <SearchIcon size={30} color={color} />
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
