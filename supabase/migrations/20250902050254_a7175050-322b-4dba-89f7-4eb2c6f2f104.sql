-- Supabase Security Definer View 문제 해결을 위한 조치
-- 시스템 뷰들의 보안 설정을 확인하고 필요한 경우 대안 제공

-- 먼저 현재 프로젝트의 모든 뷰를 확인
DO $$
DECLARE
    view_record RECORD;
    view_def TEXT;
BEGIN
    -- 모든 사용자 정의 뷰를 검사
    FOR view_record IN 
        SELECT schemaname, viewname 
        FROM pg_views 
        WHERE schemaname NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
    LOOP
        SELECT definition INTO view_def 
        FROM pg_views 
        WHERE schemaname = view_record.schemaname 
          AND viewname = view_record.viewname;
        
        -- SECURITY DEFINER가 포함된 뷰가 있는지 확인
        IF view_def ILIKE '%security definer%' THEN
            RAISE NOTICE 'Found SECURITY DEFINER view: %.%', view_record.schemaname, view_record.viewname;
        END IF;
    END LOOP;
END $$;