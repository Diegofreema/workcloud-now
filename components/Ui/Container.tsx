import { useDarkMode } from '../../hooks/useDarkMode';
import { View } from '../Themed';

type Props = {
  children: React.ReactNode;
  noPadding?: boolean;
};

export const Container = ({ children, noPadding }: Props): JSX.Element => {
  const { darkMode } = useDarkMode();
  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: noPadding ? 0 : 20,
        backgroundColor: darkMode === 'dark' ? 'black' : 'white',
      }}>
      {children}
    </View>
  );
};
