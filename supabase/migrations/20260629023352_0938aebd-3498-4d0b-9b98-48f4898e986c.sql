-- Fix leads.center_id FK to reference center_organizations (the table the console actually uses)
ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_center_id_fkey;
ALTER TABLE public.leads
  ADD CONSTRAINT leads_center_id_fkey
  FOREIGN KEY (center_id) REFERENCES public.center_organizations(id) ON DELETE CASCADE;