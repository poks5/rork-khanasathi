import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Calendar, ChevronLeft, ChevronRight, Trash2 } from "lucide-react-native";
import { useLanguage } from "@/providers/LanguageProvider";
import { useNutrition } from "@/providers/NutritionProvider";
import { colors } from "@/constants/colors";
import { FoodLogItem } from "@/components/FoodLogItem";

export default function LogScreen() {
  const { t } = useLanguage();
  const { foodLog, removeFromLog } = useNutrition();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
  };

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const todayLog = foodLog.filter(item => {
    const itemDate = new Date(item.timestamp);
    return itemDate.toDateString() === selectedDate.toDateString();
  });

  const mealGroups = {
    breakfast: todayLog.filter(item => item.mealType === 'breakfast'),
    lunch: todayLog.filter(item => item.mealType === 'lunch'),
    dinner: todayLog.filter(item => item.mealType === 'dinner'),
    snacks: todayLog.filter(item => item.mealType === 'snacks'),
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('log.title')}</Text>
        <View style={styles.dateSelector}>
          <TouchableOpacity onPress={() => changeDate(-1)} style={styles.dateButton}>
            <ChevronLeft size={20} color={colors.primary} />
          </TouchableOpacity>
          <View style={styles.dateDisplay}>
            <Calendar size={16} color={colors.textSecondary} />
            <Text style={styles.dateText}>{formatDate(selectedDate)}</Text>
          </View>
          <TouchableOpacity onPress={() => changeDate(1)} style={styles.dateButton}>
            <ChevronRight size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {Object.entries(mealGroups).map(([mealType, items]) => (
          <View key={mealType} style={styles.mealSection}>
            <Text style={styles.mealTitle}>
              {t(`log.meals.${mealType}`)} ({items.length})
            </Text>
            {items.length === 0 ? (
              <Text style={styles.emptyText}>{t('log.noItems')}</Text>
            ) : (
              items.map(item => (
                <FoodLogItem
                  key={item.id}
                  item={item}
                  onDelete={() => removeFromLog(item.id)}
                />
              ))
            )}
          </View>
        ))}

        {todayLog.length > 0 && (
          <View style={styles.summarySection}>
            <Text style={styles.summaryTitle}>{t('log.dailySummary')}</Text>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>{t('nutrients.calories')}</Text>
                <Text style={styles.summaryValue}>
                  {todayLog.reduce((sum, item) => sum + item.nutrients.calories, 0).toFixed(0)} kcal
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>{t('nutrients.protein')}</Text>
                <Text style={styles.summaryValue}>
                  {todayLog.reduce((sum, item) => sum + item.nutrients.protein, 0).toFixed(1)} g
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>{t('nutrients.potassium')}</Text>
                <Text style={styles.summaryValue}>
                  {todayLog.reduce((sum, item) => sum + item.nutrients.potassium, 0).toFixed(0)} mg
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>{t('nutrients.phosphorus')}</Text>
                <Text style={styles.summaryValue}>
                  {todayLog.reduce((sum, item) => sum + item.nutrients.phosphorus, 0).toFixed(0)} mg
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: colors.text,
    marginBottom: 15,
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateButton: {
    padding: 8,
  },
  dateDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 16,
    color: colors.text,
  },
  mealSection: {
    backgroundColor: colors.white,
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  mealTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontStyle: 'italic',
    paddingVertical: 10,
  },
  summarySection: {
    backgroundColor: colors.white,
    marginTop: 10,
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 15,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  summaryItem: {
    width: '47%',
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
  },
  summaryLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
  },
});