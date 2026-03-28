import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, Suspense } from "react";
import { Platform, View, Text, ActivityIndicator } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { LanguageProvider } from "@/providers/LanguageProvider";
import { NutritionProvider } from "@/providers/NutritionProvider";
import { UserProfileProvider } from "@/providers/UserProfileProvider";
import { BloodReportProvider } from "@/providers/BloodReportProvider";
import { InsightsProvider } from "@/providers/InsightsProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { generateMetaTags } from "@/constants/seo";
import { initializeWebPerformance, trackWebVitals } from "@/constants/performance";
import { colors } from "@/constants/colors";

SplashScreen.preventAutoHideAsync();

// Optimize QueryClient for performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Loading fallback component
const LoadingFallback = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
    <ActivityIndicator size="large" color={colors.primary} />
    <Text style={{ marginTop: 16, color: colors.text }}>Loading...</Text>
  </View>
);

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
          title: "Admin Panel"
        }} 
      />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    // Hide splash screen immediately for faster startup
    SplashScreen.hideAsync();
    
    // Initialize SEO and performance optimizations for web (non-blocking, delayed)
    if (Platform.OS === 'web') {
      setTimeout(() => {
        try {
          generateMetaTags();
          initializeWebPerformance();
          trackWebVitals();
        } catch (error) {
          console.warn('Web optimization failed:', error);
        }
      }, 2000); // Delay to not block initial render
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Suspense fallback={<LoadingFallback />}>
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
        </Suspense>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}