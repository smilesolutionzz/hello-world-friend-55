-- 치료 세션 기록 테이블
CREATE TABLE IF NOT EXISTS therapy_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  therapist_type TEXT NOT NULL,
  session_number INTEGER NOT NULL DEFAULT 1,
  user_concern TEXT,
  session_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  duration_minutes INTEGER,
  mood_before INTEGER CHECK (mood_before >= 1 AND mood_before <= 10),
  mood_after INTEGER CHECK (mood_after >= 1 AND mood_after <= 10),
  session_notes TEXT,
  therapist_observations TEXT,
  key_insights TEXT[],
  homework_assigned TEXT[],
  progress_rating INTEGER CHECK (progress_rating >= 1 AND progress_rating <= 5),
  next_session_goals TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 치료 목표 추적 테이블
CREATE TABLE IF NOT EXISTS therapy_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  therapist_type TEXT NOT NULL,
  goal_title TEXT NOT NULL,
  goal_description TEXT,
  target_date DATE,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT CHECK (status IN ('not_started', 'in_progress', 'achieved', 'on_hold')) DEFAULT 'not_started',
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  milestones JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 대화 분석 및 인사이트 테이블
CREATE TABLE IF NOT EXISTS therapy_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES therapy_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  insight_type TEXT CHECK (insight_type IN ('pattern', 'breakthrough', 'concern', 'strength', 'homework_compliance')),
  insight_content TEXT NOT NULL,
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
  ai_generated BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 치료 기법 적용 로그
CREATE TABLE IF NOT EXISTS therapy_techniques_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES therapy_sessions(id) ON DELETE CASCADE,
  technique_name TEXT NOT NULL,
  technique_category TEXT,
  effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
  client_response TEXT,
  therapist_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS 정책 설정
ALTER TABLE therapy_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapy_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapy_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE therapy_techniques_log ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 데이터만 볼 수 있음
CREATE POLICY "Users can view own therapy sessions"
  ON therapy_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own therapy sessions"
  ON therapy_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own therapy sessions"
  ON therapy_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own therapy goals"
  ON therapy_goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own therapy goals"
  ON therapy_goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own therapy goals"
  ON therapy_goals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own therapy insights"
  ON therapy_insights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own therapy insights"
  ON therapy_insights FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own therapy techniques log"
  ON therapy_techniques_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM therapy_sessions 
      WHERE therapy_sessions.id = therapy_techniques_log.session_id 
      AND therapy_sessions.user_id = auth.uid()
    )
  );

-- 인덱스 생성
CREATE INDEX idx_therapy_sessions_user_id ON therapy_sessions(user_id);
CREATE INDEX idx_therapy_sessions_therapist_type ON therapy_sessions(therapist_type);
CREATE INDEX idx_therapy_goals_user_id ON therapy_goals(user_id);
CREATE INDEX idx_therapy_insights_session_id ON therapy_insights(session_id);
CREATE INDEX idx_therapy_techniques_session_id ON therapy_techniques_log(session_id);

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_therapy_sessions_updated_at
  BEFORE UPDATE ON therapy_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_therapy_goals_updated_at
  BEFORE UPDATE ON therapy_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();