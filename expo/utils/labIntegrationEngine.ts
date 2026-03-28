import { LabValues, BloodReportAnalysis, LabAlert, DietaryRecommendation, TrendAnalysis } from '@/types/bloodReport';
import { DIALYSIS_REFERENCE_RANGES, getAlertSeverity, getCriticalThresholds } from './labReferenceRanges';

export interface LabIntegrationConfig {
  patientType: 'hemodialysis' | 'peritoneal' | 'ckd';
  culturalPreferences: 'nepali' | 'general';
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
}

export class LabIntegrationEngine {
  private config: LabIntegrationConfig;

  constructor(config: LabIntegrationConfig) {
    this.config = config;
  }

  public analyzeLabReport(labValues: LabValues, previousReports?: LabValues[]): BloodReportAnalysis {
    console.log('🔬 Starting lab analysis for:', Object.keys(labValues).filter(key => labValues[key as keyof LabValues] !== undefined));
    
    const alerts = this.generateAlerts(labValues);
    const recommendations = this.generateRecommendations(labValues, alerts);
    const trendAnalysis = this.analyzeTrends(labValues, previousReports);
    const riskAssessment = this.assessOverallRisk(alerts, trendAnalysis);

    console.log(`📊 Analysis complete: ${alerts.length} alerts, ${recommendations.length} recommendations, risk: ${riskAssessment.risk}`);

    return {
      alerts,
      recommendations,
      trendAnalysis,
      overallRisk: riskAssessment.risk,
      summary: riskAssessment.summary,
      clinicalPriorities: this.identifyClinicalPriorities(alerts),
      followUpRecommendations: this.generateFollowUpPlan(alerts, riskAssessment.risk)
    };
  }

  private generateAlerts(labValues: LabValues): LabAlert[] {
    const alerts: LabAlert[] = [];
    console.log('🔍 Analyzing lab values:', labValues);

    Object.entries(labValues).forEach(([parameter, value]) => {
      console.log(`🧪 Checking ${parameter}: ${value}`);
      
      if (value !== undefined && value !== null && !isNaN(Number(value))) {
        const paramKey = parameter as keyof LabValues;
        const range = DIALYSIS_REFERENCE_RANGES[paramKey];
        
        if (!range) {
          console.log(`⚠️ No reference range found for ${parameter}`);
          return;
        }
        
        const numValue = Number(value);
        let status: 'low' | 'high' | 'normal' = 'normal';

        console.log(`📊 Evaluating ${parameter}: ${numValue} against range [${range.min}, ${range.max}]`);
        
        if (numValue < range.min) {
          status = 'low';
          console.log(`⚠️ ${parameter} is LOW: ${numValue} < ${range.min}`);
        } else if (numValue > range.max) {
          status = 'high';
          console.log(`⚠️ ${parameter} is HIGH: ${numValue} > ${range.max}`);
        } else {
          console.log(`✅ ${parameter} is NORMAL: ${numValue} (${range.min}-${range.max})`);
        }

        if (status !== 'normal') {
          const severity = getAlertSeverity(numValue, range);
          const urgency = this.getUrgencyLevel(parameter, status, numValue);
          
          const alert: LabAlert = {
            parameter,
            value: numValue,
            normalRange: { min: range.min, max: range.max },
            status,
            severity,
            explanation: this.generateParameterExplanation(parameter, status, numValue),
            clinicalSignificance: this.getClinicalSignificance(parameter, status, numValue),
            urgency,
            actionRequired: urgency === 'critical' || severity === 'severe',
            timeframe: urgency === 'critical' ? 'immediate' : urgency === 'urgent' ? 'within-24h' : 'within-week'
          };
          
          alerts.push(alert);
          console.log(`🚨 Added alert for ${parameter}: ${status} (${severity}, ${urgency})`);
        }
      } else if (value !== undefined && value !== null) {
        console.log(`⚠️ Skipping ${parameter}: invalid value (${value})`);
      }
    });

    console.log(`📊 Generated ${alerts.length} alerts total`);
    return alerts.sort((a, b) => this.getUrgencyScore(b) - this.getUrgencyScore(a));
  }

