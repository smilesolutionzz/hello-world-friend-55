-- 커뮤니티 팩트체크 결과 저장 테이블
CREATE TABLE IF NOT EXISTS public.fact_check_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE,
  check_status TEXT NOT NULL CHECK (check_status IN ('verified', 'questionable', 'misleading', 'pending')),
  confidence_score INTEGER CHECK (confidence_score BETWEEN 0 AND 100),
  sources JSONB DEFAULT '[]'::jsonb,
  summary TEXT,
  checked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 경쟁사 모니터링 테이블
CREATE TABLE IF NOT EXISTS public.competitor_monitoring (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competitor_name TEXT NOT NULL,
  website_url TEXT NOT NULL UNIQUE,
  category TEXT,
  last_checked_at TIMESTAMP WITH TIME ZONE,
  monitoring_data JSONB DEFAULT '{}'::jsonb,
  changes_detected JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 큐레이션된 교육 콘텐츠 테이블
CREATE TABLE IF NOT EXISTS public.curated_education_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  source_url TEXT NOT NULL,
  source_name TEXT,
  content_type TEXT CHECK (content_type IN ('article', 'research', 'video', 'course', 'guide')),
  summary TEXT,
  full_content TEXT,
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  target_age_group TEXT,
  relevance_score INTEGER CHECK (relevance_score BETWEEN 0 AND 100),
  is_published BOOLEAN DEFAULT false,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- RLS 정책 설정
ALTER TABLE public.fact_check_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.competitor_monitoring ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curated_education_content ENABLE ROW LEVEL SECURITY;

-- 팩트체크 결과는 모든 인증된 사용자가 볼 수 있음
CREATE POLICY "Anyone can view fact check results"
  ON public.fact_check_results FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- 경쟁사 모니터링은 관리자만 접근
CREATE POLICY "Only admins can view competitor monitoring"
  ON public.competitor_monitoring FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can modify competitor monitoring"
  ON public.competitor_monitoring FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- 큐레이션된 콘텐츠는 발행된 것만 사용자가 볼 수 있음
CREATE POLICY "Users can view published curated content"
  ON public.curated_education_content FOR SELECT
  USING (is_published = true AND auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage curated content"
  ON public.curated_education_content FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- 인덱스 생성
CREATE INDEX idx_fact_check_post_id ON public.fact_check_results(post_id);
CREATE INDEX idx_competitor_monitoring_active ON public.competitor_monitoring(is_active, last_checked_at);
CREATE INDEX idx_curated_content_published ON public.curated_education_content(is_published, created_at DESC);
CREATE INDEX idx_curated_content_tags ON public.curated_education_content USING GIN(tags);

-- 업데이트 트리거
CREATE OR REPLACE FUNCTION update_competitor_monitoring_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_competitor_monitoring_timestamp
  BEFORE UPDATE ON public.competitor_monitoring
  FOR EACH ROW
  EXECUTE FUNCTION update_competitor_monitoring_updated_at();

CREATE OR REPLACE FUNCTION update_curated_content_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_curated_content_timestamp
  BEFORE UPDATE ON public.curated_education_content
  FOR EACH ROW
  EXECUTE FUNCTION update_curated_content_updated_at();