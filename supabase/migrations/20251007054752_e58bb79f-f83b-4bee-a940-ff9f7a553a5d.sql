-- Create legal disclaimer component tracking
CREATE TABLE IF NOT EXISTS public.legal_disclaimer_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  page_url TEXT NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Enable RLS
ALTER TABLE public.legal_disclaimer_views ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own disclaimer views
CREATE POLICY "Users can track their disclaimer views"
  ON public.legal_disclaimer_views
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Policy: Only admins can view all disclaimer views
CREATE POLICY "Admins can view all disclaimer views"
  ON public.legal_disclaimer_views
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_legal_disclaimer_user_id ON public.legal_disclaimer_views(user_id);
CREATE INDEX IF NOT EXISTS idx_legal_disclaimer_viewed_at ON public.legal_disclaimer_views(viewed_at);

COMMENT ON TABLE public.legal_disclaimer_views IS '법적 고지사항 조회 추적 (컴플라이언스용)';
