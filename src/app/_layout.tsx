import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/context/AuthContext';
import { Colors } from '@/constants/Colors';

export default function RootLayout() {
  const scheme = useColorScheme() ?? 'dark';
  const theme = Colors[scheme];

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: theme.background },
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="property/create"
            options={{
              headerShown: true,
              headerTitle: 'Publicar Inmueble',
              headerBackTitle: 'Atrás',
              headerTintColor: theme.primary,
              headerStyle: { backgroundColor: theme.background },
            }}
          />
          <Stack.Screen
            name="(auth)/login"
            options={{ presentation: 'modal', headerShown: false }}
          />
          <Stack.Screen
            name="(auth)/signup"
            options={{ presentation: 'modal', headerShown: false }}
          />
          <Stack.Screen
            name="property/[id]"
            options={{
              headerShown: true,
              headerTitle: '',
              headerBackTitle: 'Volver',
              headerTintColor: theme.primary,
              headerStyle: { backgroundColor: theme.background },
            }}
          />
        </Stack>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
