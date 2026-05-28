
-- 1. partner_institutions 확장 (테이블 존재 시에만)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='partner_institutions') THEN
    ALTER TABLE public.partner_institutions
      ADD COLUMN IF NOT EXISTS voucher_programs text[] DEFAULT '{}'::text[],
      ADD COLUMN IF NOT EXISTS voucher_source text,
      ADD COLUMN IF NOT EXISTS voucher_business_no text,
      ADD COLUMN IF NOT EXISTS voucher_verified_at timestamptz,
      ADD COLUMN IF NOT EXISTS voucher_evidence_url text;
    CREATE INDEX IF NOT EXISTS idx_partner_institutions_voucher_programs ON public.partner_institutions USING GIN(voucher_programs);
    CREATE INDEX IF NOT EXISTS idx_partner_institutions_voucher_business_no ON public.partner_institutions(voucher_business_no);
  END IF;
END $$;

-- 2. voucher_directory (전국 캐시, 공개)
CREATE TABLE IF NOT EXISTS public.voucher_directory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_no text,
  org_name text NOT NULL,
  org_name_normalized text,
  address text,
  city text,
  district text,
  voucher_type text NOT NULL,
  source_year text,
  raw jsonb,
  synced_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_voucher_directory_uniq
  ON public.voucher_directory(COALESCE(business_no, ''), org_name_normalized, voucher_type);
CREATE INDEX IF NOT EXISTS idx_voucher_directory_city ON public.voucher_directory(city);
CREATE INDEX IF NOT EXISTS idx_voucher_directory_district ON public.voucher_directory(district);
CREATE INDEX IF NOT EXISTS idx_voucher_directory_type ON public.voucher_directory(voucher_type);
CREATE INDEX IF NOT EXISTS idx_voucher_directory_business_no ON public.voucher_directory(business_no);
CREATE INDEX IF NOT EXISTS idx_voucher_directory_name ON public.voucher_directory(org_name_normalized);

GRANT SELECT ON public.voucher_directory TO anon;
GRANT SELECT ON public.voucher_directory TO authenticated;
GRANT ALL ON public.voucher_directory TO service_role;

ALTER TABLE public.voucher_directory ENABLE ROW LEVEL SECURITY;

CREATE POLICY "voucher_directory public read"
  ON public.voucher_directory FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "voucher_directory service write"
  ON public.voucher_directory FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

-- 3. voucher_sync_logs (관리자만)
CREATE TABLE IF NOT EXISTS public.voucher_sync_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_at timestamptz NOT NULL DEFAULT now(),
  total integer NOT NULL DEFAULT 0,
  matched integer NOT NULL DEFAULT 0,
  unmatched integer NOT NULL DEFAULT 0,
  duration_ms integer,
  errors jsonb DEFAULT '[]'::jsonb,
  triggered_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.voucher_sync_logs TO authenticated;
GRANT ALL ON public.voucher_sync_logs TO service_role;

ALTER TABLE public.voucher_sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "voucher_sync_logs admin read"
  ON public.voucher_sync_logs FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "voucher_sync_logs service all"
  ON public.voucher_sync_logs FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);
