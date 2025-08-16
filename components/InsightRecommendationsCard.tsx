import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { BookmarkIcon, EyeOffIcon, TrashIcon, PlusIcon, FilterIcon, SearchIcon } from 'lucide-react-native';
import { useInsights } from '@/providers/InsightsProvider';
import { InsightRecommendation, RecommendationCategory, RecommendationPriority } from '@/types/food';
import { useLanguage } from '@/providers/LanguageProvider';
import { translateTexts } from '@/utils/translation';

// Enhanced utility function to parse bilingual content with AI translation fallback
const parseBilingualText = (text: string, language: 'en' | 'ne', translatedTexts?: Map<string, string>): string => {
  if (language === 'en') {
    if (text.includes(' | ')) {
      const [english] = text.split(' | ');
      return english.trim();
    }
    return text;
  }
  
  // For Nepali, check AI translation first
  if (translatedTexts?.has(text)) {
    return translatedTexts.get(text)!;
  }
  
  // Fallback to bilingual separator
  if (text.includes(' | ')) {
    const [, nepali] = text.split(' | ');
    return nepali.trim();
  }
  
  return text; // Return original if no translation available
};

interface InsightRecommendationsCardProps {
  showAddButton?: boolean;
  maxHeight?: number;
}

const InsightRecommendationsCardComponent: React.FC<InsightRecommendationsCardProps> = ({
  showAddButton = true,
  maxHeight = 400
}) => {
  const {
    recommendations,
    stats,
    markAsRead,
    toggleBookmark,
    deleteRecommendation,
    getFilteredRecommendations,
    addPredefinedInsights
  } = useInsights();
  const { t, language } = useLanguage();
  
  // AI Translation state
  const [translatedTexts, setTranslatedTexts] = useState<Map<string, string>>(new Map());
  const [isTranslating, setIsTranslating] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory] = useState<RecommendationCategory | undefined>();
  const [selectedPriority] = useState<RecommendationPriority | undefined>();
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);
  const [expandedRecommendation, setExpandedRecommendation] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  
  const translateRecommendations = useCallback(async () => {
    if (isTranslating || language === 'en') return;
    
    setIsTranslating(true);
    try {
      // Collect all texts that need translation
      const textsToTranslate: string[] = [];
      const textMap = new Map<string, number>();
      
      recommendations.forEach(rec => {
        // Add title and description
        if (!textMap.has(rec.title)) {
          textMap.set(rec.title, textsToTranslate.length);
          textsToTranslate.push(rec.title);
        }
        if (!textMap.has(rec.description)) {
          textMap.set(rec.description, textsToTranslate.length);
          textsToTranslate.push(rec.description);
        }
        
        // Add tip content
        rec.tips.forEach(tip => {
          if (!textMap.has(tip.title)) {
            textMap.set(tip.title, textsToTranslate.length);
            textsToTranslate.push(tip.title);
          }
          if (!textMap.has(tip.content)) {
            textMap.set(tip.content, textsToTranslate.length);
            textsToTranslate.push(tip.content);
          }
          
          // Add food items
          tip.foods?.recommended?.forEach(food => {
            if (!textMap.has(food)) {
              textMap.set(food, textsToTranslate.length);
              textsToTranslate.push(food);
            }
          });
          
          tip.foods?.avoid?.forEach(food => {
            if (!textMap.has(food)) {
              textMap.set(food, textsToTranslate.length);
              textsToTranslate.push(food);
            }
          });
          
          // Add cooking tips
          tip.cookingTips?.forEach(cookingTip => {
            if (!textMap.has(cookingTip)) {
              textMap.set(cookingTip, textsToTranslate.length);
              textsToTranslate.push(cookingTip);
            }
          });
          
          // Add evidence
          if (tip.evidence && !textMap.has(tip.evidence)) {
            textMap.set(tip.evidence, textsToTranslate.length);
            textsToTranslate.push(tip.evidence);
          }
        });
      });
      
      if (textsToTranslate.length > 0) {
        const translations = await translateTexts(textsToTranslate, 'ne');
        const newTranslatedTexts = new Map<string, string>();
        
        textMap.forEach((index, originalText) => {
          if (translations[index]) {
            newTranslatedTexts.set(originalText, translations[index]);
          }
        });
        
        setTranslatedTexts(newTranslatedTexts);
      }
    } catch (error) {
      console.error('Failed to translate recommendations:', error);
    } finally {
      setIsTranslating(false);
    }
  }, [recommendations, isTranslating, language]);
  
  // Translate content when language changes to Nepali
  useEffect(() => {
    if (language === 'ne' && recommendations.length > 0) {
      translateRecommendations();
    } else if (language === 'en') {
      setTranslatedTexts(new Map());
    }
  }, [language, recommendations, translateRecommendations]);

  const filteredRecommendations = useMemo(() => getFilteredRecommendations({
    category: selectedCategory,
    priority: selectedPriority,
    isRead: showUnreadOnly ? false : undefined,
    isBookmarked: showBookmarkedOnly ? true : undefined,
    searchTerm: searchTerm.trim() || undefined
  }), [getFilteredRecommendations, selectedCategory, selectedPriority, showUnreadOnly, showBookmarkedOnly, searchTerm]);

  const getPriorityColor = useCallback((priority: RecommendationPriority) => {
    switch (priority) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#d97706';
      case 'low': return '#65a30d';
      default: return '#6b7280';
    }
  }, []);

  const getCategoryIcon = useCallback((category: RecommendationCategory) => {
    switch (category) {
      case 'mineral-management': return '⚖️';
      case 'protein-optimization': return '🥩';
      case 'fluid-balance': return '💧';
      case 'bone-health': return '🦴';
      case 'anemia-management': return '🩸';
      case 'cardiovascular-health': return '❤️';
      case 'safety-guidelines': return '⚠️';
      default: return '📋';
    }
  }, []);

  const handleAddPredefinedInsights = useCallback(() => {
    Alert.alert(
      t('insights.confirmAddTitle'),
      t('insights.confirmAddMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('common.add'), 
          onPress: () => {
            addPredefinedInsights();
            Alert.alert(t('insights.successAddTitle'), t('insights.successAddMessage'));
          }
        }
      ]
    );
  }, [addPredefinedInsights, t]);

  const handleDeleteRecommendation = useCallback((id: string, title: string) => {
    Alert.alert(
      t('insights.deleteConfirmTitle'),
      `${t('insights.deleteConfirmMessage')} "${title}"?`,
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('insights.delete'), 
          style: 'destructive',
          onPress: () => deleteRecommendation(id)
        }
      ]
    );
  }, [deleteRecommendation, t]);

  const renderRecommendationCard = useCallback((recommendation: InsightRecommendation) => {
    const isExpanded = expandedRecommendation === recommendation.id;
    
    return (
      <View key={recommendation.id} style={styles.recommendationCard}>
        <TouchableOpacity
          onPress={() => {
            setExpandedRecommendation(isExpanded ? null : recommendation.id);
            if (!recommendation.isRead) {
              markAsRead(recommendation.id);
            }
          }}
          style={styles.recommendationHeader}
        >
          <View style={styles.headerLeftContent}>
            <Text style={styles.categoryIcon}>{getCategoryIcon(recommendation.category)}</Text>
            <View style={styles.headerText}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[styles.title, !recommendation.isRead && styles.unreadTitle]} numberOfLines={2}>
                  {parseBilingualText(recommendation.title, language, translatedTexts)}
                </Text>
                {isTranslating && language === 'ne' && (
                  <ActivityIndicator size="small" color="#3b82f6" style={{ marginLeft: 8 }} />
                )}
              </View>
              <Text style={styles.description} numberOfLines={isExpanded ? undefined : 2}>
                {parseBilingualText(recommendation.description, language, translatedTexts)}
              </Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(recommendation.priority) }]}>
              <Text style={styles.priorityText}>{recommendation.priority.toUpperCase()}</Text>
            </View>
            {!recommendation.isRead && <View style={styles.unreadDot} />}
          </View>
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.expandedContent}>
            <Text style={styles.tipsHeader}>{t('insights.tips')} ({recommendation.tips.length})</Text>
            
            {recommendation.tips.map((tip, index) => (
              <View key={index} style={styles.tipCard}>
                <View style={styles.tipHeader}>
                  <Text style={styles.tipTitle}>{parseBilingualText(tip.title, language, translatedTexts)}</Text>
                  <View style={[styles.tipPriorityBadge, { backgroundColor: getPriorityColor(tip.priority) }]}>
                    <Text style={styles.tipPriorityText}>{tip.priority}</Text>
                  </View>
                </View>
                
                <Text style={styles.tipContent}>{parseBilingualText(tip.content, language, translatedTexts)}</Text>
                
                {tip.foods && (
                  <View style={styles.foodsSection}>
                    {tip.foods.recommended && tip.foods.recommended.length > 0 && (
                      <View style={styles.foodCategory}>
                        <Text style={styles.foodCategoryTitle}>✅ {t('insights.recommendedLabel')}:</Text>
                        {tip.foods.recommended.map((food, foodIndex) => (
                          <Text key={foodIndex} style={styles.foodItem}>• {parseBilingualText(food, language, translatedTexts)}</Text>
                        ))}
                      </View>
                    )}
                    
                    {tip.foods.avoid && tip.foods.avoid.length > 0 && (
                      <View style={styles.foodCategory}>
                        <Text style={styles.foodCategoryTitle}>❌ {t('insights.avoidLabel')}:</Text>
                        {tip.foods.avoid.map((food, foodIndex) => (
                          <Text key={foodIndex} style={styles.foodItem}>• {parseBilingualText(food, language, translatedTexts)}</Text>
                        ))}
                      </View>
                    )}
                  </View>
                )}
                
                {tip.cookingTips && tip.cookingTips.length > 0 && (
                  <View style={styles.cookingTipsSection}>
                    <Text style={styles.cookingTipsTitle}>👨‍🍳 {t('insights.cookingTipsLabel')}:</Text>
                    {tip.cookingTips.map((cookingTip, cookingIndex) => (
                      <Text key={cookingIndex} style={styles.cookingTip}>• {parseBilingualText(cookingTip, language, translatedTexts)}</Text>
                    ))}
                  </View>
                )}
                
                {tip.evidence && (
                  <View style={styles.evidenceSection}>
                    <Text style={styles.evidenceTitle}>📚 {t('insights.evidenceLabel')}:</Text>
                    <Text style={styles.evidenceText}>{parseBilingualText(tip.evidence, language, translatedTexts)}</Text>
                  </View>
                )}
              </View>
            ))}

            <View style={styles.actionButtons}>
              <TouchableOpacity
                onPress={() => toggleBookmark(recommendation.id)}
                style={[styles.actionButton, recommendation.isBookmarked && styles.bookmarkedButton]}
              >
                <BookmarkIcon 
                  size={16} 
                  color={recommendation.isBookmarked ? '#ffffff' : '#6b7280'} 
                  fill={recommendation.isBookmarked ? '#ffffff' : 'none'}
                />
                <Text style={[styles.actionButtonText, recommendation.isBookmarked && styles.bookmarkedButtonText]} numberOfLines={1}>
                  {recommendation.isBookmarked ? t('insights.bookmarkedLabel') : t('insights.bookmark')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleDeleteRecommendation(recommendation.id, recommendation.title)}
                style={[styles.actionButton, styles.deleteButton]}
              >
                <TrashIcon size={16} color="#dc2626" />
                <Text style={[styles.actionButtonText, styles.deleteButtonText]}>{t('insights.delete')}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.dateAdded}>
              {t('insights.added')}: {new Date(recommendation.dateAdded).toLocaleDateString()}
            </Text>
          </View>
        )}
      </View>
    );
  }, [expandedRecommendation, language, markAsRead, toggleBookmark, handleDeleteRecommendation, getPriorityColor, getCategoryIcon, t, isTranslating, translatedTexts]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>{t('insights.headerTitle')}</Text>
          <View style={styles.statsContainer}>
            <Text style={styles.statsText}>
              {stats.total} {t('insights.stats.total')} • {stats.unread} {t('insights.stats.unread')} • {stats.bookmarked} {t('insights.stats.bookmarked')}
            </Text>
          </View>
        </View>
        
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => setShowFilters(!showFilters)}
            style={styles.filterButton}
          >
            <FilterIcon size={20} color="#6b7280" />
          </TouchableOpacity>
          
          {showAddButton && (
            <TouchableOpacity
              onPress={handleAddPredefinedInsights}
              style={styles.addButton}
            >
              <PlusIcon size={20} color="#ffffff" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {showFilters && (
        <View style={styles.filtersContainer}>
          <View style={styles.searchContainer}>
            <SearchIcon size={16} color="#6b7280" />
            <TextInput
              style={styles.searchInput}
              placeholder={t('insights.searchPlaceholder')}
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
          </View>
          
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterTags}>
            <TouchableOpacity
              onPress={() => setShowUnreadOnly(!showUnreadOnly)}
              style={[styles.filterTag, showUnreadOnly && styles.activeFilterTag]}
            >
              <EyeOffIcon size={14} color={showUnreadOnly ? '#ffffff' : '#6b7280'} />
              <Text style={[styles.filterTagText, showUnreadOnly && styles.activeFilterTagText]}>
                {t('insights.unreadOnly')}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => setShowBookmarkedOnly(!showBookmarkedOnly)}
              style={[styles.filterTag, showBookmarkedOnly && styles.activeFilterTag]}
            >
              <BookmarkIcon size={14} color={showBookmarkedOnly ? '#ffffff' : '#6b7280'} />
              <Text style={[styles.filterTagText, showBookmarkedOnly && styles.activeFilterTagText]}>
                {t('insights.bookmarked')}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}

      <ScrollView style={[styles.recommendationsList, { maxHeight }]} showsVerticalScrollIndicator={false}>
        {filteredRecommendations.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>{t('insights.emptyTitle')}</Text>
            <Text style={styles.emptyStateText}>
              {recommendations.length === 0 
                ? t('insights.emptyNoData') 
                : t('insights.emptyAdjust')
              }
            </Text>
            {showAddButton && recommendations.length === 0 && (
              <TouchableOpacity
                onPress={handleAddPredefinedInsights}
                style={styles.emptyStateButton}
              >
                <Text style={styles.emptyStateButtonText}>{t('insights.addSampleInsights')}</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          filteredRecommendations.map(renderRecommendationCard)
        )}
      </ScrollView>
    </View>
  );
};

