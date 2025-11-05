-- Add 400 token package with November event bonus
INSERT INTO public.token_packages (
  id,
  name,
  description,
  token_count,
  price_krw,
  is_popular,
  is_active
) VALUES (
  gen_random_uuid(),
  '토큰팩 400',
  '11월 특별 이벤트! 50개 보너스 토큰 증정 (총 450토큰)',
  400,
  39900,
  false,
  true
)
ON CONFLICT DO NOTHING;