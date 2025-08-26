-- Enhance profiles table RLS policies for maximum personal data protection
-- Drop existing policies to recreate with stronger security measures
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create enhanced SELECT policy with explicit authentication requirement
CREATE POLICY "Authenticated users can view only their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Create enhanced INSERT policy with strict authentication and user_id validation
CREATE POLICY "Authenticated users can create only their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id AND
  auth.uid() IS NOT NULL
);

-- Create enhanced UPDATE policy with strict authentication and user_id validation
CREATE POLICY "Authenticated users can update only their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id AND auth.uid() IS NOT NULL)
WITH CHECK (auth.uid() = user_id AND auth.uid() IS NOT NULL);

-- Add DELETE policy to prevent unauthorized profile deletion
CREATE POLICY "Prevent profile deletion"
ON public.profiles
FOR DELETE
TO authenticated
USING (false);  -- No one can delete profiles for data protection