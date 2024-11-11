import { useQuery } from 'convex/react';
import { useLocalSearchParams } from 'expo-router';

import { CompleteDialog } from '~/components/Dialogs/SavedDialog';
import { ProfileUpdateForm } from '~/components/Forms/ProfileUpdateForm';
import { HeaderNav } from '~/components/HeaderNav';
import { Container } from '~/components/Ui/Container';
import { LoadingComponent } from '~/components/Ui/LoadingComponent';
import { User } from '~/constants/types';
import { api } from '~/convex/_generated/api';
import { Id } from '~/convex/_generated/dataModel';

const Edit = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const data = useQuery(api.users.getUserById, { id: id as Id<'users'> });

  if (!data) {
    return <LoadingComponent />;
  }

  return (
    <>
      <CompleteDialog text="Changes saved successfully" />

      <Container>
        <HeaderNav title="Edit Profile" />
        <ProfileUpdateForm person={data as unknown as User} />
      </Container>
    </>
  );
};

export default Edit;
