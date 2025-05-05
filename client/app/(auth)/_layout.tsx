import { Stack as ExpoStack } from 'expo-router/stack';

export default function AuthLayout() {
  return (
    <ExpoStack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
} 