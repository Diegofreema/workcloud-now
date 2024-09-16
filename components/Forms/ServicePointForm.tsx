/* eslint-disable prettier/prettier */

import { useState } from 'react';

import { InputComponent } from '../InputComponent';
import VStack from '../Ui/VStack';

export const ServicePointForm = (): JSX.Element => {
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

  return (
    <VStack flex={1}>
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
  );
};
