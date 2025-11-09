-- Safe base migration for multi-tenant (no dependency on existing org_members schema)

-- 1) Create enums if missing
DO $$ BEGIN
  CREATE TYPE public.account_type AS ENUM ('parent', 'teacher', 'therapist', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.organization_type AS ENUM ('academy', 'daycare', 'kindergarten', 'development_center', 'none');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2) Organizations table
CREATE TABLE IF NOT EXISTS public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  org_type public.organization_type NOT NULL,
  address text,
  phone text,
  email text,
  registration_number text,
  admin_user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  is_active boolean DEFAULT true
);

-- 3) Profiles enhancements
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS account_type public.account_type DEFAULT 'parent',
  ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id);

-- 4) Observation logs scoping by organization
ALTER TABLE public.observation_logs
  ADD COLUMN IF NOT EXISTS organization_id uuid REFERENCES public.organizations(id);

-- 5) RLS policies (admin-only for now to avoid unknown org_members schema)
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'organizations' AND policyname = 'Organizations: admins can view'
  ) THEN
    CREATE POLICY "Organizations: admins can view"
    ON public.organizations FOR SELECT
    USING (auth.uid() = admin_user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'organizations' AND policyname = 'Organizations: admins can insert'
  ) THEN
    CREATE POLICY "Organizations: admins can insert"
    ON public.organizations FOR INSERT
    WITH CHECK (auth.uid() = admin_user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'organizations' AND policyname = 'Organizations: admins can update'
  ) THEN
    CREATE POLICY "Organizations: admins can update"
    ON public.organizations FOR UPDATE
    USING (auth.uid() = admin_user_id);
  END IF;
END $$;

-- 6) Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_account_type ON public.profiles(account_type);
CREATE INDEX IF NOT EXISTS idx_profiles_organization_id ON public.profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_organizations_admin_user_id ON public.organizations(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_observation_logs_organization_id ON public.observation_logs(organization_id);

-- 7) updated_at trigger
CREATE OR REPLACE FUNCTION public.update_organizations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'organizations_updated_at'
  ) THEN
    CREATE TRIGGER organizations_updated_at
    BEFORE UPDATE ON public.organizations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_organizations_updated_at();
  END IF;
END $$;