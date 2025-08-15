import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useLanguage } from '@/providers/LanguageProvider';
import { colors } from '@/constants/colors';
import { quickMeals } from '@/data/quickMeals';

export function QuickAddCard() {
  const { t, language } = useLanguage();

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {quickMeals.map(meal => (
        <TouchableOpacity
          key={meal.id}
          style={styles.mealCard}
          onPress={() => router.push({
            pathname: '/(tabs)/add-food' as any,
            params: { foodId: meal.foodIds[0] }
          })}
        >
          <Text style={styles.emoji}>{meal.emoji}</Text>
          <Text style={styles.mealName}>
            {language === 'en' ? meal.nameEn : meal.nameNe}
          </Text>
          <Text style={styles.mealTime}>{meal.time}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  mealCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    width: 100,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  emoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  mealName: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  mealTime: {
    fontSize: 10,
    color: colors.textSecondary,
  },
});