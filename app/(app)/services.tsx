import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';

import { HStack } from '~/components/HStack';
import { HeaderNav } from '~/components/HeaderNav';
import { ServicePoints } from '~/components/ServicePoints';
import { Container } from '~/components/Ui/Container';
import { DottedButton } from '~/components/Ui/DottedButton';
import { ErrorComponent } from '~/components/Ui/ErrorComponent';
import { LoadingComponent } from '~/components/Ui/LoadingComponent';
import { useServicePoints } from '~/lib/queries';

const Services = () => {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data, isError, isPending, refetch } = useServicePoints(+id);
  const onCreateServicePoint = () => {
    router.push('/create-service');
  };
  if (isError) {
    return <ErrorComponent refetch={refetch} />;
  }

  if (isPending) {
    return <LoadingComponent />;
  }
  return (
    <Container>
      <HeaderNav title="Service point" />
      <HStack justifyContent="center">
        <DottedButton text="Add a Service Point" isIcon onPress={onCreateServicePoint} />
      </HStack>
      <ServicePoints data={data} />
    </Container>
  );
};

export default Services;
