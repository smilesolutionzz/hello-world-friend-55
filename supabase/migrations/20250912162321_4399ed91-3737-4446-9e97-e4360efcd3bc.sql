-- Create user_memory table for AI agent personalization
CREATE TABLE public.user_memory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  short_term_memory JSONB DEFAULT '{}',
  long_term_memory JSONB DEFAULT '{}',
  family_context JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_memory ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own memory data" 
ON public.user_memory 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own memory data" 
ON public.user_memory 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own memory data" 
ON public.user_memory 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own memory data" 
ON public.user_memory 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_memory_updated_at
BEFORE UPDATE ON public.user_memory
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create agent_interactions table for tracking AI agent conversations
CREATE TABLE public.agent_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  agent_id TEXT NOT NULL,
  interaction_type TEXT NOT NULL DEFAULT 'conversation',
  message TEXT,
  response TEXT,
  confidence_score DECIMAL(3,2),
  urgency_level TEXT CHECK (urgency_level IN ('low', 'medium', 'high')),
  was_accepted BOOLEAN DEFAULT false,
  collaboration_agents TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.agent_interactions ENABLE ROW LEVEL SECURITY;

-- Create policies for agent interactions
CREATE POLICY "Users can view their own agent interactions" 
ON public.agent_interactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own agent interactions" 
ON public.agent_interactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_user_memory_user_id ON public.user_memory(user_id);
CREATE INDEX idx_user_memory_updated_at ON public.user_memory(updated_at);
CREATE INDEX idx_agent_interactions_user_id ON public.agent_interactions(user_id);
CREATE INDEX idx_agent_interactions_agent_id ON public.agent_interactions(agent_id);
CREATE INDEX idx_agent_interactions_created_at ON public.agent_interactions(created_at);