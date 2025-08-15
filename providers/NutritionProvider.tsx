import { useState, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { FoodLogEntry, NutrientIntake, NutritionRecommendation } from '@/types/food';
import { UserProfile, DailyLimits } from '@/types/user';
import { useInsights } from '@/providers/InsightsProvider';

const defaultLimits: DailyLimits = {
  potassium: 2000,
  phosphorus: 1000,
  sodium: 2000,
  protein: 60,
  calories: 2000,
  fluid: 1500,
};

export const [NutritionProvider, useNutrition] = createContextHook(() => {
  const [foodLog, setFoodLog] = useState<FoodLogEntry[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get insights recommendations if available
  let insightRecommendations: NutritionRecommendation[] = [];
  try {
    const insights = useInsights();
    insightRecommendations = insights.convertToNutritionRecommendations();
  } catch {
    // InsightsProvider might not be available in all contexts
    console.log('InsightsProvider not available in this context');
  }

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [storedLog, storedProfile] = await Promise.all([
        AsyncStorage.getItem('foodLog'),
        AsyncStorage.getItem('userProfile')
      ]);
      
      if (storedLog) {
        setFoodLog(JSON.parse(storedLog));
      }
      
      if (storedProfile) {
        setProfile(JSON.parse(storedProfile));
      }
    } catch (error) {
      console.error('Error loading data:', error);
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

  const addToLog = useCallback((entry: Omit<FoodLogEntry, 'id' | 'timestamp'>) => {
    const newEntry: FoodLogEntry = {
      ...entry,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    const updatedLog = [...foodLog, newEntry];
    setFoodLog(updatedLog);
    saveFoodLog(updatedLog);
  }, [foodLog]);

  const removeFromLog = useCallback((id: string) => {
    const updatedLog = foodLog.filter(entry => entry.id !== id);
    setFoodLog(updatedLog);
    saveFoodLog(updatedLog);
  }, [foodLog]);

  const clearLog = useCallback(async () => {
    setFoodLog([]);
    try {
      await AsyncStorage.removeItem('foodLog');
    } catch (error) {
      console.error('Error clearing food log:', error);
    }
  }, []);

  // Extract lab values for stable dependencies
  const hemoglobinValue = useMemo(() => profile?.labValues?.find(lab => lab.name === 'hemoglobin')?.value, [profile?.labValues]);
  const calciumValue = useMemo(() => profile?.labValues?.find(lab => lab.name === 'calcium')?.value, [profile?.labValues]);
  const vitaminDValue = useMemo(() => profile?.labValues?.find(lab => lab.name === 'vitamin_d')?.value, [profile?.labValues]);

  // Generate recommendations based on user profile and food log
  const recommendations = useMemo(() => {
    if (isLoading) return [];
    
    const currentProfile = profile || {
      dailyLimits: defaultLimits,
      labValues: []
    };
    
    const dynamicRecommendations: NutritionRecommendation[] = [];
    
    // Check potassium levels
    if (todayIntake.potassium > currentProfile.dailyLimits.potassium * 0.8) {
      dynamicRecommendations.push({
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
    if (todayIntake.phosphorus > currentProfile.dailyLimits.phosphorus * 0.8) {
      dynamicRecommendations.push({
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
    if (todayIntake.fluid > currentProfile.dailyLimits.fluid * 0.9) {
      dynamicRecommendations.push({
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
    if (todayIntake.protein < currentProfile.dailyLimits.protein * 0.5) {
      dynamicRecommendations.push({
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
    if (currentProfile.labValues && currentProfile.labValues.length > 0) {
      // Check for anemia
      const hemoglobin = currentProfile.labValues.find(lab => lab.name === 'hemoglobin');
      if (hemoglobin && hemoglobin.value < 11) {
        dynamicRecommendations.push({
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
      const calcium = currentProfile.labValues.find(lab => lab.name === 'calcium');
      const vitaminD = currentProfile.labValues.find(lab => lab.name === 'vitamin_d');
      if ((calcium && calcium.value < 8.5) || (vitaminD && vitaminD.value < 20)) {
        dynamicRecommendations.push({
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

    // Static recommendations that don't change based on intake
    const staticRecommendations: NutritionRecommendation[] = [
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
    ,
    // Hyperphosphatemia (High Phosphorus) Management – 4 tips
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
    ,
    // Fluid Overload Management – 4 tips
      {
        id: 'hidden-fluid-sources',
        category: 'fluid-balance',
        title: {
          en: 'Hidden Fluid Sources to Avoid',
          ne: 'लुकेका तरल स्रोतहरूबाट जोगिनुहोस्'
        },
        description: {
          en: 'Avoid soups, watery dal, juicy fruits, ice cream, yogurt drinks, and fruit juices. These add significant fluid.',
          ne: 'सूप, पानी धेरै भएको दाल, रसिला फलफूल, आइसक्रिम, दहीका पेय, र जुसबाट बच्नुहोस्। यीले धेरै तरल थप्छन्।'
        },
        priority: 'high',
        avoidFoods: ['soups', 'dal-masoor', 'watermelon', 'ice-cream', 'lassi', 'fruit-juices', 'milk-whole', 'yogurt-plain']
      },
      {
        id: 'dry-snack-alternatives',
        category: 'fluid-balance',
        title: {
          en: 'Dry Snack Alternatives',
          ne: 'सुक्खा खाजाका विकल्प'
        },
        description: {
          en: 'Choose plain biscuits, roasted rice (भुजा), and small amounts of dry foods to reduce fluid intake.',
          ne: 'सादा बिस्कुट, भुजा, र थोरै सुक्खा खाद्य पदार्थ रोज्नुहोस् ताकि तरल सेवन कम होस्।'
        },
        priority: 'medium',
        suggestedFoods: ['plain-biscuits', 'roasted-rice-bhuja', 'dry-bread', 'rice-cakes', 'white-bread'],
        educationalContent: [{
          en: 'Fluid Restriction Guidelines: Prefer low-moisture foods to control daily fluid allowance.',
          ne: 'तरल नियन्त्रण दिशानिर्देश: दैनिक तरल सीमालाई नियन्त्रण गर्न कम चिस्यान भएका खाद्य पदार्थ प्राथमिकता दिनुहोस्।'
        }]
      },
      {
        id: 'thirst-management-techniques',
        category: 'fluid-balance',
        title: {
          en: 'Thirst Management Techniques',
          ne: 'तिर्खा व्यवस्थापन गर्ने तरिका'
        },
        description: {
          en: 'Use ice chips, sugar-free gum, or lemon wedges. Rinse your mouth without swallowing and track all fluid intake.',
          ne: 'आइस चिप्स, सुगर-फ्रि गम, वा कागतीका साना टुक्रा प्रयोग गर्नुहोस्। ननिगाली मुख कुल्ला गर्नुहोस् र सबै तरल सेवन ट्र्याक गर्नुहोस्।'
        },
        priority: 'high',
        educationalContent: [{
          en: 'Patient Education Materials: Spacing sips and using oral care can reduce thirst sensation.',
          ne: 'रोगी शिक्षा सामग्री: साना साना घुट्का र मुखको हेरचाहले तिर्खा कम महसुस हुन्छ।'
        }]
      },
      {
        id: 'cooking-methods-reduce-fluid',
        category: 'fluid-balance',
        title: {
          en: 'Cooking Methods to Reduce Fluid',
          ne: 'तरल कम गर्ने पकाउने तरिका'
        },
        description: {
          en: 'Steam vegetables, grill or roast meats, make thick dal, and drain excess liquid from cooked foods.',
          ne: 'तरकारी भापमा पकाउनुहोस्, मासु ग्रिल/रोस्ट गर्नुहोस्, बाक्लो दाल बनाउनुहोस्, र पकाएको खाना बाट अतिरिक्त तरल फाल्नुहोस्।'
        },
        priority: 'medium',
        cookingTips: [
          { en: 'Steam instead of boil when possible.', ne: 'सम्भव भए उमाल्ने सट्टा भापमा पकाउनुहोस्।' },
          { en: 'Reduce added water and simmer to desired thickness.', ne: 'थपिएको पानी कम गर्नुहोस् र आवश्यक बाक्लोपनासम्म सिमर गर्नुहोस्।' }
        ]
      }
    ,
    // Achar Safety: Pickle Use in CKD & Dialysis Patients – 5 tips
      {
        id: 'achar-safe-daily-use',
        category: 'mineral-management',
        title: {
          en: 'Safe Achar Choices for Daily Use',
          ne: 'दैनिक प्रयोगका लागि सुरक्षित अचार विकल्प'
        },
        description: {
          en: 'Choose fresh herb-based achars like coriander and mint made with minimal salt. Limit portions to 1–2 teaspoons per meal.',
          ne: 'धनिया, पुदिनाजस्ता जडीबुटीबाट बनेका अचार कम नुनमा तयार गरी रोज्नुहोस्। प्रत्येक भोजनमा १–२ चम्चा मात्र।'
        },
        priority: 'high',
        suggestedFoods: ['coriander', 'turmeric', 'achar-mixed'],
        avoidFoods: ['gundruk'],
        cookingTips: [
          { en: 'Use minimal salt when preparing achars.', ne: 'अचार बनाउन नुन कम प्रयोग गर्नुहोस्।' },
          { en: 'Prefer fresh (non‑fermented) preparations.', ne: 'ताजा (अफर्मेन्टेड) अचार प्राथमिकता दिनुहोस्।' },
          { en: 'Limit to 1 tsp per meal.', ne: 'प्रत्येक भोजनमा १ चम्चा सीमित गर्नुहोस्।' },
          { en: 'Rinse high‑sodium commercial pickles before eating.', ne: 'उच्च नुन भएका वाणिज्यिक अचार खानुअघि पानीले धुनुहोस्।' }
        ],
        educationalContent: [
          { en: 'Renal Nutrition Guidelines 2021: Prefer low‑sodium, fresh herb condiments.', ne: 'Renal Nutrition Guidelines 2021: कम नुन र ताजा जडीबुटीका अचार प्राथमिकता दिनुहोस्।' }
        ]
      },
      {
        id: 'achar-high-risk-avoid',
        category: 'mineral-management',
        title: {
          en: 'High‑Risk Achars to Completely Avoid',
          ne: 'पुरै बच्नुपर्ने उच्च जोखिम अचार'
        },
        description: {
          en: 'Avoid tomato achar, potato pickle, and gundruk achar due to very high potassium and sodium.',
          ne: 'धेरै उच्च पोटासियम र सोडियमका कारण गोलभेडा अचार, आलु अचार र गुन्द्रुक अचारबाट जोगिनुहोस्।'
        },
        priority: 'high',
        avoidFoods: ['tomato', 'potato', 'gundruk', 'achar-mixed'],
        cookingTips: [
          { en: 'No safe preparation method for these items.', ne: 'यीका लागि सुरक्षित तयारी विधि छैन।' },
          { en: 'Replace with herb‑based alternatives.', ne: 'जडीबुटीआधारित विकल्प प्रयोग गर्नुहोस्।' },
          { en: 'Educate family about risks.', ne: 'जोखिमबारे परिवारलाई बुझाउनुहोस्।' }
        ],
        educationalContent: [
          { en: 'KDOQI Clinical Guidelines: Restrict high‑potassium and high‑sodium pickled vegetables.', ne: 'KDOQI क्लिनिकल दिशानिर्देश: उच्च पोटासियम/सोडियम भएका अचार कडाइका साथ सीमित गर्नुहोस्।' }
        ]
      },
      {
        id: 'achar-portion-prep',
        category: 'mineral-management',
        title: {
          en: 'Portion Control and Preparation Methods',
          ne: 'मात्रा नियन्त्रण र तयारी विधि'
        },
        description: {
          en: 'Even safe achars must be strictly portioned. Use ≤1 teaspoon per meal. Rinse commercial achars to reduce sodium.',
          ne: 'सुरक्षित अचार पनि कडाइका साथ मात्रा नियन्त्रण गर्नुहोस्। प्रत्येक भोजनमा अधिकतम १ चम्चा। वाणिज्यिक अचार नुन कम गर्न धुनुहोस्।'
        },
        priority: 'high',
        suggestedFoods: ['achar-mixed'],
        avoidFoods: [],
        cookingTips: [
          { en: 'Measure portions with a teaspoon.', ne: 'टिस्पूनले मात्रा नाप्नुहोस्।' },
          { en: 'Rinse before eating.', ne: 'खानुअघि पानीले धुनुहोस्।' },
          { en: 'Make fresh, low‑salt weekly batches.', ne: 'प्रत्येक हप्ता ताजा र कम नुनयुक्त अचार बनाउनुहोस्।' },
          { en: 'Use herbs instead of excess salt.', ne: 'अधिक नुनको सट्टा जडीबुटी प्रयोग गर्नुहोस्।' }
        ],
        educationalContent: [
          { en: 'Portion Control Guidelines for CKD: Keep condiments minimal.', ne: 'CKD मात्रा नियन्त्रण दिशानिर्देश: मसला/अचार न्यून राख्नुहोस्।' }
        ]
      },
      {
        id: 'achar-festival-mods',
        category: 'mineral-management',
        title: {
          en: 'Traditional Festival Food Modifications',
          ne: 'चाडपर्वका खानामा सुरक्षित परिमार्जन'
        },
        description: {
          en: 'During festivals, replace high‑salt achars with fresh herb chutneys or homemade low‑salt options to keep traditions kidney‑safe.',
          ne: 'चाडपर्वमा उच्च नुनयुक्त अचारको ठाउँमा ताजा जडीबुटी चटनी वा घरमै बनेका कम नुन विकल्प प्रयोग गरी परम्परा सुरक्षित राख्नुहोस्।'
        },
        priority: 'medium',
        suggestedFoods: ['coriander', 'turmeric'],
        avoidFoods: ['achar-mixed'],
        cookingTips: [
          { en: 'Plan safe alternatives for gatherings.', ne: 'भेला/कार्यक्रमका लागि सुरक्षित विकल्प योजना बनाउनुहोस्।' },
          { en: 'Teach family safe preparation.', ne: 'परिवारलाई सुरक्षित तयारी सिकाउनुहोस्।' },
          { en: 'Build new traditions with herb‑forward flavors.', ne: 'जडीबुटीको स्वादमुखी नयाँ परम्परा बनाउनुहोस्।' }
        ],
        educationalContent: [
          { en: 'Cultural Adaptation Guidelines: Maintain culture while meeting renal safety.', ne: 'सांस्कृतिक अनुकूलन दिशानिर्देश: किड्नी सुरक्षा कायम राख्दै संस्कृति जोगाउनुहोस्।' }
        ]
      },
      {
        id: 'achar-risk-factors',
        category: 'mineral-management',
        title: {
          en: 'Understanding Achar Risk Factors',
          ne: 'अचारका जोखिम कारक बुझ्ने'
        },
        description: {
          en: 'Fermentation raises potassium availability; excess salt drives fluid retention; high‑potassium bases (e.g., tomato) can be dangerous.',
          ne: 'फर्मेन्टेसनले पोटासियमको उपलब्धता बढाउँछ; बढी नुनले तरल जमाउने गर्दछ; गोलभेडाजस्ता उच्च पोटासियम आधार खतरनाक हुन सक्छ।'
        },
        priority: 'medium',
        suggestedFoods: ['coriander'],
        avoidFoods: ['tomato', 'gundruk'],
        cookingTips: [
          { en: 'Read labels for sodium and “phos‑” additives.', ne: 'लेबलमा सोडियम र “phos‑” एडिटिभ जाँच्नुहोस्।' },
          { en: 'Ask about preparation methods when eating out.', ne: 'बाहिर खाँदा तयारी विधि सोध्नुहोस्।' },
          { en: 'Choose fresh over fermented.', ne: 'फर्मेन्टेडको सट्टा ताजा रोज्नुहोस्।' },
          { en: 'Monitor labs regularly with your care team.', ne: 'हेरचाह टोलीसँग मिलेर नियमित ल्याब निगरानी गर्नुहोस्।' }
        ],
        educationalContent: [
          { en: 'Patient education: Sodium increases thirst and interdialytic weight gain.', ne: 'रोगी शिक्षा: सोडियमले तिर्खा र डायलिसिसबीचको तौल बढाउँछ।' }
        ]
      },
      // Kidney-Safe Protein Sources (Low PO₄ & Low K) – 4 tips
      {
        id: 'kidney-safe-protein-best-choices',
        category: 'protein-optimization',
        title: {
          en: 'Best Protein Choices for Dialysis',
          ne: 'डायलिसिसका लागि उत्तम प्रोटिन विकल्प'
        },
        description: {
          en: 'Egg whites are the gold standard - complete protein with minimal phosphorus and potassium. Fish and chicken breast are excellent secondary choices.',
          ne: 'अण्डाको सेतो भाग सुनौलो मापदण्डो हो - न्यूनतम फस्फोरस र पोटासियमसहित पूर्ण प्रोटिन। माछा र कुखुराको छाती उत्कृष्ट दोस्रो विकल्प हुन्।'
        },
        priority: 'high',
        suggestedFoods: ['egg-white', 'fish-salmon', 'chicken-breast', 'paneer'],
        educationalContent: [{
          en: 'KDOQI Protein Guidelines: Egg whites provide complete amino acids with lowest mineral load.',
          ne: 'KDOQI प्रोटिन दिशानिर्देश: अण्डाको सेतो भागले न्यूनतम खनिज लोडसहित पूर्ण एमिनो एसिड प्रदान गर्छ।'
        }]
      },
      {
        id: 'kidney-safe-protein-portion-control',
        category: 'protein-optimization',
        title: {
          en: 'Portion Control for Protein',
          ne: 'प्रोटिनका लागि मात्रा नियन्त्रण'
        },
        description: {
          en: 'Limit protein to 1.2g/kg body weight daily. For a 60kg person, this is about 70g protein total. Track portions carefully.',
          ne: 'दैनिक शरीरको तौल प्रति किलो १.२ ग्राम प्रोटिन सीमित गर्नुहोस्। ६० किलो व्यक्तिका लागि कुल ७० ग्राम प्रोटिन। मात्रा सावधानीपूर्वक ट्र्याक गर्नुहोस्।'
        },
        priority: 'high',
        educationalContent: [{
          en: 'ISRNM 2021: Adequate but not excessive protein intake prevents malnutrition while controlling uremic toxins.',
          ne: 'ISRNM 2021: पर्याप्त तर अत्यधिक नभएको प्रोटिन सेवनले कुपोषण रोक्छ र युरेमिक विषाक्त पदार्थ नियन्त्रण गर्छ।'
        }]
      },
      {
        id: 'kidney-safe-protein-binder-timing',
        category: 'protein-optimization',
        title: {
          en: 'Protein Timing with Phosphate Binders',
          ne: 'फस्फेट बाइन्डरसँग प्रोटिनको समय'
        },
        description: {
          en: 'Always take phosphate binders with protein-containing meals. Time binders with the first bite of dal, meat, or egg dishes.',
          ne: 'प्रोटिन भएका खानासँग सधैं फस्फेट बाइन्डर लिनुहोस्। दाल, मासु, वा अण्डाका परिकारको पहिलो कुम्लोसँग बाइन्डर लिनुहोस्।'
        },
        priority: 'high',
        educationalContent: [{
          en: 'Binder Compliance Guidelines: Phosphate binders are most effective when taken with meals containing phosphorus.',
          ne: 'बाइन्डर अनुपालन दिशानिर्देश: फस्फोरस भएका खानासँग लिँदा फस्फेट बाइन्डर सबैभन्दा प्रभावकारी हुन्छ।'
        }]
      },
      {
        id: 'kidney-safe-plant-protein-limits',
        category: 'protein-optimization',
        title: {
          en: 'Plant Protein Limitations',
          ne: 'वनस्पति प्रोटिनका सीमितताहरू'
        },
        description: {
          en: 'Significantly limit dal, rajma, and other legumes due to high phosphorus and potassium. If consuming, soak overnight and use small portions (1/4 cup).',
          ne: 'उच्च फस्फोरस र पोटासियमका कारण दाल, राजमा र अन्य दलहनहरू निकै सीमित गर्नुहोस्। खाने हो भने रातभर भिजाएर साना मात्रामा (१/४ कप) प्रयोग गर्नुहोस्।'
        },
        priority: 'medium',
        suggestedFoods: ['dal-masoor', 'tofu'],
        avoidFoods: ['almonds', 'seeds-mixed', 'dal-chana', 'rajma'],
        cookingTips: [
          { en: 'Soak legumes overnight and discard soaking water.', ne: 'दलहनहरू रातभर भिजाएर भिजाएको पानी फाल्नुहोस्।' },
          { en: 'Limit portions to 1/4 cup cooked per meal.', ne: 'प्रत्येक भोजनमा पकाएको १/४ कप मात्र सीमित गर्नुहोस्।' },
          { en: 'Choose animal proteins over plant proteins when possible.', ne: 'सम्भव भएसम्म वनस्पति प्रोटिनको सट्टा पशु प्रोटिन रोज्नुहोस्।' }
        ],
        educationalContent: [{
          en: 'Plant proteins generally contain more phosphorus and potassium per gram of protein compared to animal sources.',
          ne: 'वनस्पति प्रोटिनमा सामान्यतया पशु स्रोतको तुलनामा प्रति ग्राम प्रोटिनमा बढी फस्फोरस र पोटासियम हुन्छ।'
        }]
      }
    ];

    // Combine all recommendations: dynamic, static, and insights
    return [...dynamicRecommendations, ...staticRecommendations, ...insightRecommendations];
  }, [
    profile,
    hemoglobinValue,
    calciumValue,
    vitaminDValue,
    todayIntake.potassium, 
    todayIntake.phosphorus, 
    todayIntake.fluid, 
    todayIntake.protein, 
    isLoading,
    insightRecommendations
  ]);

  return useMemo(() => ({
    foodLog,
    todayIntake,
    dailyLimits: profile?.dailyLimits || defaultLimits,
    recommendations,
    addToLog,
    removeFromLog,
    clearLog,
    isLoading,
  }), [foodLog, todayIntake, profile?.dailyLimits, recommendations, addToLog, removeFromLog, clearLog, isLoading]);
});