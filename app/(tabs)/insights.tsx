import React, { useMemo } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { LabDashboard } from '@/components/LabDashboard';
import { InsightRecommendationsCard } from '@/components/InsightRecommendationsCard';

const InsightsScreenComponent = React.memo(() => {
  const memoizedInsightCard = useMemo(() => (
    <InsightRecommendationsCard showAddButton={true} maxHeight={500} />
  ), []);

  const memoizedLabDashboard = useMemo(() => (
    <LabDashboard />
  ), []);

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      removeClippedSubviews={true}
    >
      {memoizedInsightCard}
      {memoizedLabDashboard}
    </ScrollView>
  );
});

InsightsScreenComponent.displayName = 'InsightsScreen';

export default InsightsScreenComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 16,
  },
});
