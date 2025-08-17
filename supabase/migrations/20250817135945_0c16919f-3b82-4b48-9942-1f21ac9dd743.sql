-- Create observation templates table
CREATE TABLE public.observation_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  domain TEXT NOT NULL, -- 'child_development', 'psychology', 'elderly_care', 'workplace', 'learning', 'family', 'medical'
  description TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of observation items with scoring criteria
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create observation sessions table
CREATE TABLE public.observation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL,
  template_id UUID REFERENCES public.observation_templates(id),
  session_name TEXT NOT NULL,
  domain TEXT NOT NULL,
  observer_name TEXT NOT NULL,
  observation_period_start DATE NOT NULL,
  observation_period_end DATE NOT NULL,
  status TEXT DEFAULT 'in_progress', -- 'in_progress', 'completed', 'analyzed'
  raw_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  analysis_data JSONB DEFAULT '{}'::jsonb,
  ai_analysis TEXT,
  recommendations JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create observation reports table
CREATE TABLE public.observation_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.observation_sessions(id),
  report_type TEXT NOT NULL, -- 'summary', 'detailed', 'comprehensive'
  title TEXT NOT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  pdf_url TEXT,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID NOT NULL
);

-- Enable RLS
ALTER TABLE public.observation_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.observation_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.observation_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for observation_templates
CREATE POLICY "Anyone can view active templates" 
ON public.observation_templates 
FOR SELECT 
USING (is_active = true);

-- RLS Policies for observation_sessions
CREATE POLICY "Users can manage their observation sessions" 
ON public.observation_sessions 
FOR ALL 
USING (profile_id IN (
  SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
));

-- RLS Policies for observation_reports
CREATE POLICY "Users can view their observation reports" 
ON public.observation_reports 
FOR SELECT 
USING (session_id IN (
  SELECT os.id FROM observation_sessions os 
  JOIN profiles p ON os.profile_id = p.id 
  WHERE p.user_id = auth.uid()
));

CREATE POLICY "Users can create observation reports" 
ON public.observation_reports 
FOR INSERT 
WITH CHECK (created_by = auth.uid());

