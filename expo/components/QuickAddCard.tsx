import React from 'react';
import { Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useLanguage } from '@/providers/LanguageProvider';
import { useNutrition } from '@/providers/NutritionProvider';
import { colors } from '@/constants/colors';
import { quickMeals } from '@/data/quickMeals';
import { foodDatabase } from '@/data/foodDatabase';
import { MealType } from '@/types/food';

export function QuickAddCard() {
  const { language } = useLanguage();
  const { addToLog } = useNutrition();

  const handleQuickAdd = (meal: typeof quickMeals[0]) => {
    console.log('Quick add clicked for meal:', meal.nameEn);
    
    // If meal has multiple foods, add them all
    if (meal.foodIds.length > 1) {
      meal.foodIds.forEach(foodId => {
        const food = foodDatabase.find(f => f.id === foodId);
        if (food) {
          console.log('Adding food to log:', food.nameEn);
          
          // Determine meal type based on time
          let mealType: MealType = 'breakfast';
          if (meal.time === 'Lunch') mealType = 'lunch';
          else if (meal.time === 'Dinner') mealType = 'dinner';
          else if (meal.time === 'Evening') mealType = 'snacks';
          
          addToLog({
            foodId: food.id,
            foodName: language === 'en' ? food.nameEn : food.nameNe,
            quantity: food.defaultPortion,
            unit: language === 'en' ? food.unitEn : food.unitNe,
            mealType,
            nutrients: {
              calories: food.nutrients.calories * food.defaultPortion,
              protein: food.nutrients.protein * food.defaultPortion,
              carbohydrates: food.nutrients.carbohydrates * food.defaultPortion,
              fat: food.nutrients.fat * food.defaultPortion,
              fiber: food.nutrients.fiber * food.defaultPortion,
              potassium: food.nutrients.potassium * food.defaultPortion,
              phosphorus: food.nutrients.phosphorus * food.defaultPortion,
              sodium: food.nutrients.sodium * food.defaultPortion,
              calcium: food.nutrients.calcium * food.defaultPortion,
              fluid: food.nutrients.fluid * food.defaultPortion,
              iron: food.nutrients.iron * food.defaultPortion,
              zinc: food.nutrients.zinc * food.defaultPortion,
            },
          });
        } else {
          console.error('Food not found:', foodId);
        }
      });
    } else {
      // Single food - navigate to add-food page for customization
      router.push({
        pathname: '/add-food' as any,
        params: { foodId: meal.foodIds[0] }
      });
    }
  };

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
          onPress={() => handleQuickAdd(meal)}
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