InsightRecommendationsCardComponent.displayName = 'InsightRecommendationsCard';

export const InsightRecommendationsCard = React.memo(InsightRecommendationsCardComponent);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  statsContainer: {
    marginTop: 4,
  },
  statsText: {
    fontSize: 12,
    color: '#6b7280',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  addButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  filtersContainer: {
    marginBottom: 16,
    gap: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1f2937',
  },
  filterTags: {
    flexDirection: 'row',
  },
  filterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    gap: 4,
  },
  activeFilterTag: {
    backgroundColor: '#3b82f6',
  },
  filterTagText: {
    fontSize: 12,
    color: '#6b7280',
  },
  activeFilterTagText: {
    color: '#ffffff',
  },
  recommendationsList: {
    flex: 1,
  },
  recommendationCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
  },
  headerLeftContent: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  categoryIcon: {
    fontSize: 20,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  unreadTitle: {
    color: '#3b82f6',
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  headerRight: {
    alignItems: 'flex-end',
    gap: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#ffffff',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3b82f6',
  },
  expandedContent: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  tipsHeader: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  tipCard: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
  },
  tipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
    marginRight: 8,
  },
  tipPriorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  tipPriorityText: {
    fontSize: 8,
    fontWeight: '600',
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  tipContent: {
    fontSize: 13,
    color: '#4b5563',
    lineHeight: 18,
    marginBottom: 8,
  },
  foodsSection: {
    marginBottom: 8,
  },
  foodCategory: {
    marginBottom: 8,
  },
  foodCategoryTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  foodItem: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 8,
    lineHeight: 16,
  },
  cookingTipsSection: {
    marginBottom: 8,
  },
  cookingTipsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  cookingTip: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 8,
    lineHeight: 16,
  },
  evidenceSection: {
    backgroundColor: '#f0f9ff',
    padding: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  evidenceTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0369a1',
    marginBottom: 4,
  },
  evidenceText: {
    fontSize: 12,
    color: '#0369a1',
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    marginBottom: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  bookmarkedButton: {
    backgroundColor: '#3b82f6',
  },
  deleteButton: {
    backgroundColor: '#fef2f2',
  },
  actionButtonText: {
    fontSize: 12,
    color: '#6b7280',
  },
  bookmarkedButtonText: {
    color: '#ffffff',
  },
  deleteButtonText: {
    color: '#dc2626',
  },
  dateAdded: {
    fontSize: 11,
    color: '#9ca3af',
    textAlign: 'right',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
  },
  emptyStateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyStateButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});