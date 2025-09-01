-- 중복 데이터 삭제 (같은 이름의 기관 중 ID가 더 큰 것들 삭제)
DELETE FROM public.partner_institutions 
WHERE id IN (
  SELECT id FROM (
    SELECT id, 
           ROW_NUMBER() OVER (PARTITION BY name ORDER BY id) as rn
    FROM public.partner_institutions
  ) t WHERE rn > 1
);