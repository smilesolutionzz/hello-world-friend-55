-- Fix the handle_new_user trigger to prevent duplicate key errors
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create improved function with better error handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = 'public'
AS $$
DECLARE
  referral_code_from_signup TEXT;
BEGIN
  -- Insert profile with proper error handling
  INSERT INTO public.profiles (user_id, display_name, phone, birth_date)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data ->> 'display_name',
    NULLIF(NEW.raw_user_meta_data ->> 'phone', ''),
    CASE 
      WHEN NEW.raw_user_meta_data ->> 'birth_date' != '' 
      THEN (NEW.raw_user_meta_data ->> 'birth_date')::DATE
      ELSE NULL 
    END
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- Insert tokens with conflict handling
  INSERT INTO public.user_tokens (user_id, current_tokens, total_purchased, last_daily_bonus_date)
  VALUES (NEW.id, 10, 10, CURRENT_DATE)
  ON CONFLICT (user_id) DO NOTHING;

  -- Handle referral code if provided
  referral_code_from_signup := NEW.raw_user_meta_data ->> 'referral_code';
  
  IF referral_code_from_signup IS NOT NULL AND referral_code_from_signup != '' THEN
    -- Process referral reward (5 additional tokens)
    PERFORM public.process_referral_reward(referral_code_from_signup, NEW.id);
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't block user creation
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();