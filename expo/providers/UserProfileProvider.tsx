import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { UserProfile, DailyLimits } from '@/types/user';
import { asyncStorageBatch, measureAsyncPerformance } from '@/utils/performance';

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

  const loadProfile = useCallback(async () => {
    try {
      await measureAsyncPerformance('loadUserProfile', async () => {
        const stored = await AsyncStorage.getItem('userProfile');
        if (stored) {
          setProfile(JSON.parse(stored));
        }
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const updateProfile = useCallback(async (newProfile: UserProfile) => {
    setProfile(newProfile);
    
    // Use batched AsyncStorage operation for better performance
    asyncStorageBatch.add(async () => {
      await measureAsyncPerformance('saveUserProfile', async () => {
        await AsyncStorage.setItem('userProfile', JSON.stringify(newProfile));
      });
    });
  }, []);

  const resetProfile = useCallback(async () => {
    setProfile(defaultProfile);
    
    asyncStorageBatch.add(async () => {
      await measureAsyncPerformance('resetUserProfile', async () => {
        await AsyncStorage.removeItem('userProfile');
      });
    });
  }, []);

  return useMemo(() => ({
    profile,
    updateProfile,
    resetProfile,
    isLoading,
  }), [profile, updateProfile, resetProfile, isLoading]);
});