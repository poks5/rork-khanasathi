import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { UserProfile, DailyLimits, LabValue, MedicalCondition, Medication, DietaryRestriction } from '@/types/user';

const defaultLimits: DailyLimits = {
  potassium: 2000,
  phosphorus: 1000,
  sodium: 2000,
  protein: 60,
  calories: 2000,
  fluid: 1500,
};

const defaultProfile: UserProfile = {
  name: '',
  age: 0,
  weight: 0,
  height: 0,
  gender: 'male',
  activityLevel: 'light',
  isOnDialysis: true,
  dialysisType: 'hemodialysis',
  dialysisFrequency: 3,
  dailyLimits: defaultLimits,
  medicalConditions: [],
  medications: [],
  dietaryRestrictions: [],
  labValues: [],
};

export const [UserProfileProvider, useUserProfile] = createContextHook(() => {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const stored = await AsyncStorage.getItem('userProfile');
      if (stored) {
        setProfile(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (newProfile: UserProfile) => {
    setProfile(newProfile);
    try {
      await AsyncStorage.setItem('userProfile', JSON.stringify(newProfile));
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const resetProfile = async () => {
    setProfile(defaultProfile);
    try {
      await AsyncStorage.removeItem('userProfile');
    } catch (error) {
      console.error('Error resetting profile:', error);
    }
  };

  return {
    profile,
    updateProfile,
    resetProfile,
    isLoading,
  };
});