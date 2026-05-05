
DROP POLICY IF EXISTS "Users can view own feedback" ON public.ai_analysis_feedback;
CREATE POLICY "Users can view own feedback"
ON public.ai_analysis_feedback
FOR SELECT
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Anonymous posts viewable by authenticated users" ON public.community_posts;
CREATE POLICY "Non-anonymous public posts viewable by authenticated users"
ON public.community_posts
FOR SELECT
USING (
  is_public = true
  AND is_anonymous = false
  AND auth.uid() IS NOT NULL
);

CREATE OR REPLACE VIEW public.community_posts_public AS
SELECT
  id,
  CASE WHEN is_anonymous THEN NULL ELSE user_id END AS user_id,
  is_anonymous,
  is_public,
  title,
  content,
  media_urls,
  tags,
  likes_count,
  comments_count,
  created_at,
  updated_at
FROM public.community_posts
WHERE is_public = true AND auth.uid() IS NOT NULL;

GRANT SELECT ON public.community_posts_public TO authenticated;

DROP POLICY IF EXISTS "Comments are viewable by everyone" ON public.community_comments;
CREATE POLICY "Comments on non-anonymous public posts viewable by authenticated"
ON public.community_comments
FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.community_posts p
      WHERE p.id = community_comments.post_id
        AND p.is_public = true
        AND p.is_anonymous = false
        AND community_comments.is_anonymous = false
    )
  )
);

CREATE OR REPLACE VIEW public.community_comments_public AS
SELECT
  c.id,
  c.post_id,
  CASE WHEN c.is_anonymous THEN NULL ELSE c.user_id END AS user_id,
  c.is_anonymous,
  c.content,
  c.created_at,
  c.updated_at
FROM public.community_comments c
JOIN public.community_posts p ON p.id = c.post_id
WHERE p.is_public = true AND auth.uid() IS NOT NULL;

GRANT SELECT ON public.community_comments_public TO authenticated;

DROP POLICY IF EXISTS "Leaderboard is viewable by everyone" ON public.life_achievement_leaderboard;
CREATE POLICY "Leaderboard is viewable by authenticated users"
ON public.life_achievement_leaderboard
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Anyone can insert ad analytics" ON public.b2b_ad_analytics;
CREATE POLICY "Authenticated users can insert ad analytics"
ON public.b2b_ad_analytics
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users can view published comments on shared repor" ON public.expert_report_comments;
CREATE POLICY "Report owners can view published expert comments"
ON public.expert_report_comments
FOR SELECT
TO authenticated
USING (
  is_visible_to_parent = true
  AND EXISTS (
    SELECT 1 FROM public.premium_report_history h
    WHERE h.id = expert_report_comments.report_history_id
      AND h.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view institution premium analytics"
ON public.institution_premium_analytics
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));
