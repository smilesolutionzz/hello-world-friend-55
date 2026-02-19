
-- ============================================================
-- FIX 1: Subscribers table - Remove overly permissive ALL policy
-- ============================================================

-- Drop the dangerous "System can manage subscribers" ALL policy (WITH CHECK true)
DROP POLICY IF EXISTS "System can manage subscribers" ON public.subscribers;

-- Create proper owner-scoped SELECT policy
CREATE POLICY "Users can view own subscription"
ON public.subscribers FOR SELECT TO authenticated
USING (user_id = auth.uid());

-- Keep admin view policy (already exists)
-- Service role INSERT/UPDATE for system operations
CREATE POLICY "Service role can manage subscribers"
ON public.subscribers FOR ALL TO service_role
USING (true) WITH CHECK (true);

-- ============================================================
-- FIX 2: admin_notifications - Restrict INSERT to service_role
-- ============================================================

-- Drop the overly permissive INSERT policy
DROP POLICY IF EXISTS "System can create admin notifications" ON public.admin_notifications;

-- Only service_role and triggers can insert notifications
CREATE POLICY "Service role can create admin notifications"
ON public.admin_notifications FOR INSERT TO service_role
WITH CHECK (true);

-- ============================================================
-- FIX 3: Storage - Make sensitive buckets private
-- ============================================================

-- Make observation-media private
UPDATE storage.buckets SET public = false WHERE name = 'observation-media';

-- Make chat-files private
UPDATE storage.buckets SET public = false WHERE name = 'chat-files';

-- Remove public read policies for observation-media
DROP POLICY IF EXISTS "observation_media_public_read" ON storage.objects;

-- Remove public read/upload policies for chat-files
DROP POLICY IF EXISTS "Allow public read from chat-files" ON storage.objects;
DROP POLICY IF EXISTS "Allow public upload to chat-files" ON storage.objects;

-- Add authenticated owner-only policies for chat-files
CREATE POLICY "Users can upload own chat files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'chat-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can read own chat files"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'chat-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own chat files"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'chat-files' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);
