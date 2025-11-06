-- Add meeting link fields
ALTER TABLE public.consultation_bookings 
ADD COLUMN IF NOT EXISTS meeting_link TEXT,
ADD COLUMN IF NOT EXISTS meeting_platform TEXT CHECK (meeting_platform IN ('zoom', 'kakao', 'google_meet', 'other'));

-- Create reviews table
CREATE TABLE IF NOT EXISTS public.consultation_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.consultation_bookings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  expert_id UUID NOT NULL REFERENCES public.experts(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(booking_id)
);

ALTER TABLE public.consultation_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view reviews" ON public.consultation_reviews FOR SELECT USING (true);
CREATE POLICY "Users create reviews for bookings" ON public.consultation_reviews FOR INSERT WITH CHECK (auth.uid() = user_id AND EXISTS (SELECT 1 FROM public.consultation_bookings WHERE id = booking_id AND user_id = auth.uid() AND status = 'completed'));
CREATE POLICY "Users update own reviews" ON public.consultation_reviews FOR UPDATE USING (auth.uid() = user_id);

-- Rating update
CREATE OR REPLACE FUNCTION public.update_expert_rating() RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  UPDATE public.experts SET average_rating = (SELECT COALESCE(AVG(rating), 0) FROM public.consultation_reviews WHERE expert_id = COALESCE(NEW.expert_id, OLD.expert_id)) WHERE id = COALESCE(NEW.expert_id, OLD.expert_id);
  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trigger_update_expert_rating ON public.consultation_reviews;
CREATE TRIGGER trigger_update_expert_rating AFTER INSERT OR UPDATE OR DELETE ON public.consultation_reviews FOR EACH ROW EXECUTE FUNCTION public.update_expert_rating();

-- Buffer minutes
ALTER TABLE public.expert_schedules ADD COLUMN IF NOT EXISTS buffer_minutes INTEGER DEFAULT 0 CHECK (buffer_minutes >= 0 AND buffer_minutes <= 60);

-- Stats views
CREATE OR REPLACE VIEW public.expert_booking_stats AS
SELECT 
  e.id as expert_id, e.user_id,
  COUNT(cb.id) as total_bookings,
  COUNT(CASE WHEN cb.status = 'completed' THEN 1 END) as completed_bookings,
  COUNT(CASE WHEN cb.status = 'cancelled' THEN 1 END) as cancelled_bookings,
  COUNT(CASE WHEN cb.status = 'confirmed' THEN 1 END) as confirmed_bookings,
  SUM(CASE WHEN cb.status = 'completed' THEN cb.tokens_paid ELSE 0 END) as total_tokens_earned,
  ROUND(COUNT(CASE WHEN cb.status = 'cancelled' THEN 1 END)::NUMERIC / NULLIF(COUNT(cb.id), 0) * 100, 2) as cancellation_rate,
  COALESCE(AVG(cr.rating), 0) as average_rating,
  COUNT(cr.id) as review_count
FROM public.experts e
LEFT JOIN public.consultation_bookings cb ON e.id = cb.expert_id
LEFT JOIN public.consultation_reviews cr ON e.id = cr.expert_id
GROUP BY e.id, e.user_id;