-- Add expert advice columns to observations table
ALTER TABLE observations 
ADD COLUMN IF NOT EXISTS expert_advice TEXT,
ADD COLUMN IF NOT EXISTS detailed_advice TEXT;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_observations_date ON observations(observation_date DESC);

COMMENT ON COLUMN observations.expert_advice IS '전문가 한줄 조언';
COMMENT ON COLUMN observations.detailed_advice IS '상세 전문가 조언';