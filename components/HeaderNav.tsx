import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleProp, View, ViewStyle } from 'react-native';

import { colors } from '../constants/Colors';
import { useDarkMode } from '../hooks/useDarkMode';
import { MyText } from './Ui/MyText';
import VStack from './Ui/VStack';

type Props = {
  title: string;
  RightComponent?: () => JSX.Element;
  subTitle?: string;
  style?: StyleProp<ViewStyle>;
};

export const HeaderNav = ({ title, RightComponent, subTitle, style }: Props): JSX.Element => {
  const router = useRouter();
  const { darkMode } = useDarkMode();

  const onGoBack = () => {
    router.back();
  };
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          justifyContent: 'space-between',
          backgroundColor: darkMode === 'dark' ? 'black' : 'white',
          alignItems: 'center',
        },
        style,
      ]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Pressable
          onPress={onGoBack}
          style={{
            paddingVertical: 5,
            paddingRight: 5,
          }}>
          <FontAwesome
            name="angle-left"
            color={darkMode === 'dark' ? 'white' : 'black'}
            size={30}
          />
        </Pressable>
        <VStack>
          <MyText
            poppins="Bold"
            style={{
              fontSize: 20,
            }}>
            {title}
          </MyText>

          {subTitle && (
            <MyText
              poppins="Medium"
              style={{
                color: colors.grayText,

                fontSize: 12,
                marginTop: -8,
              }}>
              {subTitle}
            </MyText>
          )}
        </VStack>
      </View>

      {RightComponent && <RightComponent />}
    </View>
  );
};
