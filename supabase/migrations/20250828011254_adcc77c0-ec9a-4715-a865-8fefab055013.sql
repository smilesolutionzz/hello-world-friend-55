-- Add 500 tokens to specified users
DO $$
DECLARE
    user_record RECORD;
    target_emails TEXT[] := ARRAY['ghgus2000@hanmail.net', 'aron@mapleaba.com', 'sunbearmforyou@naver.com'];
    email_addr TEXT;
BEGIN
    FOREACH email_addr IN ARRAY target_emails
    LOOP
        -- Find user by email
        SELECT id INTO user_record
        FROM auth.users 
        WHERE email = email_addr;
        
        IF user_record.id IS NOT NULL THEN
            -- Update existing tokens or insert new record
            INSERT INTO public.user_tokens (user_id, current_tokens, total_purchased, total_used, last_daily_bonus_date)
            VALUES (user_record.id, 500, 500, 0, CURRENT_DATE)
            ON CONFLICT (user_id) 
            DO UPDATE SET 
                current_tokens = user_tokens.current_tokens + 500,
                total_purchased = user_tokens.total_purchased + 500,
                updated_at = now();
                
            RAISE NOTICE 'Added 500 tokens to user: %', email_addr;
        ELSE
            RAISE NOTICE 'User not found: %', email_addr;
        END IF;
    END LOOP;
END $$;