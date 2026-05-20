-- Lite assessment item bank for /check flow
CREATE TABLE IF NOT EXISTS public.lite_assessments (
  area_code text NOT NULL,
  question_no int NOT NULL,
  prompt text NOT NULL,
  weight numeric NOT NULL DEFAULT 1,
  reverse_scored boolean NOT NULL DEFAULT false,
  min_age_months int NOT NULL DEFAULT 0,
  max_age_months int NOT NULL DEFAULT 999,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (area_code, question_no)
);

ALTER TABLE public.lite_assessments ENABLE ROW LEVEL SECURITY;

-- Public read (guest flow); writes only via service role / migrations
CREATE POLICY "lite_assessments_public_read"
ON public.lite_assessments
FOR SELECT
USING (is_active = true);

-- Seed 4 areas × 3 questions
INSERT INTO public.lite_assessments (area_code, question_no, prompt) VALUES
('language', 1, '또래에 비해 새로운 단어를 익히는 속도가 느리다고 느낀다'),
('language', 2, '자기 생각을 문장으로 이어 말하는 것을 어려워한다'),
('language', 3, '질문을 했을 때 동문서답을 하거나 핵심을 놓치는 경우가 잦다'),
('emotion', 1, '사소한 일에 짜증이나 울음이 평소보다 오래 간다'),
('emotion', 2, '화가 났을 때 스스로 진정하는 데 시간이 오래 걸린다'),
('emotion', 3, '기분이 갑자기 가라앉거나 의욕이 없어 보이는 날이 자주 있다'),
('social',  1, '또래와 어울리기보다 혼자 있는 시간을 더 편해한다'),
('social',  2, '친구와의 다툼이나 오해가 반복적으로 일어난다'),
('social',  3, '새로운 환경(학교·학원·모임)에 적응하는 것을 힘들어한다'),
('focus',   1, '한 가지 일을 끝까지 마무리하지 못하고 다른 것으로 옮겨간다'),
('focus',   2, '지시를 듣고도 중간에 잊거나 다른 행동을 한다'),
('focus',   3, '앉아서 해야 하는 활동(숙제·식사)을 끝까지 지속하기 어렵다')
ON CONFLICT (area_code, question_no) DO NOTHING;