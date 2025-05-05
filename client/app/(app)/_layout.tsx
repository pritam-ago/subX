import { Stack as ExpoStack } from 'expo-router/stack';

export default function AppLayout() {
  return (
    <ExpoStack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
} 