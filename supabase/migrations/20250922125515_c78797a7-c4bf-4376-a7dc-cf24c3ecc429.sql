-- Create new edge function for stress analysis
CREATE OR REPLACE FUNCTION public.analyze_stress_test_results(
  p_user_id uuid,
  p_answers integer[],
  p_total_score integer,
  p_age integer DEFAULT 30
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
  stress_level text;
  analysis_prompt text;
BEGIN
  -- Only allow authenticated users to analyze their own results
  IF auth.uid() IS NULL OR auth.uid() != p_user_id THEN
    RETURN jsonb_build_object('error', '권한이 없습니다.');
  END IF;
  
  -- Determine stress level
  IF p_total_score <= 16 THEN
    stress_level := '낮음';
  ELSIF p_total_score <= 32 THEN
    stress_level := '보통';
  ELSE
    stress_level := '높음';
  END IF;
  
  -- Create detailed prompt for AI analysis
  analysis_prompt := format('스트레스 자가진단 결과 분석 (총점: %s점, 수준: %s)', p_total_score, stress_level);
  
  -- Insert into assessment results table for tracking
  INSERT INTO public.test_results (
    user_id,
    test_type,
    answers,
    score,
    analysis,
    created_at
  ) VALUES (
    p_user_id,
    'stress_test',
    array_to_json(p_answers)::jsonb,
    p_total_score,
    jsonb_build_object(
      'stress_level', stress_level,
      'detailed_analysis', '분석 중...'
    ),
    now()
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'stress_level', stress_level,
    'total_score', p_total_score,
    'message', 'AI 분석을 진행합니다.'
  );
END;
$$;