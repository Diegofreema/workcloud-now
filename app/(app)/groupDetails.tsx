import { AuthHeader } from '~/components/AuthHeader';
import { GroupDetail } from '~/components/GroupDetail';
import { Container } from '~/components/Ui/Container';

const GroupDetails = () => {
  return (
    <Container>
      <AuthHeader path="Group Details" />
      <GroupDetail />
    </Container>
  );
};

export default GroupDetails;
