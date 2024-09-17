import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList } from 'react-native';
import { toast } from 'sonner-native';

import { CustomModal } from './Dialogs/CustomModal';
import { EditServicePointModal } from './Dialogs/EditServicePointModal';
import { EmptyText } from './EmptyText';
import { HStack } from './HStack';
import { ServicePointAction } from './ServicePointAction';
import { MyText } from './Ui/MyText';
import VStack from './Ui/VStack';

import { ServicePointType } from '~/constants/types';
import { supabase } from '~/lib/supabase';

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
      ListEmptyComponent={() => <EmptyText text="No service point yet" />}
    />
  );
};

const ServicePointItem = ({ item }: { item: ServicePointType }) => {
  const [visible, setVisible] = useState(false);
  const queryClient = useQueryClient();
  const [deleting, setDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const onOpen = () => setVisible(true);
  const onClose = () => setVisible(false);

  const onShowDeleteModal = () => {
    onClose();
    setShowDeleteModal(true);
  };
  const handleDelete = async () => {
    setDeleting(true);
    try {
      const { error } = await supabase.from('servicePoint').delete().eq('id', item.id);
      if (error) {
        toast.error('Error deleting service point');
      } else {
        toast.success('Service point deleted successfully');
        queryClient.invalidateQueries({ queryKey: ['service_points'] });
      }
    } catch (error) {
      console.log(error);

      toast.error('Error deleting service point');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };
  const handleEdit = () => {
    onClose();
    setShowEditModal(true);
  };
  const handleChangeStaff = () => {
    router.push(`/create-service?editId=${item.id}`);
  };
  return (
    <>
      <EditServicePointModal
        onClose={() => setShowEditModal(false)}
        isOpen={showEditModal}
        prevValues={{ description: item.description, name: item.name! }}
        id={item.id}
      />
      <CustomModal
        onPress={handleDelete}
        title="Are you sure you want to delete this service point?"
        isLoading={deleting}
        onClose={() => setShowDeleteModal(false)}
        isOpen={showDeleteModal}
        btnText="Delete"
      />
      <HStack justifyContent="space-between">
        <VStack>
          <MyText poppins="Bold" fontSize={15}>
            {item.name}
          </MyText>
          <MyText poppins="Medium" fontSize={14}>
            {item.description}
          </MyText>
        </VStack>
        <ServicePointAction
          visible={visible}
          onClose={onClose}
          onOpen={onOpen}
          handleDelete={onShowDeleteModal}
          handleEdit={handleEdit}
          handleChangeStaff={handleChangeStaff}
        />
      </HStack>
    </>
  );
};
