-- Add report_images column to concern_storage table
ALTER TABLE public.concern_storage
ADD COLUMN IF NOT EXISTS report_images TEXT[];

-- Add comment
COMMENT ON COLUMN public.concern_storage.report_images IS 'Array of image URLs generated for the analysis report';