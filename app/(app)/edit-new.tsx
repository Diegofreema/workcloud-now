import { useAuth } from '@clerk/clerk-expo';

import { CompleteDialog } from '../../components/Dialogs/SavedDialog';
import { ProfileUpdateForm } from '../../components/Forms/ProfileUpdateForm';
import { HeaderNav } from '../../components/HeaderNav';
import { Container } from '../../components/Ui/Container';

import { ErrorComponent } from '~/components/Ui/ErrorComponent';
import { LoadingComponent } from '~/components/Ui/LoadingComponent';
import { useProfile } from '~/lib/queries';

const Edit = () => {
  const { userId } = useAuth();
  const { data, isError, isPending, isPaused, refetch } = useProfile(userId);

  if (isError || isPaused) {
    return <ErrorComponent refetch={refetch} />;
  }
  if (isPending) {
    return <LoadingComponent />;
  }

  const { profile } = data;
  return (
    <>
      <CompleteDialog text="Changes saved successfully" />

      <Container>
        <HeaderNav title="Edit Profile" />
        <ProfileUpdateForm person={profile} />
      </Container>
    </>
  );
};

export default Edit;
