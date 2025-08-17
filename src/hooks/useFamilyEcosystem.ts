import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface FamilyMember {
  profile_id: string;
  relationship_type: string;
  generation: number;
  influence_weight: number;
  stress_sensitivity: number;
  profiles: {
    display_name: string;
    birth_date: string;
  };
}

interface FamilyDynamics {
  wellnessIndex: number;
  correlations: any[];
  insights: any[];
  memberStates: any[];
}

interface FamilyEvent {
  type: string;
  description: string;
  date: string;
  impactLevel: number;
  affectedMembers: string[];
}

export const useFamilyEcosystem = () => {
  const [currentFamilyId, setCurrentFamilyId] = useState<string | null>(null);
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);
  const [familyDynamics, setFamilyDynamics] = useState<FamilyDynamics | null>(null);
  const [interventionStrategies, setInterventionStrategies] = useState<any[]>([]);
  const [generationalPatterns, setGenerationalPatterns] = useState<any[]>([]);
  const [wellnessMetrics, setWellnessMetrics] = useState<any>(null);
  const [emotionalContagions, setEmotionalContagions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Get current user's family
  useEffect(() => {
    const getCurrentFamily = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();
        
        if (profile) {
          const { data: familyMember } = await supabase
            .from('family_members')
            .select('family_id')
            .eq('profile_id', profile.id)
            .single();
          
          if (familyMember) {
            setCurrentFamilyId(familyMember.family_id);
          }
        }
      }
    };

    getCurrentFamily();
  }, []);

  // Load family members when family ID is available
  useEffect(() => {
    if (currentFamilyId) {
      loadFamilyMembers();
    }
  }, [currentFamilyId]);

  const loadFamilyMembers = useCallback(async () => {
    if (!currentFamilyId) return;

    try {
      const { data, error } = await supabase
        .from('family_relationships')
        .select(`
          profile_id,
          relationship_type,
          generation,
          influence_weight,
          stress_sensitivity
        `)
        .eq('family_id', currentFamilyId);

      if (error) throw error;
      
      // Get profile data separately
      if (data && data.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, display_name, birth_date')
          .in('id', data.map(r => r.profile_id));
        
        const membersWithProfiles = data.map(rel => ({
          ...rel,
          profiles: profiles?.find(p => p.id === rel.profile_id) || { display_name: 'Unknown', birth_date: '' }
        }));
        
        setFamilyMembers(membersWithProfiles as FamilyMember[]);
      }
    } catch (error) {
      console.error('Error loading family members:', error);
    }
  }, [currentFamilyId]);

  // Analyze family dynamics
  const analyzeFamilyDynamics = useCallback(async () => {
    if (!currentFamilyId) return null;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('family-ecosystem-analyzer', {
        body: {
          action: 'analyze_family_dynamics',
          familyId: currentFamilyId
        }
      });

      if (error) throw error;

      setFamilyDynamics(data);
      toast({
        title: "가족 역학 분석 완료",
        description: `가족 웰빙 지수: ${data.wellnessIndex?.toFixed(1)}`,
      });

      return data;
    } catch (error) {
      console.error('Error analyzing family dynamics:', error);
      toast({
        title: "분석 오류",
        description: "가족 역학 분석에 실패했습니다.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [currentFamilyId, toast]);

  // Detect emotional contagion
  const detectEmotionalContagion = useCallback(async () => {
    if (!currentFamilyId) return null;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('family-ecosystem-analyzer', {
        body: {
          action: 'detect_emotional_contagion',
          familyId: currentFamilyId
        }
      });

      if (error) throw error;

      setEmotionalContagions(data.contagions || []);
      toast({
        title: "감정 전염 분석 완료",
        description: `${data.contagions?.length || 0}개의 감정 전염 패턴을 발견했습니다.`,
      });

      return data;
    } catch (error) {
      console.error('Error detecting emotional contagion:', error);
      toast({
        title: "분석 오류",
        description: "감정 전염 분석에 실패했습니다.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [currentFamilyId, toast]);

  // Generate intervention strategies
  const generateInterventionStrategies = useCallback(async () => {
    if (!currentFamilyId) return null;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('family-ecosystem-analyzer', {
        body: {
          action: 'generate_intervention_strategies',
          familyId: currentFamilyId
        }
      });

      if (error) throw error;

      setInterventionStrategies(data.strategies || []);
      toast({
        title: "개입 전략 생성 완료",
        description: `${data.strategies?.length || 0}개의 맞춤형 전략을 생성했습니다.`,
      });

      return data;
    } catch (error) {
      console.error('Error generating intervention strategies:', error);
      toast({
        title: "생성 오류",
        description: "개입 전략 생성에 실패했습니다.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [currentFamilyId, toast]);

  // Analyze generational patterns
  const analyzeGenerationalPatterns = useCallback(async () => {
    if (!currentFamilyId) return null;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('family-ecosystem-analyzer', {
        body: {
          action: 'analyze_generational_patterns',
          familyId: currentFamilyId
        }
      });

      if (error) throw error;

      setGenerationalPatterns(data.patterns || []);
      toast({
        title: "세대 패턴 분석 완료",
        description: `${data.patterns?.length || 0}개의 세대 간 패턴을 발견했습니다.`,
      });

      return data;
    } catch (error) {
      console.error('Error analyzing generational patterns:', error);
      toast({
        title: "분석 오류",
        description: "세대 패턴 분석에 실패했습니다.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [currentFamilyId, toast]);

  // Calculate family wellness index
  const calculateWellnessIndex = useCallback(async () => {
    if (!currentFamilyId) return null;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('family-ecosystem-analyzer', {
        body: {
          action: 'calculate_wellness_index',
          familyId: currentFamilyId
        }
      });

      if (error) throw error;

      setWellnessMetrics(data);
      toast({
        title: "웰빙 지수 계산 완료",
        description: `가족 전체 웰빙 지수: ${data.overallIndex?.toFixed(1)}`,
      });

      return data;
    } catch (error) {
      console.error('Error calculating wellness index:', error);
      toast({
        title: "계산 오류",
        description: "웰빙 지수 계산에 실패했습니다.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [currentFamilyId, toast]);

  // Track family event
  const trackFamilyEvent = useCallback(async (eventData: FamilyEvent) => {
    if (!currentFamilyId) return null;

    try {
      const { data, error } = await supabase.functions.invoke('family-ecosystem-analyzer', {
        body: {
          action: 'track_family_event',
          familyId: currentFamilyId,
          eventData
        }
      });

      if (error) throw error;

      toast({
        title: "가족 이벤트 기록 완료",
        description: "이벤트가 성공적으로 기록되었습니다.",
      });

      return data;
    } catch (error) {
      console.error('Error tracking family event:', error);
      toast({
        title: "기록 오류",
        description: "가족 이벤트 기록에 실패했습니다.",
        variant: "destructive",
      });
      return null;
    }
  }, [currentFamilyId, toast]);

  // Predict event impact
  const predictEventImpact = useCallback(async (eventData: FamilyEvent) => {
    if (!currentFamilyId) return null;

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('family-ecosystem-analyzer', {
        body: {
          action: 'predict_event_impact',
          familyId: currentFamilyId,
          eventData
        }
      });

      if (error) throw error;

      toast({
        title: "이벤트 영향 예측 완료",
        description: "가족 구성원별 영향도 분석이 완료되었습니다.",
      });

      return data;
    } catch (error) {
      console.error('Error predicting event impact:', error);
      toast({
        title: "예측 오류",
        description: "이벤트 영향 예측에 실패했습니다.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [currentFamilyId, toast]);

  // Run comprehensive family analysis
  const runComprehensiveAnalysis = useCallback(async () => {
    if (!currentFamilyId) return;

    setIsLoading(true);
    try {
      // Run all analyses in parallel
      await Promise.all([
        analyzeFamilyDynamics(),
        detectEmotionalContagion(),
        analyzeGenerationalPatterns(),
        calculateWellnessIndex()
      ]);

      // Generate intervention strategies after analysis
      await generateInterventionStrategies();

      toast({
        title: "종합 분석 완료",
        description: "가족 생태계 전체 분석이 완료되었습니다.",
      });
    } catch (error) {
      console.error('Error in comprehensive analysis:', error);
      toast({
        title: "분석 오류",
        description: "종합 분석 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentFamilyId, analyzeFamilyDynamics, detectEmotionalContagion, analyzeGenerationalPatterns, calculateWellnessIndex, generateInterventionStrategies, toast]);

  // Load existing data
  const loadExistingData = useCallback(async () => {
    if (!currentFamilyId) return;

    try {
      // Load latest family dynamics
      const { data: dynamics } = await supabase
        .from('family_dynamics')
        .select('*')
        .eq('family_id', currentFamilyId)
        .order('analysis_date', { ascending: false })
        .limit(1);

      if (dynamics && dynamics[0]) {
        const dynamicsData = dynamics[0].dynamics_data as any;
        setFamilyDynamics({
          wellnessIndex: dynamics[0].family_wellness_index,
          correlations: dynamicsData?.correlations || [],
          insights: dynamicsData?.ai_insights || [],
          memberStates: dynamicsData?.member_states || []
        });
      }

      // Load intervention strategies
      const { data: strategies } = await supabase
        .from('family_intervention_strategies')
        .select('*')
        .eq('family_id', currentFamilyId)
        .order('created_at', { ascending: false });

      setInterventionStrategies(strategies || []);

      // Load generational patterns
      const { data: patterns } = await supabase
        .from('generational_patterns')
        .select('*')
        .eq('family_id', currentFamilyId);

      setGenerationalPatterns(patterns || []);

      // Load wellness metrics
      const { data: wellness } = await supabase
        .from('family_wellness_metrics')
        .select('*')
        .eq('family_id', currentFamilyId)
        .order('metric_date', { ascending: false })
        .limit(1);

      if (wellness && wellness[0]) {
        setWellnessMetrics(wellness[0]);
      }

    } catch (error) {
      console.error('Error loading existing data:', error);
    }
  }, [currentFamilyId]);

  // Load existing data when family ID changes
  useEffect(() => {
    if (currentFamilyId) {
      loadExistingData();
    }
  }, [currentFamilyId, loadExistingData]);

  return {
    // State
    currentFamilyId,
    familyMembers,
    familyDynamics,
    interventionStrategies,
    generationalPatterns,
    wellnessMetrics,
    emotionalContagions,
    isLoading,

    // Actions
    analyzeFamilyDynamics,
    detectEmotionalContagion,
    generateInterventionStrategies,
    analyzeGenerationalPatterns,
    calculateWellnessIndex,
    trackFamilyEvent,
    predictEventImpact,
    runComprehensiveAnalysis,
    loadExistingData,
    loadFamilyMembers,
  };
};