import { Tabs } from "expo-router";
import { Home, Book, User, Calendar, Lightbulb } from "lucide-react-native";
import React, { useCallback, useMemo } from "react";
import { colors } from "@/constants/colors";
import { useLanguage } from "@/providers/LanguageProvider";

function TabLayout() {
  const { t, language } = useLanguage();

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

  const titles = useMemo(() => ({
    home: t('tabs.home'),
    foods: t('tabs.foods'),
    log: t('tabs.log'),
    insights: t('insights.headerTitle'),
    profile: t('tabs.profile'),
  }), [language]);

  const renderHomeIcon = useCallback(({ color }: { color: string }) => <Home size={24} color={color} />, []);
  const renderFoodsIcon = useCallback(({ color }: { color: string }) => <Book size={24} color={color} />, []);
  const renderLogIcon = useCallback(({ color }: { color: string }) => <Calendar size={24} color={color} />, []);
  const renderInsightsIcon = useCallback(({ color }: { color: string }) => <Lightbulb size={24} color={color} />, []);
  const renderProfileIcon = useCallback(({ color }: { color: string }) => <User size={24} color={color} />, []);

  const homeOptions = useMemo(() => ({
    title: titles.home,
    tabBarIcon: renderHomeIcon,
  }), [titles.home, renderHomeIcon]);

  const foodsOptions = useMemo(() => ({
    title: titles.foods,
    tabBarIcon: renderFoodsIcon,
  }), [titles.foods, renderFoodsIcon]);

  const logOptions = useMemo(() => ({
    title: titles.log,
    tabBarIcon: renderLogIcon,
  }), [titles.log, renderLogIcon]);

  const insightsOptions = useMemo(() => ({
    title: titles.insights,
    tabBarIcon: renderInsightsIcon,
  }), [titles.insights, renderInsightsIcon]);

  const profileOptions = useMemo(() => ({
    title: titles.profile,
    tabBarIcon: renderProfileIcon,
  }), [titles.profile, renderProfileIcon]);

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

export default React.memo(TabLayout);