-- Fix RLS policies for memory_conversations table to prevent unauthorized access
-- Drop existing problematic policies first
DROP POLICY IF EXISTS "Public diaries are viewable by everyone" ON public.memory_conversations;
DROP POLICY IF EXISTS "Users can view their own memory conversations" ON public.memory_conversations;
DROP POLICY IF EXISTS "Users can create their own memory conversations" ON public.memory_conversations;
DROP POLICY IF EXISTS "Users can update their own memory conversations" ON public.memory_conversations;

-- Create secure RLS policies that only allow owners to access their data
-- Users can only view their own memory conversations, regardless of is_public flag
CREATE POLICY "Users can view own memory conversations only" 
ON public.memory_conversations 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can only create their own memory conversations
CREATE POLICY "Users can create own memory conversations" 
ON public.memory_conversations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can only update their own memory conversations
CREATE POLICY "Users can update own memory conversations" 
ON public.memory_conversations 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own memory conversations  
CREATE POLICY "Users can delete own memory conversations" 
ON public.memory_conversations 
FOR DELETE 
USING (auth.uid() = user_id);

-- Optional: Add a separate policy for a public feed feature if needed in the future
-- This would be for a curated public sharing feature with explicit user consent
-- For now, we're removing all public access to ensure privacy