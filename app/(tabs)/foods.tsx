import React, { useState, useMemo } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
} from "react-native";
import { Search } from "lucide-react-native";
import { useLanguage } from "@/providers/LanguageProvider";
import { colors } from "@/constants/colors";
import { foodDatabase } from "@/data/foodDatabase";
import { FoodCategory } from "@/types/food";
import { router } from "expo-router";
import { getSafetyLevel } from "@/utils/safetyUtils";

export default function FoodsScreen() {
  const { t, language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory | 'all'>('all');

  const categories: Array<{ key: FoodCategory | 'all'; label: string }> = [
    { key: 'all', label: t('foods.categories.all') },
    { key: 'grains', label: t('foods.categories.grains') },
    { key: 'vegetables', label: t('foods.categories.vegetables') },
    { key: 'fruits', label: t('foods.categories.fruits') },
    { key: 'proteins', label: t('foods.categories.proteins') },
    { key: 'dairy', label: t('foods.categories.dairy') },
    { key: 'beverages', label: t('foods.categories.beverages') },
    { key: 'snacks', label: t('foods.categories.snacks') },
    { key: 'traditional', label: t('foods.categories.traditional') },
  ];

  const filteredFoods = useMemo(() => {
    return foodDatabase.filter(food => {
      const matchesCategory = selectedCategory === 'all' || food.category === selectedCategory;
      const searchTerm = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
        food.nameEn.toLowerCase().includes(searchTerm) ||
        food.nameNe.toLowerCase().includes(searchTerm);
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <View style={styles.container} testID="foods-screen">
      <View style={styles.header}>
        <Text style={styles.title}>{t('foods.title')}</Text>
        <View style={styles.searchContainer}>
          <Search size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('foods.searchPlaceholder')}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.textSecondary}
            testID="foods-search-input"
          />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={styles.categoryContainer}
        keyboardShouldPersistTaps="handled"
      >
        {categories.map(category => (
          <TouchableOpacity
            key={category.key}
            style={[
              styles.categoryChip,
              selectedCategory === category.key && styles.categoryChipActive
            ]}
            onPress={() => setSelectedCategory(category.key)}
            testID={`category-chip-${String(category.key)}`}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === category.key && styles.categoryTextActive
            ]}>
              {category.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.foodScrollView}
        contentContainerStyle={styles.foodScrollViewContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.foodGrid}>
          {filteredFoods.map(food => {
            const safetyLevel = getSafetyLevel(food.nutrients);
            const safetyColor =
              safetyLevel === 'safe' ? colors.success :
              safetyLevel === 'caution' ? colors.warning :
              colors.danger;

            return (
              <TouchableOpacity
                key={food.id}
                style={styles.foodCard}
                onPress={() => router.push({
                  pathname: 'food-details' as any,
                  params: { foodId: food.id }
                })}
                testID={`food-card-${food.id}`}
              >
                <View style={[styles.safetyIndicator, { backgroundColor: safetyColor }]} />
                <Image
                  source={{ uri: food.image }}
                  style={styles.foodImage}
                />
                <Text style={styles.foodName}>
                  {language === 'en' ? food.nameEn : food.nameNe}
                </Text>
                <Text style={styles.foodPortion}>
                  {food.defaultPortion} {language === 'en' ? food.unitEn : food.unitNe}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.white,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold' as const,
    color: colors.text,
    marginBottom: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: colors.text,
  },
  categoryScroll: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  categoryContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: colors.background,
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
  },
  categoryText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500' as const,
  },
  categoryTextActive: {
    color: colors.white,
  },
  foodScrollView: {
    flex: 1,
  },
  foodScrollViewContent: {
    paddingBottom: 96,
    flexGrow: 1,
  },
  foodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    paddingTop: 8,
  },
  foodCard: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 10,
    margin: '1%',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  safetyIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 12,
    height: 12,
    borderRadius: 6,
    zIndex: 1,
  },
  foodImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginBottom: 6,
  },
  foodName: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 2,
    lineHeight: 16,
  },
  foodPortion: {
    fontSize: 11,
    color: colors.textSecondary,
  },
});