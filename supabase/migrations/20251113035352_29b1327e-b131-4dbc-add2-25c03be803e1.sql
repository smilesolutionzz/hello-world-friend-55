-- pg_cron 확장 활성화
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 사용자 토큰 증가 함수 생성
CREATE OR REPLACE FUNCTION increment_user_tokens(
  p_user_id UUID,
  p_amount INTEGER
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- user_tokens 테이블이 없으면 먼저 생성
  INSERT INTO public.user_tokens (user_id, current_tokens, referral_bonus)
  VALUES (p_user_id, p_amount, p_amount)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    current_tokens = user_tokens.current_tokens + p_amount,
    referral_bonus = user_tokens.referral_bonus + p_amount,
    updated_at = now();
END;
$$;

-- 매일 오전 2시에 pending 추천 처리 (pg_cron 사용)
-- Edge Function을 HTTP로 호출
SELECT cron.schedule(
  'process-pending-referrals-daily',
  '0 2 * * *', -- 매일 오전 2시
  $$
  SELECT
    net.http_post(
      url := 'https://hrcqxjetmzxoephgyjlb.supabase.co/functions/v1/process-pending-referrals',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhyY3F4amV0bXp4b2VwaGd5amxiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2NjUzNDAsImV4cCI6MjA3MTI0MTM0MH0.LPXwumPDk6kq5W7jRI6yx39ajYxXw15yTQvfKYtmzzg'
      ),
      body := '{}'::jsonb
    ) as request_id;
  $$
);

-- 크론잡 확인
COMMENT ON EXTENSION pg_cron IS 'pg_cron extension for scheduled jobs';
