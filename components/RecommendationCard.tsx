import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import { ChevronDown, ChevronUp, AlertTriangle, Info, Droplet, Heart, Utensils, Activity } from 'lucide-react-native';
import { NutritionRecommendation, RecommendationCategory } from '@/types/food';
import { useLanguage } from '@/providers/LanguageProvider';
import { colors } from '@/constants/colors';
import { getFoodById } from '@/data/foodDatabase';
import { router } from 'expo-router';

interface RecommendationCardProps {
  recommendation: NutritionRecommendation;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation }) => {
  const { language, t } = useLanguage();
  const [expanded, setExpanded] = useState(false);
  
  const getCategoryIcon = (category: RecommendationCategory) => {
    switch (category) {
      case 'protein-optimization':
        return <Utensils size={20} color={colors.white} />;
      case 'mineral-management':
        return <AlertTriangle size={20} color={colors.white} />;
      case 'fluid-balance':
        return <Droplet size={20} color={colors.white} />;
      case 'bone-health':
        return <Activity size={20} color={colors.white} />;
      case 'anemia-management':
        return <Activity size={20} color={colors.white} />;
      case 'cardiovascular-health':
        return <Heart size={20} color={colors.white} />;
      default:
        return <Info size={20} color={colors.white} />;
    }
  };
  
  const getCategoryColor = (category: RecommendationCategory) => {
    switch (category) {
      case 'protein-optimization':
        return colors.nutrients.protein;
      case 'mineral-management':
        return colors.nutrients.potassium;
      case 'fluid-balance':
        return colors.nutrients.fluid;
      case 'bone-health':
        return colors.nutrients.phosphorus;
      case 'anemia-management':
        return colors.danger;
      case 'cardiovascular-health':
        return colors.nutrients.sodium;
      default:
        return colors.primary;
    }
  };
  
  const getPriorityColor = (priority: 'high' | 'medium' | 'low' | 'critical') => {
    switch (priority) {
      case 'critical':
        return colors.danger;
      case 'high':
        return colors.danger;
      case 'medium':
        return colors.warning;
      case 'low':
        return colors.success;
      default:
        return colors.gray;
    }
  };
  
  const handleFoodPress = (foodId: string) => {
    router.push({ pathname: '/food-details', params: { foodId } } as any);
  };
  
  const title = language === 'en' ? recommendation.title.en : recommendation.title.ne;
  const description = language === 'en' ? recommendation.description.en : recommendation.description.ne;
  const categoryColor = getCategoryColor(recommendation.category);
  
  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: categoryColor }]}>
        <View style={styles.iconContainer}>
          {getCategoryIcon(recommendation.category)}
        </View>
        <Text style={styles.title}>{title}</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.description}>{description}</Text>
        
        <View style={styles.priorityContainer}>
          <Text style={styles.priorityLabel}>{t('recommendationCard.priority')}:</Text>
          <View 
            style={[styles.priorityBadge, { backgroundColor: getPriorityColor(recommendation.priority) }]}
          >
            <Text style={styles.priorityText}>{recommendation.priority.toUpperCase()}</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.expandButton} 
          onPress={() => setExpanded(!expanded)}
        >
          <Text style={styles.expandText}>
            {expanded ? t('recommendationCard.showLess') : t('recommendationCard.showMore')}
          </Text>
          {expanded ? 
            <ChevronUp size={16} color={colors.primary} /> : 
            <ChevronDown size={16} color={colors.primary} />
          }
        </TouchableOpacity>
        
        {expanded && (
          <View style={styles.expandedContent}>
            {recommendation.suggestedFoods && recommendation.suggestedFoods.length > 0 && (
              <View style={styles.foodSection}>
                <Text style={styles.sectionTitle}>{t('recommendationCard.recommendedFoods')}</Text>
                <View style={styles.foodGrid}>
                  {recommendation.suggestedFoods.map(foodId => {
                    const food = getFoodById(foodId);
                    if (!food) return null;
                    
                    return (
                      <TouchableOpacity 
                        key={food.id}
                        style={styles.foodItem}
                        onPress={() => handleFoodPress(food.id)}
                      >
                        <Image 
                          source={{ uri: food.image }}
                          style={styles.foodImage}
                        />
                        <Text style={styles.foodName}>
                          {language === 'en' ? food.nameEn : food.nameNe}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
            
            {recommendation.avoidFoods && recommendation.avoidFoods.length > 0 && (
              <View style={styles.foodSection}>
                <Text style={styles.sectionTitle}>{t('recommendationCard.foodsToAvoid')}</Text>
                <View style={styles.foodGrid}>
                  {recommendation.avoidFoods.map(foodId => {
                    const food = getFoodById(foodId);
                    if (!food) return null;
                    
                    return (
                      <TouchableOpacity 
                        key={food.id}
                        style={[styles.foodItem, styles.avoidFoodItem]}
                        onPress={() => handleFoodPress(food.id)}
                      >
                        <Image 
                          source={{ uri: food.image }}
                          style={styles.foodImage}
                        />
                        <Text style={styles.foodName}>
                          {language === 'en' ? food.nameEn : food.nameNe}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}
            
            {recommendation.educationalContent && recommendation.educationalContent.length > 0 && (
              <View style={styles.educationSection}>
                <Text style={styles.sectionTitle}>{t('recommendationCard.educationalInfo')}</Text>
                {recommendation.educationalContent.map((content, index) => (
                  <View key={index} style={styles.educationItem}>
                    <Info size={16} color={colors.primary} />
                    <Text style={styles.educationText}>
                      {language === 'en' ? content.en : content.ne}
                    </Text>
                  </View>
                ))}
              </View>
            )}
            
            {recommendation.cookingTips && recommendation.cookingTips.length > 0 && (
              <View style={styles.educationSection}>
                <Text style={styles.sectionTitle}>{t('recommendationCard.cookingTips')}</Text>
                {recommendation.cookingTips.map((tip, index) => (
                  <View key={index} style={styles.educationItem}>
                    <Utensils size={16} color={colors.primary} />
                    <Text style={styles.educationText}>
                      {language === 'en' ? tip.en : tip.ne}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold' as const,
    flex: 1,
  },
  content: {
    padding: 16,
  },
  description: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 12,
    lineHeight: 20,
  },
  priorityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  priorityLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginRight: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  priorityText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600' as const,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  expandText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600' as const,
    marginRight: 4,
  },
  expandedContent: {
    marginTop: 8,
  },
  foodSection: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: colors.text,
    marginBottom: 12,
  },
  foodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  foodItem: {
    width: '30%',
    marginHorizontal: '1.5%',
    marginBottom: 12,
    alignItems: 'center',
  },
  avoidFoodItem: {
    opacity: 0.6,
  },
  foodImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 4,
  },
  foodName: {
    fontSize: 12,
    color: colors.text,
    textAlign: 'center',
  },
  educationSection: {
    marginTop: 16,
  },
  educationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
  },
  educationText: {
    fontSize: 13,
    color: colors.text,
    flex: 1,
    marginLeft: 8,
    lineHeight: 18,
  },
});