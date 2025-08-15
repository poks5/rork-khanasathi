import React, { useState, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { FoodLogEntry, NutrientIntake, NutritionRecommendation, RecommendationCategory } from '@/types/food';
import { useUserProfile } from './UserProfileProvider';
import { getFoodById } from '@/data/foodDatabase';

export const [NutritionProvider, useNutrition] = createContextHook(() => {
  const { profile } = useUserProfile();
  const [foodLog, setFoodLog] = useState<FoodLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFoodLog();
  }, []);

  const loadFoodLog = async () => {
    try {
      const stored = await AsyncStorage.getItem('foodLog');
      if (stored) {
        setFoodLog(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading food log:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveFoodLog = async (log: FoodLogEntry[]) => {
    try {
      await AsyncStorage.setItem('foodLog', JSON.stringify(log));
    } catch (error) {
      console.error('Error saving food log:', error);
    }
  };

  const todayIntake = useMemo((): NutrientIntake => {
    const today = new Date().toDateString();
    const todayEntries = foodLog.filter(
      entry => new Date(entry.timestamp).toDateString() === today
    );

    return todayEntries.reduce(
      (acc, entry) => ({
        calories: acc.calories + entry.nutrients.calories,
        protein: acc.protein + entry.nutrients.protein,
        carbohydrates: acc.carbohydrates + (entry.nutrients.carbohydrates || 0),
        fat: acc.fat + (entry.nutrients.fat || 0),
        fiber: acc.fiber + (entry.nutrients.fiber || 0),
        potassium: acc.potassium + entry.nutrients.potassium,
        phosphorus: acc.phosphorus + entry.nutrients.phosphorus,
        sodium: acc.sodium + entry.nutrients.sodium,
        calcium: acc.calcium + (entry.nutrients.calcium || 0),
        fluid: acc.fluid + entry.nutrients.fluid,
        iron: acc.iron + (entry.nutrients.iron || 0),
        zinc: acc.zinc + (entry.nutrients.zinc || 0),
      }),
      {
        calories: 0,
        protein: 0,
        carbohydrates: 0,
        fat: 0,
        fiber: 0,
        potassium: 0,
        phosphorus: 0,
        sodium: 0,
        calcium: 0,
        fluid: 0,
        iron: 0,
        zinc: 0,
      }
    );
  }, [foodLog]);

  const addToLog = (entry: Omit<FoodLogEntry, 'id' | 'timestamp'>) => {
    const newEntry: FoodLogEntry = {
      ...entry,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    const updatedLog = [...foodLog, newEntry];
    setFoodLog(updatedLog);
    saveFoodLog(updatedLog);
  };

  const removeFromLog = (id: string) => {
    const updatedLog = foodLog.filter(entry => entry.id !== id);
    setFoodLog(updatedLog);
    saveFoodLog(updatedLog);
  };

  const clearLog = async () => {
    setFoodLog([]);
    try {
      await AsyncStorage.removeItem('foodLog');
    } catch (error) {
      console.error('Error clearing food log:', error);
    }
  };

  // Generate recommendations based on user profile and food log
  const recommendations = useMemo(() => {
    if (isLoading || !profile) return [];
    
    const recommendations: NutritionRecommendation[] = [];
    
    // Check potassium levels
    if (todayIntake.potassium > profile.dailyLimits.potassium * 0.8) {
      recommendations.push({
        id: 'high-potassium',
        category: 'mineral-management',
        title: {
          en: 'High Potassium Alert',
          ne: 'उच्च पोटासियम सतर्कता'
        },
        description: {
          en: 'Your potassium intake is approaching your daily limit. Consider low-potassium alternatives.',
          ne: 'तपाईंको पोटासियम सेवन दैनिक सीमा नजिक पुग्दैछ। कम पोटासियम भएका विकल्पहरू खानुहोस्।'
        },
        priority: 'high',
        suggestedFoods: ['apple', 'cucumber', 'cabbage', 'egg-white'],
        avoidFoods: ['banana', 'potato', 'spinach', 'dal-masoor'],
        educationalContent: [{
          en: 'High potassium can cause irregular heartbeat and muscle weakness.',
          ne: 'उच्च पोटासियमले मुटुको धड्कन अनियमित र मांसपेशी कमजोरी गराउन सक्छ।'
        }],
        cookingTips: [{
          en: 'Soak vegetables in water for 2 hours, then boil in fresh water to reduce potassium.',
          ne: 'तरकारीहरू २ घण्टा पानीमा भिजाएर, त्यसपछि ताजा पानीमा उमाल्नुहोस् पोटासियम कम गर्न।'
        }]
      });
    }
    
    // Check phosphorus levels
    if (todayIntake.phosphorus > profile.dailyLimits.phosphorus * 0.8) {
      recommendations.push({
        id: 'high-phosphorus',
        category: 'mineral-management',
        title: {
          en: 'High Phosphorus Alert',
          ne: 'उच्च फस्फोरस सतर्कता'
        },
        description: {
          en: 'Your phosphorus intake is approaching your daily limit. Consider low-phosphorus alternatives.',
          ne: 'तपाईंको फस्फोरस सेवन दैनिक सीमा नजिक पुग्दैछ। कम फस्फोरस भएका विकल्पहरू खानुहोस्।'
        },
        priority: 'high',
        suggestedFoods: ['egg-white', 'almond-milk', 'rice-white'],
        avoidFoods: ['dal-masoor', 'dal-chana', 'milk-whole'],
        educationalContent: [{
          en: 'High phosphorus can weaken bones and cause itchy skin.',
          ne: 'उच्च फस्फोरसले हड्डी कमजोर बनाउन र छाला चिलाउन सक्छ।'
        }]
      });
    }
    
    // Check fluid intake
    if (todayIntake.fluid > profile.dailyLimits.fluid * 0.9) {
      recommendations.push({
        id: 'high-fluid',
        category: 'fluid-balance',
        title: {
          en: 'Fluid Intake Alert',
          ne: 'तरल पदार्थ सेवन सतर्कता'
        },
        description: {
          en: 'You are close to your fluid limit for today. Restrict further fluid intake.',
          ne: 'तपाईं आजको तरल पदार्थ सीमा नजिक हुनुहुन्छ। थप तरल पदार्थ सेवन सीमित गर्नुहोस्।'
        },
        priority: 'high',
        educationalContent: [{
          en: 'Excess fluid can cause swelling, high blood pressure, and breathing problems.',
          ne: 'अत्यधिक तरल पदार्थले सुन्निने, उच्च रक्तचाप, र श्वासप्रश्वासमा समस्या ल्याउन सक्छ।'
        }]
      });
    }
    
    // Check protein intake
    if (todayIntake.protein < profile.dailyLimits.protein * 0.5) {
      recommendations.push({
        id: 'low-protein',
        category: 'protein-optimization',
        title: {
          en: 'Low Protein Intake',
          ne: 'कम प्रोटिन सेवन'
        },
        description: {
          en: 'Your protein intake is below recommended levels. Consider adding quality protein sources.',
          ne: 'तपाईंको प्रोटिन सेवन सिफारिस गरिएको स्तर भन्दा कम छ। गुणस्तरीय प्रोटिन स्रोतहरू थप्नुहोस्।'
        },
        priority: 'medium',
        suggestedFoods: ['egg-white', 'chicken-breast', 'fish-salmon'],
        educationalContent: [{
          en: 'Adequate protein is essential for maintaining muscle mass and overall health.',
          ne: 'पर्याप्त प्रोटिन मांसपेशी मास र समग्र स्वास्थ्य कायम राख्न आवश्यक छ।'
        }]
      });
    }
    
    // Add more recommendations based on lab values if available
    if (profile.labValues && profile.labValues.length > 0) {
      // Check for anemia
      const hemoglobin = profile.labValues.find(lab => lab.name === 'hemoglobin');
      if (hemoglobin && hemoglobin.value < 11) {
        recommendations.push({
          id: 'anemia-management',
          category: 'anemia-management',
          title: {
            en: 'Anemia Management',
            ne: 'रक्तअल्पता व्यवस्थापन'
          },
          description: {
            en: `Your hemoglobin level is ${hemoglobin.value} g/dL, which indicates anemia. Focus on iron-rich foods.`,
            ne: `तपाईंको हिमोग्लोबिन स्तर ${hemoglobin.value} g/dL छ, जसले रक्तअल्पता संकेत गर्छ। फलामयुक्त खानेकुरामा ध्यान दिनुहोस्।`
          },
          priority: 'high',
          basedOn: ['hemoglobin'],
          suggestedFoods: ['spinach', 'egg-whole'],
          educationalContent: [{
            en: 'Iron supplements should be taken separately from phosphate binders.',
            ne: 'फलाम पूरकहरू फस्फेट बाइन्डरहरूबाट अलग लिनुपर्छ।'
          }]
        });
      }
      
      // Check for bone health
      const calcium = profile.labValues.find(lab => lab.name === 'calcium');
      const vitaminD = profile.labValues.find(lab => lab.name === 'vitamin_d');
      if ((calcium && calcium.value < 8.5) || (vitaminD && vitaminD.value < 20)) {
        recommendations.push({
          id: 'bone-health',
          category: 'bone-health',
          title: {
            en: 'Bone Health Alert',
            ne: 'हड्डी स्वास्थ्य सतर्कता'
          },
          description: {
            en: 'Your lab values indicate risk for bone disease. Discuss vitamin D supplements with your doctor.',
            ne: 'तपाईंको ल्याब मानहरूले हड्डी रोगको जोखिम संकेत गर्छन्। आफ्नो डाक्टरसँग भिटामिन डी पूरकहरू बारे छलफल गर्नुहोस्।'
          },
          priority: 'medium',
          basedOn: ['calcium', 'vitamin_d'],
          educationalContent: [{
            en: 'Vitamin D helps your body absorb calcium properly.',
            ne: 'भिटामिन डीले तपाईंको शरीरलाई क्याल्सियम ठीकसँग सोस्न मद्दत गर्छ।'
          }]
        });
      }
    }

    // Hyperkalemia (High Potassium) Management – 4 tips
    recommendations.push(
      {
        id: 'low-potassium-nepali-staples',
        category: 'mineral-management',
        title: {
          en: 'Low-Potassium Nepali Staples',
          ne: 'कम पोटासियम नेपाली मुख्य भोजन'
        },
        description: {
          en: 'Choose refined grains like white rice, refined flour products, and white bread over whole grains to lower potassium.',
          ne: 'समग्र अन्नको सट्टा सेतो चामल, मैदा र सेतो रोटीजस्ता परिष्कृत अन्न रोज्नुहोस् पोटासियम कम गर्न।'
        },
        priority: 'high',
        suggestedFoods: ['rice-white', 'white-bread'],
        avoidFoods: ['rice-brown', 'dal-masoor', 'dal-chana', 'almonds'],
        educationalContent: [{
          en: 'KDOQI 2020: Refined grains generally have less potassium than whole grains.',
          ne: 'KDOQI 2020: परिष्कृत अन्नमा समग्र अन्न भन्दा कम पोटासियम हुन्छ।'
        }]
      },
      {
        id: 'double-boiling-technique',
        category: 'mineral-management',
        title: {
          en: 'Double-Boiling Technique for Vegetables',
          ne: 'तरकारीका लागि दोहोरो उमाल्ने तरिका'
        },
        description: {
          en: 'Cut small, boil 3–5 minutes, drain fully, then boil again in fresh water to remove 30–50% potassium.',
          ne: 'सानो टुक्रा काटेर ३–५ मिनेट उमाल्नुहोस्, पानी पूरै फाल्नुहोस्, फेरि ताजा पानीमा उमाल्दा ३०–५०% पोटासियम कम हुन्छ।'
        },
        priority: 'high',
        suggestedFoods: ['cauliflower', 'cabbage', 'green-beans'],
        cookingTips: [
          { en: 'Always discard the first boiling water.', ne: 'पहिलो उमालेको पानी सधैं फाल्नुहोस्।' },
          { en: 'Cut vegetables into small pieces.', ne: 'तरकारीलाई साना टुक्रामा काट्नुहोस्।' },
          { en: 'Boil at least 2 times for best reduction.', ne: 'सर्वोत्तम नतिजाका लागि कम्तीमा २ पटक उमाल्नुहोस्।' }
        ],
        educationalContent: [{
          en: 'Renal Nutrition Guidelines: Double-boiling reduces potassium by up to 50%.',
          ne: 'किड्नी पोषण दिशानिर्देश: दोहोरो उमाल्दा पोटासियम ५०% सम्म घट्छ।'
        }]
      },
      {
        id: 'safe-fruits-high-potassium',
        category: 'mineral-management',
        title: {
          en: 'Safe Fruits when Potassium is High',
          ne: 'पोटासियम उच्च हुँदा सुरक्षित फलफूल'
        },
        description: {
          en: 'Prefer apples, pears, grapes, and berries. Limit to 1–2 servings daily. Avoid bananas, oranges, and melons.',
          ne: 'स्याउ, नासपाती, अंगुर र बेरी प्राथमिकता दिनुहोस्। दिनमा १–२ सर्भिङ मात्र। केरा, सुन्तला र खरबुजा नखानुहोस्।'
        },
        priority: 'high',
        suggestedFoods: ['apple', 'pear', 'grapes', 'berries-mixed'],
        avoidFoods: ['banana', 'orange', 'melon'],
        educationalContent: [{
          en: 'NKF Guidelines: Choose lower-potassium fruits and control portions.',
          ne: 'NKF मार्गदर्शन: कम पोटासियम भएका फलफूल रोज्नुहोस् र परिमाण नियन्त्रण गर्नुहोस्।'
        }]
      },
      {
        id: 'protein-low-potassium-sources',
        category: 'protein-optimization',
        title: {
          en: 'Protein Sources Low in Potassium',
          ne: 'कम पोटासियम प्रोटिन स्रोत'
        },
        description: {
          en: 'Egg whites, chicken breast, and select fish are renal-friendly choices. Limit red meat; avoid organ meats.',
          ne: 'अण्डाको सेतो भाग, कुखुराको छाती र केही माछा किड्नीमैत्री विकल्प हुन्। रातो मासु सीमित गर्नुहोस्; भुँडीजात नखानुहोस्।'
        },
        priority: 'medium',
        suggestedFoods: ['egg-white', 'chicken-breast', 'fish-salmon'],
        avoidFoods: ['almonds', 'dal-masoor', 'dal-chana', 'fish-cod'],
        educationalContent: [{
          en: 'Focus on high-quality protein with lower potassium per serving.',
          ne: 'प्रत्येक सर्भिङमा कम पोटासियम भएको उच्च गुणस्तरको प्रोटिन रोज्नुहोस्।'
        }]
      }
    );
    
    // Hyperphosphatemia (High Phosphorus) Management – 4 tips
    recommendations.push(
      {
        id: 'avoid-high-phosphorus-foods',
        category: 'mineral-management',
        title: {
          en: 'Avoiding High-Phosphorus Foods',
          ne: 'उच्च फस्फोरस भएका खानाहरूबाट बच्ने'
        },
        description: {
          en: 'Avoid organ meats, nuts, seeds, and dark colas. Limit dairy (milk, yogurt, cheese). Choose white bread over whole grain.',
          ne: 'भुँडीजात, बदाम/बीउ, र डार्क कोला नखानुहोस्। दूध, दही, चीज जस्ता डेरी सीमित गर्नुहोस्। पुरै अन्नको सट्टा सेतो रोटी रोज्नुहोस्।'
        },
        priority: 'high',
        suggestedFoods: ['white-bread', 'rice-white', 'egg-white', 'fish-salmon'],
        avoidFoods: ['liver', 'kidney', 'almonds', 'seeds-mixed', 'dark-soda', 'cheese-cottage'],
        educationalContent: [{
          en: 'KDIGO CKD-MBD: Lower dietary phosphorus by avoiding organ meats, nuts/seeds, and colas.',
          ne: 'KDIGO CKD-MBD: भुँडीजात, बदाम/बीउ र कोला नखाँदा फस्फोरस घट्छ।'
        }]
      },
      {
        id: 'phosphate-binder-timing',
        category: 'mineral-management',
        title: {
          en: 'Phosphate Binder Timing',
          ne: 'फस्फेट बाइन्डरको समय'
        },
        description: {
          en: 'Take phosphate binders with the first bite of every meal and snack containing protein. Do not skip with dal, meat, or dairy.',
          ne: 'प्रोटिन भएका प्रत्येक खाना/खाजासँग पहिलो कुम्लोमै फस्फेट बाइन्डर लिनुहोस्। दाल, मासु वा डेरीसँग कहिल्यै नछोड्नुहोस्।'
        },
        priority: 'high',
        educationalContent: [{
          en: 'KDOQI 2020: Binders are most effective when taken with meals containing phosphorus.',
          ne: 'KDOQI 2020: फस्फोरस भएका खानासँग बाइन्डर लिँदा बढी प्रभावकारी हुन्छ।'
        }]
      },
      {
        id: 'safe-nepali-protein-low-phos',
        category: 'protein-optimization',
        title: {
          en: 'Safe Nepali Protein Alternatives (Low Phosphorus)',
          ne: 'सुरक्षित नेपाली प्रोटिन विकल्प (कम फस्फोरस)'
        },
        description: {
          en: 'Choose egg whites over whole eggs, fish over red meat, and limit dal to 1/4 cup per meal. Soak dal overnight and discard water.',
          ne: 'पूरा अण्डाको सट्टा अण्डाको सेतो, रातो मासुको सट्टा माछा रोज्नुहोस्। प्रत्येक भोजनमा दाल १/४ कप मात्र। दाल रातभर भिजाएर पानी फाल्नुहोस्।'
        },
        priority: 'high',
        suggestedFoods: ['egg-white', 'fish-salmon', 'chicken-breast', 'dal-masoor'],
        avoidFoods: ['egg-whole', 'red-meat', 'dal-large-portions', 'almonds'],
        educationalContent: [{
          en: 'ISRNM: Emphasize high-quality protein with lower phosphorus load and preparation methods that reduce phosphorus.',
          ne: 'ISRNM: कम फस्फोरस लोड भएका उच्च गुणस्तरका प्रोटिन तथा फस्फोरस घटाउने तयारी विधिमा जोड दिनुहोस्।'
        }]
      },
      {
        id: 'reading-labels-phosphorus',
        category: 'mineral-management',
        title: {
          en: 'Reading Food Labels for Phosphorus',
          ne: 'फस्फोरसका लागि फुड लेबल पढ्ने'
        },
        description: {
          en: 'Avoid processed foods with phosphorus additives (phosphoric acid, sodium phosphate). Prefer fresh foods over packaged.',
          ne: 'फस्फोरस एडिटिभ (phosphoric acid, sodium phosphate) भएका प्रशोधित खानेकुरा नखानुहोस्। प्याकेटेड भन्दा ताजा खाना रोज्नुहोस्।'
        },
        priority: 'medium',
        avoidFoods: ['processed-meats', 'packaged-snacks', 'instant-noodles', 'soft-drinks'],
        educationalContent: [{
          en: 'Check ingredient lists for “phos-” additives; these are rapidly absorbed and raise serum phosphorus.',
          ne: 'सामग्री सूचीमा “phos-” भएका एडिटिभ जाँच्नुहोस्; यिनीहरू छिटो सोसिन्छन् र फस्फोरस बढाउँछन्।'
        }]
      }
    );

    return recommendations;
  }, [profile, todayIntake, isLoading]);

  return {
    foodLog,
    todayIntake,
    dailyLimits: profile.dailyLimits,
    recommendations,
    addToLog,
    removeFromLog,
    clearLog,
    isLoading,
  };
});