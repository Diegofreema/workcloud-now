/* eslint-disable prettier/prettier */

import { useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { toast } from 'sonner-native';

import { ServicePointModal } from '../Dialogs/ServicePointModal';
import { InputComponent } from '../InputComponent';
import { MyButton } from '../Ui/MyButton';
import { MyText } from '../Ui/MyText';
import { UserPreview } from '../Ui/UserPreview';
import VStack from '../Ui/VStack';

import { useSelect } from '~/hooks/useSelect';
import { supabase } from '~/lib/supabase';

export const ServicePointForm = (): JSX.Element => {
  const { onDeselect, user } = useSelect();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const onClose = useCallback(() => setIsOpen(false), []);

  const [values, setValues] = useState({
    name: '',
    description: '',
  });
  const handleChange = (name: string, value: string) => {
    setValues({
      ...values,
      [name]: value,
    });
  };
  const onAddServicePoint = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('servicePoint')
        .insert({
          name: values.name,
          description: values.description,
          organizationId: +id,
          staff: user?.id!,
        })
        .select()
        .single();

      if (error) {
        console.log(error);

        return toast.error('Something went wrong', {
          description: 'Failed to create service point. Please try again',
        });
      }
      const { error: err } = await supabase
        .from('worker')
        .update({ servicePointId: data.id })
        .eq('userId', user?.id!);

      if (err) {
        console.log(err);
        await supabase.from('servicePoint').delete().eq('id', data.id);
        return toast.error('Something went wrong', {
          description: 'Failed to create service point. Please try again',
        });
      }
      setIsOpen(true);
      setValues({ name: '', description: '' });
      onDeselect();
      queryClient.invalidateQueries({ queryKey: ['service_points'] });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = !values.name || !values.description || !user || loading;
  return (
    <VStack flex={1}>
      <ServicePointModal text="Service Point Created" isOpen={isOpen} onClose={onClose} />
      <InputComponent
        label="Quick point name"
        value={values.name}
        onChangeText={(text) => handleChange('name', text)}
        placeholder="Eg. customers service"
      />

      <InputComponent
        label="Description"
        value={values.description}
        onChangeText={(text) => handleChange('description', text)}
        placeholder="Describe what this service point is for"
        multiline
        textarea
      />

      {user ? (
        <View style={{ marginHorizontal: 10 }}>
          <UserPreview name={user.name} imageUrl={user.image} roleText={user.role} />
        </View>
      ) : (
        <Pressable
          onPress={() => router.push('/select-staff')}
          style={({ pressed }) => [styles.select, pressed && { opacity: 0.5 }]}>
          <MyText poppins="Bold" fontSize={15} style={{ color: '#929292' }}>
            Select staff
          </MyText>
        </Pressable>
      )}
      <MyButton
        onPress={onAddServicePoint}
        disabled={isDisabled}
        containerStyle={{ marginHorizontal: 10, marginTop: 20 }}
        buttonStyle={{ height: 55 }}
        loading={loading}>
        <MyText poppins="Bold" fontSize={15} style={{ color: 'white' }}>
          Proceed
        </MyText>
      </MyButton>
    </VStack>
  );
};

const styles = StyleSheet.create({
  select: {
    backgroundColor: '#E5E5E5',
    borderRadius: 5,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginHorizontal: 10,
  },
});
