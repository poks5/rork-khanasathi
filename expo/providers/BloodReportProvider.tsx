import { useState, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { BloodReport, LabValues } from '@/types/bloodReport';
import { analyzeLabsWithEngine } from '@/utils/labIntegrationEngine';

// Cross-platform UUID generation
const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const STORAGE_KEY = 'bloodReports';

export const [BloodReportProvider, useBloodReports] = createContextHook(() => {
  const [reports, setReports] = useState<BloodReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<BloodReport | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsedReports = JSON.parse(stored);
        setReports(parsedReports);
        console.log(`📊 Loaded ${parsedReports.length} blood reports from storage`);
      }
    } catch (error) {
      console.error('Error loading blood reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveReports = async (newReports: BloodReport[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newReports));
      console.log(`💾 Saved ${newReports.length} blood reports to storage`);
    } catch (error) {
      console.error('Error saving blood reports:', error);
    }
  };

  const addReport = useCallback((reportData: Omit<BloodReport, 'id' | 'lastModified' | 'version'>) => {
    console.log('🩸 Adding new blood report:', reportData.date);
    
    // Get previous reports for trend analysis
    const previousReports = reports
      .filter(r => new Date(r.date) < new Date(reportData.date))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map(r => r.preHD);

    // Analyze the new report
    const analysis = analyzeLabsWithEngine(reportData.preHD, previousReports);

    const newReport: BloodReport = {
      ...reportData,
      id: generateUUID(),
      analysis,
      lastModified: new Date().toISOString(),
      version: 1
    };

    const updatedReports = [...reports, newReport].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    setReports(updatedReports);
    saveReports(updatedReports);

    console.log(`✅ Added report with ${analysis.alerts.length} alerts and ${analysis.recommendations.length} recommendations`);
    
    return newReport;
  }, [reports]);

  const updateReport = useCallback((id: string, updates: Partial<BloodReport>) => {
    console.log('📝 Updating blood report:', id);
    
    const updatedReports = reports.map(report => {
      if (report.id === id) {
        const updatedReport = {
          ...report,
          ...updates,
          lastModified: new Date().toISOString(),
          version: (report.version || 1) + 1
        };

        // Re-analyze if lab values changed
        if (updates.preHD || updates.postHD) {
          const previousReports = reports
            .filter(r => r.id !== id && new Date(r.date) < new Date(updatedReport.date))
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map(r => r.preHD);

          updatedReport.analysis = analyzeLabsWithEngine(
            updates.preHD || report.preHD,
            previousReports
          );
        }

        return updatedReport;
      }
      return report;
    });

    setReports(updatedReports);
    saveReports(updatedReports);
  }, [reports]);

  const deleteReport = useCallback((id: string) => {
    console.log('🗑️ Deleting blood report:', id);
    const updatedReports = reports.filter(report => report.id !== id);
    setReports(updatedReports);
    saveReports(updatedReports);
  }, [reports]);

  const getReportsByDateRange = useCallback((startDate: string, endDate: string) => {
    return reports.filter(report => {
      const reportDate = new Date(report.date);
      return reportDate >= new Date(startDate) && reportDate <= new Date(endDate);
    });
  }, [reports]);

  const getLatestReport = useMemo(() => {
    return reports.length > 0 ? reports[0] : null;
  }, [reports]);

  const getCriticalAlerts = useMemo(() => {
    const latestReport = getLatestReport;
    if (!latestReport?.analysis) return [];
    
    return latestReport.analysis.alerts.filter(
      alert => alert.urgency === 'critical' || alert.severity === 'severe'
    );
  }, [getLatestReport]);

  const getRecommendationsByPriority = useMemo(() => {
    const latestReport = getLatestReport;
    if (!latestReport?.analysis) return { critical: [], high: [], medium: [], low: [] };
    
    const recommendations = latestReport.analysis.recommendations;
    return {
      critical: recommendations.filter(r => r.priority === 'critical'),
      high: recommendations.filter(r => r.priority === 'high'),
      medium: recommendations.filter(r => r.priority === 'medium'),
      low: recommendations.filter(r => r.priority === 'low')
    };
  }, [getLatestReport]);

  const getTrendData = useMemo(() => {
    if (reports.length < 2) return null;
    
    const sortedReports = [...reports].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const parameters = ['potassium', 'phosphorus', 'albumin', 'hemoglobin', 'iPTH'] as const;
    const trends: Record<string, { dates: string[]; values: number[] }> = {};

    parameters.forEach(param => {
      const data = sortedReports
        .filter(report => report.preHD[param] !== undefined)
        .map(report => ({
          date: report.date,
          value: report.preHD[param] as number
        }));

      if (data.length >= 2) {
        trends[param] = {
          dates: data.map(d => d.date),
          values: data.map(d => d.value)
        };
      }
    });

    return trends;
  }, [reports]);

  const exportReportsAsJSON = useCallback(() => {
    const exportData = {
      exportDate: new Date().toISOString(),
      totalReports: reports.length,
      reports: reports.map(report => ({
        ...report,
        exportNote: 'Generated by Kidney Care App'
      }))
    };
    
    return JSON.stringify(exportData, null, 2);
  }, [reports]);

  const importReportsFromJSON = useCallback(async (jsonData: string) => {
    try {
      const importData = JSON.parse(jsonData);
      if (importData.reports && Array.isArray(importData.reports)) {
        const importedReports = importData.reports as BloodReport[];
        
        // Merge with existing reports, avoiding duplicates
        const existingIds = new Set(reports.map(r => r.id));
        const newReports = importedReports.filter(r => !existingIds.has(r.id));
        
        if (newReports.length > 0) {
          const mergedReports = [...reports, ...newReports].sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
          );
          
          setReports(mergedReports);
          await saveReports(mergedReports);
          
          console.log(`📥 Imported ${newReports.length} new reports`);
          return { success: true, imported: newReports.length };
        } else {
          return { success: true, imported: 0, message: 'No new reports to import' };
        }
      } else {
        throw new Error('Invalid JSON format');
      }
    } catch (error) {
      console.error('Error importing reports:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }, [reports]);

  const clearAllReports = useCallback(async () => {
    console.log('🧹 Clearing all blood reports');
    setReports([]);
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing reports:', error);
    }
  }, []);

  return useMemo(() => ({
    // Data
    reports,
    selectedReport,
    isLoading,
    
    // Computed values
    latestReport: getLatestReport,
    criticalAlerts: getCriticalAlerts,
    recommendationsByPriority: getRecommendationsByPriority,
    trendData: getTrendData,
    
    // Actions
    addReport,
    updateReport,
    deleteReport,
    setSelectedReport,
    
    // Queries
    getReportsByDateRange,
    
    // Import/Export
    exportReportsAsJSON,
    importReportsFromJSON,
    clearAllReports
  }), [
    reports,
    selectedReport,
    isLoading,
    getLatestReport,
    getCriticalAlerts,
    getRecommendationsByPriority,
    getTrendData,
    addReport,
    updateReport,
    deleteReport,
    getReportsByDateRange,
    exportReportsAsJSON,
    importReportsFromJSON,
    clearAllReports
  ]);
});