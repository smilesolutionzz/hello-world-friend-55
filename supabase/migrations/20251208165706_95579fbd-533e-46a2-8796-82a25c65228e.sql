-- expert_booking_stats 뷰에 공개 접근 허용
DROP POLICY IF EXISTS "Allow public read expert_booking_stats" ON consultation_bookings;

-- consultation_bookings 테이블에 공개 읽기 허용 (테스트용)
CREATE POLICY "Allow public read consultation_bookings"
ON public.consultation_bookings
FOR SELECT
USING (true);

-- consultation_reviews 테이블에도 공개 읽기 허용
CREATE POLICY "Allow public read consultation_reviews"
ON public.consultation_reviews
FOR SELECT
USING (true);