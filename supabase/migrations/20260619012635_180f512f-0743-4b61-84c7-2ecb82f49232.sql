
DROP POLICY IF EXISTS "Anyone can submit inquiries" ON public.center_inquiries;
CREATE POLICY "Anyone can submit inquiries"
ON public.center_inquiries
FOR INSERT
WITH CHECK (
  contact IS NOT NULL
  AND char_length(btrim(contact)) BETWEEN 5 AND 200
  AND (
    contact ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
    OR contact ~ '^[0-9+\-\s().]{7,20}$'
  )
  AND (name IS NULL OR char_length(name) <= 100)
  AND (memo IS NULL OR char_length(memo) <= 2000)
);

DROP POLICY IF EXISTS "leads_public_insert" ON public.leads;
CREATE POLICY "leads_public_insert"
ON public.leads
FOR INSERT
WITH CHECK (
  phone IS NOT NULL
  AND char_length(btrim(phone)) BETWEEN 7 AND 20
  AND phone ~ '^[0-9+\-\s().]{7,20}$'
  AND (parent_name IS NULL OR char_length(parent_name) <= 100)
  AND (concern IS NULL OR char_length(concern) <= 2000)
);
