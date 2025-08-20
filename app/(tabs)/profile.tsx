import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Switch,
  Alert,
  Linking,
  Share,
  Platform,
} from "react-native";
import { User, Heart, Droplet, AlertCircle, Shield, Phone, Share2 } from "lucide-react-native";
import { useLanguage } from "@/providers/LanguageProvider";
import { useUserProfile } from "@/providers/UserProfileProvider";
import { colors } from "@/constants/colors";
import { useRouter } from "expo-router";

export default function ProfileScreen() {
  const { t } = useLanguage();
  const { profile, updateProfile, resetProfile } = useUserProfile();
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState(profile);
  const router = useRouter();

  const handleSave = () => {
    updateProfile(formData);
    setEditMode(false);
  };

  const handleReset = () => {
    Alert.alert(
      t('profile.resetTitle'),
      t('profile.resetMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('common.confirm'), 
          style: 'destructive',
          onPress: () => {
            resetProfile();
            setFormData(profile);
          }
        },
      ]
    );
  };

  const copyToClipboardFallback = (text: string) => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') {
      return false;
    }
    
    try {
      // Create a temporary textarea element
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    } catch (err) {
      console.error('Fallback copy failed:', err);
      return false;
    }
  };

  const handleShareApp = async () => {
    try {
      const shareContent = {
        title: 'Khana Sathi - Kidney Diet Tracker',
        message: Platform.select({
          ios: 'Download Khana Sathi app to track your kidney-friendly diet and nutrition. Developed by Dr. Anil Pokhrel, MD, DM (Consultant Nephrologist) and Sajana Pokharel (Dietician). Get it now: https://expo.dev/accounts/poks/projects/khanasathi',
          android: 'Download Khana Sathi app to track your kidney-friendly diet and nutrition. Developed by Dr. Anil Pokhrel, MD, DM (Consultant Nephrologist) and Sajana Pokharel (Dietician). Get it now: https://expo.dev/accounts/poks/projects/khanasathi',
          default: 'Download Khana Sathi app to track your kidney-friendly diet and nutrition. Developed by Dr. Anil Pokhrel, MD, DM (Consultant Nephrologist) and Sajana Pokharel (Dietician). Get it now: https://expo.dev/accounts/poks/projects/khanasathi'
        }),
        url: 'https://expo.dev/accounts/poks/projects/khanasathi'
      };

      if (Platform.OS === 'web') {
        // Try modern Web Share API first
        if (navigator.share && navigator.canShare && navigator.canShare({ text: shareContent.message })) {
          try {
            await navigator.share({
              title: shareContent.title,
              text: shareContent.message,
              url: shareContent.url
            });
            return;
          } catch (shareError) {
            console.log('Web Share API failed, trying clipboard:', shareError);
          }
        }

        // Try clipboard API with proper permission handling
        if (navigator.clipboard && window.isSecureContext) {
          try {
            await navigator.clipboard.writeText(shareContent.message!);
            Alert.alert('Link Copied', 'App download link has been copied to clipboard!');
            return;
          } catch (clipboardError) {
            console.log('Clipboard API failed, trying fallback:', clipboardError);
          }
        }

        // Fallback to document.execCommand
        if (copyToClipboardFallback(shareContent.message!)) {
          Alert.alert('Link Copied', 'App download link has been copied to clipboard!');
        } else {
          // Final fallback - show the text in an alert
          Alert.alert(
            'Share Khana Sathi App',
            shareContent.message + '\n\nPlease copy this link manually to share the app.',
            [
              { text: 'OK', style: 'default' }
            ]
          );
        }
      } else {
        // Native sharing
        const result = await Share.share({
          title: shareContent.title,
          message: shareContent.message,
          url: shareContent.url
        });
        
        if (result.action === Share.sharedAction) {
          console.log('App shared successfully');
        }
      }
    } catch (error) {
      console.error('Error sharing app:', error);
      Alert.alert(
        'Share App',
        'Download Khana Sathi app to track your kidney-friendly diet and nutrition. Developed by Dr. Anil Pokhrel, MD, DM (Consultant Nephrologist) and Sajana Pokharel (Dietician). Get it now: https://expo.dev/accounts/poks/projects/khanasathi\n\nPlease copy this link manually to share the app.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('profile.title')}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            testID="admin-nav-button"
            accessibilityLabel="Open Admin"
            style={styles.adminButton}
            onPress={() => router.push('/admin')}
          >
            <Shield size={16} color={colors.white} />
            <Text style={styles.adminButtonText}>Admin</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => editMode ? handleSave() : setEditMode(true)}
          >
            <Text style={styles.editButtonText}>
              {editMode ? t('common.save') : t('common.edit')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <User size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>{t('profile.personalInfo')}</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t('profile.name')}</Text>
            <TextInput
              style={[styles.input, !editMode && styles.inputDisabled]}
              value={formData.name}
              onChangeText={(text) => setFormData({...formData, name: text})}
              editable={editMode}
              placeholder={t('profile.namePlaceholder')}
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t('profile.age')}</Text>
            <TextInput
              style={[styles.input, !editMode && styles.inputDisabled]}
              value={formData.age?.toString() || ''}
              onChangeText={(text) => setFormData({...formData, age: parseInt(text) || 0})}
              editable={editMode}
              keyboardType="numeric"
              placeholder={t('profile.agePlaceholder')}
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>{t('profile.weight')} (kg)</Text>
            <TextInput
              style={[styles.input, !editMode && styles.inputDisabled]}
              value={formData.weight?.toString() || ''}
              onChangeText={(text) => setFormData({...formData, weight: parseFloat(text) || 0})}
              editable={editMode}
              keyboardType="numeric"
              placeholder={t('profile.weightPlaceholder')}
              placeholderTextColor={colors.textSecondary}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Heart size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>{t('profile.dialysisInfo')}</Text>
          </View>

          <View style={styles.switchField}>
            <Text style={styles.label}>{t('profile.onDialysis')}</Text>
            <Switch
              value={formData.isOnDialysis}
              onValueChange={(value) => setFormData({...formData, isOnDialysis: value})}
              disabled={!editMode}
              trackColor={{ false: colors.gray, true: colors.primary }}
            />
          </View>

          {formData.isOnDialysis && (
            <View style={styles.field}>
              <Text style={styles.label}>{t('profile.dialysisFrequency')}</Text>
              <TextInput
                style={[styles.input, !editMode && styles.inputDisabled]}
                value={formData.dialysisFrequency?.toString() || ''}
                onChangeText={(text) => setFormData({...formData, dialysisFrequency: parseInt(text) || 0})}
                editable={editMode}
                keyboardType="numeric"
                placeholder={t('profile.frequencyPlaceholder')}
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Droplet size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>{t('profile.dailyLimits')}</Text>
          </View>

          <View style={styles.limitsGrid}>
            <View style={styles.limitItem}>
              <Text style={styles.limitLabel}>{t('nutrients.potassium')}</Text>
              <Text style={styles.limitValue}>{profile.dailyLimits.potassium} mg</Text>
            </View>
            <View style={styles.limitItem}>
              <Text style={styles.limitLabel}>{t('nutrients.phosphorus')}</Text>
              <Text style={styles.limitValue}>{profile.dailyLimits.phosphorus} mg</Text>
            </View>
            <View style={styles.limitItem}>
              <Text style={styles.limitLabel}>{t('nutrients.sodium')}</Text>
              <Text style={styles.limitValue}>{profile.dailyLimits.sodium} mg</Text>
            </View>
            <View style={styles.limitItem}>
              <Text style={styles.limitLabel}>{t('nutrients.protein')}</Text>
              <Text style={styles.limitValue}>{profile.dailyLimits.protein} g</Text>
            </View>
            <View style={styles.limitItem}>
              <Text style={styles.limitLabel}>{t('nutrients.calories')}</Text>
              <Text style={styles.limitValue}>{profile.dailyLimits.calories} kcal</Text>
            </View>
            <View style={styles.limitItem}>
              <Text style={styles.limitLabel}>{t('nutrients.fluid')}</Text>
              <Text style={styles.limitValue}>{profile.dailyLimits.fluid} ml</Text>
            </View>
          </View>

          <View style={styles.infoBox}>
            <AlertCircle size={16} color={colors.warning} />
            <Text style={styles.infoText}>{t('profile.limitsInfo')}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Share2 size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Share App</Text>
          </View>
          
          <View style={styles.shareContainer}>
            <Text style={styles.shareDescription}>
              Share Khana Sathi with your patients to help them track their kidney-friendly diet and nutrition.
            </Text>
            
            <TouchableOpacity 
              style={styles.shareButton} 
              onPress={handleShareApp}
              testID="share-app-button"
              accessibilityLabel="Share Khana Sathi app"
            >
              <Share2 size={18} color={colors.white} />
              <Text style={styles.shareButtonText}>Share App with Patients</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.resetButtonText}>{t('profile.resetData')}</Text>
        </TouchableOpacity>

        <View
          testID="medical-disclaimer"
          accessibilityLabel="Medical disclaimer"
          style={styles.disclaimerBox}
        >
          <View style={styles.sectionHeader}>
            <AlertCircle size={18} color={colors.warning} />
            <Text style={styles.disclaimerTitle}>Medical Disclaimer</Text>
          </View>
          <Text style={styles.disclaimerText}>
            This app provides general nutrition and wellness information for educational
            purposes only and is not a substitute for professional medical advice,
            diagnosis, or treatment. Always seek the advice of your physician or
            other qualified health provider with any questions regarding a medical
            condition, diet, or treatment decisions. Never disregard professional
            medical advice or delay seeking it because of something you have read
            in this app. If you think you may have a medical emergency, call your
            doctor or local emergency number immediately.
          </Text>
        </View>

        <View
          testID="app-concept-credits"
          accessibilityLabel="App concept credits"
          style={styles.creditsBox}
        >
          <View style={styles.sectionHeader}>
            <Shield size={18} color={colors.primary} />
            <Text style={styles.creditsTitle}>App Concept Developed by</Text>
          </View>
          <Text style={styles.creditsText}>Dr. Anil Pokhrel, MD, DM{"\n"}Consultant Nephrologist{"\n\n"}Sajana Pokharel{"\n"}Dietician</Text>
          <View style={styles.contactRow} accessibilityLabel="Contact for app concept development" testID="app-concept-contact">
            <Phone size={16} color={colors.primary} />
            <TouchableOpacity
              onPress={async () => {
                try {
                  const phone = "+9779840050269";
                  const url = `tel:${phone}`;
                  await Promise.resolve(Linking.openURL(url));
                } catch (e) {
                  console.log("Phone link error", e);
                }
              }}
              style={styles.phoneButton}
            >
              <Text style={styles.contactText}>Contact: +977 9840050269</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    color: colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.text,
    borderRadius: 20,
  },
  adminButtonText: {
    color: colors.white,
    fontWeight: '600' as const,
    fontSize: 12,
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.primary,
    borderRadius: 20,
  },
  editButtonText: {
    color: colors.white,
    fontWeight: '600' as const,
    fontSize: 14,
  },
  section: {
    backgroundColor: colors.white,
    marginTop: 10,
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: colors.text,
  },
  field: {
    marginBottom: 15,
  },
  switchField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 5,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
  },
  inputDisabled: {
    opacity: 0.7,
  },
  limitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  limitItem: {
    width: '48%',
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
  },
  limitLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  limitValue: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: colors.text,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.warningLight,
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
  },
  disclaimerBox: {
    backgroundColor: colors.background,
    borderRadius: 10,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  disclaimerTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.text,
  },
  disclaimerText: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: colors.text,
    lineHeight: 18,
  },
  resetButton: {
    margin: 20,
    padding: 15,
    backgroundColor: colors.danger,
    borderRadius: 10,
    alignItems: 'center',
  },
  resetButtonText: {
    color: colors.white,
    fontWeight: '600' as const,
    fontSize: 16,
  },
  creditsBox: {
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  creditsTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.text,
  },
  creditsText: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
  },
  phoneButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: colors.background,
    borderRadius: 6,
  },
  contactText: {
    fontSize: 13,
    color: colors.text,
  },
  shareContainer: {
    gap: 15,
  },
  shareDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  shareButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600' as const,
  },
});