import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as Notifications from "expo-notifications";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AlertModal } from "@/components/AlertModal";
import { RemindersProvider, useReminders } from "@/context/RemindersContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function NotificationListener() {
  const { reminders, setActiveAlert } = useReminders();

  useEffect(() => {
    const received = Notifications.addNotificationReceivedListener(notification => {
      const reminderId = notification.request.content.data?.reminderId as string | undefined;
      if (reminderId) {
        const reminder = reminders.find(r => r.id === reminderId);
        if (reminder) setActiveAlert(reminder);
      }
    });

    const response = Notifications.addNotificationResponseReceivedListener(res => {
      const reminderId = res.notification.request.content.data?.reminderId as string | undefined;
      if (reminderId) {
        const reminder = reminders.find(r => r.id === reminderId);
        if (reminder) setActiveAlert(reminder);
      }
    });

    return () => {
      received.remove();
      response.remove();
    };
  }, [reminders, setActiveAlert]);

  return null;
}

function RootLayoutNav() {
  return (
    <>
      <NotificationListener />
      <AlertModal />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="add-reminder"
          options={{
            presentation: "modal",
            headerShown: false,
            animation: "slide_from_bottom",
          }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <RemindersProvider>
      <SafeAreaProvider>
        <ErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <KeyboardProvider>
                <RootLayoutNav />
              </KeyboardProvider>
            </GestureHandlerRootView>
          </QueryClientProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </RemindersProvider>
  );
}
