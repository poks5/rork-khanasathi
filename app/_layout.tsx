import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { LanguageProvider } from "@/providers/LanguageProvider";
import { NutritionProvider } from "@/providers/NutritionProvider";
import { UserProfileProvider } from "@/providers/UserProfileProvider";
import { BloodReportProvider } from "@/providers/BloodReportProvider";
import { InsightsProvider } from "@/providers/InsightsProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { generateMetaTags } from "@/constants/seo";
import { initializeWebPerformance, trackWebVitals } from "@/constants/performance";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen 
        name="food-details" 
        options={{ 
          presentation: "modal",
          headerShown: false 
        }} 
      />
      <Stack.Screen 
        name="add-food" 
        options={{ 
          presentation: "modal",
          headerShown: false 
        }} 
      />
      <Stack.Screen 
        name="admin" 
        options={{ 
          presentation: "modal",
          headerShown: false 
        }} 
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
    
    // Initialize SEO and performance optimizations for web
    if (Platform.OS === 'web') {
      generateMetaTags();
      initializeWebPerformance();
      trackWebVitals();
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <LanguageProvider>
          <UserProfileProvider>
            <NutritionProvider>
              <BloodReportProvider>
                <InsightsProvider>
                  <ErrorBoundary>
                    <RootLayoutNav />
                  </ErrorBoundary>
                </InsightsProvider>
              </BloodReportProvider>
            </NutritionProvider>
          </UserProfileProvider>
        </LanguageProvider>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}