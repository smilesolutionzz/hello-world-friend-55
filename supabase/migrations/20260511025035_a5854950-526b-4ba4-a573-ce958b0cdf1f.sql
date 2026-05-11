
-- 1) 아이 프로필
CREATE TABLE IF NOT EXISTS public.user_child_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_nickname text NOT NULL,
  birth_date date NOT NULL,
  pain_points text[] NOT NULL DEFAULT '{}',
  goal_text text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_child_profiles_user_id ON public.user_child_profiles(user_id);

ALTER TABLE public.user_child_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users select own child profiles"
  ON public.user_child_profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own child profiles"
  ON public.user_child_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own child profiles"
  ON public.user_child_profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own child profiles"
  ON public.user_child_profiles FOR DELETE
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.touch_user_child_profiles_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

DROP TRIGGER IF EXISTS trg_touch_user_child_profiles ON public.user_child_profiles;
CREATE TRIGGER trg_touch_user_child_profiles
  BEFORE UPDATE ON public.user_child_profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_user_child_profiles_updated_at();

-- 2) AI 맞춤 한 줄 캐시
CREATE TABLE IF NOT EXISTS public.mind_track_personal_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_profile_id uuid NOT NULL REFERENCES public.user_child_profiles(id) ON DELETE CASCADE,
  day integer NOT NULL CHECK (day BETWEEN 1 AND 30),
  personal_line text NOT NULL,
  base_mission text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (child_profile_id, day)
);

CREATE INDEX IF NOT EXISTS idx_personal_lines_user ON public.mind_track_personal_lines(user_id);

ALTER TABLE public.mind_track_personal_lines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users select own personal lines"
  ON public.mind_track_personal_lines FOR SELECT
  USING (auth.uid() = user_id);
