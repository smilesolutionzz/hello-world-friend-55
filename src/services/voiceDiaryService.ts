import { supabase } from "@/integrations/supabase/client";

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

export interface VoiceDiaryEntryInsert {
  user_id: string;
  title?: string;
  audio_url?: string;
  audio_duration?: number;
  transcription?: string;
  emotion_analysis?: any;
  diary_date: string;
}

export interface VoiceDiaryEntryUpdate {
  title?: string;
  audio_url?: string;
  audio_duration?: number;
  transcription?: string;
  emotion_analysis?: any;
  diary_date?: string;
}

export const voiceDiaryService = {
  async createEntry(entry: VoiceDiaryEntryInsert): Promise<VoiceDiaryEntry> {
    const { data, error } = await supabase
      .from('voice_diary_entries')
      .insert(entry)
      .select()
      .single();

    if (error) throw error;
    return data as VoiceDiaryEntry;
  },

  async getEntries(userId: string): Promise<VoiceDiaryEntry[]> {
    const { data, error } = await supabase
      .from('voice_diary_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as VoiceDiaryEntry[];
  },

  async updateEntry(id: string, updates: VoiceDiaryEntryUpdate): Promise<VoiceDiaryEntry> {
    const { data, error } = await supabase
      .from('voice_diary_entries')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as VoiceDiaryEntry;
  },

  async deleteEntry(id: string): Promise<void> {
    const { error } = await supabase
      .from('voice_diary_entries')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};