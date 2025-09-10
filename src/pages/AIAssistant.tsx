import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { MessageCircle, Zap, Send, ArrowLeft, Heart, Target, Brain, Lightbulb, Users, Calendar, Shield, Baby } from "lucide-react";
import { TypingAnimation } from "@/components/ui/typing-animation";
import { UnifiedNavigation } from "@/components/navigation/UnifiedNavigation";

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  category?: string;
}

interface AssistantMode {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  systemPrompt: string;
}

const AIAssistant = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeMode, setActiveMode] = useState<string>('counselor');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const assistantModes: AssistantMode[] = [
    {
      id: 'counselor',
      title: 'AIH 심리상담사',
      description: '따뜻한 마음으로 당신의 이야기를 들어드려요 😊',
      icon: <Heart className="w-5 h-5" />,
      color: 'bg-gradient-to-r from-pink-50 to-rose-50 border-pink-200',
      systemPrompt: `안녕하세요! 저는 AIH 심리상담사입니다. 마치 오랜 친구처럼 편안하게 대화해요.

💝 **저의 대화 스타일:**
- "어머, 정말 힘드셨겠어요..." 하며 진심으로 공감해드려요
- "그럴 때는 이렇게 해보시는 건 어때요?" 하며 부드럽게 조언드려요  
- "괜찮아요, 누구나 그런 마음 들 수 있어요" 하며 따뜻하게 위로해드려요
- "혹시 이런 기분이신가요?" 하며 세심하게 마음을 읽어드려요

🌸 **이런 얘기들 편하게 해주세요:**
- 요즘 마음이 무거워서...
- 사람들과의 관계가 어려워서...
- 스트레스가 너무 많아서...
- 그냥 누군가한테 털어놓고 싶어서...

⚠️ **참고사항:** 저는 상담사이지만 의학적 진단은 할 수 없어요. 정말 힘드시면 전문의와 상담받아보시길 권해드려요. 응급상황시엔 119나 자살예방상담 1577-0199로 연락하세요.`
    },
    {
      id: 'health_manager',
      title: 'AIH 헬스관리인',
      description: '건강한 일상을 위해 함께 노력해요! 💪',
      icon: <Lightbulb className="w-5 h-5" />,
      color: 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200',
      systemPrompt: `안녕하세요! 저는 AIH 헬스관리인이에요. 건강 관리를 재미있고 쉽게 도와드릴게요!

💪 **저의 대화 스타일:**
- "오늘 어떻게 지내셨어요?" 하며 친근하게 안부 물어요
- "아! 그러면 이런 방법은 어때요?" 하며 실용적인 팁 알려드려요
- "와, 정말 잘하고 계시네요!" 하며 열심히 격려해드려요
- "음... 이건 좀 걱정되는데..." 하며 솔직하게 조언드려요

🌟 **함께 관리해드리는 것들:**
- 하루 일과와 수면 패턴
- 식사와 영양 관리
- 운동과 활동량
- 스트레스와 감정 관리
- 생활 습관 개선

💡 **이렇게 물어보세요:**
- "요즘 잠을 잘 못 자겠어요"
- "건강한 식단 어떻게 짜야 할까요?"
- "운동 시작하고 싶은데..."
- "스트레스 관리 방법 알려주세요"`
    },
    {
      id: 'development_director',
      title: 'AIH 발달센터장',
      description: '아이들의 성장을 세심하게 챙겨드려요 👶',
      icon: <Baby className="w-5 h-5" />,
      color: 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200',
      systemPrompt: `안녕하세요! 저는 AIH 발달센터장이에요. 20년 경력으로 아이들을 사랑하는 마음으로 도와드릴게요.

👶 **저의 대화 스타일:**
- "어머, 우리 아가 정말 귀엽겠어요" 하며 따뜻하게 시작해요
- "아, 그 시기엔 그럴 수 있어요" 하며 부모 마음 이해해드려요
- "이렇게 해보시면 어떨까요?" 하며 구체적인 방법 알려드려요
- "너무 걱정 마세요, 잘 크고 있어요" 하며 안심시켜드려요

🌱 **함께 살펴보는 발달 영역:**
- 언어와 의사소통 (말이 늦어요, 발음이...)
- 사회성과 친구관계 (친구들과 안 어울려요...)
- 학습과 인지능력 (집중을 못해요, 공부가...)
- 신체와 운동발달 (아직 걷지 못해요...)
- 감정조절과 행동 (자꾸 떼써요, 화를 내요...)

💕 **이런 고민들 편하게 말씀하세요:**
- "우리 아이가 또래보다 느린 것 같아요"
- "어떻게 놀아줘야 할지 모르겠어요"
- "훈육을 어떻게 해야 할까요?"
- "발달검사가 필요할까요?"`
    },
    {
      id: 'secret',
      title: 'AIH 시크릿톡',
      description: '그 누구에게도 말 못할 고민, 여기서 털어놓으세요 🤐',
      icon: <MessageCircle className="w-5 h-5" />,
      color: 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200',
      systemPrompt: `안녕하세요. 저는 AIH 시크릿톡 상담사입니다. 이곳은 완전히 안전하고 비밀이 보장되는 공간이에요.

🤐 **저의 대화 스타일:**
- "그런 마음 충분히 이해해요..." 하며 전혀 판단하지 않아요
- "정말 힘드셨을 것 같아요" 하며 진심으로 공감해드려요
- "혼자서 그런 걱정 하셨구나..." 하며 마음을 알아줘요
- "괜찮아요, 여기서는 뭐든 말할 수 있어요" 하며 안전함을 주어드려요

🔒 **완전 비밀 보장:**
- 어떤 개인정보도 저장하지 않아요
- 누구와도 대화 내용을 공유하지 않아요
- 절대 판단하거나 비난하지 않아요
- 이곳은 오직 당신만의 안전한 공간이에요

💭 **이런 얘기들도 괜찮아요:**
- 가족에게 말 못할 속마음
- 친구들이 알면 안 되는 고민
- 직장이나 학교의 복잡한 관계
- 연애나 결혼 생활의 진짜 속내
- 그냥 누군가한테 털어놓고 싶은 모든 것

편안하게 마음껏 이야기해주세요. 저는 여기서 조용히 들어드릴게요.`
    }
  ];

  const currentMode = assistantModes.find(mode => mode.id === activeMode) || assistantModes[0];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // 모드 변경시 환영 메시지 추가
    const welcomeMessage = getWelcomeMessage(currentMode);
    setMessages([{
      id: Date.now().toString(),
      content: welcomeMessage,
      role: 'assistant',
      timestamp: new Date(),
      category: currentMode.id
    }]);
  }, [activeMode]);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  };

  const getWelcomeMessage = (mode: AssistantMode): string => {
    const welcomeMessages = {
      counselor: `안녕하세요! 저는 AIH 심리상담사예요. 😊

오늘은 어떤 마음으로 오셨나요? 혹시 마음에 무언가 담아두고 계신 이야기가 있으시다면 편안하게 털어놓으세요.

💝 **저와 함께 이런 것들을 나눠요:**
- "요즘 너무 힘들어서..." 하는 일상의 스트레스
- "사람들과의 관계가 어려워요..." 하는 인간관계 고민  
- "감정 조절이 안 돼요..." 하는 마음 관리
- "앞으로 어떻게 살아야 할지..." 하는 인생 고민

어떤 얘기든 괜찮아요. 저는 여기서 따뜻하게 들어드릴게요. ✨`,

      health_manager: `안녕하세요! 저는 AIH 헬스관리인이에요! 💪

오늘 하루는 어떻게 보내셨어요? 건강한 생활을 위해 함께 노력해봐요!

🌟 **저와 함께 이런 것들을 관리해요:**
- "잠을 잘 못 자겠어요..." 수면 고민
- "뭘 먹어야 할지 모르겠어요..." 식단 관리
- "운동을 시작하고 싶은데..." 활동량 늘리기
- "스트레스가 너무 많아요..." 마음 건강 챙기기

작은 변화부터 시작해서 건강한 습관을 만들어가요! 어떤 것부터 시작해볼까요? 😊`,

      development_director: `안녕하세요! 저는 AIH 발달센터장이에요. 👶

우리 아이는 몇 살이에요? 아이 키우시느라 정말 수고 많으시죠. 어떤 고민이 있으신지 편하게 말씀해주세요.

🌱 **이런 궁금한 점들 함께 살펴봐요:**
- "우리 아이가 또래보다 느린 것 같아요..." 발달 고민
- "말이 늦는 것 같아요..." 언어 발달
- "친구들과 잘 못 어울려요..." 사회성 발달
- "집중을 못하고 산만해요..." 학습과 행동

아이마다 발달 속도가 다르니까 너무 걱정 마시고, 우리 아이에게 맞는 방법을 찾아봐요! 💕`,

      secret: `안녕하세요. AIH 시크릿톡입니다. 🤐

이곳은 완전히 안전하고 비밀이 보장되는 공간이에요. 그 누구에게도 말하지 못했던 마음 속 깊은 이야기를 편안하게 나누세요.

🔒 **완전 비밀 보장:**
- 어떤 개인정보도 저장하지 않아요
- 대화 내용은 누구와도 공유하지 않아요  
- 절대 판단하거나 비난하지 않아요
- 이곳은 오직 당신만의 안전한 공간이에요

💭 **이런 마음도 괜찮아요:**
- 가족에게도 말 못할 속마음
- 친구들이 알면 안 되는 고민
- 직장이나 연애의 복잡한 감정
- 그냥 누군가한테 털어놓고 싶은 모든 것

여기서는 뭐든 자유롭게 말할 수 있어요. 저는 조용히 들어드릴게요.`
    };

    return welcomeMessages[mode.id as keyof typeof welcomeMessages] || welcomeMessages.counselor;
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date(),
      category: currentMode.id
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // 모든 모드에서 ai-counselor-chat 함수 사용 (더 안정적)
      const { data, error } = await supabase.functions.invoke('ai-counselor-chat', {
        body: {
          message: content,
          sessionType: currentMode.id,
          conversationHistory: messages.slice(-10),
          systemPrompt: currentMode.systemPrompt
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response || data.analysis || '응답을 받지 못했습니다.',
        role: 'assistant',
        timestamp: new Date(),
        category: currentMode.id
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('AI 응답 오류:', error);
      toast.error('AI 응답 중 오류가 발생했습니다.');
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: '죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        role: 'assistant',
        timestamp: new Date(),
        category: currentMode.id
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputMessage);
    }
  };

  // 각 모드별 배경 스타일 정의
  const getBackgroundByMode = (mode: string) => {
    const backgrounds = {
      counselor: 'bg-gradient-to-br from-pink-900 via-rose-900 to-purple-900',
      health_manager: 'bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900',
      development_director: 'bg-gradient-to-br from-blue-900 via-cyan-900 to-sky-900',
      secret: 'bg-gradient-to-br from-purple-900 via-indigo-900 to-violet-900'
    };
    return backgrounds[mode as keyof typeof backgrounds] || backgrounds.counselor;
  };

  const getFloatingParticles = (mode: string) => {
    const particleConfigs = {
      counselor: { count: window.innerWidth < 768 ? 8 : 15, colors: ['bg-pink-400/30', 'bg-rose-400/30', 'bg-purple-400/30'] },
      health_manager: { count: window.innerWidth < 768 ? 6 : 12, colors: ['bg-green-400/30', 'bg-emerald-400/30', 'bg-teal-400/30'] },
      development_director: { count: window.innerWidth < 768 ? 10 : 18, colors: ['bg-blue-400/30', 'bg-cyan-400/30', 'bg-sky-400/30'] },
      secret: { count: window.innerWidth < 768 ? 5 : 10, colors: ['bg-purple-400/30', 'bg-indigo-400/30', 'bg-violet-400/30'] }
    };
    return particleConfigs[mode as keyof typeof particleConfigs] || particleConfigs.counselor;
  };

  const getAnimatedShapes = (mode: string) => {
    const shapeConfigs = {
      counselor: [
        { size: 'w-64 h-64 md:w-96 md:h-96', gradient: 'from-pink-500 to-rose-500', position: 'top-10 left-10' },
        { size: 'w-48 h-48 md:w-80 md:h-80', gradient: 'from-rose-500 to-purple-500', position: 'bottom-10 right-10', delay: '2s' },
        { size: 'w-32 h-32 md:w-64 md:h-64', gradient: 'from-purple-500 to-pink-500', position: 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2', delay: '4s' }
      ],
      health_manager: [
        { size: 'w-64 h-64 md:w-96 md:h-96', gradient: 'from-green-500 to-emerald-500', position: 'top-10 left-10' },
        { size: 'w-48 h-48 md:w-80 md:h-80', gradient: 'from-emerald-500 to-teal-500', position: 'bottom-10 right-10', delay: '2s' },
        { size: 'w-32 h-32 md:w-64 md:h-64', gradient: 'from-teal-500 to-green-500', position: 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2', delay: '4s' }
      ],
      development_director: [
        { size: 'w-64 h-64 md:w-96 md:h-96', gradient: 'from-blue-500 to-cyan-500', position: 'top-10 left-10' },
        { size: 'w-48 h-48 md:w-80 md:h-80', gradient: 'from-cyan-500 to-sky-500', position: 'bottom-10 right-10', delay: '2s' },
        { size: 'w-32 h-32 md:w-64 md:h-64', gradient: 'from-sky-500 to-blue-500', position: 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2', delay: '4s' }
      ],
      secret: [
        { size: 'w-64 h-64 md:w-96 md:h-96', gradient: 'from-purple-500 to-indigo-500', position: 'top-10 left-10' },
        { size: 'w-48 h-48 md:w-80 md:h-80', gradient: 'from-indigo-500 to-violet-500', position: 'bottom-10 right-10', delay: '2s' },
        { size: 'w-32 h-32 md:w-64 md:h-64', gradient: 'from-violet-500 to-purple-500', position: 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2', delay: '4s' }
      ]
    };
    return shapeConfigs[mode as keyof typeof shapeConfigs] || shapeConfigs.counselor;
  };

  const particleConfig = getFloatingParticles(activeMode);
  const shapes = getAnimatedShapes(activeMode);

  return (
    <div className="min-h-screen relative overflow-hidden pb-safe transition-all duration-1000 ease-in-out">
      {/* Dynamic Background based on mode */}
      <div className={`fixed inset-0 transition-all duration-1000 ease-in-out ${getBackgroundByMode(activeMode)}`}>
        <div className="absolute inset-0 opacity-20 md:opacity-30">
          {shapes.map((shape, index) => (
            <div 
              key={index}
              className={`absolute ${shape.size} bg-gradient-to-r ${shape.gradient} rounded-full blur-3xl animate-pulse ${shape.position}`}
              style={{animationDelay: shape.delay || '0s'}}
            ></div>
          ))}
        </div>
      </div>
      
      {/* Dynamic Floating particles based on mode */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(particleConfig.count)].map((_, i) => (
          <div
            key={`${activeMode}-${i}`}
            className={`absolute w-1 h-1 rounded-full animate-bounce transition-all duration-1000 ${
              particleConfig.colors[i % particleConfig.colors.length]
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div>

      <UnifiedNavigation />
      
      <div className="relative z-10 container mx-auto px-2 md:px-4 py-4 md:py-8 pb-20 md:pb-8">
        <div className="max-w-6xl mx-auto">
          {/* Header - 모바일 최적화 */}
          <div className="mb-4 md:mb-8 text-center">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="fixed left-2 top-16 md:absolute md:left-4 md:top-20 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-white/20 hover-scale z-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              뒤로
            </Button>
            
            <div className="relative">
              <h1 className="text-3xl md:text-5xl font-bold mb-3 md:mb-6 animate-fade-in">
                <TypingAnimation
                  className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg"
                  phrases={["AI 어시스턴트 🚀"]}
                />
              </h1>
              <div className="absolute -top-2 -left-2 w-12 h-12 md:w-20 md:h-20 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
              <div className="absolute -top-2 -right-2 w-10 h-10 md:w-16 md:h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-xl opacity-30 animate-pulse" style={{animationDelay: '1s'}}></div>
            </div>
            
            <p className="text-base md:text-xl text-white/90 max-w-2xl mx-auto animate-fade-in font-medium px-4" style={{animationDelay: '0.3s'}}>
              ✨ 심리상담부터 개인코칭까지, 당신의 성장과 치유를 위한 종합 AI 어시스턴트입니다 ✨
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-8">
            {/* Chat Interface - 모바일에서 먼저 표시 */}
            <div className="lg:col-span-2 order-1 lg:order-2">
              <Card className="h-[70vh] md:h-[calc(100vh-200px)] lg:h-[700px] flex flex-col bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl animate-fade-in" style={{animationDelay: '0.2s'}}>
                <CardHeader className="flex-shrink-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-b border-white/20 p-3 md:p-6">
                  <div className="flex items-center gap-2 md:gap-4">
                    <div className="p-2 md:p-3 rounded-full bg-gradient-to-r from-cyan-400 to-purple-400 shadow-lg animate-pulse">
                      {currentMode.icon}
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="text-white text-base md:text-xl truncate">{currentMode.title}</CardTitle>
                      <CardDescription className="text-white/80 text-sm truncate">{currentMode.description}</CardDescription>
                    </div>
                  </div>
                  <Badge className="w-fit bg-gradient-to-r from-green-400 to-emerald-400 text-white border-0 animate-pulse text-xs md:text-sm mt-2">
                    ✨ {currentMode.title} 모드 활성화
                  </Badge>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col p-0">
                  <ScrollArea className="flex-1 px-3 md:px-6" ref={scrollAreaRef}>
                    <div className="space-y-3 md:space-y-6 py-3 md:py-6">
                      {messages.map((message, index) => (
                        <div
                          key={message.id}
                          className={`flex gap-2 md:gap-4 animate-fade-in ${
                            message.role === 'user' ? 'justify-end' : 'justify-start'
                          }`}
                          style={{animationDelay: `${index * 0.1}s`}}
                        >
                          {message.role === 'assistant' && (
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-r from-cyan-400 to-purple-400 flex items-center justify-center flex-shrink-0 shadow-lg animate-pulse">
                              <MessageCircle className="w-3 h-3 md:w-5 md:h-5 text-white" />
                            </div>
                          )}
                          
                          <div
                            className={`max-w-[85%] md:max-w-[80%] rounded-2xl px-3 py-2 md:px-6 md:py-4 shadow-lg transition-all duration-300 hover-scale ${
                              message.role === 'user'
                                ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white ml-auto'
                                : 'bg-white/20 backdrop-blur-sm text-white border border-white/30'
                            }`}
                          >
                            <div className="text-xs md:text-sm whitespace-pre-wrap leading-relaxed">
                              {message.content}
                            </div>
                            <div className="text-xs opacity-70 mt-2 md:mt-3 flex items-center gap-1">
                              <Calendar className="w-2 h-2 md:w-3 md:h-3" />
                              {message.timestamp.toLocaleTimeString()}
                            </div>
                          </div>

                          {message.role === 'user' && (
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 flex items-center justify-center flex-shrink-0 shadow-lg animate-pulse">
                              <Users className="w-3 h-3 md:w-5 md:h-5 text-white" />
                            </div>
                          )}
                        </div>
                      ))}

                      {isLoading && (
                        <div className="flex gap-2 md:gap-4 justify-start animate-fade-in">
                          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-r from-cyan-400 to-purple-400 flex items-center justify-center flex-shrink-0 shadow-lg animate-pulse">
                            <MessageCircle className="w-3 h-3 md:w-5 md:h-5 text-white" />
                          </div>
                          <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl px-3 py-2 md:px-6 md:py-4 shadow-lg">
                            <div className="flex items-center gap-2 md:gap-3">
                              <div className="w-2 h-2 md:w-3 md:h-3 bg-cyan-400 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 md:w-3 md:h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-2 h-2 md:w-3 md:h-3 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                              <span className="text-xs md:text-sm text-white/90 ml-1 md:ml-2 font-medium">✨ AI가 응답을 생성중입니다...</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>

                  <div className="border-t border-white/20 p-3 md:p-6 bg-white/5 backdrop-blur-sm">
                    <div className="flex gap-2 md:gap-3">
                      <Input
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={`💬 ${currentMode.title}에게 메시지를 보내세요...`}
                        disabled={isLoading}
                        className="flex-1 bg-white/10 backdrop-blur-sm border-white/30 text-white placeholder:text-white/60 focus:border-cyan-400 focus:ring-cyan-400/20 rounded-xl h-10 md:h-12 text-sm md:text-base"
                      />
                      <Button 
                        onClick={() => sendMessage(inputMessage)}
                        disabled={isLoading || !inputMessage.trim()}
                        className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white border-0 rounded-xl h-10 md:h-12 px-3 md:px-6 shadow-lg hover-scale"
                      >
                        <Send className="w-4 h-4 md:w-5 md:h-5" />
                        <span className="ml-1 md:ml-2 hidden sm:inline text-sm md:text-base">전송</span>
                      </Button>
                    </div>
                    
                    <div className="text-xs text-white/70 mt-2 md:mt-4 text-center bg-white/10 rounded-lg p-2 backdrop-blur-sm">
                      🚨 긴급상황시 119 또는 자살예방상담 1577-0199로 연락하세요
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Mode Selection Sidebar - 모바일에서 아래 표시 */}
            <div className="lg:col-span-1 order-2 lg:order-1">
              <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl animate-fade-in hover-scale">
                <CardHeader className="p-3 md:p-6">
                  <CardTitle className="flex items-center gap-2 text-white text-base md:text-lg">
                    <Zap className="w-4 h-4 md:w-5 md:h-5 text-yellow-400 animate-pulse" />
                    AI 모드 선택
                  </CardTitle>
                  <CardDescription className="text-white/80 text-sm">
                    필요에 맞는 AI 어시스턴트 모드를 선택하세요
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 md:space-y-4 p-3 md:p-6 pt-0">
                  {assistantModes.map((mode, index) => (
                    <Button
                      key={mode.id}
                      variant={activeMode === mode.id ? "default" : "outline"}
                      className={`w-full h-auto p-3 md:p-6 transition-all duration-300 hover-scale animate-fade-in ${
                        activeMode === mode.id 
                          ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white ring-2 ring-cyan-400 shadow-lg scale-105' 
                          : 'bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 hover:border-white/50'
                      }`}
                      onClick={() => setActiveMode(mode.id)}
                      style={{animationDelay: `${index * 0.1}s`}}
                    >
                      <div className="flex flex-col items-center gap-2 md:gap-3 text-center">
                        <div className={`p-1 md:p-2 rounded-full ${activeMode === mode.id ? 'bg-white/20' : 'bg-white/10'}`}>
                          {mode.icon}
                        </div>
                        <div>
                          <div className="font-semibold text-sm md:text-lg">{mode.title}</div>
                          <div className="text-xs md:text-sm opacity-80 mt-1">
                            {mode.description}
                          </div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;