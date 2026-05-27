
-- Partner marketplace: programs, products (books/goods), owners, click tracking
-- Slug-based (matches src/data/partnerInstitutions.ts ids like 'inst_1')

CREATE TABLE public.partner_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_slug text NOT NULL,
  title text NOT NULL,
  thumbnail_url text,
  category text,
  target_age text,
  duration_text text,
  price_krw integer,
  cta_label text DEFAULT '신청하기',
  cta_url text,
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_partner_programs_slug ON public.partner_programs(partner_slug, is_published, sort_order);
GRANT SELECT ON public.partner_programs TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.partner_programs TO authenticated;
GRANT ALL ON public.partner_programs TO service_role;
ALTER TABLE public.partner_programs ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.partner_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_slug text NOT NULL,
  title text NOT NULL,
  thumbnail_url text,
  kind text NOT NULL DEFAULT 'book' CHECK (kind IN ('book','goods','kit')),
  author text,
  price_krw integer,
  external_buy_url text,
  description text,
  sort_order integer NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_partner_products_slug ON public.partner_products(partner_slug, is_published, sort_order);
GRANT SELECT ON public.partner_products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.partner_products TO authenticated;
GRANT ALL ON public.partner_products TO service_role;
ALTER TABLE public.partner_products ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.partner_owners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_slug text NOT NULL,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'owner' CHECK (role IN ('owner','editor')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (partner_slug, user_id)
);
CREATE INDEX idx_partner_owners_user ON public.partner_owners(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.partner_owners TO authenticated;
GRANT ALL ON public.partner_owners TO service_role;
ALTER TABLE public.partner_owners ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.partner_content_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_slug text NOT NULL,
  content_type text NOT NULL CHECK (content_type IN ('program','product','contact')),
  content_id uuid,
  user_id uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_partner_clicks_slug ON public.partner_content_clicks(partner_slug, created_at DESC);
GRANT INSERT ON public.partner_content_clicks TO anon, authenticated;
GRANT SELECT ON public.partner_content_clicks TO authenticated;
GRANT ALL ON public.partner_content_clicks TO service_role;
ALTER TABLE public.partner_content_clicks ENABLE ROW LEVEL SECURITY;

-- Helper: owner check
CREATE OR REPLACE FUNCTION public.is_partner_owner(_user_id uuid, _slug text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.partner_owners
    WHERE user_id = _user_id AND partner_slug = _slug
  )
$$;

-- Policies: partner_programs
CREATE POLICY "Public read published programs" ON public.partner_programs
  FOR SELECT USING (is_published = true);
CREATE POLICY "Owners read own programs" ON public.partner_programs
  FOR SELECT TO authenticated
  USING (public.is_partner_owner(auth.uid(), partner_slug) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owners insert programs" ON public.partner_programs
  FOR INSERT TO authenticated
  WITH CHECK (public.is_partner_owner(auth.uid(), partner_slug) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owners update programs" ON public.partner_programs
  FOR UPDATE TO authenticated
  USING (public.is_partner_owner(auth.uid(), partner_slug) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owners delete programs" ON public.partner_programs
  FOR DELETE TO authenticated
  USING (public.is_partner_owner(auth.uid(), partner_slug) OR public.has_role(auth.uid(), 'admin'));

-- Policies: partner_products (same pattern)
CREATE POLICY "Public read published products" ON public.partner_products
  FOR SELECT USING (is_published = true);
CREATE POLICY "Owners read own products" ON public.partner_products
  FOR SELECT TO authenticated
  USING (public.is_partner_owner(auth.uid(), partner_slug) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owners insert products" ON public.partner_products
  FOR INSERT TO authenticated
  WITH CHECK (public.is_partner_owner(auth.uid(), partner_slug) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owners update products" ON public.partner_products
  FOR UPDATE TO authenticated
  USING (public.is_partner_owner(auth.uid(), partner_slug) OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Owners delete products" ON public.partner_products
  FOR DELETE TO authenticated
  USING (public.is_partner_owner(auth.uid(), partner_slug) OR public.has_role(auth.uid(), 'admin'));

-- Policies: partner_owners
CREATE POLICY "Users see own owner mapping" ON public.partner_owners
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage owners" ON public.partner_owners
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Policies: partner_content_clicks
CREATE POLICY "Anyone can log clicks" ON public.partner_content_clicks
  FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Owners read own clicks" ON public.partner_content_clicks
  FOR SELECT TO authenticated
  USING (public.is_partner_owner(auth.uid(), partner_slug) OR public.has_role(auth.uid(), 'admin'));

-- updated_at triggers
CREATE TRIGGER trg_partner_programs_updated BEFORE UPDATE ON public.partner_programs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_partner_products_updated BEFORE UPDATE ON public.partner_products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket for partner media (public read)
INSERT INTO storage.buckets (id, name, public)
  VALUES ('partner-media', 'partner-media', true)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read partner media" ON storage.objects
  FOR SELECT USING (bucket_id = 'partner-media');
CREATE POLICY "Owners upload partner media" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'partner-media'
    AND (public.is_partner_owner(auth.uid(), (storage.foldername(name))[1])
         OR public.has_role(auth.uid(), 'admin'))
  );
CREATE POLICY "Owners update partner media" ON storage.objects
  FOR UPDATE TO authenticated
  USING (
    bucket_id = 'partner-media'
    AND (public.is_partner_owner(auth.uid(), (storage.foldername(name))[1])
         OR public.has_role(auth.uid(), 'admin'))
  );
CREATE POLICY "Owners delete partner media" ON storage.objects
  FOR DELETE TO authenticated
  USING (
    bucket_id = 'partner-media'
    AND (public.is_partner_owner(auth.uid(), (storage.foldername(name))[1])
         OR public.has_role(auth.uid(), 'admin'))
  );
