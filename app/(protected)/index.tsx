import React from 'react';
import { View, Text, Button } from 'react-native';
import { useAuth } from '@clerk/clerk-expo';
import { router } from 'expo-router';

export default function Home() {
  const { signOut } = useAuth();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Welcome</Text>
      <Button title="Sign out" onPress={() => signOut().then(() => router.replace('/(auth)/sign-in'))} />
    </View>
  );
}
