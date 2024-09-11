import { useDarkMode } from '../../hooks/useDarkMode';
import { View } from '../Themed';

type Props = {
  children: React.ReactNode;
};

export const Container = ({ children }: Props): JSX.Element => {
  const { darkMode } = useDarkMode();
  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: 20,
        backgroundColor: darkMode === 'dark' ? 'black' : 'white',
      }}>
      {children}
    </View>
  );
};
