-- 🔒 CRITICAL SECURITY FIX PHASE 2B: Create remaining secure RLS policies
-- Chat and consultation data protection

-- 4. Chat messages policies (private therapy communications protection)
CREATE POLICY "Users can view messages in their rooms" 
ON public.chat_messages 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM chat_rooms 
  WHERE chat_rooms.id = chat_messages.room_id 
  AND (chat_rooms.user_id = auth.uid() OR chat_rooms.expert_id = auth.uid())
));

CREATE POLICY "Users can send messages in their rooms" 
ON public.chat_messages 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM chat_rooms 
  WHERE chat_rooms.id = chat_messages.room_id 
  AND (chat_rooms.user_id = auth.uid() OR chat_rooms.expert_id = auth.uid())
) AND auth.uid() = sender_id);

CREATE POLICY "Users can manage messages in their chat rooms" 
ON public.chat_messages 
FOR ALL 
USING (auth.uid() = (SELECT chat_rooms.user_id FROM chat_rooms WHERE chat_rooms.id = chat_messages.room_id) OR auth.uid() = sender_id);

-- 5. Chat rooms policies (private therapy session data protection)
CREATE POLICY "Users can view their own chat rooms" 
ON public.chat_rooms 
FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() = expert_id);

CREATE POLICY "Users can manage their own chat rooms" 
ON public.chat_rooms 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own chat rooms" 
ON public.chat_rooms 
FOR UPDATE 
USING (auth.uid() = user_id OR auth.uid() = expert_id);

-- 6. Consultations policies (private therapy session data and ratings protection)
CREATE POLICY "Users can view their own consultations" 
ON public.consultations 
FOR SELECT 
USING (auth.uid() = user_id OR expert_id IN (SELECT experts.id FROM experts WHERE experts.user_id = auth.uid()));

CREATE POLICY "Users can create consultations" 
ON public.consultations 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users and experts can update their consultations" 
ON public.consultations 
FOR UPDATE 
USING (auth.uid() = user_id OR expert_id IN (SELECT experts.id FROM experts WHERE experts.user_id = auth.uid()));