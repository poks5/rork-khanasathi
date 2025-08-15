import { Tabs } from "expo-router";
import { Home, Book, User, Calendar, Lightbulb } from "lucide-react-native";
import React, { useCallback, useMemo } from "react";
import { colors } from "@/constants/colors";

export default function TabLayout() {
  const screenOptions = useMemo(() => ({
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: colors.gray,
    headerShown: false,
    tabBarStyle: {
      backgroundColor: colors.white,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingBottom: 5,
      paddingTop: 5,
      height: 60,
    },
  }), []);

  const renderHomeIcon = useCallback(({ color }: { color: string }) => <Home size={24} color={color} />, []);
  const renderFoodsIcon = useCallback(({ color }: { color: string }) => <Book size={24} color={color} />, []);
  const renderLogIcon = useCallback(({ color }: { color: string }) => <Calendar size={24} color={color} />, []);
  const renderInsightsIcon = useCallback(({ color }: { color: string }) => <Lightbulb size={24} color={color} />, []);
  const renderProfileIcon = useCallback(({ color }: { color: string }) => <User size={24} color={color} />, []);

  return (
    <Tabs screenOptions={screenOptions}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: renderHomeIcon,
        }}
      />
      <Tabs.Screen
        name="foods"
        options={{
          title: 'Foods',
          tabBarIcon: renderFoodsIcon,
        }}
      />
      <Tabs.Screen
        name="log"
        options={{
          title: 'Log',
          tabBarIcon: renderLogIcon,
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: 'Insights',
          tabBarIcon: renderInsightsIcon,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: renderProfileIcon,
        }}
      />
    </Tabs>
  );
}