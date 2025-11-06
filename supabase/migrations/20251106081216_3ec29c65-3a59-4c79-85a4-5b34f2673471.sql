-- 150토큰 패키지에 보너스 50토큰 추가 (총 200토큰 지급)
UPDATE token_packages 
SET bonus_tokens = 50
WHERE token_count = 150;