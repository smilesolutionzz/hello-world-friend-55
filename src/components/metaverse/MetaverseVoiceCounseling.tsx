import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Mic, MicOff, Phone, Loader2 } from 'lucide-react';
import CounselingRoom from '@/components/3d/CounselingRoom';
import { RealtimeChat } from '@/utils/RealtimeAudio';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const MetaverseVoiceCounseling = () => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const chatRef = useRef<RealtimeChat | null>(null);

  const handleMessage = (event: any) => {
    console.log('Received event:', event.type);
    
    if (event.type === 'response.audio_transcript.delta') {
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        
        if (lastMessage && lastMessage.role === 'assistant') {
          lastMessage.content += event.delta;
        } else {
          newMessages.push({
            role: 'assistant',
            content: event.delta,
            timestamp: new Date()
          });
        }
        return newMessages;
      });
    } else if (event.type === 'conversation.item.input_audio_transcription.completed') {
      setMessages(prev => [...prev, {
        role: 'user',
        content: event.transcript,
        timestamp: new Date()
      }]);
    } else if (event.type === 'response.audio.delta') {
      setIsSpeaking(true);
    } else if (event.type === 'response.audio.done') {
      setIsSpeaking(false);
    }
  };

  const startConversation = async () => {
    try {
      setIsLoading(true);
      
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      chatRef.current = new RealtimeChat(handleMessage);
      await chatRef.current.init();
      
      setIsConnected(true);
      setIsLoading(false);
      
      toast({
        title: "연결 완료",
        description: "AI 상담사와 대화를 시작하세요. AI가 먼저 인사할 거예요!",
      });
    } catch (error) {
      console.error('Error starting conversation:', error);
      setIsLoading(false);
      toast({
        title: "연결 실패",
        description: error instanceof Error ? error.message : '대화를 시작할 수 없습니다',
        variant: "destructive",
      });
    }
  };

  const endConversation = () => {
    chatRef.current?.disconnect();
    setIsConnected(false);
    setIsSpeaking(false);
    
    toast({
      title: "상담 종료",
      description: "대화가 종료되었습니다",
    });
  };

  useEffect(() => {
    return () => {
      chatRef.current?.disconnect();
    };
  }, []);

  return (
    <div className="relative min-h-screen">
      <CounselingRoom>
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
          {/* Header */}
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
              AI 메타버스 상담실
            </h1>
            <p className="text-lg text-white/90 drop-shadow-md">
              가상 공간에서 AI 상담사와 실시간 음성 대화
            </p>
          </div>

          {/* Status Card */}
          <Card className="bg-background/80 backdrop-blur-lg p-8 mb-6 max-w-2xl w-full animate-scale-in">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className={`w-4 h-4 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-muted'}`} />
              <span className="text-lg font-medium">
                {isConnected ? '연결됨' : '대기중'}
              </span>
            </div>

            {/* AI Speaking Indicator */}
            {isSpeaking && (
              <div className="flex items-center justify-center gap-3 mb-6 animate-fade-in">
                <div className="flex gap-1">
                  <div className="w-2 h-8 bg-primary rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-10 bg-primary rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-6 bg-primary rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-sm text-muted-foreground">AI가 말하고 있습니다...</span>
              </div>
            )}

            {/* Messages */}
            {messages.length > 0 && (
              <div className="max-h-64 overflow-y-auto mb-6 space-y-3">
                {messages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-primary/10 ml-8'
                        : 'bg-muted mr-8'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-xs font-semibold text-muted-foreground">
                        {msg.role === 'user' ? '나' : 'AI'}
                      </span>
                      <p className="text-sm flex-1">{msg.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Controls */}
            <div className="flex flex-col gap-4">
              {!isConnected ? (
                <Button
                  onClick={startConversation}
                  disabled={isLoading}
                  size="lg"
                  className="w-full gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      연결중...
                    </>
                  ) : (
                    <>
                      <Mic className="w-5 h-5" />
                      대화 시작
                    </>
                  )}
                </Button>
              ) : (
                <div className="flex gap-4">
                  <Button
                    onClick={endConversation}
                    variant="destructive"
                    size="lg"
                    className="flex-1 gap-2"
                  >
                    <Phone className="w-5 h-5" />
                    종료
                  </Button>
                </div>
              )}

              {isConnected && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground justify-center">
                  {isSpeaking ? (
                    <>
                      <MicOff className="w-4 h-4" />
                      <span>AI가 말하는 동안 대기중...</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 text-green-500" />
                      <span>마이크가 활성화되어 있습니다</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Info */}
          <p className="text-white/70 text-sm text-center max-w-md">
            마이크 권한을 허용하고 대화를 시작하세요. AI가 자동으로 음성을 인식하고 응답합니다.
          </p>
        </div>
      </CounselingRoom>
    </div>
  );
};

export default MetaverseVoiceCounseling;
