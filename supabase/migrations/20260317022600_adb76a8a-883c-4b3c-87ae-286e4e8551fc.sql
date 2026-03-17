
-- Drop the existing restrictive policy
DROP POLICY "Public can view limited expert info" ON public.experts;

-- Create a new policy that allows everyone (including unauthenticated users) to view verified experts
CREATE POLICY "Anyone can view verified experts"
ON public.experts
FOR SELECT
USING (is_verified = true AND is_available = true);
