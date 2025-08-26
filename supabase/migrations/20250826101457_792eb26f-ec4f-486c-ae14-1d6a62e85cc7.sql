-- 발달 추적 ML 분석 결과를 저장할 테이블 생성
CREATE TABLE public.developmental_ml_analysis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  student_id UUID,
  analysis_results JSONB NOT NULL,
  raw_data_summary JSONB NOT NULL,
  confidence_score NUMERIC NOT NULL DEFAULT 0.0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.developmental_ml_analysis ENABLE ROW LEVEL SECURITY;

-- Create policies for developmental_ml_analysis
CREATE POLICY "Users can view their own ML analysis"
ON public.developmental_ml_analysis
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own ML analysis"
ON public.developmental_ml_analysis
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ML analysis"
ON public.developmental_ml_analysis
FOR UPDATE
USING (auth.uid() = user_id);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_developmental_ml_analysis_updated_at
BEFORE UPDATE ON public.developmental_ml_analysis
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 개입 계획을 저장할 테이블 생성
CREATE TABLE public.intervention_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  student_id UUID,
  ml_analysis_id UUID REFERENCES public.developmental_ml_analysis(id),
  plan_data JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.intervention_plans ENABLE ROW LEVEL SECURITY;

-- Create policies for intervention_plans
CREATE POLICY "Users can manage their own intervention plans"
ON public.intervention_plans
FOR ALL
USING (auth.uid() = user_id);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_intervention_plans_updated_at
BEFORE UPDATE ON public.intervention_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();