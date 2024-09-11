import { useAuth } from '@clerk/clerk-expo';
import { EvilIcons } from '@expo/vector-icons';
import { Text } from '@rneui/themed';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors } from '../constants/Colors';
import { useDarkMode } from '../hooks/useDarkMode';

import { usePendingRequest } from '~/lib/queries';
import { supabase } from '~/lib/supabase';

export const Header = (): JSX.Element => {
  const queryClient = useQueryClient();
  const { darkMode } = useDarkMode();
  const { userId: id } = useAuth();
  const { data } = usePendingRequest(id);
  useEffect(() => {
    const channel = supabase
      .channel('workcloud')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'requests',
        },
        (payload: any) => {
          // if (payload) {
          //   onRefresh(id);
          // }
          console.log('Change received!', payload);
          queryClient.invalidateQueries({ queryKey: ['pending_requests'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  const router = useRouter();
  const onSearch = () => {
    router.push('/search');
  };
  const onNotify = () => {
    router.push('/notification');
  };
  const numberOfUnread = data?.requests.filter((r) => r.unread).length || 0;
  return (
    <View style={styles.container}>
      <Text
        style={{
          fontFamily: 'PoppinsBoldItalic',
          color: colors.buttonBlue,
          fontSize: 15,
        }}>
        Workcloud
      </Text>
      <View style={styles.subContainer}>
        <Pressable
          onPress={onSearch}
          style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1, paddingHorizontal: 5 }]}>
          <EvilIcons name="search" size={30} color={darkMode === 'dark' ? '#fff' : '#000'} />
        </Pressable>
        <Pressable onPress={onNotify} style={({ pressed }) => [{ opacity: pressed ? 0.5 : 1 }]}>
          <EvilIcons name="bell" size={30} color={darkMode === 'dark' ? '#fff' : '#000'} />
          {numberOfUnread > 0 && (
            <View style={styles.unread}>
              <Text style={{ color: 'white', fontWeight: 'bold' }}>{numberOfUnread}</Text>
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subContainer: {
    flexDirection: 'row',
    gap: 20,
  },
  unread: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: 'red',
    width: 20,
    height: 20,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
