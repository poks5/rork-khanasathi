import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Alert, Platform } from 'react-native';
import { colors } from '@/constants/colors';
import { BloodReport, LabValues } from '@/types/bloodReport';
import { useBloodReports } from '@/providers/BloodReportProvider';
import { AlertTriangle, Save, X, Activity, CheckCircle } from 'lucide-react-native';

interface BloodReportFormProps {
  onClose: () => void;
  editingReport?: BloodReport;
}

interface RealTimeAlert {
  type: 'critical' | 'warning' | 'info';
  message: string;
  parameter: string;
  value: number;
  icon: 'alert' | 'warning' | 'check';
}

interface FormField {
  key: keyof LabValues;
  label: string;
  unit: string;
  normalRange: string;
  critical?: { min?: number; max?: number };
  warning?: { min?: number; max?: number };
}

const LAB_FIELDS: FormField[] = [
  { key: 'urea', label: 'Blood Urea', unit: 'mg/dL', normalRange: '20-60 (pre-dialysis)' },
  { key: 'creatinine', label: 'Creatinine', unit: 'mg/dL', normalRange: '8-12 (pre-dialysis)' },
  { key: 'potassium', label: 'Potassium ⚠️', unit: 'mEq/L', normalRange: '3.5-5.0', critical: { min: 3.0, max: 6.0 }, warning: { min: 3.5, max: 5.5 } },
  { key: 'sodium', label: 'Sodium', unit: 'mEq/L', normalRange: '136-145' },
  { key: 'calcium', label: 'Calcium', unit: 'mg/dL', normalRange: '8.5-10.5' },
  { key: 'phosphorus', label: 'Phosphorus', unit: 'mg/dL', normalRange: '3.5-5.5', critical: { max: 7.0 }, warning: { max: 5.5 } },
  { key: 'albumin', label: 'Albumin', unit: 'g/dL', normalRange: '3.5-5.0', critical: { min: 3.0 }, warning: { min: 3.5 } },
  { key: 'hemoglobin', label: 'Hemoglobin', unit: 'g/dL', normalRange: '11-12', critical: { min: 9.0 }, warning: { min: 11.0 } },
  { key: 'iPTH', label: 'iPTH', unit: 'pg/mL', normalRange: '150-300' },
  { key: 'tsat', label: 'TSAT', unit: '%', normalRange: '20-50', warning: { min: 20 } },
  { key: 'serumFerritin', label: 'Ferritin', unit: 'ng/mL', normalRange: '200-500' },
];

