-- Create user favorites table for expert bookmarking
CREATE TABLE public.user_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  expert_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, expert_id)
);

-- Create notifications table
CREATE TABLE public.user_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL, -- 'booking_confirmed', 'booking_reminder', 'expert_response', 'waitlist_available'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  booking_id UUID REFERENCES public.consultation_bookings(id) ON DELETE CASCADE,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create expert views tracking for "recently viewed"
CREATE TABLE public.expert_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  expert_id UUID NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_user_favorites_user ON public.user_favorites(user_id);
CREATE INDEX idx_user_favorites_expert ON public.user_favorites(expert_id);
CREATE INDEX idx_notifications_user ON public.user_notifications(user_id);
CREATE INDEX idx_notifications_read ON public.user_notifications(is_read);
CREATE INDEX idx_expert_views_user ON public.expert_views(user_id);
CREATE INDEX idx_expert_views_viewed_at ON public.expert_views(viewed_at DESC);

-- Enable RLS
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expert_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_favorites
CREATE POLICY "Users can view their own favorites"
  ON public.user_favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can add favorites"
  ON public.user_favorites FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove favorites"
  ON public.user_favorites FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for user_notifications
CREATE POLICY "Users can view their own notifications"
  ON public.user_notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.user_notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for expert_views
CREATE POLICY "Users can view their own view history"
  ON public.expert_views FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can track their views"
  ON public.expert_views FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to send notification when booking is confirmed
CREATE OR REPLACE FUNCTION public.send_booking_confirmation_notification()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
    INSERT INTO public.user_notifications (user_id, type, title, message, booking_id)
    VALUES (
      NEW.user_id,
      'booking_confirmed',
      '상담 예약이 확정되었습니다',
      NEW.expert_name || '님과의 상담이 ' || to_char(NEW.booking_date, 'YYYY-MM-DD') || ' ' || NEW.start_time || '에 확정되었습니다.',
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for booking confirmation notifications
CREATE TRIGGER booking_confirmation_notification
  AFTER UPDATE ON public.consultation_bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.send_booking_confirmation_notification();