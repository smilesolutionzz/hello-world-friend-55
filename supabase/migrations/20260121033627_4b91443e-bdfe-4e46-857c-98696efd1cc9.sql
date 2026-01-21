-- 기관 관리자 역할 추가
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'institution_admin';