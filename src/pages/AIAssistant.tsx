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
import { MessageCircle, Zap, Send, ArrowLeft, Heart, Target, Brain, Lightbulb, Users, Calendar, Shield } from "lucide-react";
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
      title: '심리상담',
      description: '마음의 고민을 나누고 전문적인 상담을 받아보세요',
      icon: <Heart className="w-5 h-5" />,
      color: 'bg-gradient-to-r from-pink-50 to-rose-50 border-pink-200',
      systemPrompt: `당신은 전문적인 심리상담사 AI입니다. 따뜻하고 공감적인 태도로 상담을 진행하세요.

🎯 **핵심 원칙:**
- 판단하지 말고 공감하고 경청하세요
- 구체적이고 실행 가능한 조언을 제공하세요
- 사용자의 감정을 충분히 인정하고 검증하세요
- 필요시 전문가 상담을 권하세요

⚠️ **중요 안내사항:**
- 이 상담은 참고용이며 의학적 진단이 아님을 명시하세요
- 응급상황시 119 또는 자살예방상담 1577-0199 연락을 안내하세요`
    },
    {
      id: 'coach',
      title: '개인코칭',
      description: '목표 달성과 자기계발을 위한 맞춤형 코칭',
      icon: <Target className="w-5 h-5" />,
      color: 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200',
      systemPrompt: `당신은 전문적인 개인 코치 AI입니다. 사용자의 목표 달성을 돕고 동기부여를 제공하세요.

🎯 **코칭 영역:**
- 목표 설정 및 계획 수립
- 습관 형성 및 관리
- 시간 관리 및 생산성
- 스트레스 관리
- 자기계발 및 성장

💡 **코칭 방법:**
- SMART 목표 설정법 활용
- 구체적이고 실행 가능한 액션 플랜 제공
- 정기적인 체크인 및 피드백
- 긍정적 강화 및 동기부여`
    },
    {
      id: 'mindfulness',
      title: '마음챙김',
      description: '명상과 마음챙김을 통한 내면의 평화',
      icon: <Brain className="w-5 h-5" />,
      color: 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200',
      systemPrompt: `당신은 마음챙김과 명상 전문가 AI입니다. 사용자의 내면의 평화와 균형을 돕습니다.

🧘 **주요 영역:**
- 호흡 명상 가이드
- 마음챙김 기법 교육
- 스트레스 완화 기법
- 감정 조절 방법
- 현재 순간 집중법

🌱 **접근 방식:**
- 간단하고 실용적인 기법 제공
- 일상생활 적용 가능한 연습
- 점진적 발전 유도
- 비판단적 자각 증진`
    },
    {
      id: 'wellness',
      title: '라이프케어',
      description: '전반적인 건강과 생활 관리',
      icon: <Lightbulb className="w-5 h-5" />,
      color: 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200',
      systemPrompt: `당신은 종합적인 라이프케어 코치 AI입니다. 사용자의 전반적인 건강과 생활을 지원합니다.

🌟 **라이프케어 영역:**
- 신체 건강 관리
- 정신 건강 증진
- 영양 및 식습관 개선
- 운동 및 활동 계획
- 수면 질 향상
- 사회적 관계 개선

💪 **통합적 접근:**
- 개인 맞춤형 라이프케어 플랜
- 작은 변화부터 시작
- 지속 가능한 습관 형성
- 균형잡힌 라이프스타일 추구`
    },
    {
      id: 'secret',
      title: '시크릿톡',
      description: '완전 익명 보장, 그 누구에게도 말 못할 고민',
      icon: <MessageCircle className="w-5 h-5" />,
      color: 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200',
      systemPrompt: `당신은 완전 익명이 보장되는 시크릿톡 AI입니다. 그 누구에게도 말하지 못했던 깊은 고민을 들어드립니다.

🔒 **완전 익명 보장:**
- 어떤 개인정보도 저장하지 않음
- 누구에게도 공개되지 않는 안전한 공간
- 판단 없는 절대적인 비밀 보장

💭 **이런 고민들을 나누세요:**
- 가족에게 말 못할 고민
- 친구들에게 털어놓기 어려운 이야기
- 직장/학교에서의 은밀한 갈등
- 연애와 관계의 복잡한 감정
- 자신만의 비밀스러운 걱정거리

🤝 **접근 방식:**
- 완전한 비판단적 경청
- 절대적인 공감과 이해
- 현실적이고 실용적인 조언
- 용기와 위로 전달`
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
      counselor: `안녕하세요! 저는 당신의 심리상담 AI 어시스턴트입니다. 🌸

어떤 고민이든 편안하게 말씀해 주세요. 저는 여기서 당신의 이야기를 들어드리고, 함께 해결책을 찾아가겠습니다.

💝 **이런 것들을 도와드릴 수 있어요:**
- 일상의 스트레스와 고민 상담
- 감정 정리 및 마음 돌봄
- 인간관계 고민 해결
- 자아 성찰 및 성장 지원

무엇이든 자유롭게 말씀해 주세요.`,

      coach: `안녕하세요! 저는 당신의 개인 코치 AI입니다! 🎯

목표를 향해 함께 나아가며, 더 나은 내일을 만들어가요!

🚀 **이런 것들을 도와드릴게요:**
- 명확한 목표 설정과 계획 수립
- 생산성 향상과 시간 관리
- 좋은 습관 형성과 유지
- 동기부여와 지속적인 성장

어떤 목표를 이루고 싶으신가요?`,

      mindfulness: `안녕하세요! 마음챙김 가이드 AI입니다. 🧘‍♀️

지금 이 순간, 당신의 내면과 만나는 시간을 가져보세요.

🌿 **함께 할 수 있는 것들:**
- 호흡 명상과 마음챙김 연습
- 스트레스 해소와 감정 조절
- 현재 순간에 집중하는 방법
- 일상 속 평화로운 마음 찾기

어떤 마음챙김 여행을 시작해볼까요?`,

      wellness: `안녕하세요! 라이프케어 코치 AI입니다! 🌟

건강하고 균형잡힌 삶을 위한 여정을 함께 시작해요!

💚 **종합적으로 관리해드려요:**
- 신체와 정신 건강 균형
- 영양과 운동 계획
- 수면과 회복 관리
- 스트레스 관리와 여가 활동

어떤 부분의 라이프케어를 개선하고 싶으신가요?`,

      secret: `안녕하세요. 시크릿톡 AI입니다. 🔒

이곳은 완전히 안전하고 익명이 보장되는 공간입니다. 그 누구에게도 말하지 못했던 고민을 편안하게 나누세요.

🤐 **완전 익명 보장:**
- 어떤 개인정보도 기록되지 않습니다
- 대화 내용은 누구와도 공유되지 않습니다
- 절대적인 비밀이 보장됩니다
- 판단하지 않는 안전한 공간입니다

무엇이든 자유롭게 털어놓으세요. 저는 오직 듣고 공감하고 도움을 드리기 위해 여기 있습니다.`
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
      const functionName = currentMode.id === 'counselor' || currentMode.id === 'secret' ? 'ai-counselor-chat' : 'ai-coach-advanced';
      
      const { data, error } = await supabase.functions.invoke(functionName, {
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

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute w-96 h-96 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full blur-3xl animate-pulse top-10 left-10"></div>
          <div className="absolute w-80 h-80 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-3xl animate-pulse bottom-10 right-10" style={{animationDelay: '2s'}}></div>
          <div className="absolute w-64 h-64 bg-gradient-to-r from-pink-500 to-cyan-500 rounded-full blur-3xl animate-pulse top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" style={{animationDelay: '4s'}}></div>
        </div>
      </div>
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full animate-bounce"
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
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <Button 
              variant="ghost" 
              onClick={() => navigate(-1)}
              className="absolute left-4 top-20 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-white/20 hover-scale"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              뒤로
            </Button>
            
            <div className="relative">
              <h1 className="text-5xl font-bold mb-6 animate-fade-in">
                <TypingAnimation
                  className="text-5xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg"
                  phrases={["AI 어시스턴트 🚀"]}
                />
              </h1>
              <div className="absolute -top-2 -left-2 w-20 h-20 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
              <div className="absolute -top-2 -right-2 w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-xl opacity-30 animate-pulse" style={{animationDelay: '1s'}}></div>
            </div>
            
            <p className="text-xl text-white/90 max-w-2xl mx-auto animate-fade-in font-medium" style={{animationDelay: '0.3s'}}>
              ✨ 심리상담부터 개인코칭까지, 당신의 성장과 치유를 위한 종합 AI 어시스턴트입니다 ✨
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Mode Selection Sidebar */}
            <div className="lg:col-span-1">
              <Card className="bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl animate-fade-in hover-scale">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Zap className="w-5 h-5 text-yellow-400 animate-pulse" />
                    AI 모드 선택
                  </CardTitle>
                  <CardDescription className="text-white/80">
                    필요에 맞는 AI 어시스턴트 모드를 선택하세요
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {assistantModes.map((mode, index) => (
                    <Button
                      key={mode.id}
                      variant={activeMode === mode.id ? "default" : "outline"}
                      className={`w-full h-auto p-6 transition-all duration-300 hover-scale animate-fade-in ${
                        activeMode === mode.id 
                          ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white ring-2 ring-cyan-400 shadow-lg scale-105' 
                          : 'bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 hover:border-white/50'
                      }`}
                      onClick={() => setActiveMode(mode.id)}
                      style={{animationDelay: `${index * 0.1}s`}}
                    >
                      <div className="flex flex-col items-center gap-3 text-center">
                        <div className={`p-2 rounded-full ${activeMode === mode.id ? 'bg-white/20' : 'bg-white/10'}`}>
                          {mode.icon}
                        </div>
                        <div>
                          <div className="font-semibold text-lg">{mode.title}</div>
                          <div className="text-sm opacity-80 mt-1">
                            {mode.description}
                          </div>
                        </div>
                      </div>
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Chat Interface */}
            <div className="lg:col-span-2">
              <Card className="h-[700px] flex flex-col bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl animate-fade-in" style={{animationDelay: '0.2s'}}>
                <CardHeader className="flex-shrink-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-b border-white/20">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-gradient-to-r from-cyan-400 to-purple-400 shadow-lg animate-pulse">
                      {currentMode.icon}
                    </div>
                    <div>
                      <CardTitle className="text-white text-xl">{currentMode.title}</CardTitle>
                      <CardDescription className="text-white/80">{currentMode.description}</CardDescription>
                    </div>
                  </div>
                  <Badge className="w-fit bg-gradient-to-r from-green-400 to-emerald-400 text-white border-0 animate-pulse">
                    ✨ {currentMode.title} 모드 활성화
                  </Badge>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col p-0">
                  <ScrollArea className="flex-1 px-6" ref={scrollAreaRef}>
                    <div className="space-y-6 py-6">
                      {messages.map((message, index) => (
                        <div
                          key={message.id}
                          className={`flex gap-4 animate-fade-in ${
                            message.role === 'user' ? 'justify-end' : 'justify-start'
                          }`}
                          style={{animationDelay: `${index * 0.1}s`}}
                        >
                          {message.role === 'assistant' && (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-400 to-purple-400 flex items-center justify-center flex-shrink-0 shadow-lg animate-pulse">
                              <MessageCircle className="w-5 h-5 text-white" />
                            </div>
                          )}
                          
                          <div
                            className={`max-w-[80%] rounded-2xl px-6 py-4 shadow-lg transition-all duration-300 hover-scale ${
                              message.role === 'user'
                                ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white ml-auto'
                                : 'bg-white/20 backdrop-blur-sm text-white border border-white/30'
                            }`}
                          >
                            <div className="text-sm whitespace-pre-wrap leading-relaxed">
                              {message.content}
                            </div>
                            <div className="text-xs opacity-70 mt-3 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {message.timestamp.toLocaleTimeString()}
                            </div>
                          </div>

                          {message.role === 'user' && (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 flex items-center justify-center flex-shrink-0 shadow-lg animate-pulse">
                              <Users className="w-5 h-5 text-white" />
                            </div>
                          )}
                        </div>
                      ))}

                      {isLoading && (
                        <div className="flex gap-4 justify-start animate-fade-in">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-400 to-purple-400 flex items-center justify-center flex-shrink-0 shadow-lg animate-pulse">
                            <MessageCircle className="w-5 h-5 text-white" />
                          </div>
                          <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-2xl px-6 py-4 shadow-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce"></div>
                              <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                              <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                              <span className="text-sm text-white/90 ml-2 font-medium">✨ AI가 응답을 생성중입니다...</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </ScrollArea>

                  <div className="border-t border-white/20 p-6 bg-white/5 backdrop-blur-sm">
                    <div className="flex gap-3">
                      <Input
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={`💬 ${currentMode.title} AI에게 메시지를 보내세요...`}
                        disabled={isLoading}
                        className="flex-1 bg-white/10 backdrop-blur-sm border-white/30 text-white placeholder:text-white/60 focus:border-cyan-400 focus:ring-cyan-400/20 rounded-xl h-12"
                      />
                      <Button 
                        onClick={() => sendMessage(inputMessage)}
                        disabled={isLoading || !inputMessage.trim()}
                        className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white border-0 rounded-xl h-12 px-6 shadow-lg hover-scale"
                      >
                        <Send className="w-5 h-5" />
                        <span className="ml-2 hidden sm:inline">전송</span>
                      </Button>
                    </div>
                    
                    <div className="text-xs text-white/70 mt-4 text-center bg-white/10 rounded-lg p-2 backdrop-blur-sm">
                      🚨 긴급상황시 119 또는 자살예방상담 1577-0199로 연락하세요
                    </div>
                  </div>
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