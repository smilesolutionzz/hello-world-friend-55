-- timeline_activities 테이블에 데이터가 제대로 저장되도록 RLS 정책 수정
DROP POLICY IF EXISTS "Users can manage timeline activities" ON timeline_activities;

CREATE POLICY "Users can manage timeline activities" 
ON timeline_activities FOR ALL 
USING (
  -- 사용자가 자신의 family_id에 속한 타임라인 활동을 볼 수 있도록
  family_id IN (
    SELECT fm.family_id 
    FROM family_members fm 
    JOIN profiles p ON fm.profile_id = p.id 
    WHERE p.user_id = auth.uid()
  )
  OR 
  -- member_id가 자신의 profile_id와 일치하면 볼 수 있도록
  member_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  -- 삽입 시에도 같은 조건 적용
  family_id IN (
    SELECT fm.family_id 
    FROM family_members fm 
    JOIN profiles p ON fm.profile_id = p.id 
    WHERE p.user_id = auth.uid()
  )
  OR 
  member_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
);

-- assessments 테이블 RLS 정책 개선
DROP POLICY IF EXISTS "Users can create assessments for family members" ON assessments;
DROP POLICY IF EXISTS "Users can view family assessments" ON assessments;

CREATE POLICY "Users can manage assessments" 
ON assessments FOR ALL 
USING (
  profile_id IN (
    SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
  )
  OR 
  family_id IN (
    SELECT fm.family_id 
    FROM family_members fm 
    JOIN profiles p ON fm.profile_id = p.id 
    WHERE p.user_id = auth.uid()
  )
)
WITH CHECK (
  profile_id IN (
    SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
  )
  OR 
  family_id IN (
    SELECT fm.family_id 
    FROM family_members fm 
    JOIN profiles p ON fm.profile_id = p.id 
    WHERE p.user_id = auth.uid()
  )
);

-- consultations 테이블 RLS 정책 개선
DROP POLICY IF EXISTS "Users can create consultations for family members" ON consultations;
DROP POLICY IF EXISTS "Users can view family consultations" ON consultations;

CREATE POLICY "Users can manage consultations" 
ON consultations FOR ALL 
USING (
  profile_id IN (
    SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
  )
  OR 
  family_id IN (
    SELECT fm.family_id 
    FROM family_members fm 
    JOIN profiles p ON fm.profile_id = p.id 
    WHERE p.user_id = auth.uid()
  )
)
WITH CHECK (
  profile_id IN (
    SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
  )
  OR 
  family_id IN (
    SELECT fm.family_id 
    FROM family_members fm 
    JOIN profiles p ON fm.profile_id = p.id 
    WHERE p.user_id = auth.uid()
  )
);

-- observation_sessions 테이블에 RLS 정책 추가 (현재 없어 보임)
CREATE POLICY "Users can manage observation sessions" 
ON observation_sessions FOR ALL 
USING (
  profile_id IN (
    SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
  )
)
WITH CHECK (
  profile_id IN (
    SELECT profiles.id FROM profiles WHERE profiles.user_id = auth.uid()
  )
);