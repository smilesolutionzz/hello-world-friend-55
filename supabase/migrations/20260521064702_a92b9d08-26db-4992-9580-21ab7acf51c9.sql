-- 진행중인 trial enrollment 중 30일로 잘못 박힌 것들을 7일로 교정 (워크북 미생성건 대상)
UPDATE public.mind_track_enrollments e
SET track_type = 'mind_7day'
WHERE e.payment_status = 'trial'
  AND e.track_type <> 'mind_7day'
  AND NOT EXISTS (
    SELECT 1 FROM public.mind_track_workbooks w WHERE w.enrollment_id = e.id
  );