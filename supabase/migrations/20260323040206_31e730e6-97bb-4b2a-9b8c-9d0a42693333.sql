
-- Note: Previous migration partially applied (fixes 1-9 succeeded, 10 failed).
-- Only applying fixes 10-13 now.

-- ============================================
-- FIX 10: facility_audit_item_status - USING true → facility access check
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can manage audit item status" ON public.facility_audit_item_status;

CREATE POLICY "Facility staff can manage audit item status"
  ON public.facility_audit_item_status FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.facility_staff fs
      WHERE fs.facility_id = facility_audit_item_status.facility_id 
      AND fs.user_id = auth.uid() AND fs.is_active = true
    )
  );

-- ============================================
-- FIX 11: staff_training_records - USING true → facility access
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can manage training records" ON public.staff_training_records;

CREATE POLICY "Facility staff can manage training records"
  ON public.staff_training_records FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.facility_staff fs
      WHERE fs.facility_id = staff_training_records.facility_id AND fs.user_id = auth.uid() AND fs.is_active = true
    )
  );

-- ============================================
-- FIX 12: facility_audit_checks - USING true → facility access
-- ============================================
DROP POLICY IF EXISTS "Authenticated users can manage audit checks" ON public.facility_audit_checks;

CREATE POLICY "Facility staff can manage audit checks"
  ON public.facility_audit_checks FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.facility_staff fs
      WHERE fs.facility_id = facility_audit_checks.facility_id AND fs.user_id = auth.uid() AND fs.is_active = true
    )
  );

-- ============================================
-- FIX 13: observation-media storage - make private
-- ============================================
UPDATE storage.buckets SET public = false WHERE name = 'observation-media';

DROP POLICY IF EXISTS "observation_media_public_read" ON storage.objects;

CREATE POLICY "Users can read own observation files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'observation-media'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
