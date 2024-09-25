/* eslint-disable prettier/prettier */

import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { toast } from 'sonner-native';

import { MyButton } from './Ui/MyButton';
import { MyText } from './Ui/MyText';

import { useDarkMode } from '~/hooks/useDarkMode';
import { supabase } from '~/lib/supabase';

export const AddRole = ({ onNavigate }: { onNavigate: (item: string) => void }): JSX.Element => {
  const { darkMode } = useDarkMode();
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const onAddRole = async () => {
    if (value === '') return;

    setLoading(true);
    try {
      const { data, error } = await supabase.from('roles').select().eq('role', value);
      if (error) {
        toast.error('Failed to add role');
        return;
      }
      if (data.length) {
        toast('Could not add role', {
          description: 'Role already exists',
        });
        return;
      }

      const { error: error2 } = await supabase.from('roles').insert({ role: value });
      if (error2) {
        toast.error('Failed to add role');
        return;
      }
      onNavigate(value);
      queryClient.invalidateQueries({ queryKey: ['roles'] });
      toast('Role added successfully');
      setValue('');
    } catch (error) {
      console.log(error);
      toast.error('Failed to add role');
    } finally {
      setLoading(false);
    }
  };
  return (
    <View style={{ gap: 10, paddingTop: 15 }}>
      <MyText poppins="Medium" fontSize={15}>
        Couldn't find a role
      </MyText>
      <TextInput
        placeholder="Enter a custom one"
        placeholderTextColor={darkMode === 'dark' ? 'white' : 'black'}
        style={{
          borderWidth: 1,
          borderRadius: 5,
          marginTop: 10,
          padding: 10,
          borderColor: 'gray',
          color: darkMode === 'dark' ? 'white' : 'black',
        }}
        onEndEditing={onAddRole}
        value={value}
        onChangeText={setValue}
      />
      <MyButton onPress={onAddRole} disabled={value === '' || loading} loading={loading}>
        <MyText poppins="Medium" fontSize={15}>
          Add
        </MyText>
      </MyButton>
    </View>
  );
};
