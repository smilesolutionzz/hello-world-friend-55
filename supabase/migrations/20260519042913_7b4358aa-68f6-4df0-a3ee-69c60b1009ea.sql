
ALTER TABLE public.mind_track_enrollments
  ADD COLUMN IF NOT EXISTS audience text NOT NULL DEFAULT 'child';

-- 허용값 검증 (CHECK는 immutable이라 안전)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'mind_track_enrollments_audience_check'
  ) THEN
    ALTER TABLE public.mind_track_enrollments
      ADD CONSTRAINT mind_track_enrollments_audience_check
      CHECK (audience IN ('child','adult','parent','teen'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_mind_track_enrollments_audience
  ON public.mind_track_enrollments(audience);
