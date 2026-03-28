export interface LabValues {
  // Basic Electrolytes
  potassium?: number;
  sodium?: number;
  chloride?: number;
  calcium?: number;
  phosphorus?: number;
  magnesium?: number;
  
  // Kidney Function
  urea?: number;
  creatinine?: number;
  eGFR?: number;
  
  // Nutritional Markers
  albumin?: number;
  totalProtein?: number;
  prealbumin?: number;
  
  // Hematology
  hemoglobin?: number;
  hematocrit?: number;
  
  // Iron Studies
  serumIron?: number;
  tsat?: number; // Transferrin Saturation
  serumFerritin?: number;
  tibc?: number; // Total Iron Binding Capacity
  
  // Bone & Mineral
  iPTH?: number; // Intact Parathyroid Hormone
  vitaminD?: number;
  alkalinePhosphatase?: number;
  
  // Vitamins & Micronutrients
  vitaminB12?: number;
  folate?: number;
  zinc?: number;
  
  // Lipids
  totalCholesterol?: number;
  ldl?: number;
  hdl?: number;
  triglycerides?: number;
  
  // Inflammation
  crp?: number; // C-Reactive Protein
  
  // Dialysis Adequacy
  ktv?: number;
  urr?: number; // Urea Reduction Ratio
}

export interface AnthropometricData {
  height?: number; // cm
  weight?: number; // kg
  bmi?: number;
  dryWeight?: number; // kg
  fluidGain?: number; // kg
  bloodPressureSystolic?: number;
  bloodPressureDiastolic?: number;
}

export interface LabAlert {
  parameter: string;
  value: number;
  normalRange: { min: number; max: number };
  status: 'low' | 'high' | 'normal';
  severity: 'mild' | 'moderate' | 'severe';
  urgency: 'routine' | 'urgent' | 'critical';
  explanation: string;
  clinicalSignificance: string;
  actionRequired?: boolean;
  timeframe?: 'immediate' | 'within-24h' | 'within-week';
}

export interface TrendAnalysis {
  parameter: string;
  direction: 'improving' | 'worsening' | 'stable';
  magnitude: number;
  significance: 'mild' | 'moderate' | 'significant';
  recommendation: string;
  timeframe: string;
}

export interface DietaryRecommendation {
  id: string;
  title: string;
  description: string;
  category: 'emergency' | 'protein' | 'mineral' | 'fluid' | 'general';
  priority: 'critical' | 'high' | 'medium' | 'low';
  evidence: string;
  foods: string[];
  supplements?: string[];
  targetValues?: Record<string, string>;
  monitoringFrequency?: 'weekly' | 'monthly' | 'quarterly';
  coordinatedCare?: string[];
  actionRequired?: boolean;
  timeframe?: 'immediate' | 'within-24h' | 'within-week' | 'ongoing';
}

export interface BloodReportAnalysis {
  alerts: LabAlert[];
  recommendations: DietaryRecommendation[];
  trendAnalysis?: {
    trends: TrendAnalysis[];
    message?: string;
  };
  overallRisk: 'low' | 'moderate' | 'high';
  summary: string;
  clinicalPriorities: string[];
  followUpRecommendations: string[];
  riskFactors?: string[];
  improvementAreas?: string[];
}

export interface BloodReport {
  id: string;
  date: string;
  preHD: LabValues;
  postHD: LabValues;
  anthropometric: AnthropometricData;
  analysis?: BloodReportAnalysis;
  clinicalNotes?: string;
  patientType: 'hemodialysis' | 'peritoneal' | 'ckd';
  providerId?: string;
  facilityId?: string;
  reviewStatus?: 'pending' | 'reviewed' | 'approved';
  lastModified?: string;
  version?: number;
}

export interface LabSystemIntegration {
  enabled: boolean;
  systemId: string;
  systemName: string;
  lastSync?: string;
  autoImport: boolean;
  mappingConfig: Record<string, string>;
}

export interface ClinicalWorkflow {
  id: string;
  name: string;
  triggers: {
    labValue: string;
    condition: 'above' | 'below' | 'change';
    threshold: number;
  }[];
  actions: {
    type: 'alert' | 'notification' | 'order' | 'referral';
    target: string;
    message: string;
  }[];
  enabled: boolean;
}

export interface QualityMetrics {
  patientId: string;
  reportingPeriod: { start: string; end: string };
  metrics: {
    adequacyTargets: {
      ktv: { target: number; achieved: number; percentage: number };
      urr: { target: number; achieved: number; percentage: number };
    };
    nutritionalTargets: {
      albumin: { target: number; achieved: number; percentage: number };
      hemoglobin: { target: number; achieved: number; percentage: number };
    };
    mineralBoneTargets: {
      phosphorus: { target: string; achieved: number; percentage: number };
      pth: { target: string; achieved: number; percentage: number };
    };
  };
  overallScore: number;
  improvementAreas: string[];
}