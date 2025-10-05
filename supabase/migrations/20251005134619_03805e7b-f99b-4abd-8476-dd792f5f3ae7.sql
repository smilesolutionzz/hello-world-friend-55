-- Update kakao_link for all experts to the new KakaoTalk link
UPDATE public.experts 
SET kakao_link = 'https://open.kakao.com/o/sq57G6Th'
WHERE is_verified = true;