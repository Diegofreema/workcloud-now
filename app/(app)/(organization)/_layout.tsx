import { Stack } from 'expo-router';

const OrganizationLayout = () => {
  return (
    <Stack>
      <Stack.Screen name="organizations" options={{ headerShown: false }} />
      <Stack.Screen name="[organizationId]" options={{ headerShown: false }} />
      <Stack.Screen name="edit/[editId]" options={{ headerShown: false }} />
      <Stack.Screen name="posts/[id]" options={{ headerShown: false }} />
    </Stack>
  );
};

export default OrganizationLayout;
