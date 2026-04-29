
UPDATE public.mind_track_enrollments
SET payment_status = 'completed',
    status = 'active',
    started_at = now(),
    current_day = 1,
    payment_amount = 19900,
    goal_focus = COALESCE(NULLIF(goal_focus, ''), 'stress'),
    baseline_data = jsonb_build_object(
      'stress_score', 60,
      'energy_score', 50,
      'clarity_score', 55,
      'primary_concern', '테스트 이용 활성화',
      'source', 'admin_test_grant',
      'seeded_at', now()
    )
WHERE id = 'a9f45bfd-1a4d-4e6b-a812-14f2e286a074';

-- 다른 중복 pending enrollment는 정리(취소 처리)
UPDATE public.mind_track_enrollments
SET status = 'cancelled'
WHERE user_id = '5b33a1a3-2670-4bf7-91a5-aa486d37b7cd'
  AND id <> 'a9f45bfd-1a4d-4e6b-a812-14f2e286a074'
  AND payment_status = 'pending';
