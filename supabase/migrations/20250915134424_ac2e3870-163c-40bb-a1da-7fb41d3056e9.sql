-- Fix community posts privacy vulnerability with proper approach

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Public posts viewable with privacy protection" ON public.community_posts;

-- Create secure RLS policies that protect user privacy
CREATE POLICY "Users can view their own posts with full data" 
ON public.community_posts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Anonymous posts viewable by authenticated users" 
ON public.community_posts 
FOR SELECT 
USING (is_public = true AND is_anonymous = true AND auth.uid() IS NOT NULL);

-- Create a secure function to get community posts without exposing user_id for anonymous posts
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
  updated_at timestamp with time zone,
  author_display text
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
    cp.updated_at,
    CASE 
      WHEN cp.is_anonymous = true THEN '익명의 사용자'
      WHEN auth.uid() = cp.user_id THEN p.display_name
      ELSE '익명의 사용자'
    END AS author_display
  FROM public.community_posts cp
  LEFT JOIN public.profiles p ON p.user_id = cp.user_id
  WHERE cp.is_public = true
    AND auth.uid() IS NOT NULL
  ORDER BY cp.created_at DESC;
$$;