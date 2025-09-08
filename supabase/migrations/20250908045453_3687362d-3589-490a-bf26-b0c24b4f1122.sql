-- Make tntjr91@kakao.com an admin
SELECT public.make_user_admin('tntjr91@kakao.com');

-- Update community posts delete policy to allow admins
DROP POLICY IF EXISTS "Users can delete their own posts" ON public.community_posts;

CREATE POLICY "Users and admins can delete posts" 
ON public.community_posts 
FOR DELETE 
USING (
  auth.uid() = user_id OR 
  has_role(auth.uid(), 'admin'::app_role)
);