import React, { useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Clock, PhoneOff, Sparkles, Shield } from 'lucide-react';
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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, remoteTyping]);

  const getStatusBadge = () => {
    switch (session.status) {
      case 'waiting':
        return (
          <Badge className="bg-gradient-to-r from-amber-400 to-orange-500 text-white border-0 shadow-md">
            <span className="w-1.5 h-1.5 bg-white rounded-full mr-1.5 animate-pulse" />
            대기중
          </Badge>
        );
      case 'active':
        return (
          <Badge className="bg-gradient-to-r from-emerald-400 to-teal-500 text-white border-0 shadow-md">
            <span className="w-1.5 h-1.5 bg-white rounded-full mr-1.5 animate-pulse" />
            상담중
          </Badge>
        );
      case 'ended':
        return (
          <Badge variant="outline" className="bg-muted/50">
            종료됨
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="h-[650px] flex flex-col border-0 shadow-xl overflow-hidden bg-gradient-to-b from-background to-muted/10">
      {/* Header */}
      <CardHeader className="pb-4 border-b bg-gradient-to-r from-primary/5 via-violet-500/5 to-transparent backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="w-14 h-14 ring-4 ring-offset-2 ring-primary/20 shadow-lg">
                <AvatarFallback className="bg-gradient-to-br from-primary/30 to-violet-500/30">
                  <User className="w-7 h-7 text-primary" />
                </AvatarFallback>
              </Avatar>
              {session.status === 'active' && (
                <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full border-2 border-background flex items-center justify-center">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <CardTitle className="text-xl font-bold">{userName}</CardTitle>
                {getStatusBadge()}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <Clock className="w-3.5 h-3.5" />
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
              variant="outline"
              size="sm"
              onClick={onEndSession}
              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 shadow-sm transition-all"
            >
              <PhoneOff className="w-4 h-4 mr-2" />
              상담 종료
            </Button>
          )}
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 p-0 overflow-hidden bg-gradient-to-b from-transparent to-muted/5">
        <ScrollArea className="h-full">
          <div className="px-4 py-4 space-y-4">
            {messages.length === 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
              >
                <div className="relative w-20 h-20 mx-auto mb-6">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-violet-500/20 rounded-full animate-pulse" />
                  <div className="absolute inset-2 bg-background rounded-full flex items-center justify-center shadow-inner">
                    {session.status === 'waiting' ? (
                      <Shield className="w-8 h-8 text-amber-500" />
                    ) : session.status === 'active' ? (
                      <Sparkles className="w-8 h-8 text-primary" />
                    ) : (
                      <Clock className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                </div>
                <p className="text-lg font-medium text-foreground/70">
                  {session.status === 'waiting' 
                    ? '상담을 수락하면 대화를 시작할 수 있습니다'
                    : session.status === 'active'
                      ? '메시지를 보내서 상담을 시작하세요'
                      : '상담이 종료되었습니다'
                  }
                </p>
              </motion.div>
            )}
            
            <AnimatePresence mode="popLayout">
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: index * 0.02 }}
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
        <div className="border-t bg-gradient-to-r from-background via-muted/5 to-background">
          <ChatInput
            onSendMessage={sendMessage}
            onSendFile={sendFileMessage}
            onTyping={handleTyping}
            isSending={isSending}
            disabled={false}
          />
        </div>
      ) : session.status === 'ended' ? (
        <div className="p-5 border-t bg-gradient-to-r from-muted/30 to-muted/10 text-center">
          <p className="text-muted-foreground font-medium">이 상담은 종료되었습니다</p>
        </div>
      ) : (
        <div className="p-5 border-t bg-gradient-to-r from-amber-50/50 to-orange-50/50 text-center">
          <p className="text-amber-700 font-medium">상담을 수락하면 메시지를 보낼 수 있습니다</p>
        </div>
      )}
    </Card>
  );
};