  private generateRecommendations(labValues: LabValues, alerts: LabAlert[]): DietaryRecommendation[] {
    const recommendations: DietaryRecommendation[] = [];
    const culturalFoods = this.config.culturalPreferences === 'nepali';
    console.log('📝 Generating recommendations for lab values:', labValues);

    // Critical potassium management
    const potassiumValue = Number(labValues.potassium);
    if (labValues.potassium && !isNaN(potassiumValue) && potassiumValue > 5.5) {
      console.log('🚨 Critical potassium detected:', potassiumValue);
      recommendations.push({
        id: 'critical-hyperkalemia',
        title: 'URGENT: Critical Potassium Level',
        description: `Your potassium level (${potassiumValue} mEq/L) is dangerously high and requires immediate medical attention.`,
        category: 'emergency',
        priority: 'critical',
        evidence: 'KDOQI Clinical Practice Guidelines - Emergency Management',
        foods: culturalFoods 
          ? ['Avoid: Alu (potato), Kerau (peas), Pharsi (pumpkin)', 'Safe: Seto bhaat (white rice), Phapar ko pitho (buckwheat)']
          : ['Avoid: Potatoes, tomatoes, oranges, bananas', 'Safe: White rice, pasta, apples'],
        supplements: ['Contact nephrologist immediately', 'Potassium binder as prescribed'],
        actionRequired: true,
        timeframe: 'immediate'
      });
    }

    // Protein-energy wasting prevention
    const albuminValue = Number(labValues.albumin);
    if (labValues.albumin && !isNaN(albuminValue) && albuminValue < 3.5) {
      console.log('🍗 Low albumin detected:', albuminValue);
      recommendations.push({
        id: 'protein-energy-wasting',
        title: 'Prevent Protein-Energy Wasting',
        description: `Low albumin (${albuminValue} g/dL) suggests protein malnutrition, common in dialysis patients.`,
        category: 'protein',
        priority: 'high',
        evidence: 'KDOQI Nutrition Guidelines for CKD',
        foods: culturalFoods
          ? ['Machha (fish)', 'Kukhura ko masu (chicken)', 'Phul ko dal (small portions)', 'Dahi (yogurt - limited)']
          : ['Fish (salmon, tuna)', 'Chicken breast', 'Egg whites', 'Lean beef (limited)'],
        supplements: ['Renal-specific protein powder', 'Consider IDPN if severe'],
        targetValues: { albumin: '>3.8 g/dL' },
        monitoringFrequency: 'monthly'
      });
    }

    // Mineral bone disorder management
    const phosphorusValue = Number(labValues.phosphorus);
    const iPTHValue = Number(labValues.iPTH);
    if (labValues.phosphorus && !isNaN(phosphorusValue) && phosphorusValue > 5.5 && 
        labValues.iPTH && !isNaN(iPTHValue) && iPTHValue > 300) {
      console.log('🦴 Mineral bone disorder detected - P:', phosphorusValue, 'PTH:', iPTHValue);
      recommendations.push({
        id: 'mineral-bone-disorder',
        title: 'Mineral Bone Disorder Management',
        description: `High phosphorus (${phosphorusValue} mg/dL) and PTH (${iPTHValue} pg/mL) indicate bone disease requiring comprehensive management.`,
        category: 'mineral',
        priority: 'high',
        evidence: 'KDIGO CKD-MBD Guidelines',
        foods: culturalFoods
          ? ['Limit: Dudh (milk), Paneer (cheese), Badam (almonds)', 'Choose: Seto bhaat (white rice), Makai (corn)']
          : ['Limit: Dairy products, nuts, whole grains', 'Choose: White bread, rice, pasta'],
        supplements: ['Phosphate binders with ALL meals', 'Active vitamin D as prescribed', 'Calcimimetics if indicated'],
        targetValues: { phosphorus: '3.5-5.5 mg/dL', iPTH: '150-300 pg/mL' },
        coordinatedCare: ['Endocrinologist referral', 'Bone density scan']
      });
    }

    // Anemia management
    const hemoglobinValue = Number(labValues.hemoglobin);
    if (labValues.hemoglobin && !isNaN(hemoglobinValue) && hemoglobinValue < 11) {
      console.log('🩸 Anemia detected:', hemoglobinValue);
      recommendations.push({
        id: 'anemia-management',
        title: 'Anemia Management Required',
        description: `Hemoglobin ${hemoglobinValue} g/dL indicates anemia requiring treatment.`,
        category: 'protein',
        priority: 'high',
        evidence: 'KDOQI Anemia Guidelines',
        foods: culturalFoods
          ? ['Machha (fish)', 'Kukhura ko masu (chicken)', 'Palungo (spinach - limited)', 'Anda (eggs)']
          : ['Lean meats', 'Fish', 'Poultry', 'Iron-fortified cereals'],
        supplements: ['Iron supplements (separate from phosphate binders)', 'EPO as prescribed', 'Vitamin C with iron'],
        targetValues: { hemoglobin: '11-12 g/dL' },
        monitoringFrequency: 'monthly'
      });
    }

    // Iron deficiency
    const tsatValue = Number(labValues.tsat);
    if (labValues.tsat && !isNaN(tsatValue) && tsatValue < 20) {
      console.log('🩸 Iron deficiency detected:', tsatValue);
      recommendations.push({
        id: 'iron-deficiency',
        title: 'Iron Deficiency Treatment',
        description: `TSAT ${tsatValue}% indicates iron deficiency requiring supplementation.`,
        category: 'mineral',
        priority: 'high',
        evidence: 'KDOQI Anemia Guidelines',
        foods: ['Iron-rich foods with vitamin C', 'Avoid tea/coffee with iron-rich meals'],
        supplements: ['IV iron therapy may be needed', 'Oral iron between meals', 'Vitamin C 100mg with iron'],
        targetValues: { tsat: '20-50%', ferritin: '200-500 ng/mL' },
        monitoringFrequency: 'monthly'
      });
    }

    console.log(`📝 Generated ${recommendations.length} recommendations`);
    return recommendations;
  }