-- Insert default observation templates
INSERT INTO public.observation_templates (name, domain, description, items) VALUES 
(
  '아동발달 종합관찰',
  'child_development',
  '아동의 전영역 발달상황을 체계적으로 관찰하는 템플릿',
  '[
    {
      "category": "대근육운동",
      "items": [
        {"id": "gross_motor_1", "text": "계단 오르내리기 (양발 번갈아)", "scale": 5},
        {"id": "gross_motor_2", "text": "한 발로 균형잡기 (5초 이상)", "scale": 5},
        {"id": "gross_motor_3", "text": "공 던지고 받기", "scale": 5},
        {"id": "gross_motor_4", "text": "세발자전거/자전거 타기", "scale": 5},
        {"id": "gross_motor_5", "text": "달리기와 갑자기 멈추기", "scale": 5}
      ]
    },
    {
      "category": "소근육운동",
      "items": [
        {"id": "fine_motor_1", "text": "가위질하기 (직선, 곡선)", "scale": 5},
        {"id": "fine_motor_2", "text": "블록 쌓기 (10개 이상)", "scale": 5},
        {"id": "fine_motor_3", "text": "연필 잡기 및 그리기", "scale": 5},
        {"id": "fine_motor_4", "text": "단추 끼우기/지퍼 올리기", "scale": 5},
        {"id": "fine_motor_5", "text": "종이접기 (간단한 형태)", "scale": 5}
      ]
    },
    {
      "category": "언어발달",
      "items": [
        {"id": "language_1", "text": "명확한 발음으로 말하기", "scale": 5},
        {"id": "language_2", "text": "복문 사용하기 (접속사 활용)", "scale": 5},
        {"id": "language_3", "text": "이야기 순서대로 말하기", "scale": 5},
        {"id": "language_4", "text": "질문에 적절히 답하기", "scale": 5},
        {"id": "language_5", "text": "어휘량 (연령 적합성)", "scale": 5}
      ]
    },
    {
      "category": "사회성발달",
      "items": [
        {"id": "social_1", "text": "또래와 협동놀이하기", "scale": 5},
        {"id": "social_2", "text": "차례 지키기", "scale": 5},
        {"id": "social_3", "text": "갈등상황 대처하기", "scale": 5},
        {"id": "social_4", "text": "타인의 감정 이해하기", "scale": 5},
        {"id": "social_5", "text": "도움 요청하기", "scale": 5}
      ]
    },
    {
      "category": "인지발달",
      "items": [
        {"id": "cognitive_1", "text": "수 개념 이해 (1-20)", "scale": 5},
        {"id": "cognitive_2", "text": "패턴 인식하기", "scale": 5},
        {"id": "cognitive_3", "text": "분류하기 (색깔, 모양, 크기)", "scale": 5},
        {"id": "cognitive_4", "text": "원인과 결과 이해하기", "scale": 5},
        {"id": "cognitive_5", "text": "집중력 지속시간", "scale": 5}
      ]
    },
    {
      "category": "정서발달",
      "items": [
        {"id": "emotional_1", "text": "자신의 감정 표현하기", "scale": 5},
        {"id": "emotional_2", "text": "감정 조절하기", "scale": 5},
        {"id": "emotional_3", "text": "새로운 상황 적응하기", "scale": 5},
        {"id": "emotional_4", "text": "자신감 보이기", "scale": 5},
        {"id": "emotional_5", "text": "스트레스 상황 대처하기", "scale": 5}
      ]
    }
  ]'::jsonb
),
(
  '심리상담 관찰기록',
  'psychology',
  '심리상담 과정에서의 내담자 상태 및 변화 관찰',
  '[
    {
      "category": "정서상태",
      "items": [
        {"id": "emotion_1", "text": "우울감 정도", "scale": 5},
        {"id": "emotion_2", "text": "불안 수준", "scale": 5},
        {"id": "emotion_3", "text": "분노 조절", "scale": 5},
        {"id": "emotion_4", "text": "기분 변화 폭", "scale": 5},
        {"id": "emotion_5", "text": "정서적 안정성", "scale": 5}
      ]
    },
    {
      "category": "인지패턴",
      "items": [
        {"id": "cognitive_1", "text": "부정적 사고 빈도", "scale": 5},
        {"id": "cognitive_2", "text": "사고의 유연성", "scale": 5},
        {"id": "cognitive_3", "text": "현실 검증 능력", "scale": 5},
        {"id": "cognitive_4", "text": "문제해결 능력", "scale": 5},
        {"id": "cognitive_5", "text": "자기효능감", "scale": 5}
      ]
    },
    {
      "category": "행동변화",
      "items": [
        {"id": "behavior_1", "text": "치료 참여도", "scale": 5},
        {"id": "behavior_2", "text": "과제 수행도", "scale": 5},
        {"id": "behavior_3", "text": "변화 동기", "scale": 5},
        {"id": "behavior_4", "text": "새로운 행동 시도", "scale": 5},
        {"id": "behavior_5", "text": "진전 정도", "scale": 5}
      ]
    },
    {
      "category": "대인관계",
      "items": [
        {"id": "relationship_1", "text": "가족 관계", "scale": 5},
        {"id": "relationship_2", "text": "친구 관계", "scale": 5},
        {"id": "relationship_3", "text": "직장/학교 관계", "scale": 5},
        {"id": "relationship_4", "text": "사회적 지지 활용", "scale": 5},
        {"id": "relationship_5", "text": "갈등 해결 능력", "scale": 5}
      ]
    }
  ]'::jsonb
),
(
  '노인케어 관찰일지',
  'elderly_care',
  '노인의 인지기능, 일상생활능력, 정서적 웰빙 관찰',
  '[
    {
      "category": "인지기능",
      "items": [
        {"id": "cognitive_1", "text": "기억력 (최근 사건)", "scale": 5},
        {"id": "cognitive_2", "text": "기억력 (과거 사건)", "scale": 5},
        {"id": "cognitive_3", "text": "시간 지남력", "scale": 5},
        {"id": "cognitive_4", "text": "장소 지남력", "scale": 5},
        {"id": "cognitive_5", "text": "판단력", "scale": 5},
        {"id": "cognitive_6", "text": "계산능력", "scale": 5}
      ]
    },
    {
      "category": "일상생활능력",
      "items": [
        {"id": "adl_1", "text": "식사하기", "scale": 5},
        {"id": "adl_2", "text": "옷 입기", "scale": 5},
        {"id": "adl_3", "text": "목욕하기", "scale": 5},
        {"id": "adl_4", "text": "화장실 이용", "scale": 5},
        {"id": "adl_5", "text": "이동하기", "scale": 5},
        {"id": "adl_6", "text": "약물 관리", "scale": 5},
        {"id": "adl_7", "text": "금전 관리", "scale": 5},
        {"id": "adl_8", "text": "전화 사용", "scale": 5}
      ]
    },
    {
      "category": "정서적웰빙",
      "items": [
        {"id": "wellbeing_1", "text": "기분 상태", "scale": 5},
        {"id": "wellbeing_2", "text": "사회적 참여", "scale": 5},
        {"id": "wellbeing_3", "text": "의욕 수준", "scale": 5},
        {"id": "wellbeing_4", "text": "수면 패턴", "scale": 5},
        {"id": "wellbeing_5", "text": "식욕", "scale": 5}
      ]
    }
  ]'::jsonb
);

-- Add triggers for updated_at
CREATE TRIGGER update_observation_templates_updated_at
  BEFORE UPDATE ON public.observation_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_observation_sessions_updated_at
  BEFORE UPDATE ON public.observation_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();