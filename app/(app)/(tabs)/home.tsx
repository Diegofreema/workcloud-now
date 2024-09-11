import { useStreamVideoClient } from '@stream-io/video-react-native-sdk';
import { Stack } from 'expo-router';
import { StyleSheet, View, Button } from 'react-native';

export default function Home() {
  const client = useStreamVideoClient();
  const onPress = async () => {
    const call = client?.call('default', '123');
    await call?.getOrCreate({
      ring: true,
      data: {
        members: [
          { user_id: 'user_2lqdLuqt1S6TJVCG0fOWdCZTLNC', role: 'admin' },
          { user_id: 'user_2dKoMMHhxMurWNBkrlJS6vh0nYP', role: 'user' },
        ],
      },
    });
  };
  return (
    <>
      <Stack.Screen options={{ title: 'Tab One' }} />
      <View style={styles.container}>
        <Button title="Start call" onPress={onPress} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
});
