import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, X, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuthGuard } from '@/hooks/useAuthGuard';

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  message_type: 'text' | 'image' | 'file';
}

interface Session {
  id: string;
  status: 'waiting' | 'active' | 'ended';
  expert_id: string | null;
}

export const RealtimeConsultation = () => {
  const { user } = useAuthGuard();
  const { toast } = useToast();
  
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [session, setSession] = useState<Session | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 세션 시작
  const startSession = async () => {
    if (!user) {
      toast({
        title: '로그인 필요',
        description: '실시간 상담을 이용하려면 로그인이 필요합니다.',
        variant: 'destructive',
      });
      return;
    }

    setIsConnecting(true);
    try {
      // 새로운 상담 세션 생성
      const { data, error } = await supabase
        .from('realtime_consultation_sessions')
        .insert({
          user_id: user.id,
          status: 'waiting'
        })
        .select()
        .single();

      if (error) throw error;

      setSession(data);
      setIsOpen(true);
      
      toast({
        title: '상담 대기 중',
        description: '전문가가 곧 연결됩니다.',
      });
    } catch (error) {
      console.error('Error starting session:', error);
      toast({
        title: '연결 실패',
        description: '상담 세션을 시작할 수 없습니다.',
        variant: 'destructive',
      });
    } finally {
      setIsConnecting(false);
    }
  };

  // 메시지 불러오기
  useEffect(() => {
    if (!session) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('realtime_consultation_messages')
        .select('*')
        .eq('session_id', session.id)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setMessages(data);
      }
    };

    fetchMessages();

    // 실시간 메시지 구독
    const channel = supabase
      .channel(`session-${session.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'realtime_consultation_messages',
          filter: `session_id=eq.${session.id}`
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  // 자동 스크롤
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // 메시지 전송
  const sendMessage = async () => {
    if (!newMessage.trim() || !session || !user) return;

    try {
      const { error } = await supabase
        .from('realtime_consultation_messages')
        .insert({
          session_id: session.id,
          sender_id: user.id,
          content: newMessage,
          message_type: 'text'
        });

      if (error) throw error;

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: '전송 실패',
        description: '메시지를 전송할 수 없습니다.',
        variant: 'destructive',
      });
    }
  };

  // 세션 종료
  const endSession = async () => {
    if (!session) return;

    try {
      const { error } = await supabase
        .from('realtime_consultation_sessions')
        .update({ 
          status: 'ended',
          ended_at: new Date().toISOString()
        })
        .eq('id', session.id);

      if (error) throw error;

      setIsOpen(false);
      setSession(null);
      setMessages([]);
      
      toast({
        title: '상담 종료',
        description: '상담이 종료되었습니다.',
      });
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  return (
    <>
      {/* 플로팅 버튼 */}
      {!isOpen && (
        <div className="fixed bottom-8 right-8 z-50">
          <Button
            size="lg"
            onClick={startSession}
            disabled={isConnecting}
            className="rounded-full h-16 w-16 shadow-xl bg-primary hover:bg-primary/90"
          >
            {isConnecting ? (
              <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full" />
            ) : (
              <MessageCircle className="h-8 w-8" />
            )}
          </Button>
          <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1">
            <div className="h-3 w-3 bg-green-400 rounded-full animate-pulse" />
          </div>
        </div>
      )}

      {/* 채팅 창 */}
      {isOpen && session && (
        <div className="fixed bottom-8 right-8 z-50 w-96">
          <Card className="flex flex-col h-[600px] shadow-2xl">
            {/* 헤더 */}
            <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground rounded-t-lg">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                <div>
                  <h3 className="font-semibold">실시간 전문가 상담</h3>
                  <p className="text-xs opacity-90">
                    {session.status === 'waiting' && '전문가 연결 대기 중...'}
                    {session.status === 'active' && '상담 진행 중'}
                    {session.status === 'ended' && '상담 종료'}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={endSession}
                className="text-primary-foreground hover:bg-primary-foreground/20"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* 메시지 영역 */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    <p className="text-sm">대화를 시작해보세요</p>
                  </div>
                )}
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[75%] rounded-lg p-3 ${
                        message.sender_id === user?.id
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(message.created_at).toLocaleTimeString('ko-KR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* 입력 영역 */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="메시지를 입력하세요..."
                  className="flex-1"
                  disabled={session.status === 'ended'}
                />
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || session.status === 'ended'}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};