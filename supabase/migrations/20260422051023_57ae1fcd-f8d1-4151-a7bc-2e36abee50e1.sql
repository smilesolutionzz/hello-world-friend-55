-- Allow authenticated users to view their own b2b demo requests (matched by email)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policy
    WHERE polrelid = 'public.b2b_demo_requests'::regclass
      AND polname = 'Users view own b2b requests by email'
  ) THEN
    CREATE POLICY "Users view own b2b requests by email"
      ON public.b2b_demo_requests
      FOR SELECT
      TO authenticated
      USING (
        contact_email = (auth.jwt() ->> 'email')
        OR public.has_role(auth.uid(), 'admin')
      );
  END IF;
END $$;