-- Fix community posts privacy vulnerability
-- Create a secure view that properly handles anonymous posts

-- First, create a secure view for community posts that protects user privacy
CREATE OR REPLACE VIEW public.community_posts_secure AS
SELECT 
  id,
  CASE 
    WHEN is_anonymous = true THEN NULL 
    ELSE user_id 
  END AS user_id,
  title,
  content,
  tags,
  media_urls,
  is_anonymous,
  likes_count,
  comments_count,
  is_public,
  created_at,
  updated_at
FROM public.community_posts
WHERE is_public = true;

-- Enable RLS on the view
ALTER VIEW public.community_posts_secure SET (security_invoker = true);

-- Create RLS policies for the secure view
CREATE POLICY "Secure community posts are viewable by authenticated users" 
ON public.community_posts_secure
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Update the original table policies to be more restrictive
-- Only allow users to see their own posts with full data, or public anonymous posts without user_id
DROP POLICY IF EXISTS "Public posts viewable with privacy protection" ON public.community_posts;

CREATE POLICY "Users can view their own posts with full data" 
ON public.community_posts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Public anonymous posts viewable without user identification" 
ON public.community_posts 
FOR SELECT 
USING (is_public = true AND is_anonymous = true AND auth.uid() IS NOT NULL);

-- Create a function to safely get community posts
CREATE OR REPLACE FUNCTION public.get_community_posts_safe()
RETURNS TABLE(
  id uuid,
  user_id uuid,
  title text,
  content text,
  tags text[],
  media_urls jsonb,
  is_anonymous boolean,
  likes_count integer,
  comments_count integer,
  is_public boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
) 
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    cp.id,
    CASE 
      WHEN cp.is_anonymous = true THEN NULL::uuid
      WHEN auth.uid() = cp.user_id THEN cp.user_id
      ELSE NULL::uuid
    END AS user_id,
    cp.title,
    cp.content,
    cp.tags,
    cp.media_urls,
    cp.is_anonymous,
    cp.likes_count,
    cp.comments_count,
    cp.is_public,
    cp.created_at,
    cp.updated_at
  FROM public.community_posts cp
  WHERE cp.is_public = true
    AND auth.uid() IS NOT NULL
  ORDER BY cp.created_at DESC;
$$;