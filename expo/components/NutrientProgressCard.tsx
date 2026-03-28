import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';

interface NutrientProgressCardProps {
  nutrient: {
    key: string;
    name: string;
    unit: string;
    current: number;
    limit: number;
    color: string;
  };
}

const NutrientProgressCardComponent = ({ nutrient }: NutrientProgressCardProps) => {
  // Memoize calculations to prevent recalculation on every render
  const { percentage, indicatorColor, currentText, limitText } = useMemo(() => {
    const pct = Math.min((nutrient.current / nutrient.limit) * 100, 100);
    const warning = pct > 80;
    const danger = pct > 100;
    const indicator = danger ? colors.danger : warning ? colors.warning : colors.success;
    const current = `${nutrient.current.toFixed(0)} ${nutrient.unit}`;
    const limit = `/ ${nutrient.limit} ${nutrient.unit}`;
    
    return {
      percentage: pct,
      indicatorColor: indicator,
      currentText: current,
      limitText: limit
    };
  }, [nutrient]);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.name}>{nutrient.name}</Text>
        <View style={[styles.indicator, { backgroundColor: indicatorColor }]} />
      </View>
      
      <View style={styles.progressContainer}>
        <View style={styles.progressBg}>
          <View 
            style={[styles.progressFill, { 
              width: `${percentage}%`,
              backgroundColor: nutrient.color 
            }]} 
          />
        </View>
      </View>
      
      <View style={styles.values}>
        <Text style={styles.current}>{currentText}</Text>
        <Text style={styles.limit}>{limitText}</Text>
      </View>
    </View>
  );
};

NutrientProgressCardComponent.displayName = 'NutrientProgressCard';

export const NutrientProgressCard = React.memo(NutrientProgressCardComponent);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    width: '48%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.text,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressBg: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  values: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  current: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
  },
  limit: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 2,
  },
});