-- Enable realtime for mind track tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.mind_track_enrollments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.mind_track_workbooks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.mind_track_daily_missions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.mind_track_checkins;

-- Set REPLICA IDENTITY FULL for complete row data on updates
ALTER TABLE public.mind_track_enrollments REPLICA IDENTITY FULL;
ALTER TABLE public.mind_track_workbooks REPLICA IDENTITY FULL;
ALTER TABLE public.mind_track_daily_missions REPLICA IDENTITY FULL;
ALTER TABLE public.mind_track_checkins REPLICA IDENTITY FULL;