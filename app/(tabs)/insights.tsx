import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Modal, Alert } from 'react-native';
import RecommendationFeed from '@/components/RecommendationFeed';
import { colors } from '@/constants/colors';
import { Plus, Activity, AlertTriangle, TrendingUp, FileText } from 'lucide-react-native';

// Simple Blood Report Form Component
const SimpleBloodReportForm = ({ onClose }: { onClose: () => void }) => {
  const [potassium, setPotassium] = useState('');
  const [phosphorus, setPhosphorus] = useState('');
  const [albumin, setAlbumin] = useState('');
  const [hemoglobin, setHemoglobin] = useState('');

  const handleSubmit = () => {
    // Simple validation and alert
    const values = { potassium, phosphorus, albumin, hemoglobin };
    const hasValues = Object.values(values).some(v => v.trim() !== '');
    
    if (!hasValues) {
      Alert.alert('Error', 'Please enter at least one lab value');
      return;
    }

    // Generate simple analysis
    let alerts = [];
    if (potassium && parseFloat(potassium) > 5.5) {
      alerts.push('⚠️ High Potassium detected - Avoid bananas, potatoes, oranges');
    }
    if (phosphorus && parseFloat(phosphorus) > 5.5) {
      alerts.push('⚠️ High Phosphorus detected - Take phosphate binders with meals');
    }
    if (albumin && parseFloat(albumin) < 3.5) {
      alerts.push('⚠️ Low Albumin detected - Increase protein intake');
    }
    if (hemoglobin && parseFloat(hemoglobin) < 11) {
      alerts.push('⚠️ Low Hemoglobin detected - Consider iron supplements');
    }

    const message = alerts.length > 0 
      ? `Analysis Complete:\n\n${alerts.join('\n\n')}` 
      : 'Lab values look normal. Continue current management.';
    
    Alert.alert('Lab Analysis', message, [{ text: 'OK', onPress: onClose }]);
  };

  return (
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Add Lab Values</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Potassium (mEq/L) - Normal: 3.5-5.0</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputValue}>{potassium || '0.0'}</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.adjustButton} onPress={() => setPotassium(prev => Math.max(0, parseFloat(prev || '0') - 0.1).toFixed(1))}>
                <Text style={styles.buttonText}>-</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.adjustButton} onPress={() => setPotassium(prev => (parseFloat(prev || '0') + 0.1).toFixed(1))}>
                <Text style={styles.buttonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Phosphorus (mg/dL) - Normal: 3.5-5.5</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputValue}>{phosphorus || '0.0'}</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.adjustButton} onPress={() => setPhosphorus(prev => Math.max(0, parseFloat(prev || '0') - 0.1).toFixed(1))}>
                <Text style={styles.buttonText}>-</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.adjustButton} onPress={() => setPhosphorus(prev => (parseFloat(prev || '0') + 0.1).toFixed(1))}>
                <Text style={styles.buttonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Albumin (g/dL) - Normal: 3.5-5.0</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputValue}>{albumin || '0.0'}</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.adjustButton} onPress={() => setAlbumin(prev => Math.max(0, parseFloat(prev || '0') - 0.1).toFixed(1))}>
                <Text style={styles.buttonText}>-</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.adjustButton} onPress={() => setAlbumin(prev => (parseFloat(prev || '0') + 0.1).toFixed(1))}>
                <Text style={styles.buttonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Hemoglobin (g/dL) - Normal: 11-12</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.inputValue}>{hemoglobin || '0.0'}</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.adjustButton} onPress={() => setHemoglobin(prev => Math.max(0, parseFloat(prev || '0') - 0.1).toFixed(1))}>
                <Text style={styles.buttonText}>-</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.adjustButton} onPress={() => setHemoglobin(prev => (parseFloat(prev || '0') + 0.1).toFixed(1))}>
                <Text style={styles.buttonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.modalButtons}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>Analyze Labs</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default function InsightsScreen() {
  const [showLabForm, setShowLabForm] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Insights</Text>
        <Text style={styles.subtitle}>Personalized nutrition guidance and lab analysis</Text>
      </View>
      
      {/* Lab Integration Section */}
      <View style={styles.labSection}>
        <View style={styles.labHeader}>
          <View style={styles.labTitleRow}>
            <Activity size={20} color={colors.primary} />
            <Text style={styles.labTitle}>Lab Integration</Text>
          </View>
          <TouchableOpacity 
            style={styles.addLabButton}
            onPress={() => setShowLabForm(true)}
          >
            <Plus size={16} color={colors.white} />
            <Text style={styles.addLabText}>Add Labs</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.labCards}>
          <View style={styles.labCard}>
            <FileText size={16} color={colors.primary} />
            <Text style={styles.labCardTitle}>Blood Reports</Text>
            <Text style={styles.labCardValue}>0</Text>
            <Text style={styles.labCardSubtitle}>Reports tracked</Text>
          </View>
          
          <View style={styles.labCard}>
            <AlertTriangle size={16} color={colors.danger} />
            <Text style={styles.labCardTitle}>Critical Alerts</Text>
            <Text style={styles.labCardValue}>0</Text>
            <Text style={styles.labCardSubtitle}>Need attention</Text>
          </View>
          
          <View style={styles.labCard}>
            <TrendingUp size={16} color={colors.warning} />
            <Text style={styles.labCardTitle}>Recommendations</Text>
            <Text style={styles.labCardValue}>0</Text>
            <Text style={styles.labCardSubtitle}>Active</Text>
          </View>
        </View>
        
        <View style={styles.labPrompt}>
          <Text style={styles.labPromptTitle}>🩸 Lab Analysis Ready</Text>
          <Text style={styles.labPromptText}>
            Add your latest blood work to get personalized dietary recommendations based on your lab values.
          </Text>
          <Text style={styles.labPromptFeatures}>
            ✓ Real-time critical value alerts{"\n"}
            ✓ Evidence-based dietary guidance{"\n"}
            ✓ Nepali food-specific recommendations{"\n"}
            ✓ Trend analysis across reports
          </Text>
        </View>
      </View>
      
      <RecommendationFeed />
      
      <Modal
        visible={showLabForm}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SimpleBloodReportForm onClose={() => setShowLabForm(false)} />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.white, paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.border },
  title: { fontSize: 24, fontWeight: 'bold' as const, color: colors.text },
  subtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  
  // Lab Integration Styles
  labSection: {
    backgroundColor: colors.white,
    margin: 16,
    borderRadius: 12,
    padding: 16,
  },
  labHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  labTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  labTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.text,
  },
  addLabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  addLabText: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.white,
  },
  labCards: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  labCard: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  labCardTitle: {
    fontSize: 10,
    fontWeight: '500' as const,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  labCardValue: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: colors.text,
  },
  labCardSubtitle: {
    fontSize: 9,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  labPrompt: {
    backgroundColor: colors.primaryLight + '15',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.primaryLight + '30',
  },
  labPromptTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 8,
  },
  labPromptText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  labPromptFeatures: {
    fontSize: 12,
    color: colors.primary,
    lineHeight: 18,
  },
  
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.text,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 12,
    justifyContent: 'space-between',
  },
  inputValue: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.text,
    minWidth: 60,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  adjustButton: {
    backgroundColor: colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: colors.white,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
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
  submitButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.white,
  },
});
