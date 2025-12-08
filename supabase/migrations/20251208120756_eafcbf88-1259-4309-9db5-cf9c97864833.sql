-- Add expert queue table for matching
CREATE TABLE IF NOT EXISTS public.expert_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  expert_id uuid NOT NULL,
  is_available boolean DEFAULT true,
  current_sessions integer DEFAULT 0,
  max_sessions integer DEFAULT 3,
  last_assigned_at timestamptz,
  specialties text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.expert_queue ENABLE ROW LEVEL SECURITY;

-- Policies for expert_queue
CREATE POLICY "Experts can manage their own queue status"
ON public.expert_queue FOR ALL
USING (auth.uid() = expert_id);

CREATE POLICY "Users can view available experts"
ON public.expert_queue FOR SELECT
USING (is_available = true);

-- Enable realtime for expert_queue
ALTER PUBLICATION supabase_realtime ADD TABLE public.expert_queue;

-- Function to auto-assign expert to waiting session
CREATE OR REPLACE FUNCTION public.assign_expert_to_session()
RETURNS TRIGGER AS $$
DECLARE
  available_expert_id uuid;
BEGIN
  -- Find an available expert with least current sessions
  SELECT expert_id INTO available_expert_id
  FROM public.expert_queue
  WHERE is_available = true 
    AND current_sessions < max_sessions
  ORDER BY current_sessions ASC, last_assigned_at ASC NULLS FIRST
  LIMIT 1;
  
  IF available_expert_id IS NOT NULL THEN
    -- Assign expert to session
    NEW.expert_id := available_expert_id;
    NEW.status := 'active';
    
    -- Update expert queue
    UPDATE public.expert_queue
    SET current_sessions = current_sessions + 1,
        last_assigned_at = now(),
        updated_at = now()
    WHERE expert_id = available_expert_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to auto-assign expert when session is created
DROP TRIGGER IF EXISTS trigger_assign_expert ON public.realtime_consultation_sessions;
CREATE TRIGGER trigger_assign_expert
  BEFORE INSERT ON public.realtime_consultation_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.assign_expert_to_session();

-- Function to decrease expert session count when session ends
CREATE OR REPLACE FUNCTION public.handle_session_end()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'ended' AND OLD.status != 'ended' AND OLD.expert_id IS NOT NULL THEN
    UPDATE public.expert_queue
    SET current_sessions = GREATEST(0, current_sessions - 1),
        updated_at = now()
    WHERE expert_id = OLD.expert_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for session end
DROP TRIGGER IF EXISTS trigger_session_end ON public.realtime_consultation_sessions;
CREATE TRIGGER trigger_session_end
  BEFORE UPDATE ON public.realtime_consultation_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_session_end();