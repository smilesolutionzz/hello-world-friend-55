-- Add new fields to profiles table for detailed user information
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS gender TEXT,
ADD COLUMN IF NOT EXISTS age_group TEXT,
ADD COLUMN IF NOT EXISTS interests JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS primary_concern TEXT,
ADD COLUMN IF NOT EXISTS relationship_to_child TEXT;

-- Add enum for gender if needed
-- CREATE TYPE gender_type AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');

-- Add enum for age groups
-- CREATE TYPE age_group_type AS ENUM ('child_0_5', 'child_6_12', 'teen_13_18', 'adult_19_35', 'adult_36_50', 'adult_51_65', 'senior_65_plus');

-- Update the handle_new_user function to include new fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id, 
    display_name, 
    email, 
    phone, 
    birth_date,
    gender,
    age_group,
    interests,
    primary_concern,
    relationship_to_child
  )
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    NEW.raw_user_meta_data ->> 'phone',
    CASE 
      WHEN NEW.raw_user_meta_data ->> 'birth_date' IS NOT NULL 
      THEN (NEW.raw_user_meta_data ->> 'birth_date')::date 
      ELSE NULL 
    END,
    NEW.raw_user_meta_data ->> 'gender',
    NEW.raw_user_meta_data ->> 'age_group',
    COALESCE((NEW.raw_user_meta_data ->> 'interests')::jsonb, '[]'::jsonb),
    NEW.raw_user_meta_data ->> 'primary_concern',
    NEW.raw_user_meta_data ->> 'relationship_to_child'
  )
  ON CONFLICT (user_id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    phone = EXCLUDED.phone,
    birth_date = EXCLUDED.birth_date,
    gender = EXCLUDED.gender,
    age_group = EXCLUDED.age_group,
    interests = EXCLUDED.interests,
    primary_concern = EXCLUDED.primary_concern,
    relationship_to_child = EXCLUDED.relationship_to_child;
  
  INSERT INTO public.user_tokens (user_id, current_tokens)
  VALUES (NEW.id, 5)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';