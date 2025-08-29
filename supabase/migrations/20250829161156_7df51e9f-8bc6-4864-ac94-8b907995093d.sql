-- dongwon2222@naver.com에 3000토큰 추가
DO $$
DECLARE
    target_user_id UUID;
BEGIN
    -- 사용자 ID 찾기
    SELECT id INTO target_user_id 
    FROM auth.users 
    WHERE email = 'dongwon2222@naver.com';
    
    IF target_user_id IS NOT NULL THEN
        -- 토큰 추가
        UPDATE user_tokens
        SET 
            current_tokens = current_tokens + 3000,
            total_purchased = total_purchased + 3000
        WHERE user_id = target_user_id;
        
        -- 사용량 추적 기록
        INSERT INTO usage_tracking (user_id, feature_type, usage_date, count)
        VALUES (target_user_id, 'admin_bonus', CURRENT_DATE, 3000)
        ON CONFLICT (user_id, feature_type, usage_date)
        DO UPDATE SET count = usage_tracking.count + 3000;
        
        RAISE NOTICE 'Successfully added 3000 tokens to dongwon2222@naver.com';
    ELSE
        RAISE EXCEPTION 'User not found with email dongwon2222@naver.com';
    END IF;
END $$;