export const BloodReportForm: React.FC<BloodReportFormProps> = ({ onClose, editingReport }) => {
  const { addReport, updateReport } = useBloodReports();
  
  const [date, setDate] = useState(editingReport?.date || new Date().toISOString().split('T')[0]);
  const [patientType] = useState<'hemodialysis' | 'peritoneal' | 'ckd'>(editingReport?.patientType || 'hemodialysis');
  const [labValues, setLabValues] = useState<LabValues>(editingReport?.preHD || {});
  const [clinicalNotes, setClinicalNotes] = useState(editingReport?.clinicalNotes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inputValues, setInputValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    Object.entries(editingReport?.preHD || {}).forEach(([key, value]) => {
      if (value !== undefined) {
        initial[key] = value.toString();
      }
    });
    return initial;
  });

  // Real-time alert calculation
  const currentAlert = useMemo((): RealTimeAlert | null => {
    for (const field of LAB_FIELDS) {
      const inputValue = inputValues[field.key];
      if (!inputValue || inputValue === '' || inputValue === '.') continue;
      
      const numValue = parseFloat(inputValue);
      if (isNaN(numValue) || !isFinite(numValue)) continue;
      
      // Check critical ranges
      if (field.critical) {
        if (field.critical.min !== undefined && numValue < field.critical.min) {
          return {
            type: 'critical',
            message: `CRITICAL: ${field.label} ${numValue} ${field.unit} is dangerously low`,
            parameter: field.key,
            value: numValue,
            icon: 'alert'
          };
        }
        if (field.critical.max !== undefined && numValue > field.critical.max) {
          return {
            type: 'critical',
            message: `CRITICAL: ${field.label} ${numValue} ${field.unit} is dangerously high`,
            parameter: field.key,
            value: numValue,
            icon: 'alert'
          };
        }
      }
      
      // Check warning ranges
      if (field.warning) {
        if (field.warning.min !== undefined && numValue < field.warning.min) {
          return {
            type: 'warning',
            message: `WARNING: ${field.label} ${numValue} ${field.unit} is below normal range`,
            parameter: field.key,
            value: numValue,
            icon: 'warning'
          };
        }
        if (field.warning.max !== undefined && numValue > field.warning.max) {
          return {
            type: 'warning',
            message: `WARNING: ${field.label} ${numValue} ${field.unit} is above normal range`,
            parameter: field.key,
            value: numValue,
            icon: 'warning'
          };
        }
      }
    }
    return null;
  }, [inputValues]);

  const updateLabValue = useCallback((field: keyof LabValues, value: string) => {
    console.log(`🔬 Updating ${field}: "${value}"`);
    
    // Allow empty string, single dot, or valid decimal numbers
    const decimalRegex = /^$|^\d*\.?\d*$/;
    if (!decimalRegex.test(value)) {
      console.log(`❌ Invalid format for ${field}: "${value}"`);
      return;
    }
    
    // Update input display value
    setInputValues(prev => ({ ...prev, [field]: value }));
    
    // Handle empty or incomplete input
    if (value === '' || value === '.' || value.endsWith('.')) {
      if (value === '') {
        // Clear the lab value completely
        setLabValues(prev => {
          const updated = { ...prev };
          delete updated[field];
          return updated;
        });
      }
      return;
    }
    
    // Parse and validate complete numeric value
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && isFinite(numValue) && numValue >= 0) {
      setLabValues(prev => ({ ...prev, [field]: numValue }));
      console.log(`✅ Updated ${field} to:`, numValue);
    } else {
      console.log(`❌ Invalid numeric value for ${field}: "${value}"`);
    }
  }, []);

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    // Validate required fields
    const hasValues = Object.keys(labValues).length > 0;
    if (!hasValues) {
      Alert.alert('Validation Error', 'Please enter at least one lab value before saving.');
      return;
    }
    
    if (!date) {
      Alert.alert('Validation Error', 'Please enter a report date.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('🩸 === BLOOD REPORT SUBMISSION START ===');
      console.log('📊 Lab Values:', JSON.stringify(labValues, null, 2));
      console.log('📅 Report Date:', date);
      console.log('📝 Clinical Notes:', clinicalNotes);
      console.log('🏥 Patient Type:', patientType);
      
      const reportData = {
        date,
        preHD: labValues,
        postHD: {},
        anthropometric: {},
        clinicalNotes,
        patientType,
        reviewStatus: 'pending' as const
      };
      
      console.log('📦 Report Data Package:', JSON.stringify(reportData, null, 2));

      if (editingReport) {
        console.log('📝 Updating existing report:', editingReport.id);
        updateReport(editingReport.id, reportData);
        console.log('✅ Report updated successfully');
        Alert.alert(
          'Success', 
          'Blood report updated successfully',
          [{ text: 'OK', onPress: onClose }]
        );
      } else {
        console.log('🆕 Creating new report...');
        const newReport = addReport(reportData);
        console.log('📊 New Report Created:', JSON.stringify(newReport, null, 2));
        
        const alertCount = newReport.analysis?.alerts.length || 0;
        const recommendationCount = newReport.analysis?.recommendations.length || 0;
        
        console.log(`✅ === ANALYSIS RESULTS ===`);
        console.log(`🚨 Alerts: ${alertCount}`);
        console.log(`💡 Recommendations: ${recommendationCount}`);
        console.log(`📊 Overall Risk: ${newReport.analysis?.overallRisk || 'unknown'}`);
        console.log(`📝 Summary: ${newReport.analysis?.summary || 'no summary'}`);
        
        if (newReport.analysis?.alerts) {
          newReport.analysis.alerts.forEach((alert, index) => {
            console.log(`🚨 Alert ${index + 1}: ${alert.parameter} = ${alert.value} (${alert.status}, ${alert.severity})`);
          });
        }
        
        if (Platform.OS === 'web') {
          Alert.alert(
            'Analysis Complete',
            `Report saved successfully!\n\n• ${alertCount} alerts generated\n• ${recommendationCount} recommendations created\n• Risk Level: ${newReport.analysis?.overallRisk || 'unknown'}`,
            [{ text: 'View Results', onPress: onClose }]
          );
        } else {
          Alert.alert(
            '🎉 Analysis Complete',
            `Your blood report has been analyzed:\n\n📊 ${alertCount} alerts\n💡 ${recommendationCount} recommendations\n🏁 Risk: ${newReport.analysis?.overallRisk || 'unknown'}\n\nTap 'View Results' to see your personalized insights.`,
            [{ text: 'View Results', onPress: onClose }]
          );
        }
      }
      
      console.log('✅ === BLOOD REPORT SUBMISSION COMPLETE ===');
    } catch (error) {
      console.error('❌ === ERROR DURING SUBMISSION ===');
      console.error('Error details:', error);
      console.error('Stack trace:', error instanceof Error ? error.stack : 'No stack trace');
      
      Alert.alert(
        'Save Error', 
        `Failed to save blood report: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease check the console for details and try again.`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderLabInput = (fieldConfig: FormField) => {
    const { key, label, unit, normalRange } = fieldConfig;
    const inputValue = inputValues[key] || '';
    const hasValue = labValues[key] !== undefined;
    const isValid = hasValue && !isNaN(Number(inputValue));
    
    return (
      <View key={key} style={styles.inputGroup}>
        <View style={styles.labelRow}>
          <Text style={styles.inputLabel}>{label}</Text>
          <Text style={styles.normalRange}>{normalRange}</Text>
        </View>
        <View style={[
          styles.inputWithUnit,
          isValid && styles.inputWithUnitValid,
          currentAlert?.parameter === key && currentAlert.type === 'critical' && styles.inputWithUnitCritical,
          currentAlert?.parameter === key && currentAlert.type === 'warning' && styles.inputWithUnitWarning
        ]}>
          <TextInput
            style={styles.input}
            value={inputValue}
            onChangeText={(value) => updateLabValue(key, value)}
            placeholder="0.0"
            keyboardType="decimal-pad"
            returnKeyType="next"
            selectTextOnFocus={true}
            autoCorrect={false}
            maxLength={8}
            testID={`lab-input-${key}`}
          />
          <Text style={styles.unit}>{unit}</Text>
          {isValid && (
            <View style={styles.validIcon}>
              <CheckCircle size={16} color={colors.success} />
            </View>
          )}
        </View>
      </View>
    );
  };

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

      {currentAlert && (
        <View style={[
          styles.alertBanner,
          currentAlert.type === 'critical' && styles.criticalAlert,
          currentAlert.type === 'warning' && styles.warningAlert,
          currentAlert.type === 'info' && styles.infoAlert
        ]}>
          {currentAlert.icon === 'alert' && (
            <AlertTriangle 
              size={20} 
              color={currentAlert.type === 'critical' ? colors.white : colors.warning} 
            />
          )}
          {currentAlert.icon === 'warning' && (
            <AlertTriangle 
              size={20} 
              color={colors.warning} 
            />
          )}
          {currentAlert.icon === 'check' && (
            <Activity 
              size={20} 
              color={colors.primary} 
            />
          )}
          <Text style={[
            styles.alertText,
            currentAlert.type === 'critical' && styles.criticalAlertText,
            currentAlert.type === 'warning' && styles.warningAlertText,
            currentAlert.type === 'info' && styles.infoAlertText
          ]}>
            {currentAlert.message}
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
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Essential Dialysis Monitoring</Text>
            <Text style={styles.sectionSubtitle}>
              Enter your lab values below. Real-time alerts will appear for critical values.
            </Text>
          </View>
          {LAB_FIELDS.map(renderLabInput)}
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
  infoAlert: {
    backgroundColor: colors.primary + '20',
    borderWidth: 1,
    borderColor: colors.primary,
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
  infoAlertText: {
    color: colors.primary,
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
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: colors.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
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
    position: 'relative',
  },
  inputWithUnitValid: {
    borderColor: colors.success,
    backgroundColor: colors.success + '10',
  },
  inputWithUnitCritical: {
    borderColor: colors.error,
    backgroundColor: colors.error + '10',
  },
  inputWithUnitWarning: {
    borderColor: colors.warning,
    backgroundColor: colors.warning + '10',
  },
  validIcon: {
    position: 'absolute',
    right: 40,
    top: '50%',
    transform: [{ translateY: -8 }],
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