-- 음성 녹음 일기장 테이블 생성
CREATE TABLE public.voice_diary_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT,
  audio_url TEXT,
  audio_duration INTEGER, -- 초 단위
  transcription TEXT,
  emotion_analysis JSONB,
  diary_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS 정책 설정
ALTER TABLE public.voice_diary_entries ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 음성 일기만 관리할 수 있음
CREATE POLICY "Users can manage their own voice diary entries" 
ON public.voice_diary_entries 
FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 업데이트 시간 자동 갱신 트리거
CREATE OR REPLACE FUNCTION public.update_voice_diary_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_voice_diary_updated_at
BEFORE UPDATE ON public.voice_diary_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_voice_diary_updated_at();

-- 인덱스 추가
CREATE INDEX idx_voice_diary_user_date ON public.voice_diary_entries(user_id, diary_date DESC);
CREATE INDEX idx_voice_diary_created_at ON public.voice_diary_entries(created_at DESC);