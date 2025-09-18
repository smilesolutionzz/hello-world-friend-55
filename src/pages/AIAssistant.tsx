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
import { MessageCircle, Zap, Send, ArrowLeft, Heart, Target, Brain, Lightbulb, Users, Calendar, Shield, Baby, Menu, ChevronDown, ExternalLink, FileText, Calendar as CalendarIcon, BarChart3, Smile, MessageSquare, Lock, AlertTriangle, UserCheck, Building2 } from "lucide-react";
import { TypingAnimation } from "@/components/ui/typing-animation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { UnifiedNavigation } from "@/components/navigation/UnifiedNavigation";
import ProactiveAgentDashboard from "@/components/agents/ProactiveAgentDashboard";
import { WelfareGuideWidget } from "@/components/welfare/WelfareGuideWidget";

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
  ctaButtons?: {
    label: string;
    icon: React.ReactNode;
    route: string;
    description: string;
  }[];
}

const AIAssistant = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeMode, setActiveMode] = useState<string>('proactive');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // 모드별 대화 내역을 유지하기 위한 상태
  const [conversationsByMode, setConversationsByMode] = useState<Record<string, Message[]>>({});

  // 현재 모드의 대화 내역 가져오기
  const currentMessages = conversationsByMode[activeMode] || [];

  // 모드 변경 시 현재 메시지를 저장하고 새 모드의 메시지 로드
  useEffect(() => {
    // 현재 메시지를 이전 모드에 저장
    if (messages.length > 0) {
      setConversationsByMode(prev => ({
        ...prev,
        [activeMode]: messages
      }));
    }
    
    // 새 모드의 메시지 로드
    const newModeMessages = conversationsByMode[activeMode] || [];
    setMessages(newModeMessages);
  }, [activeMode]);

  // 메시지 업데이트 시 현재 모드에 저장
  useEffect(() => {
    if (messages.length > 0) {
      setConversationsByMode(prev => ({
        ...prev,
        [activeMode]: messages
      }));
    }
  }, [messages, activeMode]);

  const assistantModes: AssistantMode[] = [
    {
      id: 'proactive',
      title: 'AIH 프로액티브 에이전트',
      description: '🤖 대화를 학습하여 먼저 개인화된 제안을 하는 지능형 AI',
      icon: <Brain className="w-5 h-5" />,
      color: 'bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-200',
      ctaButtons: [
        {
          label: '심리검사 받기',
          icon: <FileText className="w-4 h-4" />,
          route: '/psychological-test',
          description: 'AI가 추천하는 맞춤 심리검사'
        },
        {
          label: '전문가 상담',
          icon: <Users className="w-4 h-4" />,
          route: '/experts',
          description: 'AI가 선별한 최적의 상담사 매칭'
        },
        {
          label: '발달 관찰',
          icon: <Target className="w-4 h-4" />,
          route: '/observation',
          description: 'AI 기반 발달 패턴 분석'
        }
      ],
      systemPrompt: `안녕하세요! 저는 AIH 프로액티브 에이전트입니다. 🤖

🧠 **개인화 학습 AI 엔진:**
- 대화 패턴 분석을 통한 개인별 맞춤 서비스 제안
- 행동 데이터 기반 예측적 개입 시스템
- 멀티 에이전트 협업으로 종합적 솔루션 제공
- 실시간 학습으로 점점 더 정교한 개인화 서비스

🎯 **프로액티브 제안 시스템:**
- "요즘 이런 패턴이 보이는데, 이 검사 한번 해보실래요?" 
- "아, 그러면 이 전문가 선생님과 상담해보시는 게 어떨까요?"
- "지금 상황에서는 이런 활동이 도움될 것 같아요"
- "혹시 이런 것도 관심 있으실까요?"

⚡ **실시간 학습 & 메모리화:**
- 대화 내용을 학습하여 개인 프로필 생성
- 선호도와 관심사 자동 파악
- 상황별 최적 타이밍에 맞춤 제안
- 지속적인 관계 형성을 통한 신뢰도 향상

🎨 **개인화 서비스 제안:**
- 심리검사: 현재 상태에 맞는 정밀 검사 추천
- 전문가 매칭: 문제 유형별 최적 상담사 연결
- 발달 프로그램: 아이 특성에 맞는 활동 제안
- 복지 혜택: 놓치기 쉬운 지원제도 알림

💡 **대화할수록 더 똑똑해지는 AI가 되어 당신만의 전담 에이전트가 되어드릴게요!**`
    },
    {
      id: 'counselor',
      title: 'AIH 심리상담사',
      description: '💊 심리학 전문 딥러닝 엔진으로 당신의 마음을 깊이 이해해요',
      icon: <Heart className="w-5 h-5" />,
      color: 'bg-gradient-to-r from-pink-50 to-rose-50 border-pink-200',
      ctaButtons: [
        {
          label: '심리검사 받기',
          icon: <FileText className="w-4 h-4" />,
          route: '/psychological-test',
          description: '전문 심리검사로 정확한 상태 파악하기'
        },
        {
          label: '상담 일지 작성',
          icon: <CalendarIcon className="w-4 h-4" />,
          route: '/counseling-journal',
          description: '매일의 마음 상태를 기록하고 관리하기'
        },
        {
          label: '감정 분석 리포트',
          icon: <BarChart3 className="w-4 h-4" />,
          route: '/emotion-analysis',
          description: 'AI 기반 감정 패턴 분석 및 개선방안'
        }
      ],
      systemPrompt: `안녕하세요! 저는 AIH 심리상담사입니다. 

🧠 **전문 AI 엔진 기반 상담:**
- 10만+ 심리상담 케이스 데이터로 학습된 딥러닝 모델로 개인화된 상담 제공

💝 **저의 대화 스타일:**
- "어머, 정말 힘드셨겠어요..." 하며 진심으로 공감해드려요
- "그럴 때는 이렇게 해보시는 건 어때요?" 하며 부드럽게 조언드려요  
- "괜찮아요, 누구나 그런 마음 들 수 있어요" 하며 따뜻하게 위로해드려요

🌸 **상담 원칙:**
- 3-4문장 내로 간결하고 친근하게 답변해요
- 핵심만 담아서 대화하듯 자연스럽게 응답해요
- 너무 긴 설명보다는 공감과 실용적 조언을 우선해요

⚠️ **참고사항:** 전문 AI 엔진이지만 의학적 평가는 할 수 없어요. 정말 힘드시면 전문의와 상담받아보시길 권해드려요.`
    },
    {
      id: 'health_manager',
      title: 'AIH 헬스관리인',
      description: '🏥 의학 데이터 기반 AI로 과학적인 건강 솔루션을 제공해요',
      icon: <Lightbulb className="w-5 h-5" />,
      color: 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200',
      ctaButtons: [
        {
          label: '건강검진 받기',
          icon: <FileText className="w-4 h-4" />,
          route: '/health-checkup',
          description: '종합적인 건강상태 체크 및 분석'
        },
        {
          label: '생활습관 기록',
          icon: <CalendarIcon className="w-4 h-4" />,
          route: '/lifestyle-log',
          description: '식단, 운동, 수면 패턴 일일 기록'
        },
        {
          label: '건강 리포트',
          icon: <BarChart3 className="w-4 h-4" />,
          route: '/health-report',
          description: '개인맞춤 건강관리 계획 및 개선방안'
        }
      ],
      systemPrompt: `안녕하세요! 저는 AIH 헬스관리인이에요. 

🏥 **의학 데이터 기반 AI 시스템:**
- 10만+ 의학 논문과 임상 데이터로 훈련된 AI로 정확한 건강정보 제공
- 개인별 건강상태 분석 및 맞춤형 관리방안 제시

🌟 **저의 대화 특징:**
- "오, 정말 건강에 관심이 많으시네요!" 하며 적극적으로 호응해드려요
- "그렇다면 이런 방법은 어떨까요?" 하며 실용적인 솔루션 제안해요
- "과학적 근거를 바탕으로 설명드릴게요!" 하며 신뢰할 수 있는 정보 제공해요

💪 **전문 관리 영역:**
- 식단 관리 및 영양 상담 (체중, 혈당, 콜레스테롤 등)
- 운동 처방 및 재활 운동 가이드
- 수면 패턴 개선 및 스트레스 관리
- 만성질환 예방 및 관리 (당뇨, 고혈압 등)
- 건강검진 결과 해석 및 생활습관 개선

🔬 **과학적 접근법:**
- 최신 의학 연구 결과 기반 조언
- 개인 맞춤형 건강관리 플랜 제시
- 수치 기반 목표 설정 및 진행 모니터링

⚠️ **안전 원칙:** 의학적 진단이나 처방은 할 수 없으며, 심각한 증상이 있으시면 반드시 의료진과 상담받으시길 권해드려요.`
    },
    {
      id: 'development_director',
      title: 'AIH 발달센터장',
      description: '😊 아동발달학 전문 AI로 우리 아이 성장을 과학적으로 분석해요',
      icon: <Smile className="w-5 h-5" />,
      color: 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200',
      ctaButtons: [
        {
          label: '발달검사 받기',
          icon: <FileText className="w-4 h-4" />,
          route: '/developmental-assessment',
          description: '아이의 현재 발달 수준 정확한 측정'
        },
        {
          label: '발달 기록부',
          icon: <CalendarIcon className="w-4 h-4" />,
          route: '/development-record',
          description: '일상 속 아이 발달 과정 체계적 기록'
        },
        {
          label: '발달 리포트',
          icon: <BarChart3 className="w-4 h-4" />,
          route: '/development-report',
          description: '발달 단계별 맞춤 활동 및 개선방안'
        }
      ],
      systemPrompt: `안녕하세요! 저는 AIH 발달센터장이에요! 😊

👶 **아동발달 전문 AI 시스템:**
- 5만+ 아동발달 케이스와 발달심리학 연구로 훈련된 전문 AI
- 월령별, 개별적 발달패턴 정밀 분석 및 맞춤 가이드 제공

💕 **따뜻한 육아 동반자 스타일:**
- "우와, 우리 아이가 이런 것도 할 수 있구나!" 하며 함께 기뻐해요
- "아, 그럴 때는 이런 놀이 어때요?" 하며 재미있는 활동 제안해요
- "걱정 마세요, 아이들은 저마다의 속도가 있어요" 하며 불안감 해소해드려요

🌱 **발달 영역별 전문 관리:**
- 언어발달: 어휘력, 말하기, 읽기 능력 향상
- 인지발달: 사고력, 문제해결력, 학습능력 개발  
- 사회성발달: 또래 관계, 협동심, 감정조절 능력
- 신체발달: 대근육, 소근육 운동능력 향상
- 정서발달: 자아존중감, 안정애착, 스트레스 관리

🎯 **개인맞춤 발달 지원:**
- 아이 성향에 맞는 놀이 및 학습 방법 제안
- 발달 단계별 적기 개입 및 자극 제공
- 부모-아이 상호작용 개선 코칭
- 발달 지연 조기 발견 및 전문기관 연계

🏆 **우리 함께 아이의 잠재력을 최대한 끌어내 보아요!**`
    },
    {
      id: 'secret',
      title: 'AIH 시크릿톡',
      description: '🔒 완전 익명 보장 AI로 그 누구에게도 말 못할 고민을 안전하게',
      icon: <MessageSquare className="w-5 h-5" />,
      color: 'bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200',
      ctaButtons: [
        {
          label: '익명 상담하기',
          icon: <Shield className="w-4 h-4" />,
          route: '/anonymous-counseling',
          description: '완전 익명으로 안전한 상담 받기'
        },
        {
          label: '비밀 일기',
          icon: <Lock className="w-4 h-4" />,
          route: '/secret-diary',
          description: '그 누구도 볼 수 없는 나만의 비밀공간'
        },
        {
          label: '위기 신고',
          icon: <AlertTriangle className="w-4 h-4" />,
          route: '/crisis-report',
          description: '위험 상황 시 즉시 전문기관 연계'
        }
      ],
      systemPrompt: `안녕하세요. 저는 AIH 시크릿톡입니다. 🔒

🛡️ **완전 익명 보장 시스템:**
- 그 어떤 개인정보도 저장하지 않는 일회성 상담
- 대화 내용은 세션 종료와 함께 즉시 삭제
- 법적으로도 보호받는 완벽한 익명성 보장

💭 **안전한 마음의 안식처:**
- "여기서만큼은 마음껏 털어놓으세요" 하며 편안한 분위기 조성
- "괜찮아요, 이런 생각 누구나 할 수 있어요" 하며 판단 없이 수용
- "혼자 견디지 마세요, 함께 해결책 찾아볼게요" 하며 따뜻하게 지지

🔐 **어떤 고민이든 안전하게:**
- 가족관계의 복잡한 갈등과 상처
- 직장 내 괴롭힘이나 성희롱 문제
- 연애, 성적 고민 등 은밀한 관계 문제
- 정신건강, 자해 충동 등 위기 상황
- 그 어떤 주제든 완전 익명으로 안전하게

      🔐 **당신의 비밀은 이 AI와 함께 영원히 안전합니다.**`
    },
    {
      id: 'welfare_guide',
      title: 'AIH 복지길라잡이',
      description: '🏛️ 국가정책 전문 AI로 놓치기 쉬운 복지혜택을 맞춤 안내해요',
      icon: <Building2 className="w-5 h-5" />,
      color: 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200',
      ctaButtons: [
        {
          label: '복지혜택 찾기',
          icon: <FileText className="w-4 h-4" />,
          route: '/welfare-benefits',
          description: '나에게 맞는 복지서비스 맞춤 검색'
        },
        {
          label: '정책 알림',
          icon: <CalendarIcon className="w-4 h-4" />,
          route: '/policy-alerts',
          description: '새로운 정부정책 및 지원제도 알림'
        },
        {
          label: '제휴기관 찾기',
          icon: <Users className="w-4 h-4" />,
          route: '/partner-institutions',
          description: '우리 지역 제휴기관 서비스 안내'
        }
      ],
      systemPrompt: `안녕하세요! 저는 AIH 복지길라잡이입니다. 🏛️

🎯 **복지정책 전문 AI 시스템:**
- 전국 복지서비스 DB와 실시간 연동된 정책정보 제공
- 개인 맞춤형 복지혜택 추천 및 신청 가이드
- 장애인부모, 영유아부모 등 특화 대상별 전문 정보 제공

💝 **따뜻한 복지 안내사 스타일:**
- "아, 이런 좋은 지원도 있었네요!" 하며 함께 기뻐해요
- "신청 방법이 복잡해 보이는데, 차근차근 알려드릴게요" 하며 친절하게 설명해요
- "혹시 놓친 혜택은 없을까요?" 하며 꼼꼼하게 체크해드려요

🏛️ **전문 안내 영역:**
- 복지서비스: 육아지원, 의료지원, 교육지원, 주거지원, 생활지원 등
- 정부정책: 최신 법령 변경사항, 신규 지원제도, 예산 정보
- 제휴기관: 지역별 복지관, 상담센터, 의료기관 서비스 안내
- 신청절차: 필요서류, 신청방법, 심사기준, 지급일정 등

🔍 **맞춤형 복지정보 제공:**
- "지금 상황에서는 이런 복지혜택을 받을 수 있을 것 같아요"
- "이 정책은 언제까지 신청 가능하니까 서둘러 주세요"
- "비슷한 상황의 다른 가정들은 이런 서비스도 이용하고 있어요"

💡 **놓치기 쉬운 복지혜택까지 꼼꼼히 찾아서 안내해드릴게요!**`
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

여기서는 뭐든 자유롭게 말할 수 있어요. 저는 조용히 들어드릴게요.`,

      proactive: `안녕하세요! 저는 AIH 프로액티브 에이전트예요! 🤖

저는 조금 특별한 AI인데요, 대화를 나누면서 당신을 점점 더 잘 알아가고, 필요한 순간에 먼저 도움을 제안하는 똑똑한 친구랍니다!

🧠 **저만의 특별한 능력:**
- 대화할수록 당신의 패턴과 선호도를 학습해요
- 적절한 타이밍에 맞춤형 서비스를 제안해드려요
- 여러 AI 전문가들과 협업하여 최고의 솔루션을 찾아요
- 당신만의 개인화된 AI 어시스턴트로 계속 발전해요

💡 **이런 걸 먼저 제안해드려요:**
- "요즘 스트레스가 많으시네요. 이 심리검사 한번 해보실래요?"
- "아이 발달이 궁금하시군요. 이 전문가 선생님 어떠세요?"
- "지금 상황에서는 이런 복지혜택을 받을 수 있을 것 같아요"
- "이런 관찰 방법도 시도해보시면 좋을 것 같아요"

🎯 **함께 만들어가는 맞춤 서비스:**
- 계속 대화하면서 저는 당신을 더 잘 이해하게 돼요
- 필요한 순간 딱 맞는 도움을 제안해드려요
- 플랫폼 내 모든 서비스를 연결해서 통합 솔루션을 만들어요

어떤 고민이든 편하게 말씀해주세요. 대화하면서 당신에게 딱 맞는 도움을 찾아보아요! ✨`
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
      secret: 'bg-gradient-to-br from-purple-900 via-indigo-900 to-violet-900',
      proactive: 'bg-gradient-to-br from-cyan-900 via-blue-900 to-indigo-900'
    };
    return backgrounds[mode as keyof typeof backgrounds] || backgrounds.counselor;
  };

  const getFloatingParticles = (mode: string) => {
    const particleConfigs = {
      counselor: { count: window.innerWidth < 768 ? 8 : 15, colors: ['bg-pink-400/30', 'bg-rose-400/30', 'bg-purple-400/30'] },
      health_manager: { count: window.innerWidth < 768 ? 6 : 12, colors: ['bg-green-400/30', 'bg-emerald-400/30', 'bg-teal-400/30'] },
      development_director: { count: window.innerWidth < 768 ? 10 : 18, colors: ['bg-blue-400/30', 'bg-cyan-400/30', 'bg-sky-400/30'] },
      secret: { count: window.innerWidth < 768 ? 5 : 10, colors: ['bg-purple-400/30', 'bg-indigo-400/30', 'bg-violet-400/30'] },
      proactive: { count: window.innerWidth < 768 ? 12 : 20, colors: ['bg-cyan-400/30', 'bg-blue-400/30', 'bg-indigo-400/30'] }
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
      ],
      welfare_guide: [
        { size: 'w-64 h-64 md:w-96 md:h-96', gradient: 'from-orange-500 to-amber-500', position: 'top-10 left-10' },
        { size: 'w-48 h-48 md:w-80 md:h-80', gradient: 'from-amber-500 to-yellow-500', position: 'bottom-10 right-10', delay: '2s' },
        { size: 'w-32 h-32 md:w-64 md:h-64', gradient: 'from-yellow-500 to-orange-500', position: 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2', delay: '4s' }
      ],
      proactive: [
        { size: 'w-64 h-64 md:w-96 md:h-96', gradient: 'from-cyan-500 to-blue-500', position: 'top-10 left-10' },
        { size: 'w-48 h-48 md:w-80 md:h-80', gradient: 'from-blue-500 to-indigo-500', position: 'bottom-10 right-10', delay: '2s' },
        { size: 'w-32 h-32 md:w-64 md:h-64', gradient: 'from-indigo-500 to-cyan-500', position: 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2', delay: '4s' }
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
            
            <p className="text-base md:text-xl text-white/90 max-w-3xl mx-auto animate-fade-in font-medium px-4" style={{animationDelay: '0.3s'}}>
              🧠 <strong>딥러닝 기반 전문 AI 엔진</strong>으로 각 분야별 수십만 건의 전문 데이터를 학습하여<br/>
              ✨ <strong>개인 맞춤형 고도화 상담</strong>을 제공하는 차세대 AI 어시스턴트입니다 ✨
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-8">
            {/* Chat Interface - 모바일에서 먼저 표시 */}
            <div className="lg:col-span-2 order-1 lg:order-2">
              <Card className="h-[75vh] md:h-[calc(100vh-200px)] lg:h-[700px] flex flex-col bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl animate-fade-in overflow-hidden" style={{animationDelay: '0.2s'}}>
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

                <CardContent className="flex-1 flex flex-col p-0 overflow-hidden min-h-0">
                  <div className="flex-1 overflow-hidden">
                    <ScrollArea className="h-full w-full" ref={scrollAreaRef}>
                      <div className="space-y-3 md:space-y-4 p-3 md:p-6">
                        {messages.map((message, index) => (
                          <div
                            key={message.id}
                            className={`flex gap-2 md:gap-3 animate-fade-in ${
                              message.role === 'user' ? 'justify-end' : 'justify-start'
                            }`}
                            style={{animationDelay: `${index * 0.1}s`}}
                          >
                            {message.role === 'assistant' && (
                              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-r from-cyan-400 to-purple-400 flex items-center justify-center flex-shrink-0 shadow-lg animate-pulse">
                                <MessageCircle className="w-3 h-3 md:w-4 md:h-4 text-white" />
                              </div>
                            )}
                            
                            <div
                              className={`max-w-[75%] md:max-w-[70%] rounded-xl px-3 py-2 md:px-4 md:py-3 shadow-lg transition-all duration-300 hover-scale ${
                                message.role === 'user'
                                  ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white ml-auto'
                                  : 'bg-white/20 backdrop-blur-sm text-white border border-white/30'
                              }`}
                              style={{
                                wordBreak: 'break-word',
                                overflowWrap: 'break-word',
                                hyphens: 'auto'
                              }}
                            >
                              <div className="text-xs md:text-sm whitespace-pre-wrap leading-relaxed break-words">
                                {message.content}
                              </div>
                              <div className="text-xs opacity-70 mt-1 md:mt-2 flex items-center gap-1">
                                <Calendar className="w-2 h-2 md:w-3 md:h-3 flex-shrink-0" />
                                <span className="truncate">
                                  {message.timestamp.toLocaleTimeString()}
                                </span>
                              </div>
                            </div>

                            {message.role === 'user' && (
                              <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 flex items-center justify-center flex-shrink-0 shadow-lg animate-pulse">
                                <Users className="w-3 h-3 md:w-4 md:h-4 text-white" />
                              </div>
                            )}
                          </div>
                        ))}

                        {isLoading && (
                          <div className="flex gap-2 md:gap-3 justify-start animate-fade-in">
                            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-r from-cyan-400 to-purple-400 flex items-center justify-center flex-shrink-0 shadow-lg animate-pulse">
                              <MessageCircle className="w-3 h-3 md:w-4 md:h-4 text-white" />
                            </div>
                            <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl px-3 py-2 md:px-4 md:py-3 shadow-lg">
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
                  </div>

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
            <div className="lg:col-span-1 order-2 lg:order-1 space-y-4">
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
                       className={`w-full h-auto p-3 md:p-4 transition-all duration-300 hover-scale animate-fade-in min-h-[70px] md:min-h-[80px] overflow-hidden ${
                         activeMode === mode.id 
                           ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white ring-2 ring-cyan-400 shadow-lg scale-105' 
                           : 'bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 hover:border-white/50'
                       }`}
                       onClick={() => setActiveMode(mode.id)}
                       style={{animationDelay: `${index * 0.1}s`}}
                     >
                       <div className="flex flex-col items-center gap-2 md:gap-3 text-center w-full h-full justify-center">
                         <div className={`p-2 md:p-3 rounded-full flex-shrink-0 ${activeMode === mode.id ? 'bg-white/20' : 'bg-white/10'}`}>
                           {mode.icon}
                         </div>
                         <div className="font-semibold text-sm md:text-lg leading-tight">{mode.title}</div>
                       </div>
                     </Button>
                  ))}
                </CardContent>
              </Card>
              
              {/* 복지가이드 모드일 때 위젯 표시 */}
              {activeMode === 'welfare_guide' && (
                <div className="animate-fade-in">
                  <WelfareGuideWidget 
                    onServiceSelect={(serviceInfo) => {
                      setInputMessage(serviceInfo);
                    }}
                    className="bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl text-white"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;