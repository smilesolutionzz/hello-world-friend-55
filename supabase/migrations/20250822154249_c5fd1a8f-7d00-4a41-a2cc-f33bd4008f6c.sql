-- 나머지 보안 문제 해결

-- 나머지 함수들의 search_path 설정
CREATE OR REPLACE FUNCTION public.track_feature_usage(p_user_id uuid, p_feature_type text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.usage_tracking (user_id, feature_type, usage_date, count)
  VALUES (p_user_id, p_feature_type, CURRENT_DATE, 1)
  ON CONFLICT (user_id, feature_type, usage_date)
  DO UPDATE SET count = usage_tracking.count + 1;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_monthly_usage(p_user_id uuid, p_feature_type text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  usage_count INTEGER;
BEGIN
  SELECT COALESCE(SUM(count), 0)
  INTO usage_count
  FROM public.usage_tracking
  WHERE user_id = p_user_id
    AND feature_type = p_feature_type
    AND usage_date >= DATE_TRUNC('month', CURRENT_DATE);
  
  RETURN usage_count;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- pg_cron과 pg_net 확장을 extensions 스키마로 이동
DROP EXTENSION IF EXISTS pg_cron;
DROP EXTENSION IF EXISTS pg_net;

CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- 크론 작업 다시 생성
SELECT cron.schedule(
  'daily-token-bonus',
  '0 0 * * *', -- 매일 자정 (UTC)
  $$SELECT public.add_daily_tokens();$$
);