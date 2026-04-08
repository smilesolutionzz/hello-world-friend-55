
-- 1. 프리미엄 리포트 이력 테이블
CREATE TABLE public.premium_report_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  report_number INTEGER NOT NULL DEFAULT 1,
  report_data JSONB NOT NULL DEFAULT '{}',
  preprocessed_data JSONB NOT NULL DEFAULT '{}',
  dimension_scores JSONB DEFAULT '{}',
  risk_level TEXT DEFAULT 'unknown',
  overall_score NUMERIC DEFAULT 0,
  model_used TEXT DEFAULT 'unknown',
  research_citations JSONB DEFAULT '[]',
  data_source_counts JSONB DEFAULT '{}',
  data_span_days INTEGER DEFAULT 0,
  report_mode TEXT DEFAULT 'with-data',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. RLS
ALTER TABLE public.premium_report_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own report history"
  ON public.premium_report_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reports"
  ON public.premium_report_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 3. 또래 비교 백분위 계산 함수
CREATE OR REPLACE FUNCTION public.get_peer_percentile(
  p_user_id UUID,
  p_dimension TEXT,
  p_user_score NUMERIC,
  p_age_group TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_count INTEGER;
  below_count INTEGER;
  percentile NUMERIC;
  avg_score NUMERIC;
  result JSONB;
BEGIN
  -- progress_tracking 테이블에서 같은 차원의 모든 점수 집계
  -- 연령대 필터가 있으면 프로필의 birth_date 기준으로 필터링
  IF p_age_group IS NOT NULL THEN
    SELECT 
      COUNT(*),
      COUNT(CASE WHEN (dimension_scores->>p_dimension)::NUMERIC < p_user_score THEN 1 END),
      AVG((dimension_scores->>p_dimension)::NUMERIC)
    INTO total_count, below_count, avg_score
    FROM public.progress_tracking pt
    JOIN public.profiles pr ON pt.user_id = pr.user_id
    WHERE pt.dimension_scores ? p_dimension
      AND pt.user_id != p_user_id
      AND (dimension_scores->>p_dimension) IS NOT NULL;
  ELSE
    SELECT 
      COUNT(*),
      COUNT(CASE WHEN (dimension_scores->>p_dimension)::NUMERIC < p_user_score THEN 1 END),
      AVG((dimension_scores->>p_dimension)::NUMERIC)
    INTO total_count, below_count, avg_score
    FROM public.progress_tracking
    WHERE dimension_scores ? p_dimension
      AND user_id != p_user_id
      AND (dimension_scores->>p_dimension) IS NOT NULL;
  END IF;

  IF total_count < 3 THEN
    -- 데이터 부족 시 추정치 반환
    percentile := CASE 
      WHEN p_user_score >= 80 THEN 85
      WHEN p_user_score >= 60 THEN 60
      WHEN p_user_score >= 40 THEN 40
      ELSE 20
    END;
    result := jsonb_build_object(
      'percentile', percentile,
      'sample_size', total_count,
      'is_estimated', true,
      'avg_score', COALESCE(avg_score, 50),
      'message', '비교 데이터가 충분하지 않아 추정치입니다.'
    );
  ELSE
    percentile := ROUND((below_count::NUMERIC / total_count) * 100);
    result := jsonb_build_object(
      'percentile', percentile,
      'sample_size', total_count,
      'is_estimated', false,
      'avg_score', ROUND(avg_score, 1),
      'message', total_count || '명의 사용자 데이터 기반'
    );
  END IF;

  RETURN result;
END;
$$;

-- 4. 이전 리포트 대비 변화 계산 함수
CREATE OR REPLACE FUNCTION public.get_report_comparison(
  p_user_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  prev_report RECORD;
  latest_report RECORD;
  comparison JSONB;
  dim_changes JSONB := '[]'::JSONB;
  prev_dim TEXT;
  prev_score NUMERIC;
  curr_score NUMERIC;
BEGIN
  -- 최신 2개 리포트 가져오기
  SELECT * INTO latest_report
  FROM public.premium_report_history
  WHERE user_id = p_user_id
  ORDER BY created_at DESC
  LIMIT 1;

  SELECT * INTO prev_report
  FROM public.premium_report_history
  WHERE user_id = p_user_id
  ORDER BY created_at DESC
  OFFSET 1
  LIMIT 1;

  IF prev_report IS NULL OR latest_report IS NULL THEN
    RETURN jsonb_build_object(
      'has_comparison', false,
      'message', '비교할 이전 리포트가 없습니다. 두 번째 리포트부터 비교 분석이 제공됩니다.'
    );
  END IF;

  -- 차원별 점수 변화 계산
  FOR prev_dim, prev_score IN 
    SELECT key, value::NUMERIC 
    FROM jsonb_each_text(prev_report.dimension_scores)
    WHERE value ~ '^\d+\.?\d*$'
  LOOP
    curr_score := (latest_report.dimension_scores->>prev_dim)::NUMERIC;
    IF curr_score IS NOT NULL THEN
      dim_changes := dim_changes || jsonb_build_array(
        jsonb_build_object(
          'dimension', prev_dim,
          'previous_score', prev_score,
          'current_score', curr_score,
          'change', curr_score - prev_score,
          'change_percent', CASE WHEN prev_score > 0 THEN ROUND(((curr_score - prev_score) / prev_score) * 100, 1) ELSE 0 END,
          'status', CASE 
            WHEN curr_score - prev_score > 5 THEN 'improved'
            WHEN curr_score - prev_score < -5 THEN 'declined'
            ELSE 'stable'
          END
        )
      );
    END IF;
  END LOOP;

  comparison := jsonb_build_object(
    'has_comparison', true,
    'previous_report_date', prev_report.created_at,
    'current_report_date', latest_report.created_at,
    'days_between', EXTRACT(DAY FROM (latest_report.created_at - prev_report.created_at))::INTEGER,
    'previous_overall_score', prev_report.overall_score,
    'current_overall_score', latest_report.overall_score,
    'overall_change', latest_report.overall_score - prev_report.overall_score,
    'previous_risk_level', prev_report.risk_level,
    'current_risk_level', latest_report.risk_level,
    'dimension_changes', dim_changes,
    'previous_report_number', prev_report.report_number,
    'current_report_number', latest_report.report_number
  );

  RETURN comparison;
END;
$$;

-- 5. 인덱스
CREATE INDEX idx_premium_report_history_user_id ON public.premium_report_history(user_id);
CREATE INDEX idx_premium_report_history_created_at ON public.premium_report_history(created_at DESC);
