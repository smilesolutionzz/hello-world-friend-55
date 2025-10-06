import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { VoiceInputButton } from '@/components/ui/VoiceInputButton';
import { 
  Send, 
  Phone, 
  PhoneOff, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff,
  Star,
  Clock,
  User
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: string;
  sender_id: string;
  message: string;
  created_at: string;
  message_type: string;
}

interface Expert {
  id: string;
  full_name: string;
  professional_title: string;
  profile_image_url: string | null;
  average_rating: number;
  total_sessions: number;
}

interface Consultation {
  id: string;
  expert_id: string;
  consultation_type: string;
  status: string;
  duration_minutes: number;
  price: number;
  scheduled_at: string;
  experts: Expert;
}

interface ConsultationInterfaceProps {
  roomId: string;
}

export const ConsultationInterface: React.FC<ConsultationInterfaceProps> = ({ roomId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    initializeConsultation();
    getCurrentUser();
  }, [roomId]);

  useEffect(() => {
    if (consultation) {
      loadMessages();
      subscribeToMessages();
    }
  }, [consultation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);
  };

  const initializeConsultation = async () => {
    try {
      // 채팅방 정보와 상담 정보 가져오기
      const { data: roomData, error: roomError } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('id', roomId)
        .single();

      if (roomError) throw roomError;

      // 상담 정보 가져오기
      const { data: consultationData, error: consultationError } = await supabase
        .from('consultations')
        .select(`
          *,
          experts (
            id,
            full_name,
            professional_title,
            profile_image_url,
            average_rating,
            total_sessions
          )
        `)
        .eq('chat_room_id', roomId)
        .single();

      if (consultationError) throw consultationError;

      setConsultation(consultationData);
      setIsConnected(true);
    } catch (error) {
      console.error('상담방 초기화 실패:', error);
      toast({
        title: "오류",
        description: "상담방을 불러오는데 실패했습니다.",
        variant: "destructive",
      });
      navigate('/expert-hiring');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('메시지 로드 실패:', error);
    }
  };

  const subscribeToMessages = () => {
    const channel = supabase
      .channel(`room_${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${roomId}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !currentUser || !consultation) return;

    setIsSending(true);
    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          room_id: roomId,
          sender_id: currentUser.id,
          message: newMessage.trim(),
          message_type: 'text'
        });

      if (error) throw error;

      setNewMessage('');
    } catch (error) {
      console.error('메시지 전송 실패:', error);
      toast({
        title: "전송 실패",
        description: "메시지 전송에 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const endConsultation = async () => {
    try {
      const { error } = await supabase
        .from('consultations')
        .update({ status: 'completed' })
        .eq('id', consultation?.id);

      if (error) throw error;

      toast({
        title: "상담 종료",
        description: "상담이 완료되었습니다. 평가를 남겨주세요.",
      });

      navigate(`/consultation/${consultation?.id}/review`);
    } catch (error) {
      console.error('상담 종료 실패:', error);
      toast({
        title: "오류",
        description: "상담 종료 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!consultation) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">상담 정보를 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* 상담 헤더 */}
      <Card className="p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12">
              <AvatarImage src={consultation.experts.profile_image_url || ''} />
              <AvatarFallback>
                {consultation.experts.full_name.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-semibold">{consultation.experts.full_name}</h2>
              <p className="text-sm text-muted-foreground">
                {consultation.experts.professional_title}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm">
                  {consultation.experts.average_rating.toFixed(1)} 
                  ({consultation.experts.total_sessions}회)
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={consultation.status === 'in_progress' ? 'default' : 'secondary'}>
              {consultation.status === 'in_progress' ? '상담 진행중' : '대기중'}
            </Badge>
            <Button
              onClick={endConsultation}
              variant="outline"
              size="sm"
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              상담 종료
            </Button>
          </div>
        </div>
      </Card>

      {/* 메시지 영역 */}
      <Card className="h-96 mb-4">
        <div className="h-full flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <User className="w-8 h-8 mx-auto mb-2" />
                <p>아직 메시지가 없습니다.</p>
                <p className="text-sm">전문가와 대화를 시작해보세요!</p>
              </div>
            ) : (
              messages.map((message) => {
                const isMe = message.sender_id === currentUser?.id;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        isMe
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm">{message.message}</p>
                      <p className={`text-xs mt-1 ${
                        isMe ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      }`}>
                        {formatTime(message.created_at)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </Card>

      {/* 메시지 입력 */}
      <Card className="p-4">
        <div className="space-y-2">
          <div className="flex gap-2">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="메시지를 입력하세요..."
              className="flex-1 resize-none"
              rows={2}
            />
            <Button
              onClick={sendMessage}
              disabled={!newMessage.trim() || isSending}
              size="lg"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <VoiceInputButton
            onTranscription={(text) => setNewMessage(prev => prev + text)}
            className="w-full"
            disabled={isSending}
          />
        </div>
      </Card>
    </div>
  );
};