  private analyzeTrends(currentValues: LabValues, previousReports?: LabValues[]): { trends: TrendAnalysis[]; message?: string } {
    if (!previousReports || previousReports.length === 0) {
      return { trends: [], message: 'No previous data for trend analysis' };
    }

    const trends: TrendAnalysis[] = [];
    const criticalParameters: (keyof LabValues)[] = ['potassium', 'phosphorus', 'albumin', 'hemoglobin', 'iPTH'];

    criticalParameters.forEach(param => {
      const currentValue = currentValues[param];
      if (currentValue !== undefined) {
        const previousValues = previousReports
          .map(report => report[param])
          .filter(val => val !== undefined) as number[];

        if (previousValues.length > 0) {
          const trend = this.calculateTrend(previousValues, currentValue);
          trends.push({
            parameter: param,
            direction: trend.direction,
            magnitude: trend.magnitude,
            significance: trend.significance,
            recommendation: this.getTrendRecommendation(param, trend),
            timeframe: `Over ${previousValues.length} reports`
          });
        }
      }
    });

    return { trends };
  }

  private calculateTrend(previousValues: number[], currentValue: number): { direction: 'improving' | 'worsening' | 'stable'; magnitude: number; significance: 'mild' | 'moderate' | 'significant' } {
    const lastValue = previousValues[previousValues.length - 1];
    const change = ((currentValue - lastValue) / lastValue) * 100;

    return {
      direction: change > 5 ? 'improving' : change < -5 ? 'worsening' : 'stable',
      magnitude: Math.abs(change),
      significance: Math.abs(change) > 15 ? 'significant' : Math.abs(change) > 10 ? 'moderate' : 'mild'
    };
  }

