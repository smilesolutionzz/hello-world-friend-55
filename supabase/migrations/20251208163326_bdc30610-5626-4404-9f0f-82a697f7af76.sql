-- sender_id 외래 키 제약 제거
ALTER TABLE public.realtime_consultation_messages 
DROP CONSTRAINT IF EXISTS realtime_consultation_messages_sender_id_fkey;