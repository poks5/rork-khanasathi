import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert } from 'react-native';
import { colors } from '@/constants/colors';
import { BloodReport, LabValues, AnthropometricData } from '@/types/bloodReport';
import { useBloodReports } from '@/providers/BloodReportProvider';
import { AlertTriangle, Activity, TrendingUp, Save, X } from 'lucide-react-native';

interface BloodReportFormProps {
  onClose: () => void;
  editingReport?: BloodReport;
}

interface RealTimeAlert {
  type: 'critical' | 'warning';
  message: string;
  parameter: string;
  value: number;
}

export const BloodReportForm: React.FC<BloodReportFormProps> = ({ onClose, editingReport }) => {
  const { addReport, updateReport } = useBloodReports();
  
  const [activeTab, setActiveTab] = useState<'basic' | 'nutrition' | 'advanced' | 'measurements'>('basic');
  const [date, setDate] = useState(editingReport?.date || new Date().toISOString().split('T')[0]);
  const [patientType, setPatientType] = useState<'hemodialysis' | 'peritoneal' | 'ckd'>(editingReport?.patientType || 'hemodialysis');
  const [preHD, setPreHD] = useState<LabValues>(editingReport?.preHD || {});
  const [postHD, setPostHD] = useState<LabValues>(editingReport?.postHD || {});
  const [anthropometric, setAnthropometric] = useState<AnthropometricData>(editingReport?.anthropometric || {});
  const [clinicalNotes, setClinicalNotes] = useState(editingReport?.clinicalNotes || '');
  const [realTimeAlert, setRealTimeAlert] = useState<RealTimeAlert | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updatePreHD = useCallback((field: keyof LabValues, value: string) => {
    const numValue = value ? parseFloat(value) : undefined;
    setPreHD(prev => ({ ...prev, [field]: numValue }));

    // Real-time critical value detection
    if (field === 'potassium' && numValue) {
      if (numValue > 6.0) {
        setRealTimeAlert({
          type: 'critical',
          message: 'CRITICAL: Potassium >6.0 - Immediate medical attention required',
          parameter: 'potassium',
          value: numValue
        });
      } else if (numValue < 3.0) {
        setRealTimeAlert({
          type: 'critical',
          message: 'CRITICAL: Potassium <3.0 - Risk of cardiac arrhythmia',
          parameter: 'potassium',
          value: numValue
        });
      } else if (numValue > 5.5 || numValue < 3.5) {
        setRealTimeAlert({
          type: 'warning',
          message: `WARNING: Potassium ${numValue} is outside normal range (3.5-5.0)`,
          parameter: 'potassium',
          value: numValue
        });
      } else {
        setRealTimeAlert(null);
      }
    }
  }, []);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      const reportData = {
        date,
        preHD,
        postHD,
        anthropometric,
        clinicalNotes,
        patientType,
        reviewStatus: 'pending' as const
      };

      if (editingReport) {
        updateReport(editingReport.id, reportData);
        Alert.alert('Success', 'Blood report updated successfully');
      } else {
        const newReport = addReport(reportData);
        const alertCount = newReport.analysis?.alerts.length || 0;
        const recommendationCount = newReport.analysis?.recommendations.length || 0;
        
        Alert.alert(
          'Analysis Complete',
          `Report saved with ${alertCount} alerts and ${recommendationCount} recommendations`,
          [{ text: 'OK', onPress: onClose }]
        );
      }
      
      if (editingReport) {
        onClose();
      }
    } catch (error) {
      console.error('Error saving report:', error);
      Alert.alert('Error', 'Failed to save blood report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderLabInput = (label: string, field: keyof LabValues, unit: string, normalRange?: string) => (
    <View style={styles.inputGroup}>
      <View style={styles.labelRow}>
        <Text style={styles.inputLabel}>{label}</Text>
        {normalRange && <Text style={styles.normalRange}>{normalRange}</Text>}
      </View>
      <View style={styles.inputWithUnit}>
        <TextInput
          style={styles.input}
          value={preHD[field]?.toString() || ''}
          onChangeText={(value) => updatePreHD(field, value)}
          placeholder="0.0"
          keyboardType="numeric"
        />
        <Text style={styles.unit}>{unit}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {editingReport ? 'Edit Blood Report' : 'New Blood Report'}
        </Text>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <X size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      {realTimeAlert && (
        <View style={[
          styles.alertBanner,
          realTimeAlert.type === 'critical' ? styles.criticalAlert : styles.warningAlert
        ]}>
          <AlertTriangle 
            size={20} 
            color={realTimeAlert.type === 'critical' ? colors.white : colors.warning} 
          />
          <Text style={[
            styles.alertText,
            realTimeAlert.type === 'critical' ? styles.criticalAlertText : styles.warningAlertText
          ]}>
            {realTimeAlert.message}
          </Text>
        </View>
      )}

      <View style={styles.basicInfo}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Report Date</Text>
          <TextInput
            style={styles.input}
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
          />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.tabContent}>
          <Text style={styles.sectionTitle}>Essential Dialysis Monitoring</Text>
          {renderLabInput('Blood Urea', 'urea', 'mg/dL', '15-45')}
          {renderLabInput('Creatinine', 'creatinine', 'mg/dL', '8-12')}
          {renderLabInput('Potassium ⚠️', 'potassium', 'mEq/L', '3.5-5.0')}
          {renderLabInput('Sodium', 'sodium', 'mEq/L', '136-145')}
          {renderLabInput('Calcium', 'calcium', 'mg/dL', '8.5-10.5')}
          {renderLabInput('Phosphorus', 'phosphorus', 'mg/dL', '3.5-5.5')}
          {renderLabInput('Albumin', 'albumin', 'g/dL', '3.5-5.0')}
          {renderLabInput('Hemoglobin', 'hemoglobin', 'g/dL', '11-12')}
        </View>

        <View style={styles.notesSection}>
          <Text style={styles.inputLabel}>Clinical Notes</Text>
          <TextInput
            style={styles.notesInput}
            value={clinicalNotes}
            onChangeText={setClinicalNotes}
            placeholder="Additional clinical observations, symptoms, or notes..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.saveButton, isSubmitting && styles.disabledButton]} 
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <Save size={20} color={colors.white} />
          <Text style={styles.saveButtonText}>
            {isSubmitting ? 'Analyzing...' : editingReport ? 'Update Report' : 'Generate Analysis'}
          </Text>
        </TouchableOpacity>
      </View>
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
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: colors.text,
  },
  closeButton: {
    padding: 4,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
    gap: 8,
  },
  criticalAlert: {
    backgroundColor: colors.error,
  },
  warningAlert: {
    backgroundColor: colors.warning + '20',
    borderWidth: 1,
    borderColor: colors.warning,
  },
  alertText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600' as const,
  },
  criticalAlertText: {
    color: colors.white,
  },
  warningAlertText: {
    color: colors.warning,
  },
  basicInfo: {
    backgroundColor: colors.white,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    gap: 16,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  tabContent: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 8,
  },
  inputGroup: {
    gap: 8,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.text,
  },
  normalRange: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic' as const,
  },
  inputWithUnit: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  unit: {
    paddingHorizontal: 12,
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500' as const,
  },
  notesSection: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    gap: 8,
  },
  notesInput: {
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    minHeight: 100,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.textSecondary,
  },
  saveButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: colors.primary,
    gap: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.white,
  },
});