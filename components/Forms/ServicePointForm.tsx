/* eslint-disable prettier/prettier */

import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { toast } from 'sonner-native';

import { ServicePointModal } from '../Dialogs/ServicePointModal';
import { InputComponent } from '../InputComponent';
import { LoadingComponent } from '../Ui/LoadingComponent';
import { MyButton } from '../Ui/MyButton';
import { MyText } from '../Ui/MyText';
import { UserPreview } from '../Ui/UserPreview';
import VStack from '../Ui/VStack';

import { useSelect } from '~/hooks/useSelect';
import { supabase } from '~/lib/supabase';

export const ServicePointForm = (): JSX.Element => {
  const { onDeselect, user, onSelect } = useSelect();
  const { editId } = useLocalSearchParams<{ editId: string }>();
  const [fetching, setFetching] = useState(false);
  const { id } = useLocalSearchParams<{ id: string }>();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!editId) return;
    const fetchServicePoint = async () => {
      setFetching(true);
      try {
        const { data, error } = await supabase
          .from('servicePoint')
          .select('*')
          .eq('id', +editId)
          .single();
        if (error) {
          console.log(error);
          toast.error('Something went wrong', {
            description: 'Failed to fetch service point. Please try again',
          });
          router.back();
        }
        if (data) {
          const { data: worker, error: workerError } = await supabase
            .from('worker')
            .select('*, userId(*)')
            .eq('servicePointId', data.id)
            .single();
          if (workerError) {
            console.log(workerError);
            toast.error('Something went wrong', {
              description: 'Failed to fetch worker. Please try again',
            });
            router.back();
          }
          if (worker) {
            onSelect({
              // @ts-ignore
              id: worker?.userId?.userId,
              // @ts-ignore
              name: worker?.userId?.name,
              role: worker.role!,
              // @ts-ignore
              image: worker.userId?.avatar,
            });
          }
        }
      } catch (error) {
        console.log(error);
        toast.error('Something went wrong', {
          description: 'Failed to fetch service point. Please try again',
        });
      } finally {
        setFetching(false);
      }
    };
    fetchServicePoint();
  }, []);
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
  const onChangeStaff = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('servicePoint')
        .update({ staff: user?.id! })
        .eq('id', editId);
      if (error) {
        console.log(error);

        return toast.error('Something went wrong', {
          description: 'Failed to change staff. Please try again',
        });
      }
      if (!error) {
        toast.success('Staff changed successfully');
        router.back();
        onDeselect();
      }
    } catch (error) {
      console.log(error);
      toast.error('Something went wrong', {
        description: 'Failed to change staff. Please try again',
      });
    } finally {
      setLoading(false);
    }
  };
  const onCreateServicePoint = async () => {
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
      toast.success('Success', {
        description: 'Service point created successfully',
      });
      setIsOpen(true);
      setValues({ name: '', description: '' });
      onDeselect();
      router.back();
    } catch (error) {
      console.log(error);
      toast.error('Something went wrong', {
        description: 'Failed to create service point. Please try again',
      });
    } finally {
      setLoading(false);
    }
  };
  const onAddServicePoint = async () => {
    if (editId) {
      onChangeStaff();
    } else {
      onCreateServicePoint();
    }
  };
  if (fetching) return <LoadingComponent />;
  const isDisabled = !values.name || !values.description || !user || loading;
  const isDisabled2 = !user || loading;
  return (
    <VStack flex={1}>
      <ServicePointModal text="Service Point Created" isOpen={isOpen} onClose={onClose} />
      {!editId && (
        <>
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
        </>
      )}

      {user ? (
        <UserPreview
          onPress={() => router.push('/select-staff')}
          name={user.name}
          imageUrl={user.image}
          roleText={user.role}
        />
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
        disabled={editId ? isDisabled2 : isDisabled}
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
