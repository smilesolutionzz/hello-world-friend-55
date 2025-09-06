-- Create storage buckets for community posts
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('community-media', 'community-media', true),
  ('observation-media', 'observation-media', true);

-- Create RLS policies for community media uploads
CREATE POLICY "Users can upload their own community media" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'community-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Community media is publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'community-media');

CREATE POLICY "Users can update their own community media" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'community-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own community media" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'community-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create RLS policies for observation media uploads
CREATE POLICY "Users can upload their own observation media" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'observation-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Observation media is publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'observation-media');

CREATE POLICY "Users can update their own observation media" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'observation-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own observation media" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'observation-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create community posts table
CREATE TABLE public.community_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL DEFAULT 'general', -- 'observation', 'concern', 'general'
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  media_urls TEXT[], -- Array of media file URLs
  observation_id UUID, -- Link to original observation if shared from observation log
  tags TEXT[],
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

-- Create policies for community posts
CREATE POLICY "Community posts are viewable by everyone" 
ON public.community_posts 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own posts" 
ON public.community_posts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" 
ON public.community_posts 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" 
ON public.community_posts 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create community comments table
CREATE TABLE public.community_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for comments
CREATE POLICY "Comments are viewable by everyone" 
ON public.community_comments 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create comments" 
ON public.community_comments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
ON public.community_comments 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
ON public.community_comments 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_community_posts_user_id ON public.community_posts(user_id);
CREATE INDEX idx_community_posts_type ON public.community_posts(type);
CREATE INDEX idx_community_posts_created_at ON public.community_posts(created_at DESC);
CREATE INDEX idx_community_comments_post_id ON public.community_comments(post_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_community_posts_updated_at
  BEFORE UPDATE ON public.community_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();