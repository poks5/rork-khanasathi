export type FoodCategory = 
  | 'grains'
  | 'vegetables'
  | 'fruits'
  | 'proteins'
  | 'dairy'
  | 'beverages'
  | 'snacks'
  | 'traditional'
  | 'legumes'
  | 'nuts-seeds'
  | 'spices';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snacks';

export type SafetyLevel = 'safe' | 'caution' | 'avoid';

export interface NutrientIntake {
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber: number;
  potassium: number;
  phosphorus: number;
  sodium: number;
  calcium: number;
  fluid: number;
  iron: number;
  zinc: number;
}

export interface Food {
  id: string;
  nameEn: string;
  nameNe: string;
  category: FoodCategory;
  subcategory?: string;
  image: string;
  defaultPortion: number;
  unitEn: string;
  unitNe: string;
  weightGrams: number;
  volumeMl?: number;
  nutrients: NutrientIntake;
  safetyLevel: SafetyLevel;
  preparationTips?: {
    en: string;
    ne: string;
  }[];
  alternativeNames?: {
    en: string[];
    ne: string[];
  };
  medicalNotes?: {
    en: string;
    ne: string;
  }[];
  dialysisDay?: {
    maxPortion: number;
    notes: string;
  };
  nonDialysisDay?: {
    maxPortion: number;
    notes: string;
  };
}

export interface FoodLogEntry {
  id: string;
  foodId: string;
  foodName: string;
  quantity: number;
  unit: string;
  mealType: MealType;
  timestamp: string;
  nutrients: NutrientIntake;
}

export type RecommendationCategory = 
  | 'protein-optimization'
  | 'mineral-management'
  | 'fluid-balance'
  | 'bone-health'
  | 'anemia-management'
  | 'cardiovascular-health';

export type RecommendationPriority = 'high' | 'medium' | 'low';

export interface NutritionRecommendation {
  id: string;
  category: RecommendationCategory;
  title: {
    en: string;
    ne: string;
  };
  description: {
    en: string;
    ne: string;
  };
  priority: RecommendationPriority;
  basedOn?: string[];
  suggestedFoods?: string[];
  avoidFoods?: string[];
  educationalContent?: {
    en: string;
    ne: string;
  }[];
  cookingTips?: {
    en: string;
    ne: string;
  }[];
}