import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { useLanguage } from "@/providers/LanguageProvider";
import { useNutrition } from "@/providers/NutritionProvider";
import { useUserProfile } from "@/providers/UserProfileProvider";
import { colors } from "@/constants/colors";
import { NutrientProgressCard } from "@/components/NutrientProgressCard";
import { QuickAddCard } from "@/components/QuickAddCard";
import { DailyTipCard } from "@/components/DailyTipCard";
import { Plus, Globe } from "lucide-react-native";
import { router } from "expo-router";

export default function HomeScreen() {
  const { t, language, toggleLanguage } = useLanguage();
  const { todayIntake, dailyLimits } = useNutrition();
  const { profile } = useUserProfile();

  const nutrients = [
    {
      key: 'potassium',
      name: t('nutrients.potassium'),
      unit: 'mg',
      current: todayIntake.potassium,
      limit: dailyLimits.potassium,
      color: colors.nutrients.potassium,
    },
    {
      key: 'phosphorus',
      name: t('nutrients.phosphorus'),
      unit: 'mg',
      current: todayIntake.phosphorus,
      limit: dailyLimits.phosphorus,
      color: colors.nutrients.phosphorus,
    },
    {
      key: 'sodium',
      name: t('nutrients.sodium'),
      unit: 'mg',
      current: todayIntake.sodium,
      limit: dailyLimits.sodium,
      color: colors.nutrients.sodium,
    },
    {
      key: 'protein',
      name: t('nutrients.protein'),
      unit: 'g',
      current: todayIntake.protein,
      limit: dailyLimits.protein,
      color: colors.nutrients.protein,
    },
    {
      key: 'calories',
      name: t('nutrients.calories'),
      unit: 'kcal',
      current: todayIntake.calories,
      limit: dailyLimits.calories,
      color: colors.nutrients.calories,
    },
    {
      key: 'fluid',
      name: t('nutrients.fluid'),
      unit: 'ml',
      current: todayIntake.fluid,
      limit: dailyLimits.fluid,
      color: colors.nutrients.fluid,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            {t('home.greeting')}, {profile.name || t('home.defaultName')}
          </Text>
          <Text style={styles.subtitle}>{t('home.subtitle')}</Text>
        </View>
        <TouchableOpacity onPress={toggleLanguage} style={styles.langButton}>
          <Globe size={20} color={colors.primary} />
          <Text style={styles.langText}>{language === 'en' ? 'NE' : 'EN'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('home.todayProgress')}</Text>
          <View style={styles.nutrientGrid}>
            {nutrients.map((nutrient) => (
              <NutrientProgressCard
                key={nutrient.key}
                nutrient={nutrient}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('home.quickAdd')}</Text>
          <QuickAddCard />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('home.dailyTip')}</Text>
          <DailyTipCard />
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/add-food' as any)}
        testID="add-food-fab"
      >
        <Plus size={28} color={colors.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  langButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    padding: 8,
    borderRadius: 20,
    backgroundColor: colors.background,
  },
  langText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.primary,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 15,
  },
  nutrientGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});