import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mic, MicOff, Phone, Loader2, ArrowRight, User, MessageSquare, Building2, Home, Bed, GraduationCap, Users, Sofa, Trees, Download, Copy, Share2, UserCircle, Smile, Link2, Music, Hand, Clock, TrendingUp, X, ArrowLeft, LogOut, Gamepad2, Package, Palette, BookOpen, Flower2, Paintbrush } from 'lucide-react';
import CounselingRoom, { RoomType } from '@/components/3d/CounselingRoom';
import { SpaceManager } from './SpaceManager';
import { RealtimeChat } from '@/utils/RealtimeAudio';
import { useReadyPlayerMe } from '@/components/metaverse/ReadyPlayerMeAvatar';
import { MovementGuide } from '@/components/metaverse/CharacterController';
import { EmotionDetector, EmotionType } from '@/utils/EmotionDetector';
import { useInteractiveObjects } from '@/components/metaverse/InteractiveObject';
import { AvatarPreview } from '@/components/metaverse/AvatarPreview';
import { AvatarGallery } from '@/components/metaverse/AvatarGallery';
import { getSoundEffects } from '@/utils/SoundEffects';
import { getMusicPlayer, MUSIC_OPTIONS, type MusicType } from '@/utils/BackgroundMusic';
import { GestureManager, GESTURES, type GestureType } from '@/utils/GestureSystem';
import { detectCounselorGesture } from '@/utils/CounselorGestureDetector';
import { detectCounselorEmotion, type CounselorEmotion } from '@/utils/CounselorEmotionDetector';
import { SessionRecorder } from '@/utils/SessionRecorder';
import { RecordingConsent } from './RecordingConsent';
import { AvatarCustomization, type AvatarCustomization as AvatarCustomizationType } from './AvatarCustomization';
import { SessionTimeline } from './SessionTimeline';
import { EmotionTrendChart } from './EmotionTrendChart';
import { Slider } from '@/components/ui/slider';
import { VirtualJoystick } from './VirtualJoystick';
import { GestureQuickMenu } from './GestureQuickMenu';
import { StructuredCounseling } from './StructuredCounseling';
import type { AgeGroup, CharacterType } from '@/utils/CounselingQuestions';
import { CHARACTERS } from '@/utils/CounselingQuestions';
import { SCTVisualization } from './SCTVisualization';
import { analyzeSCTResponses, type SCTAgeGroup, SCT_QUESTIONS } from '@/utils/SCTQuestions';
import type { RolePlayScenario } from '@/utils/RolePlayScenarios';
import { GroupUserList, type UserPresence } from './GroupPresence';
import { RoomTransitionUI } from './RoomTransitionUI';
import { Drawing3DPanel } from './Drawing3DPanel';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  responseId?: string;
}

interface MetaverseVoiceCounselingProps {
  mode?: 'free' | 'structured' | 'roleplay';
  structuredConfig?: {
    ageGroup: AgeGroup;
    character: CharacterType;
  };
  roleplayScenario?: RolePlayScenario;
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
  { id: 'playground' as RoomType, name: '놀이터', icon: Gamepad2, description: '신나는 놀이터' },
  { id: 'toyroom' as RoomType, name: '장난감방', icon: Package, description: '재미있는 장난감방' },
  { id: 'artroom' as RoomType, name: '미술실', icon: Palette, description: '창의적인 미술실' },
  { id: 'library' as RoomType, name: '도서관', icon: BookOpen, description: '조용한 도서관' },
  { id: 'garden' as RoomType, name: '정원', icon: Flower2, description: '예쁜 꽃 정원' },
];

