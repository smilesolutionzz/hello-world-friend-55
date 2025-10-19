import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Message {
  id: string;
  session_id: string;
  sender_id: string;
  message_type: 'text' | 'image' | 'file';
  content: string;
  file_url?: string;
  is_read: boolean;
  created_at: string;
}

export interface ConsultationSession {
  id: string;
  user_id: string;
  expert_id?: string;
  status: 'waiting' | 'active' | 'ended';
  started_at: string;
  ended_at?: string;
}

export const useRealtimeConsultation = (sessionId?: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [session, setSession] = useState<ConsultationSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  // Create new session
  const createSession = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('realtime_consultation_sessions')
        .insert([
          {
            user_id: user.id,
            status: 'waiting'
          }
        ])
        .select()
        .single();

      if (error) throw error;
      setSession(data);
      return data;
    } catch (error) {
      console.error('Error creating session:', error);
      toast({
        title: '세션 생성 실패',
        description: '다시 시도해주세요.',
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Load messages for session
  const loadMessages = useCallback(async (sid: string) => {
    try {
      const { data, error } = await supabase
        .from('realtime_consultation_messages')
        .select('*')
        .eq('session_id', sid)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }, []);

  // Load session details
  const loadSession = useCallback(async (sid: string) => {
    try {
      const { data, error } = await supabase
        .from('realtime_consultation_sessions')
        .select('*')
        .eq('id', sid)
        .single();

      if (error) throw error;
      setSession(data);
    } catch (error) {
      console.error('Error loading session:', error);
    }
  }, []);

  // Send message
  const sendMessage = useCallback(async (content: string, messageType: 'text' | 'image' | 'file' = 'text', fileUrl?: string) => {
    if (!sessionId) return;
    
    setIsSending(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('realtime_consultation_messages')
        .insert([
          {
            session_id: sessionId,
            sender_id: user.id,
            message_type: messageType,
            content,
            file_url: fileUrl
          }
        ]);

      if (error) throw error;
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: '메시지 전송 실패',
        description: '다시 시도해주세요.',
        variant: 'destructive'
      });
    } finally {
      setIsSending(false);
    }
  }, [sessionId, toast]);

  // Subscribe to realtime messages
  useEffect(() => {
    if (!sessionId) return;

    loadMessages(sessionId);
    loadSession(sessionId);

    const channel = supabase
      .channel(`session-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'realtime_consultation_messages',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          console.log('New message:', payload);
          setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'realtime_consultation_sessions',
          filter: `id=eq.${sessionId}`
        },
        (payload) => {
          console.log('Session updated:', payload);
          setSession(payload.new as ConsultationSession);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, loadMessages, loadSession]);

  return {
    messages,
    session,
    isLoading,
    isSending,
    createSession,
    sendMessage
  };
};