  private generateParameterExplanation(parameter: string, status: 'low' | 'high', value: number): string {
    const explanations: Record<string, Record<'low' | 'high', string>> = {
      potassium: {
        low: 'Low potassium can cause dangerous heart rhythms, muscle weakness, and fatigue. This may indicate excessive removal during dialysis or inadequate intake.',
        high: 'High potassium is life-threatening and can cause cardiac arrest. This suggests inadequate dialysis clearance, dietary non-compliance, or medication effects.'
      },
      phosphorus: {
        low: 'Low phosphorus can cause bone pain, muscle weakness, and increased fracture risk. May indicate malnutrition or excessive binder use.',
        high: 'High phosphorus accelerates bone disease, increases cardiovascular risk, and causes calcium-phosphorus deposits in soft tissues.'
      },
      albumin: {
        low: 'Low albumin indicates protein malnutrition, inflammation, or protein losses. This is associated with increased mortality in dialysis patients.',
        high: 'High albumin may suggest dehydration or hemoconcentration. While less concerning than low levels, fluid status should be evaluated.'
      },
      iPTH: {
        low: 'Low PTH suggests adynamic bone disease with poor bone turnover. This can lead to fractures and may indicate over-suppression of parathyroid glands.',
        high: 'High PTH indicates secondary hyperparathyroidism, leading to bone disease, cardiovascular calcifications, and increased fracture risk.'
      }
    };

    return explanations[parameter]?.[status] || `${parameter} level is ${status} and requires clinical attention.`;
  }

  private getClinicalSignificance(parameter: string, status: 'low' | 'high', value: number): string {
    const significance: Record<string, Record<'low' | 'high', (value: number) => string>> = {
      potassium: {
        high: (v) => v >= 6.0 ? 'Life-threatening - risk of cardiac arrest' : v > 5.5 ? 'Significant - cardiovascular risk' : 'Moderate - monitor closely',
        low: (v) => v <= 3.0 ? 'Dangerous - muscle paralysis risk' : v < 3.5 ? 'Concerning - monitor closely' : 'Mild deviation'
      },
      phosphorus: {
        high: (v) => v >= 7.0 ? 'Severe - accelerated bone disease' : v > 5.5 ? 'Moderate - long-term complications' : 'Mild elevation',
        low: (v) => v <= 2.5 ? 'Significant - bone disease risk' : v < 3.5 ? 'Mild - nutritional concern' : 'Minor deviation'
      },
      calcium: {
        high: (v) => v >= 11.0 ? 'Severe - cardiac and neurological risk' : v > 10.5 ? 'Moderate - monitor symptoms' : 'Mild elevation',
        low: (v) => v <= 7.5 ? 'Severe - tetany and seizure risk' : v < 8.5 ? 'Moderate - muscle cramps possible' : 'Mild deficiency'
      },
      albumin: {
        high: (v) => 'Possible dehydration - check fluid status',
        low: (v) => v <= 3.0 ? 'Severe malnutrition - increased mortality risk' : v < 3.5 ? 'Moderate malnutrition - intervention needed' : 'Mild protein deficiency'
      },
      hemoglobin: {
        high: (v) => 'Possible hemoconcentration or polycythemia',
        low: (v) => v <= 9.0 ? 'Severe anemia - transfusion may be needed' : v < 11.0 ? 'Moderate anemia - treatment required' : 'Mild anemia'
      },
      sodium: {
        high: (v) => v >= 150 ? 'Severe hypernatremia - neurological risk' : v > 145 ? 'Moderate hypernatremia - fluid restriction needed' : 'Mild elevation',
        low: (v) => v <= 130 ? 'Severe hyponatremia - seizure risk' : v < 136 ? 'Moderate hyponatremia - monitor symptoms' : 'Mild reduction'
      },
      iPTH: {
        high: (v) => v >= 500 ? 'Severe hyperparathyroidism - bone disease acceleration' : v > 300 ? 'Moderate elevation - optimize treatment' : 'Mild elevation',
        low: (v) => v <= 100 ? 'Severe suppression - adynamic bone disease risk' : v < 150 ? 'Moderate suppression - monitor bone turnover' : 'Mild suppression'
      },
      urea: {
        high: (v) => v >= 100 ? 'Severe uremia - inadequate dialysis' : v > 60 ? 'Moderate elevation - review dialysis adequacy' : 'Mild elevation',
        low: (v) => 'Possible over-dialysis or malnutrition'
      },
      creatinine: {
        high: (v) => v >= 15 ? 'Severe elevation - inadequate dialysis' : v > 12 ? 'Moderate elevation - review treatment' : 'Mild elevation',
        low: (v) => 'Possible muscle wasting or over-dialysis'
      }
    };

    const paramSignificance = significance[parameter];
    if (paramSignificance && paramSignificance[status]) {
      return paramSignificance[status](value);
    }
    
    return `${parameter} level is ${status} and requires clinical evaluation`;
  }

