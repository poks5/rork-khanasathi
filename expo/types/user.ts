export interface DailyLimits {
  potassium: number;
  phosphorus: number;
  sodium: number;
  protein: number;
  calories: number;
  fluid: number;
}

export type DialysisType = 'hemodialysis' | 'peritoneal' | 'ckd-stage-1' | 'ckd-stage-2' | 'ckd-stage-3' | 'ckd-stage-4' | 'ckd-stage-5';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very-active';

export interface MedicalCondition {
  name: string;
  active: boolean;
  notes?: string;
}

export interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  affectsNutrition: boolean;
  nutritionNotes?: string;
}

export interface DietaryRestriction {
  type: 'allergy' | 'cultural' | 'religious' | 'preference';
  description: string;
}

export interface LabValue {
  name: string;
  value: number;
  unit: string;
  date: string;
  normalRange?: {
    min: number;
    max: number;
  };
  severity?: 'normal' | 'mild' | 'moderate' | 'severe';
}

export interface UserProfile {
  name: string;
  age: number;
  weight: number;
  height?: number;
  gender?: 'male' | 'female' | 'other';
  activityLevel?: ActivityLevel;
  isOnDialysis: boolean;
  dialysisType?: DialysisType;
  dialysisFrequency?: number;
  dailyLimits: DailyLimits;
  medicalConditions?: MedicalCondition[];
  medications?: Medication[];
  dietaryRestrictions?: DietaryRestriction[];
  labValues?: LabValue[];
}