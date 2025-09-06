-- 🚨 CRITICAL SECURITY FIX PHASE 1: Enable RLS on vulnerable tables
-- This addresses the most severe security vulnerabilities

-- 1. Enable RLS on family_members table (contains personal info, emails, phone numbers)
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;

-- 2. Enable RLS on bank_transfer_requests table (contains financial data)
ALTER TABLE public.bank_transfer_requests ENABLE ROW LEVEL SECURITY;

-- 3. Enable RLS on assessments table (contains medical/psychological data)  
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

-- 4. Enable RLS on chat_messages table (contains private therapy communications)
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- 5. Enable RLS on chat_rooms table (contains private therapy session data)
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;

-- 6. Enable RLS on consultations table (contains private therapy session data and ratings)
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

-- 7. Enable RLS on developmental_screening_results table (contains medical data)
ALTER TABLE public.developmental_screening_results ENABLE ROW LEVEL SECURITY;

-- 8. Enable RLS on developmental_tracking table (contains medical/educational data)
ALTER TABLE public.developmental_tracking ENABLE ROW LEVEL SECURITY;

-- 9. Enable RLS on individual_education_plans table (contains sensitive educational data)
ALTER TABLE public.individual_education_plans ENABLE ROW LEVEL SECURITY;