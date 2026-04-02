-- Fix 1: Remove overly permissive admin_notifications policies
DROP POLICY IF EXISTS "Admin notifications are viewable by authenticated users" ON admin_notifications;
DROP POLICY IF EXISTS "Admin can update notification status" ON admin_notifications;

-- Fix 2: Fix payments anonymous INSERT policy - restrict to authenticated users
DROP POLICY IF EXISTS "Allow insert payments" ON payments;
CREATE POLICY "Authenticated users can insert payments" ON payments FOR INSERT TO authenticated WITH CHECK (true);