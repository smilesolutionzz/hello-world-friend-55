import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, User, ExternalLink, ArrowLeft, MessageCircle, Users, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  sender_id: string;
  message: string;
  message_type: 'text' | 'system' | 'assessment_share';
  created_at: string;
  sender_name?: string;
  is_expert?: boolean;
}

interface RealTimeChatProps {
  assessmentResults?: any;
  onClose?: () => void;
}

const RealTimeChat = ({ assessmentResults, onClose }: RealTimeChatProps) => {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [roomId, setRoomId] = useState<string | null>(null);
  const [roomStatus, setRoomStatus] = useState<'waiting' | 'active' | 'ended'>('waiting');
  const [isConnected, setIsConnected] = useState(false);
  const [expertName, setExpertName] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 채팅방 생성 및 연결
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setCurrentUserId(user.id);
    };
    getCurrentUser();
    createChatRoom();
  }, []);

  // 실시간 메시지 구독
  useEffect(() => {
    if (!roomId) return;

    const channel = supabase
      .channel('chat-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`
        },
        (payload) => {
          console.log('New message received:', payload);
          const newMessage = payload.new as Message;
          setMessages(prev => [...prev, newMessage]);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_rooms',
          filter: `id=eq.${roomId}`
        },
        (payload) => {
          console.log('Room status updated:', payload);
          const updatedRoom = payload.new as any;
          setRoomStatus(updatedRoom.status);
          if (updatedRoom.status === 'active' && updatedRoom.expert_id) {
            setIsConnected(true);
            // 전문가 정보 가져오기 (실제로는 profiles 테이블에서)
            setExpertName("전문가");
            
            toast({
              title: "전문가 연결됨",
              description: "전문가와 실시간 상담이 시작되었습니다.",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [roomId]);

  const createChatRoom = async () => {
    try {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "인증 필요",
          description: "채팅을 시작하려면 로그인이 필요합니다.",
          variant: "destructive",
        });
        return;
      }

      // 채팅방 생성
      const { data: roomData, error: roomError } = await supabase
        .from('chat_rooms')
        .insert({
          user_id: user.id,
          assessment_results: assessmentResults,
          status: 'waiting'
        })
        .select()
        .single();

      if (roomError) {
        console.error('Room creation error:', roomError);
        throw roomError;
      }

      setRoomId(roomData.id);

      // 시스템 메시지 추가
      const { error: messageError } = await supabase
        .from('chat_messages')
        .insert({
          room_id: roomData.id,
          sender_id: user.id,
          message: "전문가 상담 요청이 접수되었습니다. 잠시만 기다려주세요...",
          message_type: 'system'
        });

      if (messageError) {
        console.error('System message error:', messageError);
      }

      // 검사 결과 공유 (있는 경우)
      if (assessmentResults) {
        const { error: assessmentError } = await supabase
          .from('chat_messages')
          .insert({
            room_id: roomData.id,
            sender_id: user.id,
            message: `검사 결과를 공유했습니다: ${assessmentResults.testType || '심리평가'} (${assessmentResults.severity || assessmentResults.ageGroup})`,
            message_type: 'assessment_share'
          });

        if (assessmentError) {
          console.error('Assessment share error:', assessmentError);
        }
      }

      // 기존 메시지 로드
      loadMessages(roomData.id);

    } catch (error) {
      console.error('Error creating chat room:', error);
      toast({
        title: "오류 발생",
        description: "채팅방 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadMessages = async (roomId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Load messages error:', error);
        throw error;
      }

      setMessages(data as Message[] || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !roomId || isLoading) return;

    try {
      setIsLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('chat_messages')
        .insert({
          room_id: roomId,
          sender_id: user.id,
          message: input.trim(),
          message_type: 'text'
        });

      if (error) {
        console.error('Send message error:', error);
        throw error;
      }

      setInput("");
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "메시지 전송 실패",
        description: "메시지 전송 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const endChat = async () => {
    if (!roomId) return;

    try {
      await supabase
        .from('chat_rooms')
        .update({ status: 'ended' })
        .eq('id', roomId);

      setRoomStatus('ended');
      
      toast({
        title: "상담 종료",
        description: "상담이 종료되었습니다.",
      });
    } catch (error) {
      console.error('Error ending chat:', error);
    }
  };

  const getMessageSenderInfo = (message: Message, currentUserId?: string) => {
    const isCurrentUser = message.sender_id === currentUserId;
    
    return {
      isCurrentUser,
      senderName: isCurrentUser ? "나" : (message.is_expert ? expertName || "전문가" : "상대방")
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/20 to-warm-lavender/30 p-6">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            {onClose && (
              <Button variant="outline" onClick={onClose} className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                뒤로가기
              </Button>
            )}
            <div className="text-center flex-1">
              <h1 className="text-3xl font-bold text-brand-gradient">실시간 전문가 상담</h1>
              <p className="text-muted-foreground">전문가와 1:1 실시간 채팅</p>
            </div>
            <div></div>
          </div>

          {/* Status Bar */}
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  roomStatus === 'active' ? 'bg-green-500' : 
                  roomStatus === 'waiting' ? 'bg-yellow-500' : 'bg-red-500'
                }`}></div>
                <span className="font-medium">
                  {roomStatus === 'active' ? '상담 진행 중' : 
                   roomStatus === 'waiting' ? '전문가 연결 대기 중' : '상담 종료'}
                </span>
                {isConnected && expertName && (
                  <Badge variant="secondary" className="ml-2">
                    <Users className="w-3 h-3 mr-1" />
                    {expertName}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {roomStatus === 'waiting' && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open('https://typebot.io/hilight-consult', '_blank')}
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    즉시 상담
                  </Button>
                )}
                {roomStatus === 'active' && (
                  <Button variant="outline" size="sm" onClick={endChat}>
                    상담 종료
                  </Button>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Chat Interface */}
        <Card className="flex flex-col h-[600px]">
          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => {
                const { isCurrentUser, senderName } = getMessageSenderInfo(message, currentUserId || undefined);
                
                return (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-3 max-w-[80%] ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className={
                          message.message_type === 'system' ? 'bg-blue-100 text-blue-600' :
                          isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-green-100 text-green-600'
                        }>
                          {message.message_type === 'system' ? 'S' : 
                           isCurrentUser ? 'U' : 'E'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className={`rounded-lg p-3 ${
                        message.message_type === 'system' ? 'bg-blue-50 border border-blue-200' :
                        message.message_type === 'assessment_share' ? 'bg-purple-50 border border-purple-200' :
                        isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      }`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium opacity-70">
                            {senderName}
                          </span>
                          <span className="text-xs opacity-50">
                            {new Date(message.created_at).toLocaleTimeString('ko-KR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                        
                        {message.message_type === 'assessment_share' && (
                          <div className="mt-2 flex items-center gap-1 text-xs opacity-70">
                            <MessageCircle className="w-3 h-3" />
                            검사 결과 공유됨
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {isLoading && messages.length === 0 && (
                <div className="flex items-center justify-center py-8">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4 animate-spin" />
                    채팅방을 준비하고 있습니다...
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  roomStatus === 'ended' ? '상담이 종료되었습니다' :
                  roomStatus === 'waiting' ? '전문가 연결을 기다리는 중...' :
                  '메시지를 입력하세요...'
                }
                disabled={isLoading || roomStatus === 'ended'}
                className="flex-1"
              />
              <Button 
                onClick={sendMessage} 
                disabled={!input.trim() || isLoading || roomStatus === 'ended'}
                className="btn-brand"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              {roomStatus === 'waiting' ? '전문가가 곧 연결됩니다. 미리 질문을 입력해두세요.' :
               roomStatus === 'active' ? '실시간으로 전문가와 대화 중입니다.' :
               '상담이 종료되었습니다. 추가 상담이 필요하시면 새로 시작해주세요.'}
            </p>
          </div>
        </Card>

        {/* Emergency Notice */}
        <Card className="mt-6 p-4 bg-red-50 border-red-200">
          <p className="text-red-800 text-sm text-center">
            <strong>긴급상황:</strong> 위급한 상황이시면 <a href="/expert-hiring?urgent=true" className="underline font-bold">긴급 전문가 매칭</a>을 이용하세요.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default RealTimeChat;