  private getUrgencyLevel(parameter: string, status: 'low' | 'high', value: number): 'routine' | 'urgent' | 'critical' {
    console.log(`🔍 Assessing urgency for ${parameter}: ${value} (${status})`);
    
    // Critical thresholds that require immediate attention
    getCriticalThresholds(); // Available for future use
    
    switch (parameter) {
      case 'potassium':
        if (status === 'high' && value >= 6.0) {
          console.log('🚨 CRITICAL potassium level - cardiac risk');
          return 'critical';
        }
        if (status === 'low' && value <= 3.0) {
          console.log('🚨 CRITICAL potassium level - muscle paralysis risk');
          return 'critical';
        }
        if ((status === 'high' && value > 5.5) || (status === 'low' && value < 3.5)) {
          console.log('⚠️ URGENT potassium level');
          return 'urgent';
        }
        break;
        
      case 'phosphorus':
        if (status === 'high' && value >= 7.0) {
          console.log('⚠️ URGENT phosphorus level - bone disease risk');
          return 'urgent';
        }
        if (status === 'low' && value <= 2.5) {
          console.log('⚠️ URGENT phosphorus level - bone weakness risk');
          return 'urgent';
        }
        break;
        
      case 'calcium':
        if (status === 'high' && value >= 11.0) {
          console.log('⚠️ URGENT calcium level - cardiac risk');
          return 'urgent';
        }
        if (status === 'low' && value <= 7.5) {
          console.log('⚠️ URGENT calcium level - tetany risk');
          return 'urgent';
        }
        break;
        
      case 'albumin':
        if (status === 'low' && value <= 3.0) {
          console.log('⚠️ URGENT albumin level - malnutrition risk');
          return 'urgent';
        }
        break;
        
      case 'hemoglobin':
        if (status === 'low' && value <= 9.0) {
          console.log('⚠️ URGENT hemoglobin level - severe anemia');
          return 'urgent';
        }
        break;
        
      case 'iPTH':
        if (status === 'high' && value >= 500) {
          console.log('⚠️ URGENT iPTH level - severe bone disease risk');
          return 'urgent';
        }
        if (status === 'low' && value <= 100) {
          console.log('⚠️ URGENT iPTH level - adynamic bone disease risk');
          return 'urgent';
        }
        break;
        
      case 'sodium':
        if (status === 'high' && value >= 150) {
          console.log('⚠️ URGENT sodium level - hypernatremia');
          return 'urgent';
        }
        if (status === 'low' && value <= 130) {
          console.log('⚠️ URGENT sodium level - hyponatremia');
          return 'urgent';
        }
        break;
        
      case 'urea':
        if (status === 'high' && value >= 100) {
          console.log('⚠️ URGENT urea level - inadequate dialysis');
          return 'urgent';
        }
        break;
        
      case 'creatinine':
        if (status === 'high' && value >= 15) {
          console.log('⚠️ URGENT creatinine level - inadequate dialysis');
          return 'urgent';
        }
        break;
    }

    console.log('🟢 ROUTINE level for', parameter);
    return 'routine';
  }

  private getUrgencyScore(alert: LabAlert): number {
    const scores = { critical: 3, urgent: 2, routine: 1 };
    return scores[alert.urgency || 'routine'];
  }

