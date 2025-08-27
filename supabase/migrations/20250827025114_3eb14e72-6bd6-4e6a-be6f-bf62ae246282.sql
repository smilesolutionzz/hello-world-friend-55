-- 사용자 tntjr91@kakao.com을 제휴기관 관리자로 설정
UPDATE public.profiles 
SET subscription_tier = 'institution',
    display_name = COALESCE(display_name, '') || ' (제휴기관관리자)'
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'tntjr91@kakao.com'
);

-- 제휴기관 관리자 역할도 추가 (혹시 필요한 경우)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::app_role 
FROM auth.users 
WHERE email = 'tntjr91@kakao.com'
ON CONFLICT (user_id, role) DO NOTHING;