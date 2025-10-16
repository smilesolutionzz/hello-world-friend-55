-- 토큰 거래 기록 테이블 생성 (구매/사용 이력)
CREATE TABLE IF NOT EXISTS public.token_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'usage', 'bonus', 'expired')),
  amount INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  feature_type TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- user_tokens 테이블에 만료 관련 필드 추가
ALTER TABLE public.user_tokens 
ADD COLUMN IF NOT EXISTS expiring_tokens JSONB DEFAULT '[]'::jsonb;

-- 토큰 거래 기록 RLS 정책
ALTER TABLE public.token_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own token transactions"
  ON public.token_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own token transactions"
  ON public.token_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 토큰 소비 함수 (유효기간 고려)
CREATE OR REPLACE FUNCTION public.consume_tokens(
  p_user_id UUID,
  p_amount INTEGER,
  p_feature_type TEXT,
  p_description TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_current_tokens INTEGER;
  v_expiring_tokens JSONB;
  v_remaining_amount INTEGER;
  v_batch JSONB;
  v_batch_amount INTEGER;
  v_batch_expires TIMESTAMP WITH TIME ZONE;
  v_updated_batches JSONB := '[]'::jsonb;
  v_now TIMESTAMP WITH TIME ZONE := now();
BEGIN
  -- 사용자 확인
  IF auth.uid() != p_user_id THEN
    RETURN jsonb_build_object('success', false, 'error', '권한이 없습니다.');
  END IF;

  -- 현재 토큰과 만료 예정 토큰 가져오기
  SELECT current_tokens, expiring_tokens 
  INTO v_current_tokens, v_expiring_tokens
  FROM public.user_tokens
  WHERE user_id = p_user_id
  FOR UPDATE;

  -- 잔액 부족 확인
  IF v_current_tokens < p_amount THEN
    RETURN jsonb_build_object('success', false, 'error', '토큰이 부족합니다.', 'required', p_amount, 'available', v_current_tokens);
  END IF;

  -- 만료된 토큰 먼저 제거
  FOR v_batch IN SELECT * FROM jsonb_array_elements(v_expiring_tokens)
  LOOP
    v_batch_expires := (v_batch->>'expires_at')::TIMESTAMP WITH TIME ZONE;
    v_batch_amount := (v_batch->>'amount')::INTEGER;
    
    IF v_batch_expires > v_now AND v_batch_amount > 0 THEN
      v_updated_batches := v_updated_batches || v_batch;
    ELSE
      -- 만료된 토큰 기록
      INSERT INTO public.token_transactions (user_id, transaction_type, amount, balance_after, description)
      VALUES (p_user_id, 'expired', -v_batch_amount, v_current_tokens - v_batch_amount, '토큰 만료');
      
      v_current_tokens := v_current_tokens - v_batch_amount;
    END IF;
  END LOOP;

  -- 만료 예정 토큰부터 차감 (FIFO)
  v_remaining_amount := p_amount;
  v_expiring_tokens := v_updated_batches;
  v_updated_batches := '[]'::jsonb;

  FOR v_batch IN SELECT * FROM jsonb_array_elements(v_expiring_tokens)
  LOOP
    IF v_remaining_amount <= 0 THEN
      v_updated_batches := v_updated_batches || v_batch;
      CONTINUE;
    END IF;

    v_batch_amount := (v_batch->>'amount')::INTEGER;
    v_batch_expires := (v_batch->>'expires_at')::TIMESTAMP WITH TIME ZONE;

    IF v_batch_amount <= v_remaining_amount THEN
      v_remaining_amount := v_remaining_amount - v_batch_amount;
    ELSE
      v_batch := jsonb_set(v_batch, '{amount}', to_jsonb(v_batch_amount - v_remaining_amount));
      v_updated_batches := v_updated_batches || v_batch;
      v_remaining_amount := 0;
    END IF;
  END LOOP;

  -- 토큰 차감
  UPDATE public.user_tokens
  SET 
    current_tokens = current_tokens - p_amount,
    expiring_tokens = v_updated_batches
  WHERE user_id = p_user_id;

  -- 거래 기록
  INSERT INTO public.token_transactions (user_id, transaction_type, amount, balance_after, feature_type, description)
  VALUES (p_user_id, 'usage', -p_amount, v_current_tokens - p_amount, p_feature_type, COALESCE(p_description, p_feature_type));

  RETURN jsonb_build_object('success', true, 'remaining', v_current_tokens - p_amount);
END;
$$;

-- 토큰 추가 함수 (구매/보너스)
CREATE OR REPLACE FUNCTION public.add_tokens(
  p_user_id UUID,
  p_amount INTEGER,
  p_transaction_type TEXT DEFAULT 'purchase',
  p_description TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_new_balance INTEGER;
  v_expires_at TIMESTAMP WITH TIME ZONE := now() + INTERVAL '1 year';
  v_expiring_tokens JSONB;
  v_new_batch JSONB;
BEGIN
  -- 관리자이거나 본인인 경우만 허용
  IF auth.uid() != p_user_id AND NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RETURN jsonb_build_object('success', false, 'error', '권한이 없습니다.');
  END IF;

  -- 현재 만료 예정 토큰 가져오기
  SELECT expiring_tokens INTO v_expiring_tokens
  FROM public.user_tokens
  WHERE user_id = p_user_id;

  -- 새 토큰 배치 추가
  v_new_batch := jsonb_build_object(
    'amount', p_amount,
    'expires_at', v_expires_at,
    'created_at', now()
  );

  -- 토큰 추가
  UPDATE public.user_tokens
  SET 
    current_tokens = current_tokens + p_amount,
    total_purchased = total_purchased + p_amount,
    expiring_tokens = COALESCE(expiring_tokens, '[]'::jsonb) || v_new_batch
  WHERE user_id = p_user_id
  RETURNING current_tokens INTO v_new_balance;

  -- 거래 기록
  INSERT INTO public.token_transactions (
    user_id, transaction_type, amount, balance_after, 
    expires_at, description
  )
  VALUES (
    p_user_id, p_transaction_type, p_amount, v_new_balance,
    v_expires_at, COALESCE(p_description, '토큰 구매')
  );

  RETURN jsonb_build_object('success', true, 'balance', v_new_balance, 'expires_at', v_expires_at);
END;
$$;

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_token_transactions_user_id ON public.token_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_token_transactions_created_at ON public.token_transactions(created_at DESC);