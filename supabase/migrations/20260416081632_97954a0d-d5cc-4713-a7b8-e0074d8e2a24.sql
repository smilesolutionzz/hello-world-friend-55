
-- 1. 리포트 재검사 알림 시스템
CREATE TABLE public.report_reassessment_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  report_id TEXT,
  test_type TEXT,
  reminder_type TEXT NOT NULL DEFAULT '3month',
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending',
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.report_reassessment_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own reminders"
ON public.report_reassessment_reminders FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reminders"
ON public.report_reassessment_reminders FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reminders"
ON public.report_reassessment_reminders FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reminders"
ON public.report_reassessment_reminders FOR DELETE
USING (auth.uid() = user_id);

CREATE INDEX idx_reminders_user_status ON public.report_reassessment_reminders(user_id, status);
CREATE INDEX idx_reminders_scheduled ON public.report_reassessment_reminders(scheduled_at) WHERE status = 'pending';

-- 2. 전문가 리포트 코멘트 레이어
CREATE TABLE public.expert_report_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_share_id UUID,
  report_history_id UUID,
  expert_user_id UUID NOT NULL,
  institution_id UUID REFERENCES public.b2b_partner_institutions(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  comment_type TEXT NOT NULL DEFAULT 'general',
  highlighted_section TEXT,
  is_visible_to_parent BOOLEAN NOT NULL DEFAULT false,
  parent_viewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.expert_report_comments ENABLE ROW LEVEL SECURITY;

-- 기관 전문가: 자기 기관의 코멘트 조회
CREATE POLICY "Experts can view their institution comments"
ON public.expert_report_comments FOR SELECT
USING (auth.uid() = expert_user_id);

-- 기관 전문가: 코멘트 작성
CREATE POLICY "Experts can create comments"
ON public.expert_report_comments FOR INSERT
WITH CHECK (auth.uid() = expert_user_id);

-- 기관 전문가: 자기 코멘트 수정
CREATE POLICY "Experts can update their own comments"
ON public.expert_report_comments FOR UPDATE
USING (auth.uid() = expert_user_id);

-- 기관 전문가: 자기 코멘트 삭제
CREATE POLICY "Experts can delete their own comments"
ON public.expert_report_comments FOR DELETE
USING (auth.uid() = expert_user_id);

-- 학부모: 공개된 코멘트 열람 (공유 리포트 기반)
CREATE POLICY "Parents can view published comments on shared reports"
ON public.expert_report_comments FOR SELECT
USING (is_visible_to_parent = true);

CREATE INDEX idx_expert_comments_report ON public.expert_report_comments(report_share_id);
CREATE INDEX idx_expert_comments_institution ON public.expert_report_comments(institution_id);
CREATE INDEX idx_expert_comments_history ON public.expert_report_comments(report_history_id);
