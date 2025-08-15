import { useState, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { InsightRecommendation, NutritionRecommendation, RecommendationCategory, RecommendationPriority } from '@/types/food';

const STORAGE_KEY = 'insightRecommendations_v2';

export const [InsightsProvider, useInsights] = createContextHook(() => {
  const [recommendations, setRecommendations] = useState<InsightRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Get predefined recommendations
  const getPredefinedRecommendations = useCallback((): InsightRecommendation[] => {
    // Achar Safety: Pickle Use in CKD & Dialysis Patients
    const acharSafetyInsight: Omit<InsightRecommendation, 'id' | 'dateAdded' | 'isRead' | 'isBookmarked'> = {
      title: 'Achar Safety: Pickle Use in CKD & Dialysis Patients',
      description: 'Safe pickle consumption guidelines and traditional condiment modifications for kidney patients',
      category: 'safety-guidelines',
      priority: 'high',
      tips: [
        {
          title: 'Safe Achar Choices for Daily Use',
          content: 'Choose fresh herb-based achars like coriander (धनिया) and mint (पुदिना) pickles. These are naturally low in potassium and sodium when prepared with minimal salt. Limit portions to 1-2 teaspoons per meal.',
          foods: {
            recommended: ['Coriander achar (धनिया अचार)', 'Mint achar (पुदिना अचार)', 'Fresh ginger pickle (अदुवा अचार)'],
            avoid: ['Fermented achars', 'Commercial pickles', 'High-sodium preparations']
          },
          cookingTips: [
            'Use minimal salt in preparation',
            'Choose fresh over fermented',
            'Limit to 1 tsp per meal',
            'Rinse high-sodium achars before eating'
          ],
          priority: 'high',
          evidence: 'Renal Nutrition Guidelines 2021'
        },
        {
          title: 'High-Risk Achars to Completely Avoid',
          content: 'Completely avoid tomato achar (गोलभेडा अचार), potato pickle (आलु अचार), and gundruk achar (गुन्द्रुक अचार). These contain extremely high levels of potassium and sodium that can be dangerous for kidney patients.',
          foods: {
            avoid: ['Tomato achar (गोलभेडा अचार)', 'Potato pickle (आलु अचार)', 'Gundruk achar (गुन्द्रुक अचार)', 'Fermented radish (मुला अचार)']
          },
          cookingTips: [
            'No safe preparation method exists for these',
            'Replace with herb-based alternatives',
            'Educate family members about risks'
          ],
          priority: 'high',
          evidence: 'KDOQI Clinical Guidelines'
        },
        {
          title: 'Portion Control and Preparation Methods',
          content: 'Even safe achars must be limited to very small portions. Use 1 teaspoon or less per meal. For commercial achars, rinse with water before eating to reduce sodium content.',
          foods: {
            recommended: ['Homemade low-salt achars', 'Rinsed commercial pickles (limited)', 'Fresh herb preparations'],
            avoid: ['Large portions (>1 tsp)', 'Daily consumption', 'High-sodium commercial brands']
          },
          cookingTips: [
            'Measure portions with teaspoon',
            'Rinse before eating',
            'Make fresh weekly batches',
            'Use herbs instead of excess salt'
          ],
          priority: 'high',
          evidence: 'Portion Control Guidelines for CKD'
        },
        {
          title: 'Traditional Festival Food Modifications',
          content: 'During festivals and special occasions, replace traditional high-risk achars with kidney-safe alternatives. Use fresh coriander chutney, mint sauce, or homemade low-salt preparations to maintain cultural food practices safely.',
          foods: {
            recommended: ['Fresh herb chutneys', 'Low-salt homemade preparations', 'Kidney-safe spice blends'],
            avoid: ['Traditional high-salt festival achars', 'Community-prepared pickles', 'Unknown preparation methods']
          },
          cookingTips: [
            'Plan alternatives for festivals',
            'Teach family safe preparation',
            'Create new traditions with safe foods',
            'Focus on flavor through herbs and safe spices'
          ],
          priority: 'medium',
          evidence: 'Cultural Adaptation Guidelines'
        },
        {
          title: 'Understanding Achar Risk Factors',
          content: 'Learn to identify high-risk ingredients: fermented vegetables increase potassium bioavailability, excess salt causes fluid retention, and high-potassium vegetables like tomatoes can cause dangerous heart rhythm problems.',
          foods: {
            recommended: ['Low-potassium vegetables for pickling', 'Fresh preparation methods', 'Reduced-salt recipes'],
            avoid: ['Fermented preparations', 'High-potassium base vegetables', 'Unknown sodium content']
          },
          cookingTips: [
            'Read ingredient labels carefully',
            'Ask about preparation methods',
            'Choose fresh over fermented',
            'Monitor blood levels regularly'
          ],
          priority: 'medium',
          evidence: 'Risk Assessment Guidelines'
        }
      ]
    };

    // Kidney-Safe Protein Sources
    const proteinSafetyInsight: Omit<InsightRecommendation, 'id' | 'dateAdded' | 'isRead' | 'isBookmarked'> = {
      title: 'Kidney-Safe Protein Sources (Low PO₄ & Low K)',
      description: 'High-quality protein options that are low in both phosphorus and potassium',
      category: 'protein-optimization',
      priority: 'high',
      tips: [
        {
          title: 'Best Protein Choices for Dialysis',
          content: 'Egg whites are the gold standard - complete protein with minimal phosphorus and potassium. Fish and chicken breast are excellent secondary choices.',
          foods: {
            recommended: ['Egg whites (2-3 daily)', 'Fish (rohu, katla)', 'Chicken breast', 'Limited paneer']
          },
          priority: 'high',
          evidence: 'KDOQI Protein Guidelines'
        },
        {
          title: 'Portion Control for Protein',
          content: 'Limit protein to 1.2g/kg body weight daily. For a 60kg person, this is about 70g protein total. Track portions carefully.',
          priority: 'high',
          evidence: 'ISRNM 2021'
        },
        {
          title: 'Protein Timing with Phosphate Binders',
          content: 'Always take phosphate binders with protein-containing meals. Time binders with the first bite of dal, meat, or egg dishes.',
          priority: 'high',
          evidence: 'Binder Compliance Guidelines'
        },
        {
          title: 'Plant Protein Limitations',
          content: 'Significantly limit dal, rajma, and other legumes due to high phosphorus and potassium. If consuming, soak overnight and use small portions (1/4 cup).',
          foods: {
            recommended: ['Very limited dal', 'Tofu (small amounts)'],
            avoid: ['Large legume portions', 'Nuts', 'Seeds']
          },
          priority: 'medium'
        }
      ]
    };

    // Hyperkalemia Management
    const hyperkalemiaInsight: Omit<InsightRecommendation, 'id' | 'dateAdded' | 'isRead' | 'isBookmarked'> = {
      title: 'Hyperkalemia Management: Critical Potassium Control',
      description: 'Emergency and routine management of high potassium levels in dialysis patients',
      category: 'mineral-management',
      priority: 'critical',
      tips: [
        {
          title: 'Emergency Hyperkalemia Protocol',
          content: 'Potassium >6.0 mEq/L requires immediate medical attention. Stop all high-K foods, contact nephrologist, and prepare for emergency dialysis if needed.',
          foods: {
            avoid: ['All fruits', 'Vegetables', 'Dal/legumes', 'Nuts', 'Chocolate', 'Coconut water']
          },
          cookingTips: [
            'Emergency diet: white rice, pasta, bread only',
            'No fruits or vegetables until K+ <5.5',
            'Contact healthcare team immediately',
            'Monitor for heart rhythm changes'
          ],
          priority: 'critical',
          evidence: 'KDOQI Emergency Guidelines'
        },
        {
          title: 'Daily Potassium Restriction (<2000mg)',
          content: 'Maintain strict potassium limit of 2000mg daily. Use leaching techniques for vegetables and choose low-K alternatives.',
          foods: {
            recommended: ['White rice', 'Pasta', 'White bread', 'Cauliflower (leached)', 'Cabbage (limited)'],
            avoid: ['Bananas', 'Oranges', 'Potatoes', 'Tomatoes', 'Spinach', 'Dal']
          },
          cookingTips: [
            'Leach vegetables: soak 2+ hours, boil, drain',
            'Use small portions of leached vegetables',
            'Avoid cooking water from vegetables',
            'Choose canned fruits over fresh'
          ],
          priority: 'high',
          evidence: 'Potassium Restriction Guidelines'
        },
        {
          title: 'Medication Compliance for K+ Control',
          content: 'Take potassium binders (Kayexalate, Patiromer) exactly as prescribed. Never skip doses, especially before dialysis.',
          priority: 'high',
          evidence: 'Binder Efficacy Studies'
        }
      ]
    };

    // Hyperphosphatemia Management
    const hyperphosphatemiaInsight: Omit<InsightRecommendation, 'id' | 'dateAdded' | 'isRead' | 'isBookmarked'> = {
      title: 'Hyperphosphatemia Control: Bone Disease Prevention',
      description: 'Comprehensive phosphorus management to prevent bone disease and cardiovascular complications',
      category: 'bone-health',
      priority: 'high',
      tips: [
        {
          title: 'Phosphate Binder Optimization',
          content: 'Take phosphate binders with EVERY meal and snack. Timing is critical - take with first bite of food for maximum effectiveness.',
          cookingTips: [
            'Set phone reminders for binder timing',
            'Keep binders at dining table',
            'Take with first bite, not after eating',
            'Never skip binders with protein meals'
          ],
          priority: 'critical',
          evidence: 'KDIGO CKD-MBD Guidelines'
        },
        {
          title: 'Hidden Phosphorus Sources',
          content: 'Avoid processed foods with phosphate additives. These are 90% absorbed vs 60% from natural sources.',
          foods: {
            avoid: ['Processed meats', 'Sodas with phosphoric acid', 'Packaged foods', 'Fast food', 'Cheese spreads'],
            recommended: ['Fresh meats', 'Homemade foods', 'Natural ingredients']
          },
          priority: 'high',
          evidence: 'Phosphate Additive Research'
        },
        {
          title: 'Protein-Phosphorus Balance',
          content: 'Choose high-quality proteins with lower phosphorus content. Egg whites are ideal - complete protein with minimal phosphorus.',
          foods: {
            recommended: ['Egg whites', 'Fish (limited)', 'Chicken breast (small portions)'],
            avoid: ['Dairy products', 'Nuts', 'Whole grains', 'Large meat portions']
          },
          priority: 'high'
        }
      ]
    };

    // Fluid Management
    const fluidManagementInsight: Omit<InsightRecommendation, 'id' | 'dateAdded' | 'isRead' | 'isBookmarked'> = {
      title: 'Fluid Balance: Preventing Overload & Hypotension',
      description: 'Optimal fluid management between dialysis sessions for cardiovascular health',
      category: 'fluid-balance',
      priority: 'high',
      tips: [
        {
          title: 'Daily Fluid Allowance Calculation',
          content: 'Limit fluids to 500-750ml plus previous day urine output. Track all liquids including soups, ice, and hidden fluids in foods.',
          cookingTips: [
            'Use small cups for drinking',
            'Measure and track all fluids',
            'Include soup, dal water, and ice',
            'Weigh yourself daily at same time'
          ],
          priority: 'high',
          evidence: 'Fluid Management Guidelines'
        },
        {
          title: 'Managing Thirst Without Excess Fluid',
          content: 'Use ice chips, sugar-free gum, lemon wedges, and mouth rinses to manage thirst without increasing fluid intake.',
          cookingTips: [
            'Freeze allowed fluids as ice chips',
            'Use lemon or lime for mouth freshness',
            'Chew sugar-free gum',
            'Rinse mouth without swallowing'
          ],
          priority: 'medium'
        }
      ]
    };

    // Anemia Management
    const anemiaInsight: Omit<InsightRecommendation, 'id' | 'dateAdded' | 'isRead' | 'isBookmarked'> = {
      title: 'Anemia Management: Iron & EPO Optimization',
      description: 'Nutritional and medical management of kidney disease anemia',
      category: 'anemia-management',
      priority: 'medium',
      tips: [
        {
          title: 'Iron-Rich Foods for Kidney Patients',
          content: 'Choose kidney-safe iron sources. Avoid high-potassium iron-rich foods like spinach and dried fruits.',
          foods: {
            recommended: ['Chicken liver (small amounts)', 'Fish', 'Egg yolks (limited)', 'Iron-fortified cereals'],
            avoid: ['Spinach', 'Dried fruits', 'Nuts', 'Whole grains']
          },
          priority: 'medium'
        },
        {
          title: 'Iron Supplement Timing',
          content: 'Take iron supplements away from phosphate binders and calcium. Best absorbed on empty stomach with vitamin C.',
          cookingTips: [
            'Take iron 2 hours before/after binders',
            'Take with small amount of orange juice if tolerated',
            'Avoid tea/coffee with iron supplements',
            'Monitor for constipation'
          ],
          priority: 'medium'
        }
      ]
    };

    // Cardiovascular Protection
    const cardiovascularInsight: Omit<InsightRecommendation, 'id' | 'dateAdded' | 'isRead' | 'isBookmarked'> = {
      title: 'Cardiovascular Protection in Kidney Disease',
      description: 'Heart-healthy strategies for dialysis patients at high cardiovascular risk',
      category: 'cardiovascular-health',
      priority: 'high',
      tips: [
        {
          title: 'Sodium Restriction for Blood Pressure',
          content: 'Limit sodium to 2000mg daily to control blood pressure and fluid retention. Read all food labels carefully.',
          foods: {
            avoid: ['Processed foods', 'Restaurant meals', 'Canned soups', 'Pickles', 'Salty snacks'],
            recommended: ['Fresh foods', 'Homemade meals', 'Herbs and spices for flavor']
          },
          cookingTips: [
            'Use herbs instead of salt',
            'Rinse canned foods',
            'Cook from scratch when possible',
            'Taste food before adding salt'
          ],
          priority: 'high'
        },
        {
          title: 'Omega-3 for Heart Health',
          content: 'Include kidney-safe omega-3 sources 2-3 times weekly. Fish is preferred over supplements for dialysis patients.',
          foods: {
            recommended: ['Salmon (small portions)', 'Mackerel', 'Sardines (low sodium)', 'Fish oil (if prescribed)']
          },
          priority: 'medium'
        }
      ]
    };

    return [
      {
        ...acharSafetyInsight,
        id: `insight-achar-safety-${Date.now()}`,
        dateAdded: new Date().toISOString(),
        isRead: false,
        isBookmarked: false,
      },
      {
        ...proteinSafetyInsight,
        id: `insight-protein-safety-${Date.now() + 1}`,
        dateAdded: new Date().toISOString(),
        isRead: false,
        isBookmarked: false,
      },
      {
        ...hyperkalemiaInsight,
        id: `insight-hyperkalemia-${Date.now() + 2}`,
        dateAdded: new Date().toISOString(),
        isRead: false,
        isBookmarked: false,
      },
      {
        ...hyperphosphatemiaInsight,
        id: `insight-hyperphosphatemia-${Date.now() + 3}`,
        dateAdded: new Date().toISOString(),
        isRead: false,
        isBookmarked: false,
      },
      {
        ...fluidManagementInsight,
        id: `insight-fluid-management-${Date.now() + 4}`,
        dateAdded: new Date().toISOString(),
        isRead: false,
        isBookmarked: false,
      },
      {
        ...anemiaInsight,
        id: `insight-anemia-${Date.now() + 5}`,
        dateAdded: new Date().toISOString(),
        isRead: false,
        isBookmarked: false,
      },
      {
        ...cardiovascularInsight,
        id: `insight-cardiovascular-${Date.now() + 6}`,
        dateAdded: new Date().toISOString(),
        isRead: false,
        isBookmarked: false,
      }
    ];
  }, []);

  // Function to add predefined insights on first load
  const addPredefinedInsightsOnFirstLoad = useCallback(async () => {
    const predefinedRecommendations = getPredefinedRecommendations();
    setRecommendations(predefinedRecommendations);
    await saveRecommendations(predefinedRecommendations);
    console.log('Added predefined insights on first load');
  }, [getPredefinedRecommendations]);

  const loadRecommendations = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setRecommendations(JSON.parse(stored));
      } else {
        // If no stored recommendations, add predefined ones
        console.log('No stored recommendations found, adding predefined insights');
        await addPredefinedInsightsOnFirstLoad();
      }
    } catch (error) {
      console.error('Error loading insight recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [addPredefinedInsightsOnFirstLoad]);

  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  const saveRecommendations = async (recs: InsightRecommendation[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(recs));
    } catch (error) {
      console.error('Error saving insight recommendations:', error);
    }
  };

  const addInsightRecommendation = useCallback((insight: Omit<InsightRecommendation, 'id' | 'dateAdded' | 'isRead' | 'isBookmarked'>) => {
    const newRecommendation: InsightRecommendation = {
      ...insight,
      id: `insight-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      dateAdded: new Date().toISOString(),
      isRead: false,
      isBookmarked: false,
    };

    const updatedRecommendations = [newRecommendation, ...recommendations];
    setRecommendations(updatedRecommendations);
    saveRecommendations(updatedRecommendations);
    
    console.log('Added new insight recommendation:', newRecommendation.title);
  }, [recommendations]);

  const markAsRead = useCallback((id: string) => {
    const updated = recommendations.map(rec => 
      rec.id === id ? { ...rec, isRead: true } : rec
    );
    setRecommendations(updated);
    saveRecommendations(updated);
  }, [recommendations]);

  const toggleBookmark = useCallback((id: string) => {
    const updated = recommendations.map(rec => 
      rec.id === id ? { ...rec, isBookmarked: !rec.isBookmarked } : rec
    );
    setRecommendations(updated);
    saveRecommendations(updated);
  }, [recommendations]);

  const addUserNote = useCallback((id: string, note: string) => {
    const updated = recommendations.map(rec => 
      rec.id === id ? { ...rec, userNotes: note } : rec
    );
    setRecommendations(updated);
    saveRecommendations(updated);
  }, [recommendations]);

  const deleteRecommendation = useCallback((id: string) => {
    const updated = recommendations.filter(rec => rec.id !== id);
    setRecommendations(updated);
    saveRecommendations(updated);
  }, [recommendations]);

  // Convert insight recommendations to nutrition recommendations for integration
  const convertToNutritionRecommendations = useCallback((): NutritionRecommendation[] => {
    return recommendations.flatMap(insight => 
      insight.tips.map((tip, index) => ({
        id: `${insight.id}-tip-${index}`,
        category: insight.category,
        title: {
          en: tip.title,
          ne: tip.title // For now, using English for both
        },
        description: {
          en: tip.content,
          ne: tip.content
        },
        priority: tip.priority,
        suggestedFoods: tip.foods?.recommended || [],
        avoidFoods: tip.foods?.avoid || [],
        cookingTips: tip.cookingTips?.map(cookingTip => ({
          en: cookingTip,
          ne: cookingTip
        })) || [],
        educationalContent: tip.evidence ? [{
          en: tip.evidence,
          ne: tip.evidence
        }] : [],
        source: 'insights' as const,
        dateAdded: insight.dateAdded,
        isRead: insight.isRead,
        isBookmarked: insight.isBookmarked,
        userNotes: insight.userNotes
      }))
    );
  }, [recommendations]);

  // Statistics and filtering
  const stats = useMemo(() => {
    const total = recommendations.length;
    const unread = recommendations.filter(r => !r.isRead).length;
    const bookmarked = recommendations.filter(r => r.isBookmarked).length;
    const critical = recommendations.filter(r => r.priority === 'critical').length;
    const high = recommendations.filter(r => r.priority === 'high').length;
    
    const byCategory = recommendations.reduce((acc, rec) => {
      acc[rec.category] = (acc[rec.category] || 0) + 1;
      return acc;
    }, {} as Record<RecommendationCategory, number>);

    return {
      total,
      unread,
      bookmarked,
      critical,
      high,
      byCategory
    };
  }, [recommendations]);

  const getFilteredRecommendations = useCallback((
    filters: {
      category?: RecommendationCategory;
      priority?: RecommendationPriority;
      isRead?: boolean;
      isBookmarked?: boolean;
      searchTerm?: string;
    } = {}
  ) => {
    return recommendations.filter(rec => {
      if (filters.category && rec.category !== filters.category) return false;
      if (filters.priority && rec.priority !== filters.priority) return false;
      if (filters.isRead !== undefined && rec.isRead !== filters.isRead) return false;
      if (filters.isBookmarked !== undefined && rec.isBookmarked !== filters.isBookmarked) return false;
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesTitle = rec.title.toLowerCase().includes(searchLower);
        const matchesDescription = rec.description.toLowerCase().includes(searchLower);
        const matchesTips = rec.tips.some(tip => 
          tip.title.toLowerCase().includes(searchLower) ||
          tip.content.toLowerCase().includes(searchLower)
        );
        if (!matchesTitle && !matchesDescription && !matchesTips) return false;
      }
      return true;
    });
  }, [recommendations]);



  // Function to manually add predefined insights (for the button)
  const addPredefinedInsights = useCallback(() => {
    const newInsights = getPredefinedRecommendations();
    const updatedRecommendations = [...newInsights, ...recommendations];
    setRecommendations(updatedRecommendations);
    saveRecommendations(updatedRecommendations);
  }, [recommendations, getPredefinedRecommendations]);

  return useMemo(() => ({
    recommendations,
    isLoading,
    stats,
    addInsightRecommendation,
    markAsRead,
    toggleBookmark,
    addUserNote,
    deleteRecommendation,
    getFilteredRecommendations,
    convertToNutritionRecommendations,
    addPredefinedInsights
  }), [
    recommendations,
    isLoading,
    stats,
    addInsightRecommendation,
    markAsRead,
    toggleBookmark,
    addUserNote,
    deleteRecommendation,
    getFilteredRecommendations,
    convertToNutritionRecommendations,
    addPredefinedInsights
  ]);
});