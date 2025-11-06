-- Fix search_path for booking trigger function
DROP FUNCTION IF EXISTS public.update_booking_updated_at() CASCADE;

CREATE OR REPLACE FUNCTION public.update_booking_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  
  IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
    NEW.confirmed_at = now();
  END IF;
  
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    NEW.cancelled_at = now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public;

-- Recreate trigger
CREATE TRIGGER update_consultation_bookings_updated_at
  BEFORE UPDATE ON public.consultation_bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_booking_updated_at();