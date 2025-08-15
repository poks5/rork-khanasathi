import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { FoodLogEntry } from '@/types/food';

interface FoodLogItemProps {
  item: FoodLogEntry;
  onDelete: () => void;
}

export function FoodLogItem({ item, onDelete }: FoodLogItemProps) {
  const time = new Date(item.timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <View style={styles.container}>
      <View style={styles.info}>
        <Text style={styles.name}>{item.foodName}</Text>
        <Text style={styles.details}>
          {item.quantity} {item.unit} • {time}
        </Text>
        <View style={styles.nutrients}>
          <Text style={styles.nutrient}>
            {item.nutrients.calories.toFixed(0)} kcal
          </Text>
          <Text style={styles.nutrient}>
            K: {item.nutrients.potassium.toFixed(0)} mg
          </Text>
          <Text style={styles.nutrient}>
            P: {item.nutrients.phosphorus.toFixed(0)} mg
          </Text>
        </View>
      </View>
      <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
        <Trash2 size={18} color={colors.danger} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 4,
  },
  details: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  nutrients: {
    flexDirection: 'row',
    gap: 12,
  },
  nutrient: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  deleteButton: {
    justifyContent: 'center',
    paddingLeft: 12,
  },
});