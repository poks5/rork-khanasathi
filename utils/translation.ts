import { translations } from '@/data/translations';

type Language = 'en' | 'ne';

// AI-powered translation cache
const translationCache = new Map<string, string>();

// Generate cache key for translation
const getCacheKey = (text: string, targetLang: Language): string => {
  return `${text}|${targetLang}`;
};

// AI translation function
export const translateText = async (text: string, targetLang: Language): Promise<string> => {
  if (!text || text.trim() === '') return text;
  
  // Return original if target language is English
  if (targetLang === 'en') return text;
  
  const cacheKey = getCacheKey(text, targetLang);
  
  // Check cache first
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }
  
  try {
    const response = await fetch('https://toolkit.rork.com/text/llm/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: `You are a professional medical translator specializing in kidney health and nutrition. Translate the following text from English to Nepali. Maintain medical accuracy and cultural appropriateness. Only return the translated text, nothing else.`
          },
          {
            role: 'user',
            content: text
          }
        ]
      })
    });
    
    if (!response.ok) {
      throw new Error('Translation failed');
    }
    
    const data = await response.json();
    const translatedText = data.completion.trim();
    
    // Cache the translation
    translationCache.set(cacheKey, translatedText);
    
    return translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    // Return original text if translation fails
    return text;
  }
};

// Batch translation function for multiple texts
export const translateTexts = async (texts: string[], targetLang: Language): Promise<string[]> => {
  if (targetLang === 'en') return texts;
  
  const results: string[] = [];
  const uncachedTexts: { index: number; text: string }[] = [];
  
  // Check cache for each text
  texts.forEach((text, index) => {
    const cacheKey = getCacheKey(text, targetLang);
    if (translationCache.has(cacheKey)) {
      results[index] = translationCache.get(cacheKey)!;
    } else {
      uncachedTexts.push({ index, text });
      results[index] = text; // fallback
    }
  });
  
  // Translate uncached texts in batch
  if (uncachedTexts.length > 0) {
    try {
      const batchText = uncachedTexts.map(item => `${item.index}: ${item.text}`).join('\n');
      
      const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: `You are a professional medical translator specializing in kidney health and nutrition. Translate the following numbered texts from English to Nepali. Maintain medical accuracy and cultural appropriateness. Return each translation on a new line with the same number format (e.g., "0: translated text").`
            },
            {
              role: 'user',
              content: batchText
            }
          ]
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        const translations = data.completion.trim().split('\n');
        
        translations.forEach((line: string) => {
          const match = line.match(/^(\d+):\s*(.+)$/);
          if (match) {
            const index = parseInt(match[1]);
            const translation = match[2].trim();
            const originalItem = uncachedTexts.find(item => item.index === index);
            
            if (originalItem) {
              results[index] = translation;
              // Cache the translation
              const cacheKey = getCacheKey(originalItem.text, targetLang);
              translationCache.set(cacheKey, translation);
            }
          }
        });
      }
    } catch (error) {
      console.error('Batch translation error:', error);
    }
  }
  
  return results;
};

// Enhanced translation hook
export const useTranslation = (language: Language) => {
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];

    for (const k of keys) {
      value = value?.[k];
    }

    return (value as string) || key;
  };
  
  const translateDynamic = async (text: string): Promise<string> => {
    return translateText(text, language);
  };
  
  const translateDynamicBatch = async (texts: string[]): Promise<string[]> => {
    return translateTexts(texts, language);
  };
  
  return {
    t,
    translateDynamic,
    translateDynamicBatch,
    language
  };
};

// Clear translation cache (useful for memory management)
export const clearTranslationCache = (): void => {
  translationCache.clear();
};

// Get cache size (for debugging)
export const getTranslationCacheSize = (): number => {
  return translationCache.size;
};