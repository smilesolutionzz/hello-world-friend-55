-- Create weekly missions table
CREATE TABLE public.weekly_missions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  week_start_date DATE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'health',
  difficulty TEXT NOT NULL DEFAULT 'easy',
  points INTEGER NOT NULL DEFAULT 10,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user mission progress table
CREATE TABLE public.user_mission_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  mission_id UUID NOT NULL REFERENCES public.weekly_missions(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, mission_id)
);

-- Enable RLS
ALTER TABLE public.weekly_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_mission_progress ENABLE ROW LEVEL SECURITY;

-- Create policies for weekly_missions (viewable by everyone)
CREATE POLICY "Weekly missions are viewable by everyone"
ON public.weekly_missions
FOR SELECT
USING (is_active = true);

-- Create policies for user_mission_progress (users can manage their own progress)
CREATE POLICY "Users can view their own mission progress"
ON public.user_mission_progress
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mission progress"
ON public.user_mission_progress
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mission progress"
ON public.user_mission_progress
FOR UPDATE
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_weekly_missions_updated_at
  BEFORE UPDATE ON public.weekly_missions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_mission_progress_updated_at
  BEFORE UPDATE ON public.user_mission_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample weekly missions
INSERT INTO public.weekly_missions (week_start_date, title, description, category, difficulty, points) VALUES
('2025-01-20', '하루 30분 명상하기', '매일 30분씩 명상이나 마음챙김을 실천해보세요. 스트레스 관리에 도움이 됩니다.', 'mental_health', 'easy', 15),
('2025-01-20', '일주일 금연/금주 도전', '7일간 금연 또는 금주에 도전해보세요. 건강한 체질 개선에 도움이 됩니다.', 'health', 'hard', 30),
('2025-01-20', '매일 따뜻한 차 마시기', '체질에 맞는 따뜻한 차를 매일 마셔보세요. 소음인에게 특히 좋습니다.', 'diet', 'easy', 10),
('2025-01-20', '주 3회 이상 운동하기', '본인 체질에 맞는 운동을 주 3회 이상 실천해보세요.', 'exercise', 'medium', 20),
('2025-01-20', '일찍 자고 일찍 일어나기', '밤 11시 전 취침, 오전 7시 기상으로 규칙적인 생활리듬을 만들어보세요.', 'lifestyle', 'medium', 20);