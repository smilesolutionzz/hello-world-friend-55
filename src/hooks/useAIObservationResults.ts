import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface AIObservationResult {
  id: string;
  user_id: string;
  analysis_type: string;
  input_type: string;
  input_context: string | null;
  age_group: string | null;
  analysis_result: any;
  risk_level: string | null;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export function useAIObservationResults() {
  const { toast } = useToast();
  const [results, setResults] = useState<AIObservationResult[]>([]);
  const [loading, setLoading] = useState(true);

  const loadResults = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('ai_observation_results')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResults(data || []);
    } catch (error) {
      console.error('Error loading AI observation results:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveResult = async (params: {
    analysisType: string;
    inputType: 'video' | 'audio' | 'text';
    inputContext?: string;
    ageGroup?: string;
    analysisResult: any;
    riskLevel?: string;
    title?: string;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "로그인 필요",
          description: "결과를 저장하려면 로그인이 필요합니다.",
          variant: "destructive",
        });
        return null;
      }

      const { data, error } = await supabase
        .from('ai_observation_results')
        .insert({
          user_id: user.id,
          analysis_type: params.analysisType,
          input_type: params.inputType,
          input_context: params.inputContext || null,
          age_group: params.ageGroup || null,
          analysis_result: params.analysisResult,
          risk_level: params.riskLevel || null,
          title: params.title || `${getAnalysisTypeLabel(params.analysisType)} 분석`,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "저장 완료",
        description: "분석 결과가 저장되었습니다.",
      });

      await loadResults();
      return data;
    } catch (error) {
      console.error('Error saving AI observation result:', error);
      toast({
        title: "저장 실패",
        description: "결과를 저장하는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteResult = async (id: string) => {
    try {
      const { error } = await supabase
        .from('ai_observation_results')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "삭제 완료",
        description: "분석 결과가 삭제되었습니다.",
      });

      await loadResults();
      return true;
    } catch (error) {
      console.error('Error deleting AI observation result:', error);
      toast({
        title: "삭제 실패",
        description: "결과를 삭제하는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    loadResults();
  }, []);

  return {
    results,
    loading,
    saveResult,
    deleteResult,
    refresh: loadResults,
  };
}

export function getAnalysisTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    child_behavior: '아동 행동패턴',
    language_delay: '언어발달',
    autism_screening: '자폐스펙트럼',
    adult_psychology: '성인심리',
    elderly_cognitive: '노인인지',
    motor_function: '운동기능',
  };
  return labels[type] || type;
}

export function getInputTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    video: '영상',
    audio: '음성',
    text: '텍스트',
  };
  return labels[type] || type;
}

export function getRiskLevelConfig(level: string | null) {
  const configs: Record<string, { bg: string; text: string; label: string }> = {
    low: { bg: 'bg-emerald-500/20', text: 'text-emerald-600 dark:text-emerald-400', label: '양호' },
    medium: { bg: 'bg-amber-500/20', text: 'text-amber-600 dark:text-amber-400', label: '관찰 필요' },
    high: { bg: 'bg-rose-500/20', text: 'text-rose-600 dark:text-rose-400', label: '주의 필요' },
  };
  return configs[level || ''] || { bg: 'bg-slate-100', text: 'text-slate-600', label: '-' };
}
