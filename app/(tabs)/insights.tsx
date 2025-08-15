import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import RecommendationFeed from '@/components/RecommendationFeed';
import { colors } from '@/constants/colors';

export default function InsightsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Insights</Text>
        <Text style={styles.subtitle}>Personalized nutrition guidance based on your profile and intake.</Text>
      </View>
      <RecommendationFeed />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.white, paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  title: { fontSize: 24, fontWeight: 'bold' as const, color: colors.text },
  subtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
});
