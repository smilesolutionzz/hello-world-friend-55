import { useState, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  Mic,
  MicOff,
  Send,
  Phone,
  Heart,
  Bot,
  User,
  Volume2,
  VolumeX,
  AlertTriangle,
  Loader2
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  audio?: string;
}

interface SafetyMessage {
  text: string;
  contacts: { name: string; number: string }[];
}

export const CrisisVoiceCounselor = () => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [crisisLevel, setCrisisLevel] = useState<'critical' | 'high' | 'medium' | 'low'>('low');
  const [safetyMessage, setSafetyMessage] = useState<SafetyMessage | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 메시지 전송
  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // 위기 감지 먼저 수행
      const { data: crisisData } = await supabase.functions.invoke('crisis-detection-ai', {
        body: { text: text.trim() }
      });

      const detectedLevel = crisisData?.analysis?.crisisLevel || 'low';
      setCrisisLevel(detectedLevel);

      // 상담 응답 생성
      const { data, error } = await supabase.functions.invoke('crisis-voice-counselor', {
        body: {
          userMessage: text.trim(),
          crisisLevel: detectedLevel,
          conversationHistory: messages.map(m => ({
            role: m.role,
            content: m.content
          })),
          sessionId: `session_${Date.now()}`
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: data.response?.text || '지금 힘드시죠. 천천히 이야기해주세요.',
        timestamp: new Date(),
        audio: data.response?.audio
      };

      setMessages(prev => [...prev, assistantMessage]);
      
      if (data.safetyMessage) {
        setSafetyMessage(data.safetyMessage);
      }

      // 오디오 자동 재생
      if (data.response?.audio) {
        playAudio(data.response.audio);
      }

      // 스크롤
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

    } catch (error) {
      console.error('[CrisisVoiceCounselor] Error:', error);
      toast({
        title: '연결 오류',
        description: '잠시 후 다시 시도해주세요.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading, toast]);

  // 오디오 재생
  const playAudio = (base64Audio: string) => {
    try {
      const audio = new Audio(`data:audio/mpeg;base64,${base64Audio}`);
      audioRef.current = audio;
      audio.onplay = () => setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => setIsPlaying(false);
      audio.play();
    } catch (e) {
      console.error('Audio play error:', e);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsPlaying(false);
    }
  };

  const getLevelStyle = (level: string) => {
    const styles: Record<string, string> = {
      critical: 'bg-red-500',
      high: 'bg-orange-500',
      medium: 'bg-yellow-500',
      low: 'bg-green-500'
    };
    return styles[level] || 'bg-gray-500';
  };

  return (
    <div className="flex flex-col h-[600px] max-h-[80vh]">
      {/* 헤더 */}
      <Card className="p-4 rounded-b-none border-b-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">AI 위기상담사</h3>
              <p className="text-sm text-muted-foreground">24시간 마음의 친구</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getLevelStyle(crisisLevel)}>
              {crisisLevel === 'critical' ? '🚨 긴급' : 
               crisisLevel === 'high' ? '⚠️ 주의' : 
               crisisLevel === 'medium' ? '관심' : '안정'}
            </Badge>
            {isPlaying ? (
              <Button size="icon" variant="ghost" onClick={stopAudio}>
                <VolumeX className="w-4 h-4" />
              </Button>
            ) : (
              <Button size="icon" variant="ghost" disabled>
                <Volume2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* 안전 메시지 */}
      {safetyMessage && (
        <Card className="mx-4 mt-2 p-3 border-red-300 bg-red-50 dark:bg-red-950/30">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-700 dark:text-red-300 mb-2">
                {safetyMessage.text}
              </p>
              <div className="flex flex-wrap gap-2">
                {safetyMessage.contacts.map((contact, idx) => (
                  <Button
                    key={idx}
                    size="sm"
                    variant="outline"
                    className="text-red-600 border-red-300"
                    onClick={() => window.open(`tel:${contact.number}`, '_self')}
                  >
                    <Phone className="w-3 h-3 mr-1" />
                    {contact.name} {contact.number}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* 대화 영역 */}
      <Card className="flex-1 rounded-none border-y-0 overflow-hidden">
        <ScrollArea className="h-full p-4">
          <div className="space-y-4">
            {/* 웰컴 메시지 */}
            {messages.length === 0 && (
              <div className="text-center py-8">
                <Heart className="w-12 h-12 mx-auto mb-4 text-primary opacity-50" />
                <p className="text-muted-foreground">
                  안녕하세요. 무엇이든 편하게 이야기해주세요.
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  당신의 이야기를 듣고 있어요.
                </p>
              </div>
            )}

            {/* 메시지 목록 */}
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.role === 'user' ? 'bg-primary' : 'bg-primary/10'
                }`}>
                  {message.role === 'user' ? (
                    <User className="w-4 h-4 text-primary-foreground" />
                  ) : (
                    <Bot className="w-4 h-4 text-primary" />
                  )}
                </div>
                <div className={`max-w-[75%] p-3 rounded-2xl ${
                  message.role === 'user' 
                    ? 'bg-primary text-primary-foreground rounded-br-sm' 
                    : 'bg-muted rounded-bl-sm'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  {message.audio && message.role === 'assistant' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="mt-2 h-6 text-xs"
                      onClick={() => playAudio(message.audio!)}
                    >
                      <Volume2 className="w-3 h-3 mr-1" />
                      음성 듣기
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {/* 로딩 */}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-muted p-3 rounded-2xl rounded-bl-sm">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">응답 중...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={scrollRef} />
          </div>
        </ScrollArea>
      </Card>

      {/* 입력 영역 */}
      <Card className="p-4 rounded-t-none border-t-0">
        <div className="flex gap-2">
          <Textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage(inputText);
              }
            }}
            placeholder="마음 속 이야기를 나눠주세요..."
            className="min-h-[44px] max-h-[120px] resize-none"
          />
          <Button
            onClick={() => sendMessage(inputText)}
            disabled={!inputText.trim() || isLoading}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          긴급 시: 자살예방상담전화 <button className="text-red-500 font-medium" onClick={() => window.open('tel:1393', '_self')}>1393</button>
        </p>
      </Card>
    </div>
  );
};

export default CrisisVoiceCounselor;
