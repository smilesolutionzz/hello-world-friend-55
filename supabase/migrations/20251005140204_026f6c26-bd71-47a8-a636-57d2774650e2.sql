-- Update expert specializations to match new categories

-- 강은미 - 심리상담 전문가
UPDATE experts 
SET specializations = ARRAY['심리상담', '행동치료', '발달재활']
WHERE id = '1b03c115-d662-41b4-8b14-2bfaaa018950';

-- 이상록 - 운동재활 전문가
UPDATE experts 
SET specializations = ARRAY['운동재활', '감각통합', '발달재활']
WHERE id = '1f312fb0-dd95-48e9-bbd1-96b0dfaa5ea4';

-- 김미영 - 아동발달 전문의
UPDATE experts 
SET specializations = ARRAY['아동발달', '언어치료', '전문의사', '발달재활']
WHERE id = 'a5ef3f38-f8f6-4bc5-8bb5-6fc5eac1e2d6';

-- 박상훈 - BCBA 행동분석사
UPDATE experts 
SET specializations = ARRAY['행동분석', 'ABA치료', '행동치료', '발달재활']
WHERE id = '82448a43-a151-4caf-95b6-f3b19543d80b';

-- 이정아 - 언어재활사
UPDATE experts 
SET specializations = ARRAY['언어치료', '발달재활', '아동발달']
WHERE id = '92761c82-e017-43d8-bfb1-160eff55dd0d';

-- 김수현 - 작업치료사
UPDATE experts 
SET specializations = ARRAY['감각통합', '운동재활', '발달재활', '아동발달']
WHERE id = '067795d9-41e6-4450-8d1d-8562583995fe';

-- 문기웅 - 제약회사 부장
UPDATE experts 
SET specializations = ARRAY['약물관련', '심리상담']
WHERE id = 'fb64a1b5-c4a8-4eac-8ca5-413b30adea5d';

-- 정민호 - 놀이치료사
UPDATE experts 
SET specializations = ARRAY['놀이치료', '심리상담', '발달재활', '아동발달']
WHERE id = '0a249634-86f8-4800-a35c-c62fb04a048a';

-- 윤서연 - 특수교육사
UPDATE experts 
SET specializations = ARRAY['아동발달', '발달재활', '심리상담']
WHERE id = '0378dd2c-dffa-47f6-8197-2355a04ff3e2';

-- 장호탁 - 한의사
UPDATE experts 
SET specializations = ARRAY['한의사', '아동발달', '심리상담', '약물관련']
WHERE id = 'e830d961-2fb7-4027-813b-10c6a059bca9';

-- 김선길 - 틔움통합발달센터 대표
UPDATE experts 
SET specializations = ARRAY['운동재활', '발달재활', '감각통합', '아동발달']
WHERE id = '0695f0df-6ac9-4cf9-b31d-e91f3bab51af';

-- 오세은 - 음악/놀이/심리 재활 전문 치료사
UPDATE experts 
SET specializations = ARRAY['음악치료', '놀이치료', '심리상담', '발달재활']
WHERE id = '732161d0-d637-404b-a0d6-8f3c46e4c953';

-- 이하연 - 미술치료 및 심리상담 전문가
UPDATE experts 
SET specializations = ARRAY['심리상담', '놀이치료', '발달재활']
WHERE id = '711a4ae0-9ce2-4a2d-8a48-0d60d74f78be';

-- 백경열 - 특수체육/행동발달 전문가
UPDATE experts 
SET specializations = ARRAY['운동재활', '행동치료', '발달재활', '감각통합']
WHERE id = 'b1102cdd-60ef-4140-80da-8c7dd9ae4c36';

-- 허승룡 - 언어치료 및 발달재활 전문가
UPDATE experts 
SET specializations = ARRAY['언어치료', '발달재활', '아동발달']
WHERE id = 'af3768da-43ea-453a-8351-8a1eeb2ede42';

-- 송성목 - 부모치료 전문가
UPDATE experts 
SET specializations = ARRAY['심리상담', '발달재활']
WHERE id = '4464d0cb-916c-4665-b217-0e77fa493f8b';

-- 이수석 - AIHPRO 창립자
UPDATE experts 
SET specializations = ARRAY['운동재활', '발달재활', '심리상담', '감각통합']
WHERE id = '9ef96327-919b-46fc-b66d-d293027a45ee';