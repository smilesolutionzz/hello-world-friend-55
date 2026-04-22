-- 1. 전문가 개입 이벤트 테이블
CREATE TABLE public.mind_track_interventions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  enrollment_id UUID,
  trigger_day INTEGER NOT NULL, -- 7, 14, 21, 30
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('day_milestone', 'risk_detected', 'user_requested')),
  offering_key TEXT NOT NULL CHECK (offering_key IN ('text_review_9900', 'midcheck_29000', 'urgent_49000', 'premium_track_99000')),
  offering_price INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'suggested' CHECK (status IN ('suggested', 'viewed', 'clicked', 'purchased', 'completed', 'dismissed')),
  matched_expert_id UUID,
  payment_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  suggested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  acted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_mt_interventions_user ON public.mind_track_interventions(user_id, trigger_day);
CREATE INDEX idx_mt_interventions_status ON public.mind_track_interventions(status);

ALTER TABLE public.mind_track_interventions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own interventions"
  ON public.mind_track_interventions FOR SELECT
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users update own interventions"
  ON public.mind_track_interventions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own interventions"
  ON public.mind_track_interventions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins manage all interventions"
  ON public.mind_track_interventions FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_mt_interventions_updated_at
  BEFORE UPDATE ON public.mind_track_interventions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 2. 위험 감지 케어 알림 테이블
CREATE TABLE public.mind_track_risk_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  enrollment_id UUID,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('missed_3days', 'score_drop_30pct', 'low_engagement', 'help_requested')),
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high')),
  trigger_data JSONB DEFAULT '{}'::jsonb,
  notification_sent BOOLEAN NOT NULL DEFAULT false,
  notification_channel TEXT, -- email, in_app, kakao
  user_response TEXT CHECK (user_response IN ('acknowledged', 'requested_help', 'ignored', 'recovered')),
  followup_intervention_id UUID,
  detected_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_mt_risk_user ON public.mind_track_risk_alerts(user_id, detected_at DESC);
CREATE INDEX idx_mt_risk_unresolved ON public.mind_track_risk_alerts(user_id) WHERE resolved_at IS NULL;

ALTER TABLE public.mind_track_risk_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own alerts"
  ON public.mind_track_risk_alerts FOR SELECT
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users update own alerts"
  ON public.mind_track_risk_alerts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins manage all alerts"
  ON public.mind_track_risk_alerts FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_mt_risk_alerts_updated_at
  BEFORE UPDATE ON public.mind_track_risk_alerts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();