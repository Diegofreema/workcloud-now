import { FontAwesome } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useQueryClient } from '@tanstack/react-query';
import { format, parse } from 'date-fns';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useFormik } from 'formik';
import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SelectList } from 'react-native-dropdown-select-list';
import { toast } from 'sonner-native';
import * as yup from 'yup';

import { AuthHeader } from '../../../../components/AuthHeader';
import { InputComponent } from '../../../../components/InputComponent';
import { days } from '../../../../constants';
import { colors } from '../../../../constants/Colors';
import { useDarkMode } from '../../../../hooks/useDarkMode';

import { Container } from '~/components/Ui/Container';
import { ErrorComponent } from '~/components/Ui/ErrorComponent';
import { LoadingComponent } from '~/components/Ui/LoadingComponent';
import { MyButton } from '~/components/Ui/MyButton';
import { onDeleteImage } from '~/lib/helper';
import { supabase } from '~/lib/supabase';

const validationSchema = yup.object().shape({
  organizationName: yup.string().required('Name of organization is required'),
  category: yup.string().required('Category is required'),
  location: yup.string().required('Location is required'),
  description: yup.string().required('Description is required'),
  startDay: yup.string().required('Working days are required'),
  endDay: yup.string().required('Working days are required'),
  startTime: yup.string().required('Working time is required'),
  endTime: yup.string().required('Working time is required'),
  websiteUrl: yup.string().required('Website link is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  image: yup.string().required('Logo is required'),
});

const Edit = () => {
  const [start, setStartTime] = useState(new Date(1598051730000));
  const [end, setEndTime] = useState(new Date(1598051730000));
  const [error, setError] = useState(false);
  // const [organization, setOrganization] = useState();

  const [isLoading, setIsLoading] = useState(true);
  const { editId } = useLocalSearchParams<{ editId: string; id: string }>();
  const [path, setPath] = useState('');
  const [show, setShow] = useState(false);
  const [show2, setShow2] = useState(false);
  const [orgId, setOrgId] = useState('');
  const { darkMode } = useDarkMode();
  const router = useRouter();

  const queryClient = useQueryClient();

  const onSelectImage = async () => {
    const options: ImagePicker.ImagePickerOptions = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      base64: true,
    };

    const result = await ImagePicker.launchImageLibraryAsync(options);

    // Save image if not cancelled
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
          throw uploadError.message;
        }

        if (!uploadError) {
          setPath(data?.path);

          setValues({
            ...values,
            // @ts-ignore
            image: `https://mckkhgmxgjwjgxwssrfo.supabase.co/storage/v1/object/public/${data.fullPath}`,
          });
        }
      } catch (error) {
        console.log(error);

        toast.error('Failed to upload image');
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
      startDay: '',
      endDay: '',
      description: '',
      location: '',
      websiteUrl: '',
      startTime: '',
      endTime: '',
      image: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      // @ts-ignore
      const { error } = await supabase
        .from('organization')
        .update({
          name: values.organizationName,
          category: values.category,
          description: values.description,
          avatar: image,
          email: values.email,
          location: values.location,
          start: values.startTime,
          end: values.endTime,
          website: values.websiteUrl,
          workDays: values.startDay + ' - ' + values.endDay,
        })
        .eq('id', orgId);

      if (!error) {
        resetForm();
        toast.success('Success', {
          description: 'Organization updated successfully',
        });
        queryClient.invalidateQueries({
          queryKey: ['organizations', 'organization'],
        });

        // @ts-ignore
        router.replace(`/(organization)/${editId}`);
      }

      if (error) {
        console.log(error);

        toast.error('Something went wrong', {
          description: 'Please try again',
        });
      }
    },
  });
  const getOrgs = async () => {
    setError(false);
    try {
      const { data, error } = await supabase
        .from('organization')
        .select('*')
        .eq('id', editId)
        .single();
      if (!error && data) {
        setValues({
          ...values,
          email: data?.email!,
          category: data?.category!,
          location: data?.location!,
          organizationName: data?.name!,
          description: data?.description!,
          websiteUrl: data?.website!,
          startTime: data?.workDays!.split('-')[0],
          endTime: data?.workDays!.split('-')[1],
          image: data?.avatar!,
        });

        const start = parse(data?.start!, 'HH:mm', new Date());
        const end = parse(data?.end!, 'HH:mm', new Date());
        console.log(start, end);

        setStartTime(start);
        setEndTime(end);

        setOrgId(data?.id.toString());
      }

      if (error) {
        setError(true);
      }
    } catch (error) {
      console.log(error);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    getOrgs();
  }, []);

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
  // ! to fix later
  const handleDeleteImage = () => {
    setValues({ ...values, image: '' });

    onDeleteImage(`logo/${path}`);
    console.log('deleted');
  };
  const {
    email,
    category,

    location,
    organizationName,

    description,
    websiteUrl,

    image,
  } = values;

  if (error) {
    return <ErrorComponent refetch={getOrgs} />;
  }
  if (isLoading) {
    return <LoadingComponent />;
  }

  return (
    <Container>
      <ScrollView
        style={[{ flex: 1 }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}>
        <AuthHeader path="Edit Organization" />

        <View style={{ marginTop: 20, flex: 1 }}>
          <View style={{ flex: 0.6, gap: 10 }}>
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
                  source={image}
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
              />
              {touched.email && errors.email && (
                <Text style={{ color: 'red', fontWeight: 'bold' }}>{errors.email}</Text>
              )}
            </>
          </View>

          <>
            <Text style={{ marginBottom: 5, fontFamily: 'PoppinsMedium' }}>Work Days</Text>
            <View
              style={{
                flexDirection: 'column',
                gap: 10,
                width: '100%',
                marginBottom: 15,
              }}>
              <>
                <SelectList
                  search={false}
                  boxStyles={{
                    ...styles2.border,
                    width: '100%',
                    justifyContent: 'flex-start',
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
                  placeholder="Select your state"
                />
              </>
              <>
                <SelectList
                  search={false}
                  boxStyles={{
                    ...styles2.border,
                    justifyContent: 'flex-start',
                    backgroundColor: '#E9E9E9',
                    width: '100%',
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
                  placeholder="Select your state"
                />
              </>
            </View>
          </>
          <>
            <Text style={{ marginBottom: 5, fontFamily: 'PoppinsMedium' }}>
              Opening And Closing Time
            </Text>
            <View style={{ flexDirection: 'column', gap: 10 }}>
              <>
                <Pressable onPress={showMode} style={styles2.border}>
                  <Text> {`${format(start, 'HH:mm') || ' Opening Time'}`} </Text>
                </Pressable>

                {show && (
                  <DateTimePicker
                    display="spinner"
                    testID="dateTimePicker"
                    value={start}
                    mode="time"
                    is24Hour
                    onChange={(event, selectedDate) => onChange(event, selectedDate, 'startTime')}
                  />
                )}
              </>
              <>
                <Pressable onPress={showMode2} style={styles2.border}>
                  <Text>{`${format(end, 'HH:mm') || ' Closing Time'}`} </Text>
                </Pressable>

                {show2 && (
                  <DateTimePicker
                    display="spinner"
                    testID="dateTimePicker"
                    value={end}
                    mode="time"
                    is24Hour
                    onChange={(event, selectedDate) => onChange(event, selectedDate, 'endTime')}
                  />
                )}
              </>
            </View>
          </>
          <View style={{ flex: 0.4, marginTop: 30 }}>
            <MyButton
              loading={isSubmitting}
              onPress={() => handleSubmit()}
              buttonColor={colors.buttonBlue}
              textColor={colors.white}
              labelStyle={{ fontFamily: 'PoppinsMedium', fontSize: 12 }}
              contentStyle={{ height: 50, borderRadius: 20 }}>
              {isSubmitting ? 'Updating...' : 'Update'}
            </MyButton>
          </View>
        </View>
      </ScrollView>
    </Container>
  );
};

export default Edit;

const styles2 = StyleSheet.create({
  border: {
    backgroundColor: '#E9E9E9',
    minHeight: 52,
    paddingLeft: 15,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#DADADA',
    width: '100%',
  },
});
