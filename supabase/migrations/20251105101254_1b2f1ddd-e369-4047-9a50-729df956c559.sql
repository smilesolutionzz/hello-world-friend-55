-- Add bonus_tokens column to token_packages table
ALTER TABLE token_packages 
ADD COLUMN IF NOT EXISTS bonus_tokens INTEGER DEFAULT 0 NOT NULL;

-- Update the 400 token package to include 50 bonus tokens
UPDATE token_packages 
SET bonus_tokens = 50 
WHERE token_count = 400 AND name = '토큰팩 400';