  private identifyClinicalPriorities(alerts: LabAlert[]): string[] {
    const priorities: string[] = [];

    const criticalAlerts = alerts.filter(alert => alert.urgency === 'critical');
    const urgentAlerts = alerts.filter(alert => alert.urgency === 'urgent');

    if (criticalAlerts.length > 0) {
      priorities.push('IMMEDIATE medical evaluation required');
      priorities.push('Consider emergency dialysis if hyperkalemic');
    }

    if (urgentAlerts.length > 0) {
      priorities.push('Urgent nephrology consultation within 24-48 hours');
      priorities.push('Review medication dosing and dialysis prescription');
    }

    const albumin = alerts.find(alert => alert.parameter === 'albumin');
    if (albumin && albumin.status === 'low') {
      priorities.push('Nutritionist referral for protein-energy wasting prevention');
    }

    return priorities;
  }

  private generateFollowUpPlan(alerts: LabAlert[], riskLevel: 'low' | 'moderate' | 'high'): string[] {
    const followUp: string[] = [];

    switch (riskLevel) {
      case 'high':
        followUp.push('Repeat labs within 48-72 hours');
        followUp.push('Daily dietary counseling until stabilized');
        followUp.push('Consider hospitalization if indicated');
        break;
      case 'moderate':
        followUp.push('Repeat labs within 1-2 weeks');
        followUp.push('Weekly dietary counseling sessions');
        followUp.push('Review dialysis adequacy (Kt/V, URR)');
        break;
      case 'low':
        followUp.push('Routine monthly lab monitoring');
        followUp.push('Continue current dietary plan');
        followUp.push('Patient education reinforcement');
        break;
    }

    return followUp;
  }

  private assessOverallRisk(alerts: LabAlert[], trendAnalysis: { trends: TrendAnalysis[]; message?: string }): { risk: 'low' | 'moderate' | 'high'; summary: string } {
    const criticalAlerts = alerts.filter(alert => alert.urgency === 'critical').length;
    const severeAlerts = alerts.filter(alert => alert.severity === 'severe').length;
    const worseningTrends = trendAnalysis.trends?.filter((trend: TrendAnalysis) => trend.direction === 'worsening').length || 0;

    if (criticalAlerts >= 1 || severeAlerts >= 3) {
      return {
        risk: 'high',
        summary: 'Multiple critical abnormalities detected requiring immediate medical attention and intensive dietary intervention.'
      };
    } else if (severeAlerts >= 1 || worseningTrends >= 2) {
      return {
        risk: 'moderate',
        summary: 'Several concerning lab values detected. Close monitoring and dietary modifications recommended.'
      };
    } else {
      return {
        risk: 'low',
        summary: 'Lab values are relatively stable. Continue current management with routine monitoring.'
      };
    }
  }

  private getTrendRecommendation(parameter: keyof LabValues, trend: { direction: 'improving' | 'worsening' | 'stable'; magnitude: number; significance: 'mild' | 'moderate' | 'significant' }): string {
    if (trend.direction === 'worsening') {
      const recommendations: Record<string, string> = {
        potassium: 'Stricter dietary potassium restriction needed. Review dialysis adequacy.',
        phosphorus: 'Optimize phosphate binder timing and dosing. Dietary counseling.',
        albumin: 'Increase protein intake. Consider nutritional supplements.',
        hemoglobin: 'Evaluate iron status and EPO dosing. Check for bleeding.',
        iPTH: 'Review vitamin D therapy and phosphate control.'
      };
      return recommendations[parameter] || 'Clinical evaluation recommended';
    }

    return 'Continue current management';
  }
}

// Factory function to create configured engine
export const createLabIntegrationEngine = (patientType: 'hemodialysis' | 'peritoneal' | 'ckd' = 'hemodialysis') => {
  return new LabIntegrationEngine({
    patientType,
    culturalPreferences: 'nepali',
    riskTolerance: 'conservative'
  });
};

// Helper function for quick analysis
export const analyzeLabsWithEngine = (labValues: LabValues, previousReports?: LabValues[]) => {
  const engine = createLabIntegrationEngine();
  return engine.analyzeLabReport(labValues, previousReports);
};