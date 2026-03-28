import { useCallback, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { translations } from '@/data/translations';
import { asyncStorageBatch, measureAsyncPerformance } from '@/utils/performance';

type Language = 'en' | 'ne';

export const [LanguageProvider, useLanguage] = createContextHook(() => {
  const [language, setLanguage] = useState<Language>('en');
  const [isLoading, setIsLoading] = useState(true);

  const loadLanguage = useCallback(async () => {
    try {
      await measureAsyncPerformance('loadLanguage', async () => {
        const stored = await AsyncStorage.getItem('language');
        if (stored) {
          setLanguage(stored as Language);
        }
      });
    } catch (error) {
      console.error('Error loading language:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLanguage();
  }, [loadLanguage]);

  const toggleLanguage = useCallback(async () => {
    const newLang: Language = language === 'en' ? 'ne' : 'en';
    setLanguage(newLang);
    
    asyncStorageBatch.add(async () => {
      await measureAsyncPerformance('saveLanguage', async () => {
        await AsyncStorage.setItem('language', newLang);
      });
    });
  }, [language]);

  const t = useCallback((key: string): string => {
    const keys = key.split('.');

    const resolve = (lang: Language) => {
      let value: any = translations[lang as keyof typeof translations];
      for (const k of keys) {
        value = value?.[k];
      }
      return value as string | undefined;
    };

    const val = resolve(language) ?? resolve('en');
    return val ?? key;
  }, [language]);

  const value = useMemo(() => ({
    language,
    toggleLanguage,
    t,
    isLoading,
  }), [language, toggleLanguage, t, isLoading]);

  return value;
});