import React, { useRef, useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageCircle, X, Loader2, User, UserCheck, LogIn, Award, Star, Phone, Send } from 'lucide-react';
import { useRealtimeChat } from '@/hooks/useRealtimeChat';
import { MessageBubble } from '@/components/chat/MessageBubble';
import { ChatInput } from '@/components/chat/ChatInput';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Expert {
  id: string;
  name?: string;
  full_name?: string;
  profile_image_url?: string;
  image?: string;
  specializations?: string[];
  specialty?: string[];
  hourly_rate?: number;
  hourlyPrice?: number;
  average_rating?: number;
  rating?: number;
  years_experience?: number;
  experience?: string;
  isOnline?: boolean;
}

interface InstantChatDialogProps {
  open: boolean;
  onClose: () => void;
  expert: Expert;
}

export const InstantChatDialog: React.FC<InstantChatDialogProps> = ({ open, onClose, expert }) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [needsLogin, setNeedsLogin] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Normalize expert data
  const expertName = expert.full_name || expert.name || '전문가';
  const expertImage = expert.profile_image_url || expert.image;
  const expertSpecialties = expert.specializations || expert.specialty || [];
  const expertRating = expert.average_rating || expert.rating;

  const {
    messages,
    session,
    isLoading,
    isSending,
    remoteTyping,
    currentUserId,
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

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setSessionId(null);
      setNeedsLogin(false);
    }
  }, [open]);

  const handleStartSession = async () => {
    setIsStarting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setNeedsLogin(true);
        toast.error('로그인이 필요한 서비스입니다');
        return;
      }

      // Create chat session with expert_id
      const { data: newSession, error } = await supabase
        .from('realtime_consultation_sessions')
        .insert({
          user_id: user.id,
          expert_id: expert.id,
          status: 'waiting'
        })
        .select()
        .single();

      if (error) throw error;

      if (newSession) {
        setSessionId(newSession.id);
        toast.success(`${expertName} 전문가에게 상담 요청이 전송되었습니다`);
      }
    } catch (error) {
      console.error('세션 생성 실패:', error);
      toast.error('상담 시작에 실패했습니다');
    } finally {
      setIsStarting(false);
    }
  };

  const handleGoToLogin = () => {
    onClose();
    navigate('/login');
  };

  const handleEndSession = async () => {
    await endSession();
    toast.info('상담이 종료되었습니다');
  };

  const getStatusInfo = () => {
    if (!session) return { text: '연결 준비중...', color: 'bg-yellow-500', icon: Loader2 };
    
    switch (session.status) {
      case 'waiting':
        return { text: '전문가 확인 대기중', color: 'bg-yellow-500', icon: User };
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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg h-[80vh] flex flex-col p-0 gap-0">
        {/* Header with Expert Info */}
        <div className="p-4 border-b bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12 border-2 border-white/30">
                <AvatarImage src={expertImage} />
                <AvatarFallback className="bg-white/20 text-white text-lg font-bold">
                  {expertName[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg">{expertName}</h3>
                  {expert.isOnline && (
                    <span className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm opacity-90">
                  {expertRating && (
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-yellow-300 text-yellow-300" />
                      <span>{expertRating}</span>
                    </div>
                  )}
                  {sessionId && (
                    <Badge variant="secondary" className="bg-white/20 text-white text-xs">
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusInfo.text}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            {session?.status === 'active' && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleEndSession}
                className="text-white hover:bg-white/20 text-xs"
              >
                종료
              </Button>
            )}
          </div>
          {expertSpecialties.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {expertSpecialties.slice(0, 4).map((spec, idx) => (
                <Badge key={idx} variant="secondary" className="bg-white/20 text-white text-xs">
                  {spec}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {!sessionId ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
              {needsLogin ? (
                <>
                  <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                    <LogIn className="w-10 h-10 text-primary" />
                  </div>
                  <div className="text-center">
                    <h4 className="font-semibold text-lg mb-2">로그인이 필요합니다</h4>
                    <p className="text-sm text-muted-foreground">
                      상담 서비스 이용을 위해 로그인해주세요
                    </p>
                  </div>
                  <Button onClick={handleGoToLogin} className="w-full max-w-[200px]" size="lg">
                    <LogIn className="w-4 h-4 mr-2" />
                    로그인하기
                  </Button>
                </>
              ) : (
                <>
                  <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
                    <MessageCircle className="w-12 h-12 text-primary" />
                  </div>
                  <div className="text-center">
                    <h4 className="font-semibold text-xl mb-2">
                      {expertName} 전문가와 실시간 상담
                    </h4>
                    <p className="text-sm text-muted-foreground mb-1">
                      {expert.isOnline ? (
                        <span className="text-green-600 font-medium">현재 온라인 상태입니다</span>
                      ) : (
                        '전문가가 확인 후 응답합니다'
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      텍스트, 이미지, 파일 전송 가능
                    </p>
                  </div>
                  <Button 
                    onClick={handleStartSession} 
                    disabled={isStarting || isLoading} 
                    className="w-full max-w-[200px]"
                    size="lg"
                  >
                    {isStarting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    <Send className="w-4 h-4 mr-2" />
                    상담 시작하기
                  </Button>
                </>
              )}
            </div>
          ) : (
            <>
              {/* Expert connected status */}
              {session?.status === 'active' && session.expert_id && (
                <div className="px-4 py-2 bg-green-50 dark:bg-green-900/20 border-b flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-700 dark:text-green-400">
                    {expertName} 전문가가 연결되었습니다
                  </span>
                </div>
              )}

              {/* Messages */}
              <ScrollArea className="flex-1 px-4 py-2">
                <div className="space-y-3">
                  {messages.length === 0 && (
                    <div className="text-center text-sm text-muted-foreground py-8">
                      {session?.status === 'waiting' 
                        ? `${expertName} 전문가가 확인 중입니다...`
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
        </div>
      </DialogContent>
    </Dialog>
  );
};
