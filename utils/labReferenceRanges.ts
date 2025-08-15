import { LabValues } from '@/types/bloodReport';

export interface ReferenceRange {
  min: number;
  max: number;
  unit: string;
  patientType?: 'hemodialysis' | 'peritoneal' | 'ckd';
}

export const DIALYSIS_REFERENCE_RANGES: Record<keyof LabValues, ReferenceRange> = {
  // Critical Electrolytes
  potassium: { min: 3.5, max: 5.0, unit: 'mEq/L' },
  sodium: { min: 136, max: 145, unit: 'mEq/L' },
  chloride: { min: 98, max: 107, unit: 'mEq/L' },
  calcium: { min: 8.5, max: 10.5, unit: 'mg/dL' },
  phosphorus: { min: 3.5, max: 5.5, unit: 'mg/dL' },
  magnesium: { min: 1.7, max: 2.2, unit: 'mg/dL' },
  
  // Kidney Function
  urea: { min: 20, max: 60, unit: 'mg/dL' }, // Pre-dialysis target
  creatinine: { min: 8, max: 12, unit: 'mg/dL' }, // Pre-dialysis
  eGFR: { min: 10, max: 15, unit: 'mL/min/1.73m²' },
  
  // Nutritional Markers
  albumin: { min: 3.5, max: 5.0, unit: 'g/dL' },
  totalProtein: { min: 6.0, max: 8.3, unit: 'g/dL' },
  prealbumin: { min: 30, max: 40, unit: 'mg/dL' },
  
  // Hematology
  hemoglobin: { min: 11, max: 12, unit: 'g/dL' },
  hematocrit: { min: 33, max: 36, unit: '%' },
  
  // Iron Studies
  serumIron: { min: 60, max: 170, unit: 'μg/dL' },
  tsat: { min: 20, max: 50, unit: '%' },
  serumFerritin: { min: 200, max: 500, unit: 'ng/mL' },
  tibc: { min: 250, max: 400, unit: 'μg/dL' },
  
  // Bone & Mineral
  iPTH: { min: 150, max: 300, unit: 'pg/mL' },
  vitaminD: { min: 30, max: 100, unit: 'ng/mL' },
  alkalinePhosphatase: { min: 44, max: 147, unit: 'U/L' },
  
  // Vitamins & Micronutrients
  vitaminB12: { min: 300, max: 900, unit: 'pg/mL' },
  folate: { min: 4, max: 20, unit: 'ng/mL' },
  zinc: { min: 70, max: 120, unit: 'μg/dL' },
  
  // Lipids
  totalCholesterol: { min: 150, max: 200, unit: 'mg/dL' },
  ldl: { min: 70, max: 100, unit: 'mg/dL' },
  hdl: { min: 40, max: 60, unit: 'mg/dL' },
  triglycerides: { min: 50, max: 150, unit: 'mg/dL' },
  
  // Inflammation
  crp: { min: 0, max: 3, unit: 'mg/L' },
  
  // Dialysis Adequacy
  ktv: { min: 1.2, max: 2.0, unit: '' },
  urr: { min: 65, max: 85, unit: '%' }
};

export const getAlertSeverity = (value: number, range: ReferenceRange): 'mild' | 'moderate' | 'severe' => {
  const deviation = Math.max(
    Math.abs(value - range.min) / range.min,
    Math.abs(value - range.max) / range.max
  );
  
  if (deviation > 0.5) return 'severe';
  if (deviation > 0.25) return 'moderate';
  return 'mild';
};

export const getCriticalThresholds = () => ({
  potassium: { critical_high: 6.0, critical_low: 3.0 },
  phosphorus: { critical_high: 7.0, critical_low: 2.5 },
  calcium: { critical_high: 11.0, critical_low: 7.5 },
  albumin: { critical_low: 3.0 },
  hemoglobin: { critical_low: 9.0 },
  iPTH: { critical_high: 500, critical_low: 100 }
});

