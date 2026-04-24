-- 1. report_share_links: drop anon enumeration policy
DROP POLICY IF EXISTS "Anyone can view active share links by token" ON public.report_share_links;

-- 2. payment_history: remove the (auth.uid() IS NULL) bypass on UPDATE
DROP POLICY IF EXISTS "Users can update their own payment records" ON public.payment_history;
CREATE POLICY "Users can update their own payment records"
ON public.payment_history
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 3. expert_report_comments: restrict parent-visible SELECT to authenticated only
DROP POLICY IF EXISTS "Parents can view published comments on shared reports" ON public.expert_report_comments;
CREATE POLICY "Authenticated users can view published comments on shared reports"
ON public.expert_report_comments
FOR SELECT
TO authenticated
USING (is_visible_to_parent = true);