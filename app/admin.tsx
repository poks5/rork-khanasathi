import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Edit3, Save, X, Plus, Trash2, Upload } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { Food } from '@/types/food';
import { foodDatabase } from '@/data/foodDatabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ADMIN_FOODS_KEY = 'admin_foods_overrides';

interface FoodOverride {
  id: string;
  image?: string;
  nameEn?: string;
  nameNe?: string;
  safetyLevel?: 'safe' | 'caution' | 'avoid';
  nutrients?: Partial<Food['nutrients']>;
  preparationTips?: { en: string; ne: string }[];
  medicalNotes?: { en: string; ne: string }[];
}

export default function AdminPanel() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState<Food | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [foodOverrides, setFoodOverrides] = useState<Record<string, FoodOverride>>({});
  const [editForm, setEditForm] = useState<FoodOverride>({} as FoodOverride);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFoodOverrides();
  }, []);

  const loadFoodOverrides = async () => {
    try {
      const stored = await AsyncStorage.getItem(ADMIN_FOODS_KEY);
      if (stored) {
        setFoodOverrides(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load food overrides:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveFoodOverrides = async (overrides: Record<string, FoodOverride>) => {
    try {
      await AsyncStorage.setItem(ADMIN_FOODS_KEY, JSON.stringify(overrides));
      setFoodOverrides(overrides);
    } catch (error) {
      console.error('Failed to save food overrides:', error);
      Alert.alert('Error', 'Failed to save changes');
    }
  };

  const getEffectiveFood = (food: Food): Food => {
    const override = foodOverrides[food.id];
    if (!override) return food;

    return {
      ...food,
      ...(override.image && { image: override.image }),
      ...(override.nameEn && { nameEn: override.nameEn }),
      ...(override.nameNe && { nameNe: override.nameNe }),
      ...(override.safetyLevel && { safetyLevel: override.safetyLevel }),
      ...(override.nutrients && { nutrients: { ...food.nutrients, ...override.nutrients } }),
      ...(override.preparationTips && { preparationTips: override.preparationTips }),
      ...(override.medicalNotes && { medicalNotes: override.medicalNotes }),
    };
  };

  const filteredFoods = foodDatabase.filter(food => {
    const effectiveFood = getEffectiveFood(food);
    return (
      effectiveFood.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      effectiveFood.nameNe.includes(searchQuery) ||
      effectiveFood.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const openEditModal = (food: Food) => {
    const effectiveFood = getEffectiveFood(food);
    setSelectedFood(effectiveFood);
    setEditForm({
      id: food.id,
      image: effectiveFood.image,
      nameEn: effectiveFood.nameEn,
      nameNe: effectiveFood.nameNe,
      safetyLevel: effectiveFood.safetyLevel,
      nutrients: { ...effectiveFood.nutrients },
      preparationTips: effectiveFood.preparationTips || [],
      medicalNotes: effectiveFood.medicalNotes || [],
    });
    setEditModalVisible(true);
  };

  const saveChanges = async () => {
    if (!selectedFood) return;

    const newOverrides = {
      ...foodOverrides,
      [selectedFood.id]: editForm,
    };

    await saveFoodOverrides(newOverrides);
    setEditModalVisible(false);
    Alert.alert('Success', 'Food data updated successfully!');
  };

  const resetFood = async (foodId: string) => {
    Alert.alert(
      'Reset Food Data',
      'This will reset all customizations for this food item. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            const newOverrides = { ...foodOverrides };
            delete newOverrides[foodId];
            await saveFoodOverrides(newOverrides);
            Alert.alert('Success', 'Food data reset to default!');
          },
        },
      ]
    );
  };

  const exportData = async () => {
    try {
      const dataToExport = {
        timestamp: new Date().toISOString(),
        overrides: foodOverrides,
      };
      console.log('Food overrides data:', JSON.stringify(dataToExport, null, 2));
      Alert.alert(
        'Export Data',
        'Food override data has been logged to console. You can copy it from there.'
      );
    } catch {
      Alert.alert('Error', 'Failed to export data');
    }
  };

  const importData = () => {
    Alert.prompt(
      'Import Data',
      'Paste the exported JSON data:',
      async (jsonData) => {
        try {
          const parsed = JSON.parse(jsonData || '{}');
          if (parsed.overrides) {
            await saveFoodOverrides(parsed.overrides);
            Alert.alert('Success', 'Data imported successfully!');
          } else {
            Alert.alert('Error', 'Invalid data format');
          }
        } catch {
          Alert.alert('Error', 'Invalid JSON data');
        }
      }
    );
  };

  const getSafetyColor = (level: 'safe' | 'caution' | 'avoid') => {
    switch (level) {
      case 'safe': return colors.success;
      case 'caution': return colors.warning;
      case 'avoid': return colors.danger;
      default: return colors.gray;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      
      <View style={styles.header}>
        <View style={styles.searchContainer}>
          <Search size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search foods..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={colors.textSecondary}
          />
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={exportData}>
            <Upload size={16} color={colors.white} />
            <Text style={styles.actionButtonText}>Export</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, styles.importButton]} onPress={importData}>
            <Plus size={16} color={colors.white} />
            <Text style={styles.actionButtonText}>Import</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.foodList}>
        {filteredFoods.map((food) => {
          const effectiveFood = getEffectiveFood(food);
          const hasOverride = !!foodOverrides[food.id];
          
          return (
            <View key={food.id} style={[styles.foodItem, hasOverride && styles.modifiedFoodItem]}>
              <Image source={{ uri: effectiveFood.image }} style={styles.foodImage} />
              
              <View style={styles.foodInfo}>
                <Text style={styles.foodName}>{effectiveFood.nameEn}</Text>
                <Text style={styles.foodNameNe}>{effectiveFood.nameNe}</Text>
                <Text style={styles.foodCategory}>{effectiveFood.category}</Text>
                
                <View style={styles.safetyBadge}>
                  <View 
                    style={[styles.safetyIndicator, { backgroundColor: getSafetyColor(effectiveFood.safetyLevel) }]}
                  />
                  <Text style={styles.safetyText}>{effectiveFood.safetyLevel}</Text>
                </View>
                
                {hasOverride && (
                  <Text style={styles.modifiedLabel}>Modified</Text>
                )}
              </View>
              
              <View style={styles.foodActions}>
                <TouchableOpacity 
                  style={styles.editButton} 
                  onPress={() => openEditModal(food)}
                >
                  <Edit3 size={16} color={colors.primary} />
                </TouchableOpacity>
                
                {hasOverride && (
                  <TouchableOpacity 
                    style={styles.resetButton} 
                    onPress={() => resetFood(food.id)}
                  >
                    <Trash2 size={16} color={colors.danger} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>

      <Modal
        visible={editModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <KeyboardAvoidingView 
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setEditModalVisible(false)}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Food</Text>
            <TouchableOpacity onPress={saveChanges}>
              <Save size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Basic Information</Text>
              
              <Text style={styles.fieldLabel}>Image URL</Text>
              <TextInput
                style={styles.textInput}
                value={editForm.image}
                onChangeText={(text) => setEditForm({ ...editForm, image: text })}
                placeholder="https://example.com/image.jpg"
                multiline
              />
              
              <Text style={styles.fieldLabel}>English Name</Text>
              <TextInput
                style={styles.textInput}
                value={editForm.nameEn}
                onChangeText={(text) => setEditForm({ ...editForm, nameEn: text })}
                placeholder="English name"
              />
              
              <Text style={styles.fieldLabel}>Nepali Name</Text>
              <TextInput
                style={styles.textInput}
                value={editForm.nameNe}
                onChangeText={(text) => setEditForm({ ...editForm, nameNe: text })}
                placeholder="नेपाली नाम"
              />
              
              <Text style={styles.fieldLabel}>Safety Level</Text>
              <View style={styles.safetyOptions}>
                {(['safe', 'caution', 'avoid'] as const).map((level) => (
                  <TouchableOpacity
                    key={level}
                    style={[
                      styles.safetyOption,
                      editForm.safetyLevel === level && styles.selectedSafetyOption,
                      { borderColor: getSafetyColor(level) }
                    ]}
                    onPress={() => setEditForm({ ...editForm, safetyLevel: level })}
                  >
                    <Text style={[
                      styles.safetyOptionText,
                      editForm.safetyLevel === level && { color: getSafetyColor(level) }
                    ]}>
                      {level}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Nutrients (per portion)</Text>
              
              {Object.entries(editForm.nutrients || {}).map(([key, value]) => (
                <View key={key} style={styles.nutrientRow}>
                  <Text style={styles.nutrientLabel}>{key}</Text>
                  <TextInput
                    style={styles.nutrientInput}
                    value={value?.toString()}
                    onChangeText={(text) => {
                      const numValue = parseFloat(text) || 0;
                      setEditForm({
                        ...editForm,
                        nutrients: {
                          ...editForm.nutrients,
                          [key]: numValue,
                        },
                      });
                    }}
                    keyboardType="numeric"
                    placeholder="0"
                  />
                </View>
              ))}
            </View>

            <View style={styles.formSection}>
              <Text style={styles.sectionTitle}>Preview</Text>
              {editForm.image && (
                <Image source={{ uri: editForm.image }} style={styles.previewImage} />
              )}
              <Text style={styles.previewName}>{editForm.nameEn}</Text>
              <Text style={styles.previewNameNe}>{editForm.nameNe}</Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  header: {
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingLeft: 8,
    fontSize: 16,
    color: colors.text,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  importButton: {
    backgroundColor: colors.success,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600' as const,
  },
  foodList: {
    flex: 1,
  },
  foodItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modifiedFoodItem: {
    backgroundColor: '#f8f9ff',
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  foodImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 2,
  },
  foodNameNe: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  foodCategory: {
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  safetyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  safetyIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  safetyText: {
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  modifiedLabel: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: '600' as const,
    textTransform: 'uppercase',
  },
  foodActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: colors.background,
  },
  resetButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#ffebee',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.text,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  formSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.text,
    marginBottom: 6,
    marginTop: 12,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.white,
  },
  safetyOptions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  safetyOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 2,
    borderRadius: 20,
    backgroundColor: colors.white,
  },
  selectedSafetyOption: {
    backgroundColor: '#f5f5f5',
  },
  safetyOptionText: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  nutrientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  nutrientLabel: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    textTransform: 'capitalize',
  },
  nutrientInput: {
    width: 80,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 14,
    color: colors.text,
    textAlign: 'right',
  },
  previewImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginBottom: 8,
    alignSelf: 'center',
  },
  previewName: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  previewNameNe: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});