export const getParameterInfo = (parameter: keyof LabValues) => {
  const info: Record<keyof LabValues, { name: string; description: string; importance: string }> = {
    potassium: {
      name: 'Potassium',
      description: 'Essential electrolyte for heart rhythm and muscle function',
      importance: 'Critical - abnormal levels can cause cardiac arrest'
    },
    sodium: {
      name: 'Sodium',
      description: 'Primary electrolyte for fluid balance',
      importance: 'Important for fluid management and blood pressure'
    },
    chloride: {
      name: 'Chloride',
      description: 'Electrolyte that works with sodium',
      importance: 'Helps maintain acid-base balance'
    },
    calcium: {
      name: 'Calcium',
      description: 'Essential for bone health and muscle function',
      importance: 'Critical for bone disease prevention'
    },
    phosphorus: {
      name: 'Phosphorus',
      description: 'Mineral that works with calcium for bone health',
      importance: 'High levels accelerate bone disease and cardiovascular calcification'
    },
    magnesium: {
      name: 'Magnesium',
      description: 'Mineral important for heart and muscle function',
      importance: 'Affects calcium and potassium balance'
    },
    urea: {
      name: 'Blood Urea Nitrogen (BUN)',
      description: 'Waste product filtered by kidneys',
      importance: 'Indicates dialysis adequacy'
    },
    creatinine: {
      name: 'Creatinine',
      description: 'Muscle waste product filtered by kidneys',
      importance: 'Marker of kidney function and dialysis adequacy'
    },
    eGFR: {
      name: 'Estimated GFR',
      description: 'Estimated kidney filtration rate',
      importance: 'Overall measure of kidney function'
    },
    albumin: {
      name: 'Albumin',
      description: 'Main protein in blood',
      importance: 'Critical marker of nutrition and mortality risk'
    },
    totalProtein: {
      name: 'Total Protein',
      description: 'All proteins in blood combined',
      importance: 'General nutritional status indicator'
    },
    prealbumin: {
      name: 'Prealbumin',
      description: 'Protein that changes quickly with nutrition',
      importance: 'Sensitive marker of recent nutritional changes'
    },
    hemoglobin: {
      name: 'Hemoglobin',
      description: 'Protein in red blood cells that carries oxygen',
      importance: 'Critical for preventing anemia and fatigue'
    },
    hematocrit: {
      name: 'Hematocrit',
      description: 'Percentage of blood that is red blood cells',
      importance: 'Measures blood thickness and anemia'
    },
    serumIron: {
      name: 'Serum Iron',
      description: 'Iron available in blood',
      importance: 'Essential for red blood cell production'
    },
    tsat: {
      name: 'Transferrin Saturation',
      description: 'Percentage of iron-binding protein that is saturated',
      importance: 'Best measure of iron availability for red blood cells'
    },
    serumFerritin: {
      name: 'Ferritin',
      description: 'Protein that stores iron',
      importance: 'Indicates total body iron stores'
    },
    tibc: {
      name: 'Total Iron Binding Capacity',
      description: 'Total amount of iron blood can carry',
      importance: 'Helps interpret iron studies'
    },
    iPTH: {
      name: 'Intact Parathyroid Hormone',
      description: 'Hormone that regulates calcium and phosphorus',
      importance: 'Critical for bone health - too high or low causes bone disease'
    },
    vitaminD: {
      name: 'Vitamin D',
      description: 'Vitamin essential for calcium absorption',
      importance: 'Required for bone health and immune function'
    },
    alkalinePhosphatase: {
      name: 'Alkaline Phosphatase',
      description: 'Enzyme found in liver and bones',
      importance: 'Marker of bone turnover and liver function'
    },
    vitaminB12: {
      name: 'Vitamin B12',
      description: 'Vitamin essential for nerve function and red blood cells',
      importance: 'Prevents anemia and nerve damage'
    },
    folate: {
      name: 'Folate',
      description: 'B vitamin essential for cell division',
      importance: 'Works with B12 to prevent anemia'
    },
    zinc: {
      name: 'Zinc',
      description: 'Mineral important for immune function and wound healing',
      importance: 'Often deficient in dialysis patients'
    },
    totalCholesterol: {
      name: 'Total Cholesterol',
      description: 'All cholesterol in blood',
      importance: 'Cardiovascular risk factor'
    },
    ldl: {
      name: 'LDL Cholesterol',
      description: 'Bad cholesterol',
      importance: 'Major cardiovascular risk factor'
    },
    hdl: {
      name: 'HDL Cholesterol',
      description: 'Good cholesterol',
      importance: 'Protective against heart disease'
    },
    triglycerides: {
      name: 'Triglycerides',
      description: 'Type of fat in blood',
      importance: 'Cardiovascular and pancreatitis risk factor'
    },
    crp: {
      name: 'C-Reactive Protein',
      description: 'Marker of inflammation in the body',
      importance: 'High levels indicate infection or inflammation'
    },
    ktv: {
      name: 'Kt/V',
      description: 'Measure of dialysis adequacy',
      importance: 'Critical measure - inadequate dialysis increases mortality'
    },
    urr: {
      name: 'Urea Reduction Ratio',
      description: 'Percentage of urea removed during dialysis',
      importance: 'Alternative measure of dialysis adequacy'
    }
  };
  
  return info[parameter] || { name: parameter, description: 'Lab parameter', importance: 'Clinical significance varies' };
};