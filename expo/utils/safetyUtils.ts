import { NutrientIntake, SafetyLevel } from '@/types/food';

export function getSafetyLevel(nutrients: NutrientIntake): SafetyLevel {
  // Per 100g or standard portion thresholds
  const { potassium, phosphorus, sodium } = nutrients;
  
  // Avoid level (any one exceeds)
  if (potassium > 400 || phosphorus > 250 || sodium > 600) {
    return 'avoid';
  }
  
  // Caution level (any one exceeds)
  if (potassium > 200 || phosphorus > 150 || sodium > 300) {
    return 'caution';
  }
  
  // Safe level
  return 'safe';
}

export function getNutrientStatus(current: number, limit: number): 'safe' | 'warning' | 'danger' {
  const percentage = (current / limit) * 100;
  
  if (percentage > 100) return 'danger';
  if (percentage > 80) return 'warning';
  return 'safe';
}