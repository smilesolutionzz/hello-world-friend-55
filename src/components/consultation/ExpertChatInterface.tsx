import React, { useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageCircle, X, User, Clock, PhoneOff } from 'lucide-react';
import { useRealtimeChat } from '@/hooks/useRealtimeChat';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { ChatInput } from '@/components/chat/ChatInput';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { AnimatePresence, motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface ConsultationSession {
  id: string;
  user_id: string;
  expert_id: string | null;
  status: 'waiting' | 'active' | 'ended';
  created_at: string;
  profiles?: {
    full_name?: string;
    email?: string;
  } | null;
}

interface ExpertChatInterfaceProps {
  session: ConsultationSession;
  onEndSession: () => void;
}

export const ExpertChatInterface: React.FC<ExpertChatInterfaceProps> = ({ 
  session, 
  onEndSession 
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const userName = (session as any).profiles?.full_name || '사용자';

  const {
    messages,
    session: chatSession,
    isSending,
    remoteTyping,
    currentUserId,
    sendMessage,
    sendFileMessage,
    handleTyping
  } = useRealtimeChat(session.id);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, remoteTyping]);

  const getStatusBadge = () => {
    switch (session.status) {
      case 'waiting':
        return <Badge className="bg-yellow-500">대기중</Badge>;
      case 'active':
        return <Badge className="bg-green-500">상담중</Badge>;
      case 'ended':
        return <Badge variant="outline">종료됨</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      {/* Header */}
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-12 h-12">
              <AvatarFallback className="bg-blue-100">
                <User className="w-6 h-6 text-blue-600" />
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">{userName}</CardTitle>
                {getStatusBadge()}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-3 h-3" />
                <span>
                  {formatDistanceToNow(new Date(session.created_at), {
                    addSuffix: true,
                    locale: ko
                  })} 시작
                </span>
              </div>
            </div>
          </div>
          {session.status === 'active' && (
            <Button 
              variant="destructive" 
              size="sm"
              onClick={onEndSession}
            >
              <PhoneOff className="w-4 h-4 mr-2" />
              상담 종료
            </Button>
          )}
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 p-0 overflow-hidden">
        <ScrollArea className="h-full px-4 py-2">
          <div className="space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-sm text-muted-foreground py-8">
                {session.status === 'waiting' 
                  ? '상담을 수락하면 대화를 시작할 수 있습니다'
                  : session.status === 'active'
                    ? '메시지를 보내서 상담을 시작하세요'
                    : '상담이 종료되었습니다'
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
      </CardContent>

      {/* Input */}
      {session.status === 'active' ? (
        <ChatInput
          onSendMessage={sendMessage}
          onSendFile={sendFileMessage}
          onTyping={handleTyping}
          isSending={isSending}
          disabled={false}
        />
      ) : session.status === 'ended' ? (
        <div className="p-4 border-t text-center text-muted-foreground">
          이 상담은 종료되었습니다
        </div>
      ) : (
        <div className="p-4 border-t text-center text-muted-foreground">
          상담을 수락하면 메시지를 보낼 수 있습니다
        </div>
      )}
    </Card>
  );
};
