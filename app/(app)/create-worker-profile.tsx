import { useUser } from '@clerk/clerk-expo';
import { Text } from '@rneui/themed';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useFormik } from 'formik';
import React, { useEffect } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { SelectList } from 'react-native-dropdown-select-list';
import { toast } from 'sonner-native';
import * as yup from 'yup';

import { AuthHeader } from '../../components/AuthHeader';
import { AuthTitle } from '../../components/AuthTitle';
import { InputComponent } from '../../components/InputComponent';
import { fontFamily } from '../../constants';
import { colors } from '../../constants/Colors';
import { useDarkMode } from '../../hooks/useDarkMode';

import { Container } from '~/components/Ui/Container';
import { MyButton } from '~/components/Ui/MyButton';
import { MyText } from '~/components/Ui/MyText';
import { supabase } from '~/lib/supabase';

const validationSchema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),

  gender: yup.string().required('Gender is required'),
  location: yup.string().required('Location is required'),
  experience: yup.string().required('Experience is required').max(100, 'Maximum 100 characters'),
  skills: yup.string().required('Skills are required').min(1, 'Minimum of 1 skill is required'),
  qualifications: yup.string().required('Qualifications are required'),
});

const max = 150;
const genders = [
  {
    key: 'Male',
    value: 'Male',
  },
  {
    key: 'Female',
    value: 'Female',
  },
];
const CreateProfile = () => {
  const { darkMode } = useDarkMode();
  const { user } = useUser();

  const queryClient = useQueryClient();
  const router = useRouter();

  const {
    values,
    handleChange,

    handleSubmit,
    isSubmitting,
    errors,
    touched,
    setValues,
    resetForm,
  } = useFormik({
    initialValues: {
      email: user?.emailAddresses[0].emailAddress,
      location: '',
      gender: '',
      skills: '',
      experience: '',
      userId: user?.id,
      qualifications: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      const {
        experience,

        location,
        skills,
        userId,

        gender,

        qualifications,
      } = values;

      try {
        const { data, error } = await supabase
          .from('worker')
          .insert({
            userId,
            skills,
            experience,
            location,
            gender,
            qualifications,
          })
          .select()
          .single();
        if (!error) {
          const { error: err } = await supabase
            .from('user')
            .update({
              workerId: data.id,
            })
            .eq('userId', user?.id!);
          if (!err) {
            toast.success('Welcome  onboard', {
              description: `${user?.firstName} your work profile was created`,
            });
            queryClient.invalidateQueries({ queryKey: ['profile'] });

            router.replace(`/myWorkerProfile/${user?.id}`);
            resetForm();
          }
          if (err) {
            Alert.alert('Error', 'Failed to create profile');

            toast.error('Error, failed to create profile', {
              description: 'Please try again',
            });
          }
        }

        if (error) {
          console.log(error);

          toast.error('Error, failed to create profile', {
            description: 'Please try again',
          });
        }
      } catch (error: any) {
        toast.error(error?.response?.data.error, {
          description: 'Please try again',
        });
        console.log(error, 'Error');
      }
    },
  });
  const { location, experience, skills, qualifications } = values;
  useEffect(() => {
    if (experience.length > 150) {
      setValues({ ...values, experience: experience.substring(0, 150) });
    }
  }, [experience]);

  return (
    <Container>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 50 }}>
        <AuthHeader />
        <View style={{ marginBottom: 10 }} />
        <AuthTitle>Set up your profile to work on workcloud</AuthTitle>
        <MyText poppins="Light" fontSize={15} style={{ marginTop: 20, color: colors.textGray }}>
          Enter your details below
        </MyText>
        <View style={{ marginTop: 20, flex: 1 }}>
          <View style={{ flex: 0.6, gap: 10 }}>
            <>
              <InputComponent
                label="Experience"
                value={experience}
                onChangeText={handleChange('experience')}
                placeholder="Write about your past work experience..."
                keyboardType="default"
                numberOfLines={5}
                multiline
              />
              <MyText poppins="Medium" fontSize={15}>
                {experience.length}/{max}
              </MyText>
              {touched.experience && errors.experience && (
                <MyText poppins="Bold" style={{ color: 'red' }}>
                  {errors.experience}
                </MyText>
              )}
            </>
            <>
              <InputComponent
                label="Qualifications"
                value={qualifications}
                onChangeText={handleChange('qualifications')}
                placeholder="Bsc. Computer Science, Msc. Computer Science"
                keyboardType="default"
                numberOfLines={5}
                multiline
              />

              {touched.qualifications && errors.qualifications && (
                <Text style={{ color: 'red', fontWeight: 'bold' }}>{errors.qualifications}</Text>
              )}
            </>
            <>
              <InputComponent
                label="Skills"
                value={skills}
                onChangeText={handleChange('skills')}
                placeholder="e.g Customer service, marketing, sales"
                keyboardType="default"
                numberOfLines={5}
                multiline
              />
              {touched.skills && errors.skills && (
                <Text style={{ color: 'red', fontWeight: 'bold' }}>{errors.skills}</Text>
              )}
            </>
            <>
              <InputComponent
                label="Location"
                value={location}
                onChangeText={handleChange('location')}
                placeholder="Where do you reside?"
                keyboardType="default"
                numberOfLines={5}
                multiline
              />
              {touched.location && errors.location && (
                <Text style={{ color: 'red', fontWeight: 'bold' }}>{errors.location}</Text>
              )}
            </>
            <View style={{ marginHorizontal: 10 }}>
              <Text
                style={{
                  color: darkMode === 'dark' ? colors.white : colors.black,
                  fontWeight: 'bold',
                  fontSize: 15,
                  marginBottom: 10,
                }}>
                Gender
              </Text>

              <SelectList
                search={false}
                boxStyles={{
                  ...styles2.border,
                  justifyContent: 'flex-start',
                  borderWidth: 0,
                  height: 60,
                }}
                dropdownTextStyles={{
                  color: darkMode === 'dark' ? colors.white : colors.black,
                }}
                inputStyles={{
                  textAlign: 'left',
                  borderWidth: 0,
                  color: 'gray',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
                fontFamily="PoppinsMedium"
                setSelected={handleChange('gender')}
                data={genders}
                save="value"
                placeholder="Select your a gender"
              />

              {touched.gender && errors.gender && (
                <Text style={{ color: 'red', fontWeight: 'bold' }}>{errors.gender}</Text>
              )}
            </View>
          </View>
          <View style={{ flex: 0.4, marginTop: 30, marginHorizontal: 10 }}>
            <MyButton
              loading={isSubmitting}
              onPress={() => handleSubmit()}
              color={colors.buttonBlue}
              style={{ borderRadius: 5 }}
              textColor="white"
              contentStyle={{ borderRadius: 2 }}
              buttonStyle={{ height: 60 }}
              labelStyle={{ fontFamily: fontFamily.Medium, fontSize: 14 }}>
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </MyButton>
          </View>
        </View>
      </ScrollView>
    </Container>
  );
};

export default CreateProfile;

const styles2 = StyleSheet.create({
  border: {
    backgroundColor: '#E9E9E9',
    paddingLeft: 15,
    justifyContent: 'center',
    borderRadius: 5,
    alignItems: 'center',
  },
});
