-- tntjr10@naver.com 계정에 토큰 100개 추가
DO $$
DECLARE
    target_user_id uuid;
BEGIN
    -- 이메일로 사용자 ID 찾기
    SELECT id INTO target_user_id 
    FROM auth.users 
    WHERE email = 'tntjr10@naver.com';
    
    IF target_user_id IS NULL THEN
        RAISE EXCEPTION 'User with email tntjr10@naver.com not found';
    END IF;
    
    -- 기존 토큰 레코드가 있는지 확인하고 업데이트 또는 생성
    INSERT INTO public.user_tokens (
        user_id, 
        current_tokens, 
        total_purchased, 
        total_used,
        last_daily_bonus_date,
        referral_bonus
    ) 
    VALUES (
        target_user_id, 
        100, 
        100, 
        0,
        CURRENT_DATE,
        0
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        current_tokens = user_tokens.current_tokens + 100,
        total_purchased = user_tokens.total_purchased + 100,
        updated_at = now();
        
    RAISE NOTICE 'Successfully added 100 tokens to user tntjr10@naver.com';
END $$;