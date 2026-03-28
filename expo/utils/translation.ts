import { translations } from '@/data/translations';

type Language = 'en' | 'ne';

// AI-powered translation cache
const translationCache = new Map<string, string>();

// Generate cache key for translation
const getCacheKey = (text: string, targetLang: Language): string => {
  return `${text}|${targetLang}`;
};

// Medical terminology dictionary for better translations
const medicalTerms: Record<string, string> = {
  // Kidney health terms
  'chronic kidney disease': 'दीर्घकालीन मृगौला रोग',
  'dialysis': 'डायलिसिस',
  'hemodialysis': 'हेमोडायलिसिस',
  'peritoneal dialysis': 'पेरिटोनियल डायलिसिस',
  'kidney function': 'मृगौला कार्य',
  'renal diet': 'मृगौला आहार',
  'nephrology': 'मृगौला विज्ञान',
  'nephrologist': 'मृगौला विशेषज्ञ',
  'kidney transplant': 'मृगौला प्रत्यारोपण',
  'end stage renal disease': 'अन्तिम चरणको मृगौला रोग',
  'glomerular filtration rate': 'ग्लोमेरुलर फिल्ट्रेशन दर',
  'creatinine': 'क्रिएटिनिन',
  'urea': 'युरिया',
  'blood urea nitrogen': 'रगत युरिया नाइट्रोजन',
  
  // Nutrients
  'potassium': 'पोटासियम',
  'phosphorus': 'फस्फोरस',
  'sodium': 'सोडियम',
  'protein': 'प्रोटिन',
  'calcium': 'क्याल्सियम',
  'iron': 'फलाम',
  'vitamin d': 'भिटामिन डी',
  'vitamin b12': 'भिटामिन बी१२',
  'folic acid': 'फोलिक एसिड',
  'magnesium': 'म्याग्नेसियम',
  'zinc': 'जिंक',
  'fiber': 'फाइबर',
  'carbohydrates': 'कार्बोहाइड्रेट',
  'calories': 'क्यालोरी',
  'fluid': 'तरल पदार्थ',
  
  // Medical conditions
  'hyperkalemia': 'हाइपरकालेमिया',
  'hyperphosphatemia': 'हाइपरफस्फेटेमिया',
  'hypertension': 'उच्च रक्तचाप',
  'diabetes': 'मधुमेह',
  'anemia': 'रक्तअल्पता',
  'bone disease': 'हड्डी रोग',
  'cardiovascular disease': 'हृदय रोग',
  'edema': 'सुन्निने',
  'fluid overload': 'अतिरिक्त तरल पदार्थ',
  'mineral bone disorder': 'खनिज हड्डी विकार',
  
  // Food preparation
  'leaching': 'लीचिङ',
  'double boiling': 'दोहोरो उमाल्ने',
  'portion control': 'भाग नियन्त्रण',
  'food restriction': 'खाना प्रतिबन्ध',
  'dietary modification': 'आहार परिमार्जन',
  'cooking method': 'पकाउने तरिका',
  'preparation technique': 'तयारी प्रविधि',
  
  // Safety levels
  'safe': 'सुरक्षित',
  'caution': 'सावधानी',
  'avoid': 'बच्नुहोस्',
  'limit': 'सीमित गर्नुहोस्',
  'restrict': 'प्रतिबन्ध गर्नुहोस्',
  'moderate': 'मध्यम',
  'high risk': 'उच्च जोखिम',
  'low risk': 'कम जोखिम',
  
  // Common phrases
  'consult your doctor': 'आफ्नो डाक्टरसँग सल्लाह गर्नुहोस्',
  'follow medical advice': 'चिकित्सा सल्लाह पालना गर्नुहोस्',
  'monitor intake': 'सेवन निगरानी गर्नुहोस्',
  'reduce portion size': 'भागको आकार घटाउनुहोस्',
  'increase water intake': 'पानीको सेवन बढाउनुहोस्',
  'limit fluid intake': 'तरल पदार्थको सेवन सीमित गर्नुहोस्'
};

// Enhanced translation function with medical terminology
export const translateText = async (text: string, targetLang: Language): Promise<string> => {
  if (!text || text.trim() === '') return text;
  
  // Return original if target language is English
  if (targetLang === 'en') return text;
  
  const cacheKey = getCacheKey(text, targetLang);
  
  // Check cache first
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }
  
  // First, try to replace known medical terms
  let processedText = text.toLowerCase();
  let translatedText = text;
  
  for (const [english, nepali] of Object.entries(medicalTerms)) {
    const regex = new RegExp(`\\b${english}\\b`, 'gi');
    if (processedText.includes(english.toLowerCase())) {
      translatedText = translatedText.replace(regex, nepali);
    }
  }
  
  // If significant translation occurred, cache and return
  if (translatedText !== text) {
    translationCache.set(cacheKey, translatedText);
    return translatedText;
  }
  
  // Otherwise, use AI translation with enhanced medical context
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
            content: `You are a professional medical translator specializing in kidney health, dialysis, and nutrition for Nepali patients. 
            
Translate the following text from English to Nepali with these guidelines:
            1. Use proper medical terminology in Nepali
            2. Maintain cultural sensitivity for Nepali food habits
            3. Keep medical accuracy paramount
            4. Use simple, clear language that patients can understand
            5. Preserve any specific measurements or numbers
            6. For food names, use common Nepali names when available
            
Only return the translated text, nothing else.`
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
    translatedText = data.completion.trim();
    
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