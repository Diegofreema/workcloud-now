import { useAuth } from '@clerk/clerk-expo';
import { FontAwesome } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Button } from '@rneui/themed';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useFormik } from 'formik';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SelectList } from 'react-native-dropdown-select-list';
import { toast } from 'sonner-native';
import * as yup from 'yup';

import { AuthHeader } from '../../components/AuthHeader';
import { AuthTitle } from '../../components/AuthTitle';
import { InputComponent } from '../../components/InputComponent';
import { Subtitle } from '../../components/Subtitle';
import { days } from '../../constants';
import { colors } from '../../constants/Colors';
import { useDarkMode } from '../../hooks/useDarkMode';
import { supabase } from '../../lib/supabase';

import { Container } from '~/components/Ui/Container';
import { onDeleteImage } from '~/lib/helper';

const validationSchema = yup.object().shape({
  organizationName: yup.string().required('Name of organization is required'),
  category: yup.string().required('Category is required'),
  location: yup.string().required('Location is required'),
  description: yup.string().required('Description is required'),
  startDay: yup.string(),
  endDay: yup.string(),
  startTime: yup.string().required('Working time is required'),
  endTime: yup.string().required('Working time is required'),
  websiteUrl: yup.string().required('Website link is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  image: yup.string().required('Logo is required'),
  logoId: yup.string(),
});

const CreateWorkSpace = () => {
  const [startTime, setStartTime] = useState(new Date(1598051730000));
  const [endTime, setEndTime] = useState(new Date(1598051730000));
  const [avatar, setAvatar] = useState<string>('https://placehold.co/100x100');
  const [path, setPath] = useState<string>('');
  const { userId: id } = useAuth();
  const [show, setShow] = useState(false);
  const [show2, setShow2] = useState(false);
  const { darkMode } = useDarkMode();
  const router = useRouter();

  const queryClient = useQueryClient();

  const onSelectImage = async () => {
    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      base64: true,
      quality: 0.5,
    };

    const result = await ImagePicker.launchImageLibraryAsync(options);

    if (!result.canceled) {
      const image = result.assets[0];

      const arraybuffer = await fetch(image.uri).then((res) => res.arrayBuffer());

      const fileExt = image.uri?.split('.').pop()?.toLowerCase() ?? 'jpeg';
      const path = `${Date.now()}.${fileExt}`;
      try {
        const { data, error: uploadError } = await supabase.storage
          .from('avatars/logo')
          .upload(path, arraybuffer, {
            contentType: image.mimeType ?? 'image/jpeg',
          });

        if (uploadError) {
          toast.error('Something went wrong', {
            description: uploadError.message,
          });
        }

        if (!uploadError) {
          setPath(data?.path);

          setAvatar(
            // @ts-ignore
            `https://mckkhgmxgjwjgxwssrfo.supabase.co/storage/v1/object/public/${data?.fullPath}`
          );
          setValues({
            ...values,
            // @ts-ignore
            image: `https://mckkhgmxgjwjgxwssrfo.supabase.co/storage/v1/object/public/${data.fullPath}`,
          });
        }
      } catch (error) {
        console.log(error);

        toast.error('Something went wrong', {
          description: 'Failed to upload image',
        });
      }
    }
  };

  const {
    values,
    handleChange,

    handleSubmit,
    isSubmitting,
    errors,
    touched,
    resetForm,
    setValues,
  } = useFormik({
    initialValues: {
      email: '',
      organizationName: '',
      category: '',
      startDay: 'Monday',
      endDay: 'Friday',
      description: '',
      location: '',
      websiteUrl: '',
      startTime: '',
      endTime: '',
      image: '',
      logoId: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      const { data, error } = await supabase
        .from('organization')
        .insert({
          name: values.organizationName,
          category: values.category,
          description: values.description,
          avatar: values.image,
          ownerId: id,
          email: values.email,
          location: values.location,
          start: values.startTime,
          end: values.endTime,
          website: values.websiteUrl,
          workDays: values.startDay + ' - ' + values.endDay,
          logoId: values.logoId,
        })
        .select()
        .single();

      if (!error) {
        const { error: err } = await supabase
          .from('user')
          .update({
            organizationId: data?.id,
          })
          .eq('userId', id!);
        if (!err) {
          queryClient.invalidateQueries({
            queryKey: ['organizations'],
          });
          queryClient.invalidateQueries({
            queryKey: ['organization'],
          });
          queryClient.invalidateQueries({
            queryKey: ['profile'],
          });
          resetForm();
          toast.success('Success', {
            description: 'Organization created successfully',
          });

          router.replace(`/(app)/(organization)/${id}`);
        }
      }

      if (error) {
        console.log(error);

        toast.error('Something went wrong', {
          description: "Couldn't create organization",
        });
      }
    },
  });

  const onChange = (event: any, selectedDate: any, type: string) => {
    const currentDate = selectedDate;
    if (type === 'startTime') {
      setShow(false);
      setStartTime(currentDate);
      setValues({ ...values, startTime: format(currentDate, 'HH:mm') });
    } else {
      setShow2(false);
      setEndTime(currentDate);
      setValues({ ...values, endTime: format(currentDate, 'HH:mm') });
    }
  };
  const showMode = () => {
    setShow(true);
  };
  const showMode2 = () => {
    setShow2(true);
  };
  console.log(path);
  // ! to fix later
  const handleDeleteImage = () => {
    setValues({ ...values, image: '' });
    setAvatar('https://placehold.co/100x100');
    onDeleteImage(`logo/${path}`);
    console.log('deleted');
  };
  const { email, category, location, organizationName, description, websiteUrl } = values;

  return (
    <Container>
      <ScrollView
        style={[{ flex: 1 }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 20, flexGrow: 1 }}>
        <AuthHeader />
        <View style={{ marginBottom: 20 }} />

        <AuthTitle>Create an organization</AuthTitle>
        <Subtitle>Enter your organization details</Subtitle>
        <View style={{ marginTop: 20, flex: 1 }}>
          <View style={{ flex: 0.6, gap: 10 }}>
            <Text
              style={{
                color: darkMode === 'dark' ? 'white' : 'black',
                fontFamily: 'PoppinsMedium',
              }}>
              Organization logo
            </Text>
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <View
                style={{
                  width: 100,
                  height: 100,
                  borderRadius: 50,
                }}>
                <Image
                  contentFit="cover"
                  style={{ width: 100, height: 100, borderRadius: 50 }}
                  source={{ uri: avatar }}
                />
                {!values.image && (
                  <TouchableOpacity
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 3,
                      backgroundColor: darkMode ? 'white' : 'black',
                      padding: 5,
                      borderRadius: 30,
                    }}
                    onPress={onSelectImage}>
                    <FontAwesome name="plus" size={20} color={darkMode ? 'black' : 'white'} />
                  </TouchableOpacity>
                )}
                {values.image && (
                  <TouchableOpacity
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 3,
                      backgroundColor: darkMode ? 'white' : 'black',
                      padding: 5,
                      borderRadius: 30,
                    }}
                    onPress={handleDeleteImage}>
                    <FontAwesome name="trash" size={20} color="red" />
                  </TouchableOpacity>
                )}
              </View>
              {errors.image && (
                <Text style={{ color: 'red', fontWeight: 'bold' }}>{errors.image}</Text>
              )}
            </View>

            <>
              <InputComponent
                label="Organization Name"
                value={organizationName}
                onChangeText={handleChange('organizationName')}
                placeholder="Organization Name"
                keyboardType="default"
              />
              {touched.organizationName && errors.organizationName && (
                <Text style={{ color: 'red', fontWeight: 'bold' }}>{errors.organizationName}</Text>
              )}
            </>
            <>
              <InputComponent
                label="Description"
                value={description}
                onChangeText={handleChange('description')}
                placeholder="Description"
                keyboardType="default"
                numberOfLines={5}
              />
              {touched.description && errors.description && (
                <Text style={{ color: 'red', fontWeight: 'bold' }}>{errors.description}</Text>
              )}
            </>
            <>
              <InputComponent
                label="Category"
                value={category}
                onChangeText={handleChange('category')}
                placeholder="Category"
                keyboardType="default"
              />
              {touched.category && errors.category && (
                <Text style={{ color: 'red', fontWeight: 'bold' }}>{errors.category}</Text>
              )}
            </>
            <>
              <InputComponent
                label="Location"
                value={location}
                onChangeText={handleChange('location')}
                placeholder="Location"
                keyboardType="default"
              />
              {touched.location && errors.location && (
                <Text style={{ color: 'red', fontWeight: 'bold' }}>{errors.location}</Text>
              )}
            </>
            <>
              <InputComponent
                autoCapitalize="none"
                label="Website Link"
                value={websiteUrl}
                onChangeText={handleChange('websiteUrl')}
                placeholder="Website link"
                keyboardType="default"
              />
              {touched.websiteUrl && errors.websiteUrl && (
                <Text style={{ color: 'red', fontWeight: 'bold' }}>{errors.websiteUrl}</Text>
              )}
            </>
            <>
              <InputComponent
                label="Email"
                value={email}
                onChangeText={handleChange('email')}
                placeholder="Email"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {touched.email && errors.email && (
                <Text style={{ color: 'red', fontFamily: 'PoppinsMedium' }}>{errors.email}</Text>
              )}
            </>
            <>
              <Text style={{ marginBottom: 5, fontFamily: 'PoppinsMedium' }}>Work Days</Text>

              <SelectList
                search={false}
                boxStyles={{
                  ...styles2.border,
                  justifyContent: 'flex-start',
                  width: '100%',
                }}
                inputStyles={{
                  textAlign: 'left',
                  fontSize: 14,
                  borderWidth: 0,
                  width: '100%',
                }}
                fontFamily="PoppinsMedium"
                setSelected={handleChange('startDay')}
                data={days}
                defaultOption={{ key: 'monday', value: 'Monday' }}
                save="key"
                placeholder="Select Start Day"
                dropdownTextStyles={{
                  color: darkMode === 'dark' ? 'white' : 'black',
                }}
              />

              <SelectList
                search={false}
                boxStyles={{
                  ...styles2.border,
                  justifyContent: 'flex-start',
                  backgroundColor: '#E9E9E9',
                  width: '100%',
                }}
                dropdownTextStyles={{
                  color: darkMode === 'dark' ? 'white' : 'black',
                }}
                inputStyles={{
                  textAlign: 'left',
                  fontSize: 14,
                  width: '100%',
                }}
                fontFamily="PoppinsMedium"
                setSelected={handleChange('endDay')}
                data={days}
                defaultOption={{ key: 'friday', value: 'Friday' }}
                save="key"
                placeholder="Select End day"
              />
            </>
            <>
              <Text style={{ marginBottom: 5, fontFamily: 'PoppinsMedium' }}>
                Opening And Closing Time
              </Text>
              <View style={{ gap: 10 }}>
                <>
                  <Pressable onPress={showMode} style={styles2.border}>
                    <Text> {`${format(startTime, 'HH:mm') || ' Opening Time'}`} </Text>
                  </Pressable>

                  {show && (
                    <>
                      <DateTimePicker
                        style={{ marginBottom: 20 }}
                        display="spinner"
                        testID="dateTimePicker"
                        value={startTime}
                        mode="time"
                        is24Hour
                        onChange={(event, selectedDate) =>
                          onChange(event, selectedDate, 'startTime')
                        }
                      />
                    </>
                  )}
                </>
                <>
                  <Pressable onPress={showMode2} style={styles2.border}>
                    <Text> {`${format(endTime, 'HH:mm') || ' Closing Time'}`} </Text>
                  </Pressable>

                  {show2 && (
                    <DateTimePicker
                      display="spinner"
                      testID="dateTimePicker"
                      value={endTime}
                      mode="time"
                      is24Hour
                      onChange={(event, selectedDate) => onChange(event, selectedDate, 'endTime')}
                    />
                  )}
                </>
              </View>
            </>
          </View>
          <View style={{ flex: 0.4, marginTop: 30 }}>
            <Button
              loading={isSubmitting}
              onPress={() => handleSubmit()}
              color={colors.buttonBlue}
              buttonStyle={{
                borderRadius: 10,
                height: 50,
              }}
              titleStyle={{ fontFamily: 'PoppinsMedium', color: colors.white }}
              title={isSubmitting ? 'Creating...' : 'Create'}
            />
          </View>
        </View>
      </ScrollView>
    </Container>
  );
};

export default CreateWorkSpace;

const styles2 = StyleSheet.create({
  border: {
    backgroundColor: '#E9E9E9',
    minHeight: 52,
    paddingLeft: 15,
    justifyContent: 'center',
    borderBottomWidth: 0,
    borderBottomColor: '#DADADA',
    width: '100%',
  },
});
