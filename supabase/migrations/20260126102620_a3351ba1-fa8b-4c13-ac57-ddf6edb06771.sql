-- observations 테이블에 qa_history 컬럼 추가
ALTER TABLE public.observations 
ADD COLUMN IF NOT EXISTS qa_history jsonb DEFAULT '[]'::jsonb;