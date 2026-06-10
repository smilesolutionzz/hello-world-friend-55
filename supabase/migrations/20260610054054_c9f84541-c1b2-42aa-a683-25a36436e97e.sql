GRANT SELECT ON public.centers TO anon, authenticated;
GRANT INSERT ON public.leads TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.leads TO authenticated;
GRANT ALL ON public.centers TO service_role;
GRANT ALL ON public.leads TO service_role;