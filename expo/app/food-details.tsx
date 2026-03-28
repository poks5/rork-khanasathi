import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { X, AlertCircle, Check } from "lucide-react-native";
import { useLanguage } from "@/providers/LanguageProvider";
import { colors } from "@/constants/colors";
import { foodDatabase } from "@/data/foodDatabase";
import { getSafetyLevel } from "@/utils/safetyUtils";

export default function FoodDetailsScreen() {
  const { t, language } = useLanguage();
  const { foodId } = useLocalSearchParams();
  
  const food = foodDatabase.find(f => f.id === foodId);
  
  if (!food) {
    return (
      <SafeAreaView style={styles.container}>
        <Text>Food not found</Text>
      </SafeAreaView>
    );
  }

  const safetyLevel = getSafetyLevel(food.nutrients);
  const safetyColor = 
    safetyLevel === 'safe' ? colors.success :
    safetyLevel === 'caution' ? colors.warning :
    colors.danger;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('foodDetails.title')}</Text>
        <TouchableOpacity onPress={() => router.dismiss()} style={styles.closeButton}>
          <X size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: food.image }} style={styles.foodImage} />
          <View style={[styles.safetyBadge, { backgroundColor: safetyColor }]}>
            <Text style={styles.safetyText}>
              {t(`safety.${safetyLevel}`)}
            </Text>
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.foodName}>
            {language === 'en' ? food.nameEn : food.nameNe}
          </Text>
          <Text style={styles.category}>
            {t(`foods.categories.${food.category}`)}
          </Text>
          <Text style={styles.portion}>
            {t('foodDetails.standardPortion')}: {food.defaultPortion} {language === 'en' ? food.unitEn : food.unitNe}
          </Text>
        </View>

        <View style={styles.nutrientsSection}>
          <Text style={styles.sectionTitle}>{t('foodDetails.nutritionInfo')}</Text>
          
          <View style={styles.nutrientGrid}>
            <NutrientItem
              label={t('nutrients.calories')}
              value={`${food.nutrients.calories} kcal`}
              color={colors.nutrients.calories}
            />
            <NutrientItem
              label={t('nutrients.protein')}
              value={`${food.nutrients.protein} g`}
              color={colors.nutrients.protein}
            />
            <NutrientItem
              label={t('nutrients.potassium')}
              value={`${food.nutrients.potassium} mg`}
              color={colors.nutrients.potassium}
              warning={food.nutrients.potassium > 200}
            />
            <NutrientItem
              label={t('nutrients.phosphorus')}
              value={`${food.nutrients.phosphorus} mg`}
              color={colors.nutrients.phosphorus}
              warning={food.nutrients.phosphorus > 150}
            />
            <NutrientItem
              label={t('nutrients.sodium')}
              value={`${food.nutrients.sodium} mg`}
              color={colors.nutrients.sodium}
              warning={food.nutrients.sodium > 300}
            />
            <NutrientItem
              label={t('nutrients.fluid')}
              value={`${food.nutrients.fluid} ml`}
              color={colors.nutrients.fluid}
            />
          </View>
        </View>

        {food.preparationTips && (
          <View style={styles.tipsSection}>
            <Text style={styles.sectionTitle}>{t('foodDetails.preparationTips')}</Text>
            {food.preparationTips.map((tip, index) => (
              <View key={index} style={styles.tipItem}>
                <Check size={16} color={colors.success} />
                <Text style={styles.tipText}>
                  {language === 'en' ? tip.en : tip.ne}
                </Text>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            router.push({
              pathname: 'add-food' as any,
              params: { foodId: food.id }
            });
          }}
        >
          <Text style={styles.addButtonText}>{t('foodDetails.addToLog')}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

function NutrientItem({ label, value, color, warning }: {
  label: string;
  value: string;
  color: string;
  warning?: boolean;
}) {
  return (
    <View style={styles.nutrientItem}>
      <View style={styles.nutrientHeader}>
        <View style={[styles.nutrientDot, { backgroundColor: color }]} />
        <Text style={styles.nutrientLabel}>{label}</Text>
        {warning && <AlertCircle size={14} color={colors.warning} />}
      </View>
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
  imageContainer: {
    position: 'relative',
    backgroundColor: colors.white,
    padding: 20,
    alignItems: 'center',
  },
  foodImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
  safetyBadge: {
    position: 'absolute',
    top: 30,
    right: 30,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  safetyText: {
    color: colors.white,
    fontWeight: '600' as const,
    fontSize: 12,
  },
  infoSection: {
    backgroundColor: colors.white,
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  foodName: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: colors.text,
    marginBottom: 5,
  },
  category: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 10,
  },
  portion: {
    fontSize: 16,
    color: colors.text,
  },
  nutrientsSection: {
    backgroundColor: colors.white,
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 15,
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
    gap: 10,
  },
  nutrientItem: {
    width: '48%',
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
  },
  nutrientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  nutrientDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  nutrientLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
  },
  nutrientValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    marginLeft: 14,
  },
  tipsSection: {
    backgroundColor: colors.white,
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
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