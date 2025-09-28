import { supabase } from "@/integrations/supabase/client";

// 간단한 타입 정의로 순환 참조 문제 해결
export interface VoiceDiaryEntry {
  id: string;
  user_id: string;
  title: string | null;
  audio_url: string | null;
  audio_duration: number | null;
  transcription: string | null;
  emotion_analysis: any;
  diary_date: string;
  created_at: string;
  updated_at: string;
}

export const voiceDiaryService = {
  async getVoiceDiaryEntries(limit = 50) {
    const { data, error } = await (supabase as any)
      .from('voice_diary_entries')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  },

  async getVoiceDiaryEntriesByEmotion(emotion: string) {
    const { data, error } = await (supabase as any)
      .from('voice_diary_entries')
      .select('*')
      .eq('emotion_analysis->emotion', emotion)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async createVoiceDiaryEntry(entry: any) {
    const { data: user } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('voice_diary_entries')
      .insert({
        ...entry,
        user_id: user.user?.id!,
        diary_date: entry.diary_date || new Date().toISOString().split('T')[0]
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteVoiceDiaryEntry(id: string) {
    const { error } = await supabase
      .from('voice_diary_entries')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};