-- assessments 테이블의 RLS 정책을 수정하여 직접 user_id로 비교하도록 변경
-- 기존 정책 삭제
DROP POLICY IF EXISTS "Users can view their own assessments" ON assessments;
DROP POLICY IF EXISTS "Users can insert their own assessments" ON assessments;

-- 새로운 정책 생성 - user_id 컬럼 추가 필요
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

-- 기존 데이터의 user_id 업데이트
UPDATE assessments 
SET user_id = (
  SELECT profiles.user_id 
  FROM profiles 
  WHERE profiles.id = assessments.profile_id
)
WHERE user_id IS NULL;

-- 새로운 RLS 정책 생성
CREATE POLICY "Users can view their own assessments v2" 
ON assessments 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  auth.uid() = (SELECT profiles.user_id FROM profiles WHERE profiles.id = assessments.profile_id)
);

CREATE POLICY "Users can insert their own assessments v2" 
ON assessments 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id OR 
  auth.uid() = (SELECT profiles.user_id FROM profiles WHERE profiles.id = assessments.profile_id)
);

CREATE POLICY "Users can update their own assessments v2" 
ON assessments 
FOR UPDATE 
USING (
  auth.uid() = user_id OR 
  auth.uid() = (SELECT profiles.user_id FROM profiles WHERE profiles.id = assessments.profile_id)
);

-- observation_logs의 RLS 정책도 확인 및 수정
DROP POLICY IF EXISTS "observation_logs_select" ON observation_logs;
CREATE POLICY "Users can view their own observations" 
ON observation_logs 
FOR SELECT 
USING (auth.uid() = user_id);

-- 관리자는 모든 데이터 볼 수 있도록
CREATE POLICY "Admins can view all assessments" 
ON assessments 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can view all observations" 
ON observation_logs 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));