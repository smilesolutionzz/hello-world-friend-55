-- 기존 organizations 테이블에 컬럼 추가

-- 먼저 type 컬럼 이름을 org_type으로 변경
ALTER TABLE organizations RENAME COLUMN type TO org_type;

-- org_type에 enum 제약 추가 (기존 데이터가 있다면 먼저 확인)
ALTER TABLE organizations 
ALTER COLUMN org_type TYPE organization_type 
USING org_type::organization_type;

-- 누락된 컬럼 추가
ALTER TABLE organizations 
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS email text,
ADD COLUMN IF NOT EXISTS registration_number text,
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;