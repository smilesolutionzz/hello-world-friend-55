ALTER TABLE public.center_parent_reports REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.center_parent_reports;