const MetaverseVoiceCounseling = ({ mode = 'free', structuredConfig, roleplayScenario }: MetaverseVoiceCounselingProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [hasEntered, setHasEntered] = useState(false);
  const [userName, setUserName] = useState('');
  const [consultTopic, setConsultTopic] = useState('');
  const [selectedRoom, setSelectedRoom] = useState<RoomType>('counseling');
  const [showRoomSelector, setShowRoomSelector] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [showSubtitles, setShowSubtitles] = useState(true);
  const [currentResponseId, setCurrentResponseId] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  const [enableMovement, setEnableMovement] = useState(true);
  const [showMovementGuide, setShowMovementGuide] = useState(true);
  const [currentEmotion, setCurrentEmotion] = useState<EmotionType>('neutral');
  const [emotionIntensity, setEmotionIntensity] = useState(0.5);
  
  const chatRef = useRef<RealtimeChat | null>(null);
  const emotionDetectorRef = useRef<EmotionDetector | null>(null);
  const { avatarUrl, setAvatarUrl, openAvatarCreator } = useReadyPlayerMe();
  const { activeObject, objectContent, handleObjectInteraction, closeInteraction } = useInteractiveObjects();
  
  // 새로운 기능 상태
  const [backgroundMusic, setBackgroundMusic] = useState<MusicType>('none');
  const [showDrawingPanel, setShowDrawingPanel] = useState(false);
  const [floatingCubes, setFloatingCubes] = useState<Array<{ id: string; imageUrl: string }>>([]);
  const [musicVolume, setMusicVolume] = useState(0.3);
  const [currentGesture, setCurrentGesture] = useState<GestureType | null>(null);
  const [counselorGesture, setCounselorGesture] = useState<GestureType | null>(null);
  const [counselorEmotion, setCounselorEmotion] = useState<CounselorEmotion>('neutral');
  const [groupMode, setGroupMode] = useState(false);
  const [avatarPosition, setAvatarPosition] = useState({ x: 0, y: -1.5, z: 3 });
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [groupUsers, setGroupUsers] = useState<UserPresence[]>([]);
  const gestureManagerRef = useRef<GestureManager | null>(null);
  const sessionRecorderRef = useRef<SessionRecorder | null>(null);
  const [showRecordingConsent, setShowRecordingConsent] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showCustomization, setShowCustomization] = useState(false);
  const [sctAnalysisResult, setSctAnalysisResult] = useState<any>(null);
  const [showAnalysisResult, setShowAnalysisResult] = useState(false);
  const [avatarCustomization, setAvatarCustomization] = useState<AvatarCustomizationType>({
    skinTone: 30,
    hairColor: 30,
    shirtColor: 210,
    pantsColor: 220,
    hasGlasses: false,
    glassesStyle: 0
  });
  const [showTimeline, setShowTimeline] = useState(false);
  const [sessionStartTime] = useState(new Date());
  const [emotionHistory, setEmotionHistory] = useState<Array<{
    timestamp: Date;
    emotion: EmotionType;
    intensity: number;
  }>>([]);
  const [showEmotionChart, setShowEmotionChart] = useState(false);
  
  // 텍스트 기반 감정 분석
  const [transcriptBuffer, setTranscriptBuffer] = useState('');
  const lastEmotionAnalysisRef = useRef<Date>(new Date());
  
  // 모바일 감지 및 UI 상태
  const [isMobile, setIsMobile] = useState(false);
  const [isUICollapsed, setIsUICollapsed] = useState(false);
  const joystickInputRef = useRef({ x: 0, y: 0 });
  
  // 문 근처 감지 및 방 이동 UI
  const [showRoomTransition, setShowRoomTransition] = useState(false);
  const [wasDismissed, setWasDismissed] = useState(false); // 사용자가 취소 버튼을 눌렀는지 추적
  const doorPositionRef = useRef({ x: -7, y: 0, z: 0 }); // 문의 기본 위치
  
  // 텍스트 기반 감정 분석 함수
  const analyzeEmotionFromText = async (text: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('analyze-emotion', {
        body: { text }
      });

      if (error) throw error;

      console.log('감정 분석 결과:', data);

      // EmotionType으로 매핑
      const emotionMap: Record<string, EmotionType> = {
        'neutral': 'neutral',
        'happy': 'happy',
        'sad': 'sad',
        'angry': 'angry',
        'surprised': 'surprised',
        'fearful': 'fearful',
        'thinking': 'thinking'
      };

      const mappedEmotion = emotionMap[data.emotion] || 'neutral';
      const intensity = data.intensity || 0.5;

      // 감정 상태 업데이트
      setCurrentEmotion(mappedEmotion);
      setEmotionIntensity(intensity);

      // 감정 히스토리에 추가
      setEmotionHistory(prev => [...prev, {
        timestamp: new Date(),
        emotion: mappedEmotion,
        intensity: intensity
      }]);

      lastEmotionAnalysisRef.current = new Date();
      
      toast({
        title: "감정 분석",
        description: `${data.emotion} (${Math.round(intensity * 100)}%): ${data.reason}`,
      });
    } catch (error) {
      console.error('감정 분석 오류:', error);
    }
  };

  // 대화 텍스트가 쌓이면 감정 분석 실행
  useEffect(() => {
    const analyzeIfNeeded = async () => {
      // 최소 50자 이상, 마지막 분석으로부터 10초 이상 경과
      if (transcriptBuffer.length >= 50 && isConnected) {
        const timeSinceLastAnalysis = Date.now() - lastEmotionAnalysisRef.current.getTime();
        if (timeSinceLastAnalysis > 10000) {
          await analyzeEmotionFromText(transcriptBuffer);
          setTranscriptBuffer(''); // 버퍼 초기화
        }
      }
    };

    analyzeIfNeeded();
  }, [transcriptBuffer, isConnected]);

  // 모바일 감지
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 현재 사용자 ID 가져오기
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      } else {
        // 익명 사용자의 경우 세션 기반 ID 생성
        const sessionId = sessionStorage.getItem('anonymous_user_id') || crypto.randomUUID();
        sessionStorage.setItem('anonymous_user_id', sessionId);
        setCurrentUserId(sessionId);
      }
    };
    getUser();
  }, []);

  // 초기화
  useEffect(() => {
    gestureManagerRef.current = new GestureManager((gesture) => {
      setCurrentGesture(gesture?.type || null);
    });
    sessionRecorderRef.current = new SessionRecorder();
  }, []);

  // 제스처 키 이벤트 핸들러
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isConnected || !gestureManagerRef.current) return;
      
      switch(e.key) {
        case '1':
          gestureManagerRef.current.playGesture('wave');
          toast({ title: `${GESTURES.wave.icon} ${GESTURES.wave.name}` });
          break;
        case '2':
          gestureManagerRef.current.playGesture('clap');
          toast({ title: `${GESTURES.clap.icon} ${GESTURES.clap.name}` });
          break;
        case '3':
          gestureManagerRef.current.playGesture('bow');
          toast({ title: `${GESTURES.bow.icon} ${GESTURES.bow.name}` });
          break;
        case '4':
          gestureManagerRef.current.playGesture('dance');
          toast({ title: `${GESTURES.dance.icon} ${GESTURES.dance.name}` });
          break;
        case '5':
          gestureManagerRef.current.playGesture('laugh');
          toast({ title: `${GESTURES.laugh.icon} ${GESTURES.laugh.name}` });
          break;
        case '6':
          gestureManagerRef.current.playGesture('cry');
          toast({ title: `${GESTURES.cry.icon} ${GESTURES.cry.name}` });
          break;
        case '7':
          gestureManagerRef.current.playGesture('heart');
          toast({ title: `${GESTURES.heart.icon} ${GESTURES.heart.name}` });
          break;
        case '8':
          gestureManagerRef.current.playGesture('thumbsup');
          toast({ title: `${GESTURES.thumbsup.icon} ${GESTURES.thumbsup.name}` });
          break;
        case '9':
          gestureManagerRef.current.playGesture('thinking');
          toast({ title: `${GESTURES.thinking.icon} ${GESTURES.thinking.name}` });
          break;
        case '0':
          gestureManagerRef.current.playGesture('celebrate');
          toast({ title: `${GESTURES.celebrate.icon} ${GESTURES.celebrate.name}` });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isConnected, toast]);

  // 배경음악 변경
  useEffect(() => {
    const musicPlayer = getMusicPlayer();
    musicPlayer.init().then(() => {
      musicPlayer.play(backgroundMusic);
      musicPlayer.setVolume(musicVolume);
    });
  }, [backgroundMusic]);

  // 음악 볼륨 변경
  useEffect(() => {
    const musicPlayer = getMusicPlayer();
    musicPlayer.setVolume(musicVolume);
  }, [musicVolume]);

  // 플레이어와 문 사이의 거리 체크
  useEffect(() => {
    if (!isConnected) return;

    const checkDoorProximity = () => {
      const doorPos = doorPositionRef.current;
      const playerPos = avatarPosition;
      
      // 거리 계산 (x, z 평면)
      const distance = Math.sqrt(
        Math.pow(playerPos.x - doorPos.x, 2) + 
        Math.pow(playerPos.z - doorPos.z, 2)
      );
      
      console.log('🚪 Door proximity check:', {
        playerPos,
        doorPos,
        distance,
        threshold: 3,
        shouldShow: distance <= 3,
        wasDismissed
      });
      
      // 거리가 멀어지면 취소 상태 초기화
      if (distance > 3) {
        if (showRoomTransition || wasDismissed) {
          console.log('❌ Hiding room transition UI - player moved away');
          setShowRoomTransition(false);
          setWasDismissed(false);
        }
      } else if (distance <= 3 && !showRoomTransition && !wasDismissed) {
        // 거리가 3 이하이고, UI가 표시되지 않았으며, 취소 버튼을 누르지 않았을 때만 UI 표시
        console.log('✅ Showing room transition UI');
        setShowRoomTransition(true);
      }
    };
    
    const intervalId = setInterval(checkDoorProximity, 200); // 200ms마다 체크
    
    return () => clearInterval(intervalId);
  }, [avatarPosition, isConnected, showRoomTransition]);

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
          const fullMessage = { ...m, content: finalText, responseId };
          
          // 텍스트 버퍼에 추가 (감정 분석용)
          setTranscriptBuffer(prev => prev + ' ' + finalText);
          
          // 녹음 중이면 메시지 추가
          if (sessionRecorderRef.current?.getIsRecording()) {
            sessionRecorderRef.current.addMessage('assistant', fullMessage.content);
          }
          
          // 제스처 감지
          const gesture = detectCounselorGesture(fullMessage.content);
          if (gesture) {
            setCounselorGesture(gesture);
            setTimeout(() => setCounselorGesture(null), 2000);
          }
          
          // 감정 감지
          const emotion = detectCounselorEmotion(fullMessage.content);
          setCounselorEmotion(emotion);
          setTimeout(() => setCounselorEmotion('neutral'), 3000);
          
          return fullMessage;
        }
        return m;
      }));
    }
    
    // 사용자 음성 인식 완료
    else if (event.type === 'conversation.item.input_audio_transcription.completed') {
      const userText = cleanTranscript(event.transcript || '');
      setMessages(prev => [...prev, {
        role: 'user',
        content: userText,
        timestamp: new Date()
      }]);
      
      // 텍스트 버퍼에 추가 (감정 분석용)
      setTranscriptBuffer(prev => prev + ' ' + userText);
      
      // 녹음 중이면 사용자 메시지 추가
      if (sessionRecorderRef.current?.getIsRecording()) {
        sessionRecorderRef.current.addMessage('user', userText);
      }
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
      
      // 녹음 동의 요청
      setShowRecordingConsent(true);
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: "연결 실패",
        description: "음성 상담 연결에 실패했습니다.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleRecordingConsent = async (consent: boolean) => {
    setShowRecordingConsent(false);
    
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // 감정 인식 시작
      emotionDetectorRef.current = new EmotionDetector((emotionState) => {
        setCurrentEmotion(emotionState.emotion);
        setEmotionIntensity(emotionState.intensity);
        console.log('Emotion detected:', emotionState);
      });
      await emotionDetectorRef.current.init(stream);

      // RealtimeChat 초기화
      let chatOptions: any;
      if (mode === 'structured' && structuredConfig) {
        chatOptions = {
          mode: 'structured' as const,
          ageGroup: structuredConfig.ageGroup,
          character: structuredConfig.character
        };
      } else if (mode === 'roleplay' && roleplayScenario) {
        chatOptions = {
          mode: 'roleplay' as const,
          roleplayPersona: roleplayScenario.aiPersona,
          roleplayVoice: roleplayScenario.voice,
          firstMessage: roleplayScenario.firstMessage
        };
      } else {
        chatOptions = { mode: 'free' as const };
      }

      console.log('Starting conversation with options:', chatOptions);
      
      chatRef.current = new RealtimeChat(handleMessage, chatOptions);
      await chatRef.current.init();
      
      setIsConnected(true);
      setIsLoading(false);
      
      // 환경음 시작 (선택한 공간 타입에 따라)
      const soundEffects = getSoundEffects();
      const ambientType = selectedRoom === 'outdoor' ? 'outdoor' : 'indoor';
      soundEffects.startAmbient(ambientType);
      
      // 녹음 시작 (동의한 경우)
      if (consent && sessionRecorderRef.current) {
        const sessionId = await sessionRecorderRef.current.startRecording(true);
        if (sessionId) {
          setIsRecording(true);
          console.log('Recording started:', sessionId);
        }
      }
      
      // 롤플레이 모드일 때는 AI가 먼저 말하므로 화면 표시만 제거
      if (mode === 'roleplay' && roleplayScenario?.firstMessage) {
        toast({
          title: "연결 완료",
          description: "AI가 상황에 맞게 먼저 말을 걸어요!",
        });
      } else {
        toast({
          title: "연결 완료",
          description: "AI 상담사와 대화를 시작하세요!",
        });
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast({
        title: "연결 실패",
        description: error instanceof Error ? error.message : '대화를 시작할 수 없습니다',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const endConversation = async () => {
    console.log('Ending conversation...');
    
    // 구조화된 상담이었다면 분석 수행
    if (mode === 'structured' && structuredConfig && messages.length > 5) {
      try {
        // 대화에서 사용자 응답 추출
        const userMessages = messages.filter(m => m.role === 'user');
        
        // SCT 질문과 매칭하여 응답 생성
        const ageGroupMap: Record<AgeGroup, SCTAgeGroup> = {
          'child': 'infant',
          'teen': 'teen',
          'adult': 'adult',
          'parent': 'parent'
        };
        
        const sctAgeGroup = ageGroupMap[structuredConfig.ageGroup];
        const questions = SCT_QUESTIONS[sctAgeGroup];
        
        // 사용자 메시지를 SCT 응답으로 변환 (최대 질문 수만큼)
        const responses = userMessages.slice(0, questions.length).map((msg, index) => ({
          questionId: questions[index].id,
          response: msg.content
        }));
        
        if (responses.length > 0) {
          const analysis = analyzeSCTResponses(sctAgeGroup, responses);
          
          if (analysis) {
            setSctAnalysisResult(analysis);
            setShowAnalysisResult(true);
            
            toast({
              title: "분석 완료",
              description: "상담 내용 분석이 완료되었습니다.",
            });
          }
        }
      } catch (error) {
        console.error('Error analyzing conversation:', error);
        toast({
          title: "분석 오류",
          description: "상담 내용 분석 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    }
    
    // 녹음 중지 및 저장
    if (isRecording && sessionRecorderRef.current) {
      const session = await sessionRecorderRef.current.stopRecording();
      if (session) {
        setIsRecording(false);
        toast({
          title: "세션 저장됨",
          description: "상담 내용이 저장되었습니다. 다운로드할 수 있습니다.",
        });
        
        // 자동 다운로드 옵션 제공
        setTimeout(() => {
          if (window.confirm('상담 세션을 다운로드하시겠습니까?')) {
            sessionRecorderRef.current?.downloadSession(session.id);
          }
        }, 1000);
      }
    }
    
    chatRef.current?.disconnect();
    emotionDetectorRef.current?.disconnect();
    
    // 사운드 중지
    const soundEffects = getSoundEffects();
    soundEffects.stopFootsteps();
    soundEffects.stopAmbient();
    
    setIsConnected(false);
    setIsSpeaking(false);
    setCurrentEmotion('neutral');
    
    if (!showAnalysisResult) {
      toast({
        title: "상담 종료",
        description: "대화가 종료되었습니다",
      });
    }
  };

  const sendTextMessage = async () => {
    if (!textInput.trim() || !isConnected) return;

    try {
      // 사용자 메시지 추가
      const userMessage: Message = {
        role: 'user',
        content: textInput.trim(),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);

      // AI에게 메시지 전송
      await chatRef.current?.sendMessage(textInput.trim());
      
      // 입력창 초기화
      setTextInput('');
    } catch (error) {
      console.error('Error sending text message:', error);
      toast({
        title: "전송 실패",
        description: "메시지를 전송할 수 없습니다",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendTextMessage();
    }
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

  const handleStructuredMessage = (message: string, isUser: boolean) => {
    setMessages(prev => [...prev, {
      role: isUser ? 'user' : 'assistant',
      content: message,
      timestamp: new Date()
    }]);
  };

  const handleStructuredComplete = (result: any) => {
    toast({
      title: "상담 완료",
      description: "구조화된 상담이 완료되었습니다",
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

  const handleDoorClick = () => {
    setShowRoomSelector(true);
    toast({
      title: "🚪 다른 방으로 이동",
      description: "이동할 공간을 선택하세요",
    });
  };

  const handleRoomChange = (newRoom: RoomType) => {
    setSelectedRoom(newRoom);
    setShowRoomSelector(false);
    
    const roomInfo = roomOptions.find(r => r.id === newRoom);
    toast({
      title: `${roomInfo?.icon.name} ${roomInfo?.name}`,
      description: `${roomInfo?.description}으로 이동했습니다`,
    });
    
    // 환경음 변경
    const soundEffects = getSoundEffects();
    const ambientType = newRoom === 'outdoor' || newRoom === 'garden' ? 'outdoor' : 'indoor';
    soundEffects.startAmbient(ambientType);
  };

  useEffect(() => {
    return () => {
      chatRef.current?.disconnect();
      emotionDetectorRef.current?.disconnect();
      // 정리 시 사운드와 음악도 중지
      const soundEffects = getSoundEffects();
      soundEffects.cleanup();
      const musicPlayer = getMusicPlayer();
      musicPlayer.cleanup();
    };
  }, []);

  // 입장 전 설정 화면
  if (!hasEntered) {
    return (
      <div className="relative min-h-screen">
        {/* 네비게이션 버튼 */}
        <div className="fixed top-4 left-4 z-50 flex gap-2">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            size="sm"
            className="gap-2 bg-background/80 backdrop-blur-sm shadow-lg"
          >
            <ArrowLeft className="w-4 h-4" />
            뒤로
          </Button>
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            size="sm"
            className="gap-2 bg-background/80 backdrop-blur-sm shadow-lg"
          >
            <Home className="w-4 h-4" />
            홈
          </Button>
        </div>

        <CounselingRoom 
          roomType={selectedRoom} 
          enableMovement={false}
          character={mode === 'structured' && structuredConfig ? structuredConfig.character : undefined}
        >
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

                {/* 자유 대화 모드 전용 설정 */}
                {mode === 'free' && (
                <div className="space-y-3">
                  {/* 캐릭터 이동 */}
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

                  {/* 그룹 상담 모드 */}
                  <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <Label htmlFor="groupMode" className="cursor-pointer">그룹 상담 모드</Label>
                    </div>
                    <Switch
                      id="groupMode"
                      checked={groupMode}
                      onCheckedChange={setGroupMode}
                    />
                  </div>

                  {/* 배경음악 선택 */}
                  <div className="space-y-2 p-3 bg-background/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Music className="w-4 h-4" />
                      <Label>배경음악</Label>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {(Object.keys(MUSIC_OPTIONS) as MusicType[]).map((type) => (
                        <Button
                          key={type}
                          variant={backgroundMusic === type ? "default" : "outline"}
                          size="sm"
                          onClick={() => setBackgroundMusic(type)}
                          className="flex flex-col gap-1 h-auto py-2"
                        >
                          <span className="text-lg">{MUSIC_OPTIONS[type].icon}</span>
                          <span className="text-xs">{MUSIC_OPTIONS[type].name}</span>
                        </Button>
                      ))}
                    </div>
                    {backgroundMusic !== 'none' && (
                      <div className="space-y-1">
                        <Label className="text-xs">볼륨</Label>
                        <Slider
                          value={[musicVolume * 100]}
                          onValueChange={(value) => setMusicVolume(value[0] / 100)}
                          max={100}
                          step={1}
                          className="w-full"
                        />
                      </div>
                    )}
                  </div>
                </div>
                )}

                {/* 아바타 설정 */}
                {mode === 'free' && (
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

                  {/* 아바타 미리보기와 커스터마이징 */}
                  <div className="flex gap-4">
                    <AvatarPreview avatarUrl={avatarUrl} onUrlChange={setAvatarUrl} />
                    {isConnected && (
                      <Button variant="outline" onClick={() => setShowCustomization(!showCustomization)} className="h-auto">
                        🎨 꾸미기
                      </Button>
                    )}
                  </div>
                  {showCustomization && <AvatarCustomization onCustomize={setAvatarCustomization} />}
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2"
                    onClick={openAvatarCreator}
                  >
                    <UserCircle className="w-4 h-4" />
                    Ready Player Me에서 새로 만들기
                  </Button>
                </div>
                )}

                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2">
                  <p className="text-sm text-foreground text-center">
                    🔒 대화 내용은 저장되지 않으며 완전히 비밀이 보장됩니다
                  </p>
                  {enableMovement && (
                    <p className="text-xs text-foreground text-center">
                      💡 WASD/방향키로 이동 • 1,2,3 키로 제스처
                    </p>
                  )}
                  {groupMode && (
                    <p className="text-xs text-primary text-center font-medium">
                      👥 그룹 모드: 다른 사용자들과 함께 상담받을 수 있습니다
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
      {/* 네비게이션 버튼 */}
      <div className="fixed top-4 left-4 z-50 flex gap-2">
        <Button
          onClick={() => navigate(-1)}
          variant="outline"
          size="sm"
          className="gap-2 bg-background/80 backdrop-blur-sm shadow-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          뒤로
        </Button>
        <Button
          onClick={() => navigate('/')}
          variant="outline"
          size="sm"
          className="gap-2 bg-background/80 backdrop-blur-sm shadow-lg"
        >
          <Home className="w-4 h-4" />
          홈
        </Button>
        <Button
          onClick={() => {
            if (isConnected) {
              chatRef.current?.disconnect();
            }
            navigate('/');
          }}
          variant="destructive"
          size="sm"
          className="gap-2 shadow-lg"
        >
          <LogOut className="w-4 h-4" />
          나가기
        </Button>
        
        <Button
          onClick={() => setShowDrawingPanel(!showDrawingPanel)}
          variant="outline"
          size="sm"
          className="gap-2 shadow-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 hover:from-purple-600 hover:to-pink-600"
        >
          <Paintbrush className="w-4 h-4" />
          그림 그리기
        </Button>
      </div>

      <CounselingRoom 
        roomType={selectedRoom} 
        enableMovement={enableMovement} 
        avatarUrl={avatarUrl}
        emotion={currentEmotion}
        emotionIntensity={emotionIntensity}
        onObjectInteract={handleObjectInteraction}
        onDoorClick={handleDoorClick}
        isSpeaking={isSpeaking}
        counselorGesture={counselorGesture}
        counselorEmotion={counselorEmotion}
        avatarCustomization={avatarCustomization}
        groupMode={groupMode}
        userName={userName}
        avatarPosition={avatarPosition}
        virtualInput={joystickInputRef.current}
        character={mode === 'structured' && structuredConfig ? structuredConfig.character : undefined}
        onGroupUsersChange={setGroupUsers}
        userGesture={currentGesture}
        onPositionChange={(pos) => {
          setAvatarPosition(pos);
        }}
      >
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
          {/* 이동 가이드 */}
          {enableMovement && !isMobile && <MovementGuide visible={showMovementGuide} />}
          
          {/* 모바일 컨트롤 */}
          {isMobile && enableMovement && (
            <>
              <VirtualJoystick
                onMove={(x, y) => {
                  joystickInputRef.current = { x, y };
                }}
                onJump={() => {
                  // 스페이스바 이벤트 디스패치
                  const event = new KeyboardEvent('keydown', { key: ' ' });
                  window.dispatchEvent(event);
                  setTimeout(() => {
                    window.dispatchEvent(new KeyboardEvent('keyup', { key: ' ' }));
                  }, 100);
                }}
              />
              <GestureQuickMenu
                onGesture={(gesture) => {
                  if (gestureManagerRef.current) {
                    gestureManagerRef.current.playGesture(gesture);
                    const gestureInfo = GESTURES[gesture];
                    toast({ title: `${gestureInfo.icon} ${gestureInfo.name}` });
                  }
                }}
              />
            </>
          )}
          
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
          
          {/* 방 선택 다이얼로그 */}
          {showRoomSelector && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <Card className="bg-slate-900/95 border border-purple-500/30 p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-white">🚪 방 선택</h3>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowRoomSelector(false)}
                      className="text-white hover:bg-white/10"
                    >
                      ✕
                    </Button>
                  </div>
                  <p className="text-purple-200/80 mb-6">
                    이동할 공간을 선택하세요
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {roomOptions.map((room) => {
                      const Icon = room.icon;
                      const isCurrentRoom = selectedRoom === room.id;
                      
                      return (
                        <Button
                          key={room.id}
                          variant={isCurrentRoom ? "default" : "outline"}
                          className={`h-auto py-4 flex flex-col gap-2 ${
                            isCurrentRoom ? 'border-2 border-primary' : ''
                          }`}
                          onClick={() => handleRoomChange(room.id)}
                          disabled={isCurrentRoom}
                        >
                          <Icon className="w-6 h-6" />
                          <div className="text-center">
                            <div className="font-medium">{room.name}</div>
                            <div className="text-xs opacity-70">{room.description}</div>
                          </div>
                          {isCurrentRoom && (
                            <span className="text-xs text-primary">현재 위치</span>
                          )}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </Card>
            </div>
          )}
          {/* Header */}
          <div className="text-center mb-8 animate-fade-in">
            {/* UI 접기/펼치기 버튼 */}
            <Button
              onClick={() => setIsUICollapsed(!isUICollapsed)}
              className="fixed top-4 right-4 z-50 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-600 shadow-xl border-2 border-white/30 p-0"
            >
              {isUICollapsed ? '📱' : '✕'}
            </Button>
            
            {!isUICollapsed && (
              <>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 drop-shadow-lg">
                  안녕하세요, {userName}님 👋
                </h1>
                <p className="text-lg text-foreground/90 drop-shadow-md mb-3">
                  {consultTopic ? `${consultTopic}에 대해 편하게 이야기 나눠봐요` : '편하게 이야기 나눠봐요'}
                </p>
              </>
            )}
            
            {!isUICollapsed && (
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
              
              {enableMovement && !isMobile && (
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
            )}
          </div>

          {/* 구조화된 상담 캐릭터 정보 */}
          {!isUICollapsed && mode === 'structured' && structuredConfig && (
            <div className="w-full max-w-2xl mb-6">
              <Card className="bg-primary/10 backdrop-blur-sm border border-primary/20 p-6 text-center">
                <div className="text-4xl mb-3">
                  {structuredConfig.character === 'elephant' && '🐘'}
                  {structuredConfig.character === 'bear' && '🐻'}
                  {structuredConfig.character === 'rabbit' && '🐰'}
                  {structuredConfig.character === 'fox' && '🦊'}
                  {structuredConfig.character === 'owl' && '🦉'}
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {CHARACTERS[structuredConfig.character].name}
                </h3>
                <p className="text-foreground/70">
                  {CHARACTERS[structuredConfig.character].personality}
                </p>
              </Card>
            </div>
          )}

          {/* Voice Chat Interface - 자유 대화와 구조화 상담 모두 표시 */}
          {!isUICollapsed && (
          <Card className="bg-slate-900/80 backdrop-blur-xl border border-purple-500/30 p-4 sm:p-8 mb-6 max-w-2xl w-full animate-scale-in shadow-xl shadow-purple-500/20 pointer-events-none">
            <div className="pointer-events-auto">
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
                      onClick={() => setShowTimeline(!showTimeline)}
                      className="gap-2"
                    >
                      <Clock className="w-4 h-4" />
                      <span className="hidden sm:inline">타임라인</span>
                    </Button>
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
                <div className="flex flex-col gap-3">
                  {/* 텍스트 입력창 */}
                  <div className="flex gap-2">
                    <Input
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="텍스트로 메시지 보내기..."
                      className="flex-1"
                      disabled={isSpeaking}
                    />
                    <Button
                      onClick={sendTextMessage}
                      disabled={!textInput.trim() || isSpeaking}
                      size="lg"
                      className="gap-2"
                    >
                      <MessageSquare className="w-5 h-5" />
                      전송
                    </Button>
                  </div>

                  {/* 종료 버튼 */}
                  <Button
                    onClick={endConversation}
                    variant="destructive"
                    size="lg"
                    className="w-full gap-2"
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
            </div>
          </Card>
          )}

          {/* 타임라인 패널 */}
            {showTimeline && messages.length > 0 && (
              <div className="fixed right-4 top-20 z-[100]">
                <SessionTimeline 
                  messages={messages}
                  sessionStartTime={sessionStartTime}
                  onDownload={downloadConversation}
                />
              </div>
            )}

            {/* 감정 분석 버튼 - 채팅창 바깥쪽 좌측 하단 */}
            {isConnected && (
              <div className="fixed left-4 bottom-4 flex flex-col gap-2 z-40">
                <Button
                  onClick={() => setShowEmotionChart(!showEmotionChart)}
                  variant={showEmotionChart ? "default" : "outline"}
                  size="sm"
                  className="gap-2 shadow-lg bg-background/90 backdrop-blur-sm"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>감정 분석</span>
                </Button>
              </div>
            )}

            {/* 감정 트렌드 차트 */}
            {showEmotionChart && emotionHistory.length > 0 && (
              <div className="fixed left-4 top-20 z-[100]">
                <div className="relative">
                  <Button
                    onClick={() => setShowEmotionChart(false)}
                    variant="ghost"
                    size="icon"
                    className="absolute -top-2 -right-2 z-10 bg-background shadow-md rounded-full w-8 h-8"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  <EmotionTrendChart emotionHistory={emotionHistory} />
                </div>
              </div>
            )}

          {/* Info */}
          {!isUICollapsed && (
          <div className="bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-xl p-4 max-w-md">
            <p className="text-foreground/90 text-base md:text-lg text-center leading-relaxed">
              💬 마이크 권한을 허용하고 대화를 시작하세요.<br />
              AI가 자동으로 음성을 인식하고 응답합니다.
            </p>
            <p className="text-foreground/70 text-sm text-center mt-3">
              ✨ 비밀 보장 • 편하게 스트레스 풀어내세요
            </p>
          </div>
          )}
        </div>
        
        {/* 그룹 참여자 목록 */}
        {groupMode && groupUsers.length > 0 && (
          <GroupUserList users={groupUsers} currentUser={userName} />
        )}
        
        {isRecording && (
          <div className="fixed top-4 right-4 bg-destructive/90 text-destructive-foreground px-4 py-2 rounded-lg flex items-center gap-2 animate-pulse">
            <div className="w-3 h-3 bg-destructive-foreground rounded-full" />
            녹음 중
          </div>
        )}
        
        {/* 그림 그리기 패널 */}
        {showDrawingPanel && (
          <Drawing3DPanel
            onClose={() => setShowDrawingPanel(false)}
            onImageConverted={(imageUrl) => {
              const newCube = {
                id: `cube-${Date.now()}`,
                imageUrl: imageUrl
              };
              setFloatingCubes(prev => [...prev, newCube]);
            }}
          />
        )}
      </CounselingRoom>
      
      <RecordingConsent open={showRecordingConsent} onConsent={handleRecordingConsent} />
      
      {/* SCT 분석 결과 모달 */}
      {showAnalysisResult && sctAnalysisResult && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <Card className="bg-background p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">SCT 상담 분석 결과</h2>
                <Button
                  onClick={() => {
                    setShowAnalysisResult(false);
                    setSctAnalysisResult(null);
                  }}
                  variant="ghost"
                  size="icon"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              <SCTVisualization result={sctAnalysisResult} />
              <div className="mt-6 flex justify-end gap-3">
                <Button
                  onClick={() => navigate('/')}
                  variant="outline"
                >
                  홈으로
                </Button>
                <Button
                  onClick={() => {
                    setShowAnalysisResult(false);
                    setSctAnalysisResult(null);
                  }}
                >
                  확인
                </Button>
              </div>
            </Card>
          </div>
        </div>
      )}
      
      {/* 방 이동 UI */}
      {showRoomTransition && (
        <RoomTransitionUI
          currentRoom={selectedRoom}
          onSelectRoom={(room) => {
            setSelectedRoom(room);
            setShowRoomTransition(false);
            setWasDismissed(false); // 방을 선택하면 취소 상태 초기화
            toast({
              title: "방 이동",
              description: `${roomOptions.find(r => r.id === room)?.name}(으)로 이동합니다.`,
            });
          }}
          onClose={() => {
            setShowRoomTransition(false);
            setWasDismissed(true); // 취소 버튼을 눌렀음을 표시
          }}
        />
      )}
    </div>
  );
};

export default MetaverseVoiceCounseling;
