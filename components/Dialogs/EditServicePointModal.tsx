import { Button } from '@rneui/themed';
import { useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Modal from 'react-native-modal';
import { toast } from 'sonner-native';

import { HStack } from '../HStack';
import { InputComponent } from '../InputComponent';
import { MyText } from '../Ui/MyText';
import VStack from '../Ui/VStack';

import { colors } from '~/constants/Colors';
import { Id } from '~/convex/_generated/dataModel';
import { useDarkMode } from '~/hooks/useDarkMode';
import { supabase } from '~/lib/supabase';

type Props = {
  onClose: () => void;
  isOpen: boolean;
  prevValues: {
    name: string;
    description: string;
  };
  id: Id<'servicePoints'>;
};
export const EditServicePointModal = ({ onClose, isOpen, prevValues, id }: Props) => {
  const { darkMode } = useDarkMode();
  const [values, setValues] = useState(prevValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();
  const isDisabled = !values.name || !values.description || isSubmitting;
  const onSubmit = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('servicePoint').update(values).eq('id', id);
      if (error) {
        toast.error(error.message);
      }
      if (!error) {
        toast.success('Service point updated', {
          description: 'Your service point has been updated',
        });
        queryClient.invalidateQueries({ queryKey: ['service_points'] });
      }
    } catch (error) {
      console.log(error);
      toast.error('Something went wrong', {
        description: 'Please try again',
      });
    } finally {
      setIsSubmitting(false);
      onClose();
    }
  };
  const handleChange = (name: string, value: string) => {
    setValues({
      ...values,
      [name]: value,
    });
  };
  return (
    <View>
      <Modal
        hasBackdrop={false}
        onDismiss={onClose}
        animationIn="slideInDown"
        isVisible={isOpen}
        onBackButtonPress={onClose}
        onBackdropPress={onClose}>
        <View
          style={[
            styles.centeredView,
            {
              backgroundColor: darkMode === 'dark' ? 'black' : 'white',
              shadowColor: darkMode === 'dark' ? '#fff' : '#000',
            },
          ]}>
          <MyText
            poppins="Bold"
            fontSize={17}
            style={{
              textAlign: 'center',
              marginBottom: 15,
              color: darkMode === 'dark' ? 'white' : 'black',
            }}>
            Update Service Point
          </MyText>
          <VStack width="100%">
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
          </VStack>
          <HStack gap={10}>
            <Button
              titleStyle={{ fontFamily: 'PoppinsMedium', color: colors.dialPad }}
              buttonStyle={{
                backgroundColor: colors.lightBlueButton,
                borderRadius: 5,
                width: 120,
              }}
              onPress={onClose}
              color={colors.black}>
              Cancel
            </Button>
            <Button
              disabled={isDisabled}
              loading={isSubmitting}
              titleStyle={{ fontFamily: 'PoppinsMedium' }}
              buttonStyle={{
                backgroundColor: colors.dialPad,
                borderRadius: 5,
                width: 120,
              }}
              onPress={onSubmit}>
              Update
            </Button>
          </HStack>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    backgroundColor: 'white',
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,

    borderRadius: 15,
  },
  trash: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    padding: 4,
    borderRadius: 15,
  },
  modalView: {
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  button: {
    position: 'absolute',
    top: 10,
    right: 15,
    padding: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 20,
    borderWidth: 1,
    borderColor: colors.gray10,
    padding: 10,
    borderRadius: 10,
    borderStyle: 'dashed',
  },
});
