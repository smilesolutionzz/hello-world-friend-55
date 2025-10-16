import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LifeAchievementResult {
  totalScore: number;
  level: number;
  levelName: string;
  categories: Array<{
    title: string;
    score: number;
    total: number;
  }>;
  answers: any;
}

export const useLifeAchievementActions = () => {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const saveResult = async (result: LifeAchievementResult) => {
    setIsSaving(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "로그인 필요",
          description: "결과 저장을 위해 로그인이 필요합니다.",
          variant: "destructive"
        });
        return false;
      }

      const categoryScores = result.categories.reduce((acc, cat) => {
        acc[cat.title] = {
          score: cat.score,
          total: cat.total,
          percentage: Math.round((cat.score / cat.total) * 100)
        };
        return acc;
      }, {} as Record<string, any>);

      const { data, error } = await supabase
        .from('life_achievement_results')
        .insert({
          user_id: user.id,
          total_score: result.totalScore,
          level: result.level,
          level_name: result.levelName,
          category_scores: categoryScores,
          answers: result.answers
        })
        .select()
        .single();

      if (error) throw error;

      // 배지 체크
      if (data) {
        await supabase.rpc('check_and_award_badges', {
          p_user_id: user.id,
          p_result_id: data.id
        });
      }

      toast({
        title: "저장 완료",
        description: "결과가 성공적으로 저장되었습니다.",
      });

      return true;
    } catch (error) {
      console.error('Save result failed:', error);
      toast({
        title: "저장 실패",
        description: "결과 저장 중 오류가 발생했습니다.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    saveResult,
    isSaving
  };
};
