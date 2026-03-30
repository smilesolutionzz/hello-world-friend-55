import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ProgressRecord {
  id: string;
  source_type: string;
  source_id: string;
  source_label: string;
  dimension_scores: Record<string, number>;
  summary: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export const useProgressTracking = () => {
  const [history, setHistory] = useState<ProgressRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const saveProgress = useCallback(async (data: {
    source_type: 'game_counseling' | 'voice_counseling' | 'assessment';
    source_id: string;
    source_label: string;
    dimension_scores: Record<string, number>;
    summary?: string;
    metadata?: Record<string, any>;
  }) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: result, error } = await supabase
        .from('progress_tracking' as any)
        .insert({
          user_id: user.id,
          source_type: data.source_type,
          source_id: data.source_id,
          source_label: data.source_label,
          dimension_scores: data.dimension_scores,
          summary: data.summary || null,
          metadata: data.metadata || {},
        })
        .select()
        .single();

      if (error) {
        console.error('Progress save error:', error);
        return null;
      }
      return result;
    } catch (err) {
      console.error('Progress tracking error:', err);
      return null;
    }
  }, []);

  const fetchHistory = useCallback(async (sourceType?: string, sourceId?: string) => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      let query = supabase
        .from('progress_tracking' as any)
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (sourceType) query = query.eq('source_type', sourceType);
      if (sourceId) query = query.eq('source_id', sourceId);

      const { data, error } = await query.limit(50);
      if (!error && data) {
        setHistory(data as unknown as ProgressRecord[]);
      }
    } catch (err) {
      console.error('Fetch history error:', err);
    }
    setLoading(false);
  }, []);

  const getPreviousResult = useCallback(async (sourceType: string, sourceId?: string): Promise<ProgressRecord | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      let query = supabase
        .from('progress_tracking' as any)
        .select('*')
        .eq('user_id', user.id)
        .eq('source_type', sourceType)
        .order('created_at', { ascending: false })
        .limit(1);

      if (sourceId) query = query.eq('source_id', sourceId);

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data[0] as unknown as ProgressRecord;
      }
      return null;
    } catch (err) {
      return null;
    }
  }, []);

  return { saveProgress, fetchHistory, getPreviousResult, history, loading };
};
