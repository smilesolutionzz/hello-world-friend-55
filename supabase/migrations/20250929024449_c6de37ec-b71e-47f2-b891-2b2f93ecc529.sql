-- 무통장입금 요청 테이블에 구독 관련 컬럼 추가
ALTER TABLE bank_transfer_requests 
ADD COLUMN request_type text DEFAULT 'token_purchase' CHECK (request_type IN ('token_purchase', 'subscription_payment'));

ALTER TABLE bank_transfer_requests 
ADD COLUMN subscription_plan_id uuid;

ALTER TABLE bank_transfer_requests 
ADD COLUMN subscription_duration_months integer;

-- 기존 레코드들의 request_type을 'token_purchase'로 설정
UPDATE bank_transfer_requests 
SET request_type = 'token_purchase' 
WHERE request_type IS NULL;