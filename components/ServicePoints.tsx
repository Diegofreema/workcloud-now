import { FlatList } from 'react-native';

import { EmptyText } from './EmptyText';
import { HStack } from './HStack';
import { MyText } from './Ui/MyText';

import { ServicePointType } from '~/constants/types';

type Props = {
  data: ServicePointType[];
};

export const ServicePoints = ({ data }: Props) => {
  return (
    <FlatList
      style={{ marginTop: 20 }}
      data={data}
      showsHorizontalScrollIndicator={false}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => <ServicePointItem item={item} />}
      ListEmptyComponent={() => <EmptyText text="No service points" />}
    />
  );
};

const ServicePointItem = ({ item }: { item: ServicePointType }) => {
  return (
    <HStack>
      <MyText poppins="Bold" fontSize={15}>
        {item.name}
      </MyText>
    </HStack>
  );
};
