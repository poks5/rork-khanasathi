import { useState, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { InsightRecommendation, NutritionRecommendation, RecommendationCategory, RecommendationPriority } from '@/types/food';

const STORAGE_KEY = 'insightRecommendations';

export const [InsightsProvider, useInsights] = createContextHook(() => {
  const [recommendations, setRecommendations] = useState<InsightRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setRecommendations(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading insight recommendations:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  // Predefined insight recommendations from your message
  const addPredefinedInsights = useCallback(() => {
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

    // Add both insights
    addInsightRecommendation(acharSafetyInsight);
    addInsightRecommendation(proteinSafetyInsight);
  }, [addInsightRecommendation]);

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