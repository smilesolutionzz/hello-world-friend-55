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

export const voiceDiaryService = {
  // 음성 일기 목록 조회
  async getVoiceDiaryEntries(limit = 50) {
    const { data, error } = await supabase
      .from('voice_diary_entries')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as VoiceDiaryEntry[];
  },

  // 특정 감정으로 필터링된 일기 조회
  async getVoiceDiaryEntriesByEmotion(emotion: string) {
    const { data, error } = await supabase
      .from('voice_diary_entries')
      .select('*')
      .eq('emotion_analysis->emotion', emotion)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as VoiceDiaryEntry[];
  },

  // 음성 일기 생성
  async createVoiceDiaryEntry(entry: {
    title?: string;
    audio_url?: string;
    audio_duration?: number;
    transcription?: string;
    emotion_analysis?: any;
    diary_date?: string;
  }) {
    const { data, error } = await supabase
      .from('voice_diary_entries')
      .insert(entry)
      .select()
      .single();

    if (error) throw error;
    return data as VoiceDiaryEntry;
  },

  // 음성 일기 삭제
  async deleteVoiceDiaryEntry(id: string) {
    const { error } = await supabase
      .from('voice_diary_entries')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  // 특정 날짜의 일기 조회
  async getVoiceDiaryEntriesByDate(date: string) {
    const { data, error } = await supabase
      .from('voice_diary_entries')
      .select('*')
      .eq('diary_date', date)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as VoiceDiaryEntry[];
  },

  // 오디오 파일 업로드
  async uploadAudioFile(file: Blob, fileName: string) {
    const { data, error } = await supabase.storage
      .from('voice-recordings')
      .upload(fileName, file, {
        contentType: 'audio/webm'
      });

    if (error) throw error;

    // 공개 URL 가져오기
    const { data: publicUrlData } = supabase.storage
      .from('voice-recordings')
      .getPublicUrl(fileName);

    return {
      path: data.path,
      publicUrl: publicUrlData.publicUrl
    };
  },

  // 오디오 파일 삭제
  async deleteAudioFile(fileName: string) {
    const { error } = await supabase.storage
      .from('voice-recordings')
      .remove([fileName]);

    if (error) throw error;
  }
};