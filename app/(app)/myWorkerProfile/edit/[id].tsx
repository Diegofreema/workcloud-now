import { useUser } from '@clerk/clerk-expo';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useFormik } from 'formik';
import React, { useEffect } from 'react';
import { View, ScrollView, StyleSheet, Text } from 'react-native';
import { SelectList } from 'react-native-dropdown-select-list';
import { toast } from 'sonner-native';
import * as yup from 'yup';

import { AuthHeader } from '~/components/AuthHeader';
import { AuthTitle } from '~/components/AuthTitle';
import { InputComponent } from '~/components/InputComponent';
import { Container } from '~/components/Ui/Container';
import { ErrorComponent } from '~/components/Ui/ErrorComponent';
import { LoadingComponent } from '~/components/Ui/LoadingComponent';
import { MyButton } from '~/components/Ui/MyButton';
import { MyText } from '~/components/Ui/MyText';
import { colors } from '~/constants/Colors';
import { useDarkMode } from '~/hooks/useDarkMode';
import { useGetWorkerProfile } from '~/lib/queries';
import { supabase } from '~/lib/supabase';

const validationSchema = yup.object().shape({
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
    value: 'male',
  },
  {
    key: 'Female',
    value: 'female',
  },
];
const CreateProfile = () => {
  const { darkMode } = useDarkMode();

  const { user } = useUser();
  const { data, isPaused, isPending, isError, refetch, isRefetchError } = useGetWorkerProfile(
    user?.id
  );
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
  } = useFormik({
    initialValues: {
      location: '',
      gender: '',
      skills: '',
      experience: '',
      qualifications: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      const { experience, location, skills, gender, qualifications } = values;

      try {
        const { error } = await supabase
          .from('worker')
          .update({
            experience,
            location,
            skills,
            gender,
            qualifications,
          })
          .eq('userId', user?.id!);
        toast.success(`${user?.firstName} your work profile has been updated`);
        queryClient.invalidateQueries({ queryKey: ['worker'] });
        if (error) {
          console.log(error);

          toast.error('Something went wrong');
        }
        console.log(data, 'Data');

        router.back();
      } catch (error: any) {
        toast.error(error?.response?.data.error);
        console.log(error, 'Error');
      }
    },
  });
  const { gender, location, experience, skills, qualifications } = values;
  useEffect(() => {
    if (experience.length > 150) {
      setValues({ ...values, experience: experience.substring(0, 150) });
    }
  }, [experience]);

  useEffect(() => {
    if (data?.worker) {
      const { worker } = data;
      setValues({
        experience: worker?.experience as string,
        gender: worker?.gender as string,
        location: worker?.location as string,
        qualifications: worker?.qualifications as string,
        skills: worker?.skills as string,
      });
    }
  }, [data]);

  if (isError || isRefetchError || isPaused) {
    return <ErrorComponent refetch={refetch} />;
  }

  if (isPending) {
    return <LoadingComponent />;
  }
  return (
    <Container>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 50 }}>
        <AuthHeader />
        <View style={{ marginBottom: 10 }} />
        <AuthTitle>Edit your worker's profile</AuthTitle>
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
                textAlignVertical="top"
                multiline
                autoCapitalize="sentences"
              />
              <MyText poppins="Medium" fontSize={15}>
                {experience.length}/{max}
              </MyText>
              {touched.experience && errors.experience && (
                <Text style={{ color: 'red', fontWeight: 'bold' }}>{errors.experience}</Text>
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
                autoCapitalize="sentences"
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
                autoCapitalize="sentences"
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
                autoCapitalize="sentences"
              />
              {touched.location && errors.location && (
                <Text style={{ color: 'red', fontWeight: 'bold' }}>{errors.location}</Text>
              )}
            </>
            <>
              <Text
                style={{
                  color: darkMode ? colors.white : colors.black,
                  fontWeight: 'bold',
                }}>
                Gender
              </Text>

              <SelectList
                search={false}
                boxStyles={{
                  ...styles2.border,
                  justifyContent: 'flex-start',
                  borderWidth: 0,
                  height: 50,
                }}
                inputStyles={{ textAlign: 'left', borderWidth: 0 }}
                fontFamily="PoppinsMedium"
                setSelected={handleChange('gender')}
                data={genders}
                defaultOption={{
                  key: gender,
                  value: gender,
                }}
                save="value"
                placeholder="Select your a gender"
              />

              {touched.gender && errors.gender && (
                <Text style={{ color: 'red', fontWeight: 'bold' }}>{errors.gender}</Text>
              )}
            </>
          </View>
          <View style={{ flex: 0.4, marginTop: 30 }}>
            <MyButton
              loading={isSubmitting}
              onPress={() => handleSubmit()}
              buttonColor={colors.buttonBlue}
              textColor="white"
              contentStyle={{ height: 50 }}>
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
    minHeight: 52,
    paddingLeft: 15,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#DADADA',
  },
});
