-- Fix: Remove unrestricted system UPDATE/INSERT policies on referrals and referral_records
-- These allow any authenticated user to manipulate referral data and award themselves tokens

-- referrals table: remove unrestricted UPDATE
DROP POLICY IF EXISTS "System can update referral status" ON referrals;

-- referral_records table: remove unrestricted INSERT and UPDATE
DROP POLICY IF EXISTS "System can insert referral records" ON referral_records;
DROP POLICY IF EXISTS "System can update referral records" ON referral_records;