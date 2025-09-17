-- Add missing is_active column to partner_service_info table
ALTER TABLE partner_service_info 
ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;