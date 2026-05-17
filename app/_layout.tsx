import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack>
        <Stack.Screen name="index" options={{ title: '功能列表' }} />
        <Stack.Screen name="detail/[id]" options={{ title: '详情' }} />
      </Stack>
    </>
  );
}
