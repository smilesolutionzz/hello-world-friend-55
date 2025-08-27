-- institution_members 테이블의 member_user_id 컬럼을 nullable로 변경
ALTER TABLE public.institution_members 
ALTER COLUMN member_user_id DROP NOT NULL;