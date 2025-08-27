-- Enable Row Level Security on admin_analytics table
ALTER TABLE public.admin_analytics ENABLE ROW LEVEL SECURITY;

-- Create policy to allow only admin users to view business analytics
CREATE POLICY "Admins can view business analytics" 
ON public.admin_analytics 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create policy to allow only admin users to insert business analytics (for system operations)
CREATE POLICY "Admins can insert business analytics" 
ON public.admin_analytics 
FOR INSERT 
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create policy to allow only admin users to update business analytics
CREATE POLICY "Admins can update business analytics" 
ON public.admin_analytics 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create policy to allow only admin users to delete business analytics
CREATE POLICY "Admins can delete business analytics" 
ON public.admin_analytics 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));