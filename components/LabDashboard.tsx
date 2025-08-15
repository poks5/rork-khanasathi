import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { colors } from '@/constants/colors';
import { useBloodReports } from '@/providers/BloodReportProvider';
import { BloodReportForm } from './BloodReportForm';
import { Plus, AlertTriangle, TrendingUp, Activity, FileText } from 'lucide-react-native';

export const LabDashboard: React.FC = () => {
  const { reports, latestReport, criticalAlerts, recommendationsByPriority, isLoading } = useBloodReports();
  const [showForm, setShowForm] = useState(false);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading lab reports...</Text>
      </View>
    );
  }

  const renderCriticalAlert = (alert: any, index: number) => (
    <View key={index} style={styles.criticalAlertCard}>
      <View style={styles.alertHeader}>
        <AlertTriangle size={20} color={colors.white} />
        <Text style={styles.alertTitle}>{alert.parameter.toUpperCase()}</Text>
        <Text style={styles.alertValue}>{alert.value}</Text>
      </View>
      <Text style={styles.alertExplanation}>{alert.explanation}</Text>
      <Text style={styles.alertAction}>Action: {alert.clinicalSignificance}</Text>
    </View>
  );

  const renderRecommendation = (rec: any, index: number) => (
    <View key={index} style={styles.recommendationCard}>
      <View style={styles.recHeader}>
        <View style={[
          styles.priorityBadge,
          { backgroundColor: rec.priority === 'critical' ? colors.error : rec.priority === 'high' ? colors.warning : colors.primary }
        ]}>
          <Text style={styles.priorityText}>{rec.priority.toUpperCase()}</Text>
        </View>
        <Text style={styles.recTitle}>{rec.title}</Text>
      </View>
      <Text style={styles.recDescription}>{rec.description}</Text>
      {rec.foods && rec.foods.length > 0 && (
        <View style={styles.foodsSection}>
          <Text style={styles.foodsTitle}>Foods:</Text>
          {rec.foods.map((food: string, idx: number) => (
            <Text key={idx} style={styles.foodItem}>• {food}</Text>
          ))}
        </View>
      )}
      {rec.evidence && (
        <Text style={styles.evidence}>Evidence: {rec.evidence}</Text>
      )}
    </View>
  );

  const renderLatestReport = () => {
    if (!latestReport) {
      return (
        <View style={styles.noDataCard}>
          <FileText size={48} color={colors.textSecondary} />
          <Text style={styles.noDataTitle}>No Lab Reports</Text>
          <Text style={styles.noDataText}>Add your first blood report to get started with personalized analysis</Text>
        </View>
      );
    }

    return (
      <View style={styles.latestReportCard}>
        <View style={styles.reportHeader}>
          <Text style={styles.reportDate}>{latestReport.date}</Text>
          <View style={[
            styles.riskBadge,
            { backgroundColor: latestReport.analysis?.overallRisk === 'high' ? colors.error : 
                               latestReport.analysis?.overallRisk === 'moderate' ? colors.warning : colors.success }
          ]}>
            <Text style={styles.riskText}>
              {latestReport.analysis?.overallRisk?.toUpperCase() || 'UNKNOWN'} RISK
            </Text>
          </View>
        </View>
        
        <Text style={styles.reportSummary}>
          {latestReport.analysis?.summary || 'Analysis pending...'}
        </Text>

        <View style={styles.reportStats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{latestReport.analysis?.alerts.length || 0}</Text>
            <Text style={styles.statLabel}>Alerts</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{latestReport.analysis?.recommendations.length || 0}</Text>
            <Text style={styles.statLabel}>Recommendations</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{reports.length}</Text>
            <Text style={styles.statLabel}>Total Reports</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Lab Dashboard</Text>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => setShowForm(true)}
        >
          <Plus size={24} color={colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderLatestReport()}

        {criticalAlerts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <AlertTriangle size={20} color={colors.error} />
              <Text style={styles.sectionTitle}>Critical Alerts</Text>
            </View>
            {criticalAlerts.map(renderCriticalAlert)}
          </View>
        )}

        {recommendationsByPriority.high.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <TrendingUp size={20} color={colors.warning} />
              <Text style={styles.sectionTitle}>High Priority Recommendations</Text>
            </View>
            {recommendationsByPriority.high.map(renderRecommendation)}
          </View>
        )}

        {recommendationsByPriority.medium.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Activity size={20} color={colors.primary} />
              <Text style={styles.sectionTitle}>Medium Priority Recommendations</Text>
            </View>
            {recommendationsByPriority.medium.map(renderRecommendation)}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showForm}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <BloodReportForm onClose={() => setShowForm(false)} />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: colors.text,
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  noDataCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  noDataTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.text,
  },
  noDataText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  latestReportCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    gap: 12,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reportDate: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
  },
  riskBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  riskText: {
    fontSize: 12,
    fontWeight: '700' as const,
    color: colors.white,
  },
  reportSummary: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  reportStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  statItem: {
    alignItems: 'center',
    gap: 4,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: colors.primary,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: 16,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.text,
  },
  criticalAlertCard: {
    backgroundColor: colors.error,
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: colors.white,
    flex: 1,
  },
  alertValue: {
    fontSize: 16,
    fontWeight: 'bold' as const,
    color: colors.white,
  },
  alertExplanation: {
    fontSize: 14,
    color: colors.white,
    lineHeight: 20,
  },
  alertAction: {
    fontSize: 12,
    color: colors.white,
    fontStyle: 'italic' as const,
  },
  recommendationCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  recHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: colors.white,
  },
  recTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    flex: 1,
  },
  recDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  foodsSection: {
    gap: 4,
  },
  foodsTitle: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: colors.text,
  },
  foodItem: {
    fontSize: 13,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  evidence: {
    fontSize: 12,
    color: colors.primary,
    fontStyle: 'italic' as const,
  },
});