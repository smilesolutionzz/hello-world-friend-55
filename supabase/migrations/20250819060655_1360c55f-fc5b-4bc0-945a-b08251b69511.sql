-- family_members 테이블의 무한 재귀 문제 해결
-- 기존 정책들 삭제
DROP POLICY IF EXISTS "Family creators can manage family members" ON family_members;
DROP POLICY IF EXISTS "Family members can view family membership" ON family_members;

-- 보안 definer 함수 생성 (무한 재귀 방지)
CREATE OR REPLACE FUNCTION public.get_user_family_ids(user_uuid uuid)
RETURNS uuid[] 
LANGUAGE SQL 
SECURITY DEFINER 
STABLE
AS $$
  SELECT ARRAY_AGG(DISTINCT fm.family_id)
  FROM family_members fm
  JOIN profiles p ON fm.profile_id = p.id
  WHERE p.user_id = user_uuid;
$$;

CREATE OR REPLACE FUNCTION public.is_family_creator(family_uuid uuid, user_uuid uuid)
RETURNS boolean 
LANGUAGE SQL 
SECURITY DEFINER 
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM families f
    JOIN profiles p ON f.created_by = p.id
    WHERE f.id = family_uuid AND p.user_id = user_uuid
  );
$$;

-- 새로운 RLS 정책 생성 (함수 사용)
CREATE POLICY "Users can view family members"
ON family_members FOR SELECT
USING (family_id = ANY(get_user_family_ids(auth.uid())));

CREATE POLICY "Family creators can manage members"
ON family_members FOR ALL
USING (is_family_creator(family_id, auth.uid()))
WITH CHECK (is_family_creator(family_id, auth.uid()));

CREATE POLICY "Users can join families"
ON family_members FOR INSERT
WITH CHECK (
  profile_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()
  )
);