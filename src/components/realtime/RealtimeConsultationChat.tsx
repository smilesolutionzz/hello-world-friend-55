import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageCircle, X, Loader2 } from 'lucide-react';
import { useRealtimeConsultation } from '@/hooks/useRealtimeConsultation';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface RealtimeConsultationChatProps {
  onClose: () => void;
}

export const RealtimeConsultationChat: React.FC<RealtimeConsultationChatProps> = ({ onClose }) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { messages, session, isLoading, isSending, createSession, sendMessage } = useRealtimeConsultation(sessionId || undefined);

  useEffect(() => {
    const getUserId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
    };
    getUserId();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleStartSession = async () => {
    const newSession = await createSession();
    if (newSession) {
      setSessionId(newSession.id);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !sessionId) return;
    
    await sendMessage(messageInput);
    setMessageInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getStatusText = () => {
    if (!session) return '연결 대기중...';
    if (session.status === 'waiting') return '전문가 연결 대기중...';
    if (session.status === 'active') return '상담 진행중';
    if (session.status === 'ended') return '상담 종료됨';
    return '';
  };

  const getStatusColor = () => {
    if (!session || session.status === 'waiting') return 'text-yellow-600';
    if (session.status === 'active') return 'text-green-600';
    if (session.status === 'ended') return 'text-gray-600';
    return '';
  };

  return (
    <Card className="fixed bottom-4 right-4 w-96 h-[600px] flex flex-col shadow-2xl z-50 bg-background">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between bg-primary text-primary-foreground">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          <div>
            <h3 className="font-semibold">실시간 전문가 상담</h3>
            <p className={`text-xs ${getStatusColor()}`}>{getStatusText()}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-primary-foreground hover:bg-primary/90">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      {!sessionId ? (
        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
          <MessageCircle className="w-16 h-16 text-muted-foreground" />
          <div className="text-center">
            <h4 className="font-semibold mb-2">실시간 전문가 상담</h4>
            <p className="text-sm text-muted-foreground mb-4">
              현재 온라인 전문가와 바로 연결됩니다
            </p>
          </div>
          <Button onClick={handleStartSession} disabled={isLoading} className="w-full">
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            상담 시작하기
          </Button>
        </div>
      ) : (
        <>
          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-sm text-muted-foreground py-8">
                  메시지를 보내서 상담을 시작하세요
                </div>
              )}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.sender_id === currentUserId
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {formatDistanceToNow(new Date(message.created_at), { 
                        addSuffix: true,
                        locale: ko 
                      })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t">
            {session?.status === 'ended' ? (
              <div className="text-center text-sm text-muted-foreground">
                상담이 종료되었습니다
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="메시지를 입력하세요..."
                  disabled={isSending}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={isSending || !messageInput.trim()}
                  size="icon"
                >
                  {isSending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </Card>
  );
};