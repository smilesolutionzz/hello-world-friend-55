-- Create diary generation history table
CREATE TABLE public.diary_generations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  voucher_type TEXT NOT NULL,
  report_style TEXT NOT NULL,
  client_name TEXT,
  session_number INTEGER,
  main_activity TEXT,
  generated_content TEXT NOT NULL,
  character_count INTEGER NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.diary_generations ENABLE ROW LEVEL SECURITY;

-- Policies for diary generations
CREATE POLICY "Users can view their own diary generations"
ON public.diary_generations
FOR SELECT
USING (created_by = auth.uid());

CREATE POLICY "Users can create their own diary generations"
ON public.diary_generations
FOR INSERT
WITH CHECK (created_by = auth.uid());

-- Create index for faster queries
CREATE INDEX idx_diary_generations_created_by ON public.diary_generations(created_by);
CREATE INDEX idx_diary_generations_created_at ON public.diary_generations(created_at DESC);