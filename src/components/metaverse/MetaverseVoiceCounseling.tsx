import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Mic, MicOff, Phone, Loader2, ArrowRight, User, MessageSquare, Building2, Home, Bed, GraduationCap, Users, Sofa, Trees, Download, Copy, Share2, UserCircle, Smile, Link2 } from 'lucide-react';
import CounselingRoom, { RoomType } from '@/components/3d/CounselingRoom';
import { RealtimeChat } from '@/utils/RealtimeAudio';
import { useReadyPlayerMe } from '@/components/metaverse/ReadyPlayerMeAvatar';
import { MovementGuide } from '@/components/metaverse/CharacterController';
import { EmotionDetector, EmotionType } from '@/utils/EmotionDetector';
import { useInteractiveObjects } from '@/components/metaverse/InteractiveObject';
import { AvatarPreview } from '@/components/metaverse/AvatarPreview';
import { AvatarGallery } from '@/components/metaverse/AvatarGallery';
import { getSoundEffects } from '@/utils/SoundEffects';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  responseId?: string;
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
  const [currentResponseId, setCurrentResponseId] = useState<string | null>(null);
  const [enableMovement, setEnableMovement] = useState(true);
  const [showMovementGuide, setShowMovementGuide] = useState(true);
  const [currentEmotion, setCurrentEmotion] = useState<EmotionType>('neutral');
  const [emotionIntensity, setEmotionIntensity] = useState(0.5);
  const chatRef = useRef<RealtimeChat | null>(null);
  const emotionDetectorRef = useRef<EmotionDetector | null>(null);
  const { avatarUrl, setAvatarUrl, openAvatarCreator } = useReadyPlayerMe();
  const { activeObject, objectContent, handleObjectInteraction, closeInteraction } = useInteractiveObjects();

  // 스트리밍 자막에서 발생하는 말더듬/중복어 제거
  const cleanTranscript = (input: string) => {
    if (!input) return "";
    let text = input;
    // 1) 한글 문자 반복 축약 (예: 위위위 → 위)
    text = text.replace(/([\uAC00-\uD7A3])\1{1,}/g, "$1");
    // 2) 단어 반복 축약 (예: 하지만 하지만 → 하지만)
    text = text.replace(/\b([\p{L}\uAC00-\uD7A3]{1,})\b(?:\s+\1\b)+/gu, "$1");
    // 3) 구두점 반복 축약 (예: ..../!!! → . / !)
    text = text.replace(/([,.!?…])\1+/g, "$1");
    // 4) 공백 정리
    text = text.replace(/\s{2,}/g, " ");
    return text.trim();
  };

  const handleMessage = (event: any) => {
    console.log('Received event:', event.type);
    
    // 새 응답 시작 감지
    if (event.type === 'response.created') {
      setCurrentResponseId(event.response?.id || Date.now().toString());
      setIsSpeaking(true);
    }
    
    // AI 응답 텍스트 (delta는 변화분만 포함)
    else if (event.type === 'response.audio_transcript.delta') {
      const responseId = event.response_id || currentResponseId;
      
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        
        if (lastMessage && lastMessage.role === 'assistant' && lastMessage.responseId === responseId) {
          const merged = (lastMessage.content || '') + (event.delta || '');
          lastMessage.content = cleanTranscript(merged);
        } else {
          newMessages.push({
            role: 'assistant',
            content: cleanTranscript(event.delta || ''),
            timestamp: new Date(),
            responseId
          });
        }
        return newMessages;
      });
    }
    
    // 최종 자막 (완료본으로 교체)
    else if (event.type === 'response.audio_transcript.done') {
      const responseId = event.response_id || currentResponseId;
      const finalText = cleanTranscript(event.transcript || '');
      setMessages(prev => prev.map((m, i, arr) => {
        if (m.role === 'assistant' && (m.responseId === responseId || (i === arr.length - 1 && !m.responseId))) {
          return { ...m, content: finalText, responseId };
        }
        return m;
      }));
    }
    
    // 사용자 음성 인식 완료
    else if (event.type === 'conversation.item.input_audio_transcription.completed') {
      setMessages(prev => [...prev, {
        role: 'user',
        content: cleanTranscript(event.transcript || ''),
        timestamp: new Date()
      }]);
    }
    
    // AI 음성 재생 중/완료
    else if (event.type === 'response.audio.delta') {
      setIsSpeaking(true);
    } else if (event.type === 'response.audio.done') {
      setIsSpeaking(false);
    }
    
    // 응답 전체 완료
    else if (event.type === 'response.done') {
      setIsSpeaking(false);
      setCurrentResponseId(null);
    }
  };

  const startConversation = async () => {
    try {
      setIsLoading(true);
      
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // 감정 인식 시작
      emotionDetectorRef.current = new EmotionDetector((emotionState) => {
        setCurrentEmotion(emotionState.emotion);
        setEmotionIntensity(emotionState.intensity);
        console.log('Emotion detected:', emotionState);
      });
      await emotionDetectorRef.current.init(stream);

      chatRef.current = new RealtimeChat(handleMessage);
      await chatRef.current.init();
      
      setIsConnected(true);
      setIsLoading(false);
      
      // 환경음 시작 (선택한 공간 타입에 따라)
      const soundEffects = getSoundEffects();
      const ambientType = selectedRoom === 'outdoor' ? 'outdoor' : 'indoor';
      soundEffects.startAmbient(ambientType);
      
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
    emotionDetectorRef.current?.disconnect();
    
    // 사운드 중지
    const soundEffects = getSoundEffects();
    soundEffects.stopFootsteps();
    soundEffects.stopAmbient();
    
    setIsConnected(false);
    setIsSpeaking(false);
    setCurrentEmotion('neutral');
    
    toast({
      title: "상담 종료",
      description: "대화가 종료되었습니다",
    });
  };

  // 대화 내용 텍스트로 변환
  const getConversationText = () => {
    const header = `AI 메타버스 상담 기록\n날짜: ${new Date().toLocaleString('ko-KR')}\n이름: ${userName}\n${consultTopic ? `주제: ${consultTopic}\n` : ''}\n${'='.repeat(50)}\n\n`;
    
    const conversation = messages.map((msg) => {
      const time = msg.timestamp.toLocaleTimeString('ko-KR');
      const speaker = msg.role === 'user' ? userName : 'AI 상담사';
      return `[${time}] ${speaker}:\n${msg.content}\n`;
    }).join('\n');
    
    return header + conversation;
  };

  // 텍스트 다운로드
  const downloadConversation = () => {
    const text = getConversationText();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `AI상담_${new Date().toISOString().slice(0, 10)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "다운로드 완료",
      description: "대화 내용이 저장되었습니다",
    });
  };

  // 클립보드 복사
  const copyToClipboard = async () => {
    try {
      const text = getConversationText();
      await navigator.clipboard.writeText(text);
      toast({
        title: "복사 완료",
        description: "대화 내용이 클립보드에 복사되었습니다",
      });
    } catch (error) {
      toast({
        title: "복사 실패",
        description: "클립보드 복사에 실패했습니다",
        variant: "destructive",
      });
    }
  };

  // 카카오톡 공유
  const shareToKakao = () => {
    const text = getConversationText();
    const encodedText = encodeURIComponent(text);
    const kakaoUrl = `https://open.kakao.com/me`;
    
    // 텍스트를 클립보드에 복사하고 카카오톡 열기
    navigator.clipboard.writeText(text).then(() => {
      window.open(kakaoUrl, '_blank');
      toast({
        title: "카카오톡으로 이동",
        description: "대화 내용이 복사되었습니다. 카카오톡에서 붙여넣기 하세요",
      });
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
      emotionDetectorRef.current?.disconnect();
      // 정리 시 사운드도 중지
      const soundEffects = getSoundEffects();
      soundEffects.cleanup();
    };
  }, []);

  // 입장 전 설정 화면
  if (!hasEntered) {
    return (
      <div className="relative min-h-screen">
        <CounselingRoom roomType={selectedRoom} enableMovement={false}>
          <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
            <Card className="bg-slate-900/80 backdrop-blur-xl border border-purple-500/30 p-8 max-w-2xl w-full animate-scale-in shadow-xl shadow-purple-500/20">
              <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                  🎭 AI 메타버스 상담실
                </h1>
                <p className="text-purple-200/80">
                  가상 공간에서 AI 상담사와 실시간 음성 대화 • 자유롭게 이동하며 상담하세요
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

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <UserCircle className="w-4 h-4" />
                      <Label htmlFor="movement" className="cursor-pointer">캐릭터 이동 활성화</Label>
                    </div>
                    <Switch
                      id="movement"
                      checked={enableMovement}
                      onCheckedChange={setEnableMovement}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="flex items-center gap-2">
                      <Link2 className="w-4 h-4" />
                      아바타 설정
                    </Label>
                    
                    {/* 샘플 아바타 갤러리 */}
                    <AvatarGallery 
                      selectedUrl={avatarUrl}
                      onSelect={(url) => {
                        setAvatarUrl(url);
                        toast({
                          title: "샘플 아바타 선택됨 ✓",
                          description: "미리보기에서 확인하세요",
                        });
                      }}
                    />
                    
                    <div className="relative">
                      <Input
                        placeholder="또는 커스텀 아바타 URL (.glb) 붙여넣기"
                        value={avatarUrl}
                        onChange={(e) => {
                          const url = e.target.value.trim();
                          setAvatarUrl(url);
                          if (url && url.includes('readyplayer.me') && url.endsWith('.glb')) {
                            toast({
                              title: "아바타 URL 인식됨 ✓",
                              description: "미리보기에서 확인하세요",
                            });
                          }
                        }}
                        className="pr-10"
                      />
                      {avatarUrl && avatarUrl.includes('readyplayer.me') && avatarUrl.endsWith('.glb') && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
                          ✓
                        </div>
                      )}
                    </div>

                    {/* 아바타 미리보기 */}
                    <AvatarPreview avatarUrl={avatarUrl} />
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-2"
                      onClick={openAvatarCreator}
                    >
                      <UserCircle className="w-4 h-4" />
                      Ready Player Me에서 새로 만들기
                    </Button>
                    
                    <p className="text-xs text-muted-foreground">
                      💡 샘플을 선택하거나 Ready Player Me에서 생성한 URL을 붙여넣으세요
                    </p>
                  </div>
                </div>

                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2">
                  <p className="text-sm text-muted-foreground text-center">
                    🔒 대화 내용은 저장되지 않으며 완전히 비밀이 보장됩니다
                  </p>
                  {enableMovement && (
                    <p className="text-xs text-muted-foreground text-center">
                      💡 입장 후 WASD 또는 방향키로 공간을 자유롭게 이동할 수 있습니다
                    </p>
                  )}
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
      <CounselingRoom 
        roomType={selectedRoom} 
        enableMovement={enableMovement} 
        avatarUrl={avatarUrl}
        emotion={currentEmotion}
        emotionIntensity={emotionIntensity}
        onObjectInteract={handleObjectInteraction}
        isSpeaking={isSpeaking}
      >
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
          {/* 이동 가이드 */}
          {enableMovement && <MovementGuide visible={showMovementGuide} />}
          
          {/* 인터랙티브 오브젝트 콘텐츠 모달 */}
          {activeObject && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <Card className="bg-slate-900/95 border border-purple-500/30 p-6 max-w-lg w-full">
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white">{activeObject}</h3>
                  <p className="text-purple-200/80">{objectContent}</p>
                  <Button onClick={closeInteraction} className="w-full">
                    닫기
                  </Button>
                </div>
              </Card>
            </div>
          )}
          {/* Header */}
          <div className="text-center mb-8 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 drop-shadow-lg">
              안녕하세요, {userName}님 👋
            </h1>
            <p className="text-lg text-foreground/90 drop-shadow-md mb-3">
              {consultTopic ? `${consultTopic}에 대해 편하게 이야기 나눠봐요` : '편하게 이야기 나눠봐요'}
            </p>
            <div className="flex flex-wrap gap-2 justify-center items-center">
              <div className="inline-block bg-green-500/20 backdrop-blur-sm border border-green-400/30 rounded-lg px-4 py-2">
                <p className="text-sm md:text-base text-foreground font-medium">
                  🔒 대화 내용은 저장되지 않습니다
                </p>
              </div>
              
              {/* 현재 감정 표시 */}
              {isConnected && (
                <div className="inline-flex items-center gap-2 bg-purple-500/20 backdrop-blur-sm border border-purple-400/30 rounded-lg px-4 py-2">
                  <Smile className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    감정: {currentEmotion === 'happy' ? '😊 행복' : 
                           currentEmotion === 'sad' ? '😢 슬픔' : 
                           currentEmotion === 'angry' ? '😠 화남' :
                           currentEmotion === 'surprised' ? '😲 놀람' :
                           currentEmotion === 'thinking' ? '🤔 생각 중' :
                           '😐 평온'}
                  </span>
                </div>
              )}
              
              {enableMovement && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMovementGuide(!showMovementGuide)}
                  className="text-foreground"
                >
                  {showMovementGuide ? '🎮 조작법 숨기기' : '🎮 조작법 보기'}
                </Button>
              )}
            </div>
          </div>

          {/* Status Card */}
          <Card className="bg-slate-900/80 backdrop-blur-xl border border-purple-500/30 p-8 mb-6 max-w-2xl w-full animate-scale-in shadow-xl shadow-purple-500/20">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className={`w-4 h-4 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-purple-500/50'}`} />
              <span className="text-lg font-medium text-white">
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
                <div className="flex justify-between items-center mb-2">
                  <Button variant="ghost" size="sm" onClick={() => setShowSubtitles((v) => !v)}>
                    {showSubtitles ? '자막 숨기기' : '자막 표시'}
                  </Button>
                  
                  {/* 대화 저장/공유 버튼 */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadConversation}
                      className="gap-2"
                    >
                      <Download className="w-4 h-4" />
                      <span className="hidden sm:inline">다운로드</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyToClipboard}
                      className="gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      <span className="hidden sm:inline">복사</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={shareToKakao}
                      className="gap-2"
                    >
                      <Share2 className="w-4 h-4" />
                      <span className="hidden sm:inline">카톡공유</span>
                    </Button>
                  </div>
                </div>
                {showSubtitles && (
                  <div className="max-h-64 overflow-y-auto space-y-3">
                    {messages.map((msg, idx) => (
                      <div
                        key={`${msg.responseId || ''}-${idx}`}
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
