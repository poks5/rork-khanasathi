import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Image,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { X, Plus, Minus } from "lucide-react-native";
import { useLanguage } from "@/providers/LanguageProvider";
import { useNutrition } from "@/providers/NutritionProvider";
import { colors } from "@/constants/colors";
import { foodDatabase } from "@/data/foodDatabase";
import { MealType } from "@/types/food";

export default function AddFoodScreen() {
  const { t, language } = useLanguage();
  const { addToLog } = useNutrition();
  const { foodId } = useLocalSearchParams();
  
  const [selectedFoodId, setSelectedFoodId] = useState(foodId as string || '');
  const [quantity, setQuantity] = useState(1);
  const [mealType, setMealType] = useState<MealType>('breakfast');
  const [searchQuery, setSearchQuery] = useState('');

  const food = foodDatabase.find(f => f.id === selectedFoodId);

  const filteredFoods = foodDatabase.filter(f => {
    const search = searchQuery.toLowerCase();
    return f.nameEn.toLowerCase().includes(search) || 
           f.nameNe.toLowerCase().includes(search);
  }).slice(0, 5);

  const handleAdd = () => {
    if (!food) return;

    addToLog({
      foodId: food.id,
      foodName: language === 'en' ? food.nameEn : food.nameNe,
      quantity,
      unit: language === 'en' ? food.unitEn : food.unitNe,
      mealType,
      nutrients: {
        calories: food.nutrients.calories * quantity,
        protein: food.nutrients.protein * quantity,
        potassium: food.nutrients.potassium * quantity,
        phosphorus: food.nutrients.phosphorus * quantity,
        sodium: food.nutrients.sodium * quantity,
        fluid: food.nutrients.fluid * quantity,
      },
    });

    router.back();
  };

  const mealTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snacks'];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('addFood.title')}</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <X size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {!selectedFoodId ? (
          <View style={styles.searchSection}>
            <Text style={styles.sectionTitle}>{t('addFood.selectFood')}</Text>
            <TextInput
              style={styles.searchInput}
              placeholder={t('foods.searchPlaceholder')}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={colors.textSecondary}
            />
            
            {filteredFoods.map(f => (
              <TouchableOpacity
                key={f.id}
                style={styles.foodOption}
                onPress={() => setSelectedFoodId(f.id)}
              >
                <Image source={{ uri: f.image }} style={styles.foodThumb} />
                <View style={styles.foodInfo}>
                  <Text style={styles.foodName}>
                    {language === 'en' ? f.nameEn : f.nameNe}
                  </Text>
                  <Text style={styles.foodPortion}>
                    {f.defaultPortion} {language === 'en' ? f.unitEn : f.unitNe}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <>
            <View style={styles.selectedFood}>
              <Image source={{ uri: food?.image }} style={styles.selectedImage} />
              <Text style={styles.selectedName}>
                {food && (language === 'en' ? food.nameEn : food.nameNe)}
              </Text>
              <TouchableOpacity
                style={styles.changeButton}
                onPress={() => setSelectedFoodId('')}
              >
                <Text style={styles.changeButtonText}>{t('addFood.changeFood')}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.quantitySection}>
              <Text style={styles.sectionTitle}>{t('addFood.quantity')}</Text>
              <View style={styles.quantityControl}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => setQuantity(Math.max(0.5, quantity - 0.5))}
                >
                  <Minus size={20} color={colors.primary} />
                </TouchableOpacity>
                <View style={styles.quantityDisplay}>
                  <Text style={styles.quantityValue}>{quantity}</Text>
                  <Text style={styles.quantityUnit}>
                    {food && (language === 'en' ? food.unitEn : food.unitNe)}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => setQuantity(quantity + 0.5)}
                >
                  <Plus size={20} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.mealSection}>
              <Text style={styles.sectionTitle}>{t('addFood.mealType')}</Text>
              <View style={styles.mealGrid}>
                {mealTypes.map(type => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.mealOption,
                      mealType === type && styles.mealOptionActive
                    ]}
                    onPress={() => setMealType(type)}
                  >
                    <Text style={[
                      styles.mealText,
                      mealType === type && styles.mealTextActive
                    ]}>
                      {t(`log.meals.${type}`)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {food && (
              <View style={styles.nutritionPreview}>
                <Text style={styles.sectionTitle}>{t('addFood.nutritionPreview')}</Text>
                <View style={styles.nutrientGrid}>
                  <NutrientPreview
                    label={t('nutrients.calories')}
                    value={`${(food.nutrients.calories * quantity).toFixed(0)} kcal`}
                  />
                  <NutrientPreview
                    label={t('nutrients.protein')}
                    value={`${(food.nutrients.protein * quantity).toFixed(1)} g`}
                  />
                  <NutrientPreview
                    label={t('nutrients.potassium')}
                    value={`${(food.nutrients.potassium * quantity).toFixed(0)} mg`}
                  />
                  <NutrientPreview
                    label={t('nutrients.phosphorus')}
                    value={`${(food.nutrients.phosphorus * quantity).toFixed(0)} mg`}
                  />
                </View>
              </View>
            )}

            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAdd}
              disabled={!food}
            >
              <Text style={styles.addButtonText}>{t('addFood.addToLog')}</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function NutrientPreview({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.nutrientItem}>
      <Text style={styles.nutrientLabel}>{label}</Text>
      <Text style={styles.nutrientValue}>{value}</Text>
    </View>
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
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  searchSection: {
    backgroundColor: colors.white,
    margin: 10,
    padding: 15,
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 10,
  },
  searchInput: {
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
    marginBottom: 10,
  },
  foodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  foodThumb: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginRight: 12,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.text,
  },
  foodPortion: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  selectedFood: {
    backgroundColor: colors.white,
    margin: 10,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  selectedImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginBottom: 10,
  },
  selectedName: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 10,
  },
  changeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.background,
    borderRadius: 20,
  },
  changeButtonText: {
    color: colors.primary,
    fontSize: 14,
  },
  quantitySection: {
    backgroundColor: colors.white,
    marginHorizontal: 10,
    marginBottom: 10,
    padding: 15,
    borderRadius: 10,
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityDisplay: {
    alignItems: 'center',
  },
  quantityValue: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: colors.text,
  },
  quantityUnit: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  mealSection: {
    backgroundColor: colors.white,
    marginHorizontal: 10,
    marginBottom: 10,
    padding: 15,
    borderRadius: 10,
  },
  mealGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  mealOption: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 10,
    backgroundColor: colors.background,
    borderRadius: 8,
    alignItems: 'center',
  },
  mealOptionActive: {
    backgroundColor: colors.primary,
  },
  mealText: {
    fontSize: 14,
    color: colors.text,
  },
  mealTextActive: {
    color: colors.white,
    fontWeight: '600' as const,
  },
  nutritionPreview: {
    backgroundColor: colors.white,
    marginHorizontal: 10,
    marginBottom: 10,
    padding: 15,
    borderRadius: 10,
  },
  nutrientGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  nutrientItem: {
    width: '48%',
    backgroundColor: colors.background,
    padding: 10,
    borderRadius: 8,
  },
  nutrientLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  nutrientValue: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text,
  },
  addButton: {
    margin: 20,
    backgroundColor: colors.primary,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600' as const,
  },
});