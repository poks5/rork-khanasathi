import { Tabs } from "expo-router";
import { Home, Book, User, Calendar, Lightbulb } from "lucide-react-native";
import React, { useCallback, useMemo } from "react";
import { colors } from "@/constants/colors";
import { useLanguage } from "@/providers/LanguageProvider";

export default function TabLayout() {
  const { t } = useLanguage();

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
          title: t('tabs.home'),
          tabBarIcon: renderHomeIcon,
        }}
      />
      <Tabs.Screen
        name="foods"
        options={{
          title: t('tabs.foods'),
          tabBarIcon: renderFoodsIcon,
        }}
      />
      <Tabs.Screen
        name="log"
        options={{
          title: t('tabs.log'),
          tabBarIcon: renderLogIcon,
        }}
      />
      <Tabs.Screen
        name="insights"
        options={{
          title: t('insights.headerTitle'),
          tabBarIcon: renderInsightsIcon,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabs.profile'),
          tabBarIcon: renderProfileIcon,
        }}
      />
    </Tabs>
  );
}