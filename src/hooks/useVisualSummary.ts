import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { VisualSummaryData } from '@/components/visual-summary/VisualSummaryCard';

interface GenerateOptions {
  type: 'counseling' | 'assessment';
  content: string | Record<string, any>;
  therapistType?: string;
  testType?: string;
  userName?: string;
}

interface VisualSummaryResult {
  summary: VisualSummaryData;
  illustrationImage: string | null;
  infographicImage?: string | null;
  backgroundImage?: string | null;
  generatedAt: string;
}

export const useVisualSummary = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<VisualSummaryResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const generate = async (options: GenerateOptions) => {
    try {
      setIsGenerating(true);
      setError(null);

      console.log('[useVisualSummary] Generating visual summary:', options.type);

      const { data, error: fnError } = await supabase.functions.invoke('generate-visual-summary', {
        body: {
          type: options.type,
          content: options.content,
          therapistType: options.therapistType,
          testType: options.testType,
          userName: options.userName,
        }
      });

      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);

      console.log('[useVisualSummary] Summary generated:', data);
      setResult(data);

      // Save to visual_notes table
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && data?.summary) {
          await supabase.from('visual_notes' as any).insert({
            user_id: session.user.id,
            title: data.summary.title || '비주얼 노트',
            source_type: options.type,
            summary_data: data.summary,
            background_image_url: data.illustrationImage || null,
          });
          console.log('[useVisualSummary] Saved to visual_notes');
        }
      } catch (saveErr) {
        console.warn('[useVisualSummary] Failed to save to DB:', saveErr);
      }

      toast({
        title: '비주얼 노트 생성 완료! 🎨',
        description: '이미지를 저장하거나 공유할 수 있어요.',
      });

      return data;
    } catch (err) {
      console.error('[useVisualSummary] Error:', err);
      const message = err instanceof Error ? err.message : '비주얼 노트 생성에 실패했습니다.';
      setError(message);
      toast({
        title: '생성 실패',
        description: message,
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
  };

  return { generate, isGenerating, result, error, reset };
};