import { MessageSquarePlus } from 'lucide-react-native';
import { View } from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';

import { MyText } from '~/components/Ui/MyText';
import { colors } from '~/constants/Colors';
import { useDarkMode } from '~/hooks/useDarkMode';

export const EmptyChat = () => {
  const { darkMode } = useDarkMode();
  const color = darkMode === 'dark' ? colors.white : colors.dialPad;
  const colorIcon = darkMode === 'dark' ? colors.dialPad : colors.white;

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <View
        style={{
          backgroundColor: color,
          padding: 20,
          borderRadius: 100,
        }}>
        <MessageSquarePlus size={100} color={colorIcon} />
      </View>

      <MyText
        poppins="Bold"
        fontSize={RFPercentage(2)}
        style={{
          marginTop: 20,
        }}>
        Conversation is empty, send a text!
      </MyText>
    </View>
  );
};
