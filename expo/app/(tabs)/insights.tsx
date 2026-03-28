import React, { useMemo, useCallback } from 'react';
import { ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { LabDashboard } from '@/components/LabDashboard';
import { InsightRecommendationsCard } from '@/components/InsightRecommendationsCard';
import { useInsights } from '@/providers/InsightsProvider';

const InsightsScreenComponent = React.memo(() => {
  const { isLoading, addPredefinedInsights } = useInsights();

  const handleRefresh = useCallback(() => {
    console.log('🔄 Refreshing insights...');
    addPredefinedInsights();
  }, [addPredefinedInsights]);

  const memoizedInsightCard = useMemo(() => (
    <InsightRecommendationsCard showAddButton={true} maxHeight={600} />
  ), []);

  const memoizedLabDashboard = useMemo(() => (
    <LabDashboard />
  ), []);

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      removeClippedSubviews={true}
      refreshControl={
        <RefreshControl
          refreshing={isLoading}
          onRefresh={handleRefresh}
          tintColor={"#007AFF"}
        />
      }
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
