import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ChatMessage {
  id: string;
  session_id: string;
  sender_id: string;
  message_type: 'text' | 'image' | 'file';
  content: string;
  file_url?: string;
  is_read: boolean;
  created_at: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  expert_id?: string;
  status: 'waiting' | 'active' | 'ended';
  started_at: string;
  ended_at?: string;
}

interface PresenceState {
  isTyping: boolean;
  lastSeen: string;
  userId: string;
}

export const useRealtimeChat = (sessionId?: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [session, setSession] = useState<ChatSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [remoteTyping, setRemoteTyping] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const { toast } = useToast();

  // Get current user or generate anonymous ID
  useEffect(() => {
    const getOrCreateUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      } else {
        // Generate anonymous user ID for demo purposes
        const storedId = localStorage.getItem('anonymous_chat_user_id');
        if (storedId) {
          setCurrentUserId(storedId);
        } else {
          const newId = crypto.randomUUID();
          localStorage.setItem('anonymous_chat_user_id', newId);
          setCurrentUserId(newId);
        }
      }
    };
    getOrCreateUserId();
  }, []);

  // Create new session
  const createSession = useCallback(async () => {
    setIsLoading(true);
    try {
      // Use authenticated user ID or anonymous ID
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || currentUserId || crypto.randomUUID();

      const { data, error } = await supabase
        .from('realtime_consultation_sessions')
        .insert([{ user_id: userId, status: 'waiting' }])
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
  }, [toast, currentUserId]);

  // Load messages
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

  // Load session
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

  // Mark messages as read
  const markAsRead = useCallback(async (messageIds: string[]) => {
    if (!messageIds.length || !currentUserId) return;
    
    try {
      await supabase
        .from('realtime_consultation_messages')
        .update({ is_read: true })
        .in('id', messageIds)
        .neq('sender_id', currentUserId);
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  }, [currentUserId]);

  // Send typing indicator
  const sendTypingIndicator = useCallback((typing: boolean) => {
    if (!channelRef.current || !currentUserId) return;
    
    channelRef.current.track({
      isTyping: typing,
      lastSeen: new Date().toISOString(),
      userId: currentUserId
    });
  }, [currentUserId]);

  // Handle typing with debounce
  const handleTyping = useCallback(() => {
    if (!isTyping) {
      setIsTyping(true);
      sendTypingIndicator(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      sendTypingIndicator(false);
    }, 2000);
  }, [isTyping, sendTypingIndicator]);

  // Send message
  const sendMessage = useCallback(async (
    content: string, 
    messageType: 'text' | 'image' | 'file' = 'text', 
    fileUrl?: string
  ) => {
    if (!sessionId) return;
    
    // Get sender ID from state or generate one
    const senderId = currentUserId || localStorage.getItem('anonymous_chat_user_id') || crypto.randomUUID();
    
    setIsSending(true);
    setIsTyping(false);
    sendTypingIndicator(false);

    try {
      const { error } = await supabase
        .from('realtime_consultation_messages')
        .insert([{
          session_id: sessionId,
          sender_id: senderId,
          message_type: messageType,
          content,
          file_url: fileUrl
        }]);

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
  }, [sessionId, currentUserId, sendTypingIndicator, toast]);

  // Upload file
  const uploadFile = useCallback(async (file: File): Promise<string | null> => {
    const userId = currentUserId || localStorage.getItem('anonymous_chat_user_id') || 'anonymous';

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('chat-files')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('chat-files')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: '파일 업로드 실패',
        description: '다시 시도해주세요.',
        variant: 'destructive'
      });
      return null;
    }
  }, [currentUserId, toast]);

  // Send file message
  const sendFileMessage = useCallback(async (file: File) => {
    const fileUrl = await uploadFile(file);
    if (!fileUrl) return;

    const messageType = file.type.startsWith('image/') ? 'image' : 'file';
    await sendMessage(file.name, messageType, fileUrl);
  }, [uploadFile, sendMessage]);

  // End session
  const endSession = useCallback(async () => {
    if (!sessionId) return;

    try {
      await supabase
        .from('realtime_consultation_sessions')
        .update({ status: 'ended', ended_at: new Date().toISOString() })
        .eq('id', sessionId);
    } catch (error) {
      console.error('Error ending session:', error);
    }
  }, [sessionId]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!sessionId) return;
    
    const userId = currentUserId || localStorage.getItem('anonymous_chat_user_id');

    loadMessages(sessionId);
    loadSession(sessionId);

    // Create channel for messages and presence
    const channel = supabase.channel(`chat-${sessionId}`)
      // Message subscription
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
          const newMessage = payload.new as ChatMessage;
          setMessages(prev => [...prev, newMessage]);
          
          // Auto mark as read if from other user
          if (newMessage.sender_id !== userId) {
            markAsRead([newMessage.id]);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'realtime_consultation_messages',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          setMessages(prev => 
            prev.map(msg => msg.id === payload.new.id ? payload.new as ChatMessage : msg)
          );
        }
      )
      // Session subscription
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
          setSession(payload.new as ChatSession);
        }
      )
      // Presence for typing indicator
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState<PresenceState>();
        const others = Object.values(state).flat().filter(
          (p) => p.userId !== userId
        );
        setRemoteTyping(others.some(p => p.isTyping));
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED' && userId) {
          await channel.track({
            isTyping: false,
            lastSeen: new Date().toISOString(),
            userId: userId
          });
        }
      });

    channelRef.current = channel;

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      supabase.removeChannel(channel);
    };
  }, [sessionId, currentUserId, loadMessages, loadSession, markAsRead]);

  return {
    messages,
    session,
    isLoading,
    isSending,
    isTyping,
    remoteTyping,
    currentUserId,
    createSession,
    sendMessage,
    sendFileMessage,
    handleTyping,
    markAsRead,
    endSession
  };
};
