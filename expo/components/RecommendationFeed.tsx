import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNutrition } from '@/providers/NutritionProvider';
import { RecommendationCard } from '@/components/RecommendationCard';
import { colors } from '@/constants/colors';
import { useLanguage } from '@/providers/LanguageProvider';

const RecommendationFeedComponent = React.memo(() => {
  const { recommendations, isLoading } = useNutrition();
  const { t } = useLanguage();

  const sorted = useMemo(() => {
    const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
    return [...recommendations].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }, [recommendations]);

  const renderRecommendationCard = useCallback((rec: any) => (
    <RecommendationCard key={rec.id} recommendation={rec} />
  ), []);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <Text style={styles.loading}>{t('recommendationFeed.loading')}</Text>
      </View>
    );
  }

  if (sorted.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>{t('recommendationFeed.empty')}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} testID="recommendation-feed">
      {sorted.map(renderRecommendationCard)}
    </ScrollView>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  loading: { color: colors.textSecondary, fontSize: 14 },
  empty: { color: colors.textSecondary, fontSize: 14, textAlign: 'center' },
});

RecommendationFeedComponent.displayName = 'RecommendationFeed';

export default RecommendationFeedComponent;
