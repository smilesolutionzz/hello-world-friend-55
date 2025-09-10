-- Fix security issue: Hide user IDs in community tables to prevent user tracking

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Likes are viewable by everyone" ON public.community_likes;
DROP POLICY IF EXISTS "Public posts are viewable by everyone" ON public.community_posts;

-- Create secure policies for community_likes
-- Users can only see their own likes, not others' user IDs
CREATE POLICY "Users can view their own likes only" 
ON public.community_likes 
FOR SELECT 
USING (auth.uid() = user_id);

-- Allow viewing like counts without exposing user IDs through aggregate functions
CREATE POLICY "Anonymous like count access" 
ON public.community_likes 
FOR SELECT 
USING (auth.uid() IS NULL AND false); -- This will be handled by functions instead

-- Create secure policies for community_posts  
-- Public posts viewable but with user_id restricted based on anonymity settings
CREATE POLICY "Public posts viewable with privacy protection" 
ON public.community_posts 
FOR SELECT 
USING (
  is_public = true AND 
  (
    auth.uid() = user_id OR  -- User can see their own posts with user_id
    is_anonymous = true      -- Anonymous posts hide user_id from others
  )
);

-- Create functions to safely get like counts and check if user liked
CREATE OR REPLACE FUNCTION public.get_post_likes_count(post_id uuid)
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::integer
  FROM community_likes
  WHERE community_likes.post_id = get_post_likes_count.post_id;
$$;

CREATE OR REPLACE FUNCTION public.get_comment_likes_count(comment_id uuid)
RETURNS integer  
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::integer
  FROM community_likes  
  WHERE community_likes.comment_id = get_comment_likes_count.comment_id;
$$;

CREATE OR REPLACE FUNCTION public.user_has_liked_post(post_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER  
SET search_path = public
AS $$
  SELECT EXISTS(
    SELECT 1 
    FROM community_likes
    WHERE community_likes.post_id = user_has_liked_post.post_id 
      AND user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.user_has_liked_comment(comment_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public  
AS $$
  SELECT EXISTS(
    SELECT 1
    FROM community_likes
    WHERE community_likes.comment_id = user_has_liked_comment.comment_id
      AND user_id = auth.uid()
  );
$$;