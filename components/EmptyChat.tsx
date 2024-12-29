import { MessageSquarePlus } from 'lucide-react-native';
import { Platform, useWindowDimensions, View } from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';

import { MyText } from '~/components/Ui/MyText';
import { colors } from '~/constants/Colors';
import { useDarkMode } from '~/hooks/useDarkMode';

export const EmptyChat = () => {
  const { darkMode } = useDarkMode();
  const color = darkMode === 'dark' ? colors.white : colors.dialPad;
  const colorIcon = darkMode === 'dark' ? colors.dialPad : colors.white;
  const { height } = useWindowDimensions();
  return (
    <View
      style={{
        height,
        justifyContent: 'center',
        alignItems: 'center',
        transform: [{ scaleY: -1 }],
      }}>
      <View
        style={{
          backgroundColor: color,
          padding: 20,
          borderRadius: 100,
          transform: [{ rotateY: Platform.OS === 'android' ? '180deg' : '0deg' }],
        }}>
        <MessageSquarePlus size={100} color={colorIcon} />
      </View>

      <MyText
        poppins="Bold"
        fontSize={RFPercentage(2)}
        style={{
          marginTop: 20,
          transform: [{ rotateY: Platform.OS === 'android' ? '180deg' : '0deg' }],
        }}>
        Conversation is empty, send a text!
      </MyText>
    </View>
  );
};
