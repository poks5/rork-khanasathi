import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Lightbulb } from 'lucide-react-native';
import { useLanguage } from '@/providers/LanguageProvider';
import { colors } from '@/constants/colors';
import { dailyTips } from '@/data/dailyTips';

export function DailyTipCard() {
  const { language } = useLanguage();
  
  const tip = useMemo(() => {
    const today = new Date().getDay();
    return dailyTips[today % dailyTips.length];
  }, []);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Lightbulb size={20} color={colors.warning} />
        <Text style={styles.title}>
          {language === 'en' ? tip.titleEn : tip.titleNe}
        </Text>
      </View>
      <Text style={styles.content}>
        {language === 'en' ? tip.contentEn : tip.contentNe}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.warningLight,
    borderRadius: 12,
    padding: 15,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    flex: 1,
  },
  content: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
  },
});