-- Add token package related columns to payment_history table
ALTER TABLE public.payment_history 
ADD COLUMN IF NOT EXISTS token_package_id UUID REFERENCES public.token_packages(id),
ADD COLUMN IF NOT EXISTS token_amount INTEGER;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_payment_history_token_package_id ON public.payment_history(token_package_id);