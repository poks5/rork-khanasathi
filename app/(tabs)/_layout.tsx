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

  const homeOptions = useMemo(() => ({
    title: t('tabs.home'),
    tabBarIcon: renderHomeIcon,
  }), [t, renderHomeIcon]);

  const foodsOptions = useMemo(() => ({
    title: t('tabs.foods'),
    tabBarIcon: renderFoodsIcon,
  }), [t, renderFoodsIcon]);

  const logOptions = useMemo(() => ({
    title: t('tabs.log'),
    tabBarIcon: renderLogIcon,
  }), [t, renderLogIcon]);

  const insightsOptions = useMemo(() => ({
    title: t('insights.headerTitle'),
    tabBarIcon: renderInsightsIcon,
  }), [t, renderInsightsIcon]);

  const profileOptions = useMemo(() => ({
    title: t('tabs.profile'),
    tabBarIcon: renderProfileIcon,
  }), [t, renderProfileIcon]);

  return (
    <Tabs screenOptions={screenOptions}>
      <Tabs.Screen name="index" options={homeOptions} />
      <Tabs.Screen name="foods" options={foodsOptions} />
      <Tabs.Screen name="log" options={logOptions} />
      <Tabs.Screen name="insights" options={insightsOptions} />
      <Tabs.Screen name="profile" options={profileOptions} />
    </Tabs>
  );
}