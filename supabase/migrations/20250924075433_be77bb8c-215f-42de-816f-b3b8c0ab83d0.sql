-- experts 테이블의 user_id 컬럼을 nullable로 변경
ALTER TABLE public.experts ALTER COLUMN user_id DROP NOT NULL;