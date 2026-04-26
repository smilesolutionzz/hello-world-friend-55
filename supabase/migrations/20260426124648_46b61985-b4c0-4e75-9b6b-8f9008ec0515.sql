-- momentedu91@gmail.com 사용자에게 30일 마음 트랙 수동 활성화
UPDATE public.mind_track_enrollments
SET payment_status = 'completed',
    status = 'active',
    started_at = now(),
    current_day = 1,
    payment_amount = COALESCE(payment_amount, 19900),
    updated_at = now()
WHERE id = '11790174-7dec-423c-8d7c-ad748f0b4e52'
  AND user_id = '7dde4428-98d4-47b0-a43e-854049929d02';