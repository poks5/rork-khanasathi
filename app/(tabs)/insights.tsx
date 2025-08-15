import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { LabDashboard } from '@/components/LabDashboard';
import { InsightRecommendationsCard } from '@/components/InsightRecommendationsCard';

export default function InsightsScreen() {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <InsightRecommendationsCard showAddButton={true} maxHeight={500} />
      <LabDashboard />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    padding: 16,
  },
});
