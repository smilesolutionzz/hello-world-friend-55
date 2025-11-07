import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Mic, MicOff, Phone, Loader2, ArrowRight, User, MessageSquare, Building2, Home, Bed, GraduationCap, Users, Sofa, Trees } from 'lucide-react';
import CounselingRoom, { RoomType } from '@/components/3d/CounselingRoom';
import { RealtimeChat } from '@/utils/RealtimeAudio';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const roomOptions = [
  { id: 'counseling' as RoomType, name: '상담실', icon: Sofa, description: '따뜻한 상담실' },
  { id: 'office' as RoomType, name: '회사 사무실', icon: Building2, description: '업무 공간' },
  { id: 'home' as RoomType, name: '친정 엄마집', icon: Home, description: '편안한 집' },
  { id: 'bedroom' as RoomType, name: '안방', icon: Bed, description: '아늑한 침실' },
  { id: 'school' as RoomType, name: '학교', icon: GraduationCap, description: '학교 교실' },
  { id: 'club' as RoomType, name: '대학 동아리실', icon: Users, description: '동아리 공간' },
  { id: 'living' as RoomType, name: '거실', icon: Sofa, description: '편안한 거실' },
  { id: 'outdoor' as RoomType, name: '야외 잔디구장', icon: Trees, description: '자연 속에서' },
];

const MetaverseVoiceCounseling = () => {
  const { toast } = useToast();
  const [hasEntered, setHasEntered] = useState(false);
  const [userName, setUserName] = useState('');
  const [consultTopic, setConsultTopic] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<RoomType>('counseling');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showSubtitles, setShowSubtitles] = useState(true);
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

  const handleEnterRoom = () => {
    if (!userName.trim()) {
      toast({
        title: "이름을 입력해주세요",
        description: "상담실 입장을 위해 이름이 필요합니다",
        variant: "destructive",
      });
      return;
    }
    setHasEntered(true);
    toast({
      title: "상담실 입장",
      description: `${userName}님, 환영합니다!`,
    });
  };

  useEffect(() => {
    return () => {
      chatRef.current?.disconnect();
    };
  }, []);

  // 입장 전 설정 화면
  if (!hasEntered) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <CounselingRoom roomType={selectedRoom}>
          <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
            <Card className="bg-background/95 backdrop-blur-lg p-8 max-w-2xl w-full animate-scale-in">
              <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  AI 메타버스 상담실
                </h1>
                <p className="text-muted-foreground">
                  가상 공간에서 AI 상담사와 실시간 음성 대화
                </p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="userName" className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    이름 또는 닉네임
                  </Label>
                  <Input
                    id="userName"
                    placeholder="어떻게 불러드릴까요?"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="text-lg"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Sofa className="w-4 h-4" />
                    상담 공간 선택
                  </Label>
                  <div className="grid grid-cols-2 gap-3">
                    {roomOptions.map((room) => {
                      const Icon = room.icon;
                      return (
                        <Button
                          key={room.id}
                          variant={selectedRoom === room.id ? "default" : "outline"}
                          className="h-auto flex-col gap-2 p-4"
                          onClick={() => setSelectedRoom(room.id)}
                        >
                          <Icon className="w-6 h-6" />
                          <div className="text-center">
                            <div className="font-medium">{room.name}</div>
                            <div className="text-xs opacity-70">{room.description}</div>
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="consultTopic" className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    상담 주제 (선택사항)
                  </Label>
                  <Input
                    id="consultTopic"
                    placeholder="오늘은 어떤 이야기를 나누고 싶으세요?"
                    value={consultTopic}
                    onChange={(e) => setConsultTopic(e.target.value)}
                  />
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground text-center">
                    🔒 대화 내용은 저장되지 않으며<br />
                    완전히 비밀이 보장됩니다
                  </p>
                </div>

                <Button
                  onClick={handleEnterRoom}
                  size="lg"
                  className="w-full gap-2 text-lg"
                >
                  상담실 입장하기
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </Card>
          </div>
        </CounselingRoom>
      </div>
    );
  }

  // 입장 후 상담 화면
  return (
    <div className="relative min-h-screen">
      <CounselingRoom roomType={selectedRoom}>
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
          {/* Header */}
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 drop-shadow-lg">
              안녕하세요, {userName}님
            </h1>
            <p className="text-lg text-foreground/90 drop-shadow-md mb-3">
              {consultTopic ? `${consultTopic}에 대해 편하게 이야기 나눠봐요` : '편하게 이야기 나눠봐요'}
            </p>
            <div className="inline-block bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-lg px-4 py-2 mt-2">
              <p className="text-sm md:text-base text-foreground font-medium">
                🔒 대화 내용은 저장되지 않습니다 • 마음껏 표현하세요
              </p>
            </div>
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

            {/* Subtitles Toggle + Messages */}
            {messages.length > 0 && (
              <div className="mb-6">
                <div className="flex justify-end mb-2">
                  <Button variant="ghost" size="sm" onClick={() => setShowSubtitles((v) => !v)}>
                    {showSubtitles ? '자막 숨기기' : '자막 표시'}
                  </Button>
                </div>
                {showSubtitles && (
                  <div className="max-h-64 overflow-y-auto space-y-3">
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
                          <p className="text-sm flex-1 whitespace-pre-wrap break-words leading-relaxed">{msg.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
          <div className="bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-xl p-4 max-w-md">
            <p className="text-foreground/90 text-base md:text-lg text-center leading-relaxed">
              💬 마이크 권한을 허용하고 대화를 시작하세요.<br />
              AI가 자동으로 음성을 인식하고 응답합니다.
            </p>
            <p className="text-foreground/70 text-sm text-center mt-3">
              ✨ 비밀 보장 • 편하게 스트레스 풀어내세요
            </p>
          </div>
        </div>
      </CounselingRoom>
    </div>
  );
};

export default MetaverseVoiceCounseling;
