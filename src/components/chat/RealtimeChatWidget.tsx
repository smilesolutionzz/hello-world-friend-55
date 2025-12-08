import React, { useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, X, Loader2, User, UserCheck } from 'lucide-react';
import { useRealtimeChat } from '@/hooks/useRealtimeChat';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { TypingIndicator } from './TypingIndicator';
import { AnimatePresence, motion } from 'framer-motion';

interface RealtimeChatWidgetProps {
  onClose: () => void;
}

export const RealtimeChatWidget: React.FC<RealtimeChatWidgetProps> = ({ onClose }) => {
  const [sessionId, setSessionId] = React.useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    session,
    isLoading,
    isSending,
    remoteTyping,
    currentUserId,
    createSession,
    sendMessage,
    sendFileMessage,
    handleTyping,
    endSession
  } = useRealtimeChat(sessionId || undefined);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, remoteTyping]);

  const handleStartSession = async () => {
    const newSession = await createSession();
    if (newSession) {
      setSessionId(newSession.id);
    }
  };

  const handleEndSession = async () => {
    await endSession();
  };

  const getStatusInfo = () => {
    if (!session) return { text: '연결 대기중...', color: 'bg-yellow-500', icon: Loader2 };
    
    switch (session.status) {
      case 'waiting':
        return { text: '전문가 연결 대기중', color: 'bg-yellow-500', icon: User };
      case 'active':
        return { text: '상담 진행중', color: 'bg-green-500', icon: UserCheck };
      case 'ended':
        return { text: '상담 종료됨', color: 'bg-gray-500', icon: X };
      default:
        return { text: '알 수 없음', color: 'bg-gray-500', icon: User };
    }
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="fixed bottom-4 right-4 w-[380px] h-[600px] flex flex-col shadow-2xl z-50 bg-background overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b bg-primary text-primary-foreground flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <MessageCircle className="w-6 h-6" />
              <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 ${statusInfo.color} rounded-full border-2 border-primary`} />
            </div>
            <div>
              <h3 className="font-semibold">실시간 전문가 상담</h3>
              <div className="flex items-center gap-1.5">
                <StatusIcon className="w-3 h-3" />
                <span className="text-xs opacity-90">{statusInfo.text}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {session?.status === 'active' && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleEndSession}
                className="text-primary-foreground hover:bg-primary/80 text-xs"
              >
                종료
              </Button>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="text-primary-foreground hover:bg-primary/80"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Content */}
        {!sessionId ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
              <MessageCircle className="w-10 h-10 text-primary" />
            </div>
            <div className="text-center">
              <h4 className="font-semibold text-lg mb-2">실시간 전문가 상담</h4>
              <p className="text-sm text-muted-foreground mb-1">
                온라인 전문가와 바로 연결됩니다
              </p>
              <p className="text-xs text-muted-foreground">
                텍스트, 이미지, 파일 전송 가능
              </p>
            </div>
            <Button 
              onClick={handleStartSession} 
              disabled={isLoading} 
              className="w-full max-w-[200px]"
              size="lg"
            >
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              상담 시작하기
            </Button>
          </div>
        ) : (
          <>
            {/* Expert Info (when connected) */}
            {session?.status === 'active' && session.expert_id && (
              <div className="px-4 py-2 bg-green-50 dark:bg-green-900/20 border-b flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-700 dark:text-green-400">
                  전문 상담사가 연결되었습니다
                </span>
              </div>
            )}

            {/* Messages */}
            <ScrollArea className="flex-1 px-4 py-2">
              <div className="space-y-3">
                {messages.length === 0 && (
                  <div className="text-center text-sm text-muted-foreground py-8">
                    {session?.status === 'waiting' 
                      ? '전문가 연결을 기다리는 중입니다...'
                      : '메시지를 보내서 상담을 시작하세요'
                    }
                  </div>
                )}
                
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                    >
                      <MessageBubble
                        content={message.content}
                        isOwn={message.sender_id === currentUserId}
                        timestamp={message.created_at}
                        isRead={message.is_read}
                        messageType={message.message_type}
                        fileUrl={message.file_url}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>

                <TypingIndicator isVisible={remoteTyping} />
                <div ref={scrollRef} />
              </div>
            </ScrollArea>

            {/* Input */}
            {session?.status === 'ended' ? (
              <div className="p-4 border-t text-center">
                <p className="text-sm text-muted-foreground mb-3">상담이 종료되었습니다</p>
                <Button variant="outline" onClick={() => setSessionId(null)}>
                  새 상담 시작
                </Button>
              </div>
            ) : (
              <ChatInput
                onSendMessage={sendMessage}
                onSendFile={sendFileMessage}
                onTyping={handleTyping}
                isSending={isSending}
                disabled={session?.status === 'waiting'}
              />
            )}
          </>
        )}
      </Card>
    </motion.div>
  );
};
