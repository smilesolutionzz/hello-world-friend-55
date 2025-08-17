import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface OrganizationWellness {
  overall_wellness_score: number;
  department_scores: Record<string, number>;
  level_scores: Record<string, number>;
  burnout_risk_count: number;
  high_stress_count: number;
  employee_satisfaction: number;
  turnover_risk_score: number;
  team_cohesion_score: number;
  productivity_index: number;
}

export interface TurnoverPrediction {
  high_risk_employees: Array<{
    employee_id: string;
    risk_score: number;
    key_factors: string[];
  }>;
  department_risk_levels: Record<string, string>;
  predictive_factors: string[];
  intervention_recommendations: string[];
  retention_strategies: string[];
}

export interface TeamConflictAnalysis {
  departments_analysis: Array<{
    department_id: string;
    department_name: string;
    conflict_risk_level: 'low' | 'medium' | 'high' | 'critical';
    team_harmony_score: number;
    communication_quality: number;
    stress_indicators: string[];
    recommendations: string[];
  }>;
  overall_team_health: string;
  priority_interventions: string[];
}

export interface InterventionStrategy {
  strategy_type: string;
  title: string;
  description: string;
  target_demographic: {
    level: string[];
    department: string[];
  };
  duration_weeks: number;
  expected_outcomes: string[];
  implementation_steps: string[];
  success_metrics: string[];
}

export interface ROIAnalysis {
  roi_percentage: number;
  productivity_improvement: number;
  turnover_reduction: number;
  cost_savings: {
    reduced_turnover: number;
    increased_productivity: number;
    reduced_absenteeism: number;
  };
  wellness_investment_roi: string;
  key_performance_indicators: string[];
  recommendations: string[];
}

export interface CorporateProgram {
  program_title: string;
  program_type: string;
  target_demographic: {
    level: string[];
    department: string[];
  };
  program_content: {
    modules: Array<{
      title: string;
      description: string;
      duration_hours: number;
      activities: string[];
      materials: string[];
    }>;
    schedule: string;
    delivery_method: string;
  };
  success_metrics: string[];
  estimated_cost: string;
  expected_roi: string;
}

export const useCorporateAnalytics = () => {
  const [loading, setLoading] = useState(false);
  const [wellnessData, setWellnessData] = useState<OrganizationWellness | null>(null);
  const [turnoverPrediction, setTurnoverPrediction] = useState<TurnoverPrediction | null>(null);
  const [teamConflicts, setTeamConflicts] = useState<TeamConflictAnalysis | null>(null);
  const [interventionStrategies, setInterventionStrategies] = useState<InterventionStrategy[]>([]);
  const [roiAnalysis, setROIAnalysis] = useState<ROIAnalysis | null>(null);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [currentOrganization, setCurrentOrganization] = useState<any>(null);

  const analyzeOrganizationalWellness = async (organizationId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('corporate-analytics', {
        body: {
          action: 'analyze_organizational_wellness',
          organizationId
        }
      });

      if (error) throw error;

      setWellnessData(data.analysis);
      return data.analysis;
    } catch (error) {
      console.error('Error analyzing organizational wellness:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const predictTurnoverRisk = async (organizationId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('corporate-analytics', {
        body: {
          action: 'predict_turnover_risk',
          organizationId
        }
      });

      if (error) throw error;

      setTurnoverPrediction(data.prediction);
      return data.prediction;
    } catch (error) {
      console.error('Error predicting turnover risk:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const detectTeamConflicts = async (organizationId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('corporate-analytics', {
        body: {
          action: 'detect_team_conflicts',
          organizationId
        }
      });

      if (error) throw error;

      setTeamConflicts(data.analysis);
      return data.analysis;
    } catch (error) {
      console.error('Error detecting team conflicts:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const generateInterventionStrategies = async (organizationId: string, targetData: any) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('corporate-analytics', {
        body: {
          action: 'generate_intervention_strategies',
          organizationId,
          data: targetData
        }
      });

      if (error) throw error;

      setInterventionStrategies(data.strategies.strategies);
      return data.strategies;
    } catch (error) {
      console.error('Error generating intervention strategies:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const calculateROIMetrics = async (organizationId: string, periodData: any) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('corporate-analytics', {
        body: {
          action: 'calculate_roi_metrics',
          organizationId,
          data: periodData
        }
      });

      if (error) throw error;

      setROIAnalysis(data.roiAnalysis);
      return data.roiAnalysis;
    } catch (error) {
      console.error('Error calculating ROI metrics:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createCorporateProgram = async (organizationId: string, programData: any) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('corporate-analytics', {
        body: {
          action: 'create_corporate_program',
          organizationId,
          data: programData
        }
      });

      if (error) throw error;

      return data.program;
    } catch (error) {
      console.error('Error creating corporate program:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loadOrganizations = async () => {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setOrganizations(data || []);
      return data;
    } catch (error) {
      console.error('Error loading organizations:', error);
      throw error;
    }
  };

  const loadOrganizationData = async (organizationId: string) => {
    try {
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select(`
          *,
          departments (
            id,
            name,
            employee_count
          ),
          employee_profiles (
            id,
            position,
            level,
            employment_type
          )
        `)
        .eq('id', organizationId)
        .single();

      if (orgError) throw orgError;

      setCurrentOrganization(org);
      return org;
    } catch (error) {
      console.error('Error loading organization data:', error);
      throw error;
    }
  };

  const loadWellnessHistory = async (organizationId: string) => {
    try {
      const { data, error } = await supabase
        .from('organizational_wellness')
        .select('*')
        .eq('organization_id', organizationId)
        .order('metric_date', { ascending: false })
        .limit(30);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error loading wellness history:', error);
      throw error;
    }
  };

  const loadCorporatePrograms = async (organizationId: string) => {
    try {
      const { data, error } = await supabase
        .from('corporate_programs')
        .select('*')
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error loading corporate programs:', error);
      throw error;
    }
  };

  const logEmployeeWellness = async (employeeProfileId: string, wellnessData: any) => {
    try {
      const { data, error } = await supabase
        .from('employee_wellness_tracking')
        .upsert({
          employee_profile_id: employeeProfileId,
          tracking_date: new Date().toISOString().split('T')[0],
          ...wellnessData
        });

      if (error) throw error;

      return data;
    } catch (error) {
      console.error('Error logging employee wellness:', error);
      throw error;
    }
  };

  return {
    loading,
    wellnessData,
    turnoverPrediction,
    teamConflicts,
    interventionStrategies,
    roiAnalysis,
    organizations,
    currentOrganization,
    analyzeOrganizationalWellness,
    predictTurnoverRisk,
    detectTeamConflicts,
    generateInterventionStrategies,
    calculateROIMetrics,
    createCorporateProgram,
    loadOrganizations,
    loadOrganizationData,
    loadWellnessHistory,
    loadCorporatePrograms,
    logEmployeeWellness
  };
};