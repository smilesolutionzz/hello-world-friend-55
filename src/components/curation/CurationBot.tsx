import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  MessageCircle, 
  ExternalLink,
  Heart,
  ClipboardCheck,
  AlertCircle,
  Lightbulb,
  Phone,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface ConcernData {
  id: string;
  concern_text: string;
  analysis_type?: string;
  analysis_severity?: string;
  analysis_advice?: string;
  created_at: string;
}

interface AssessmentData {
  id: string;
  completed_at: string;
  results?: any;
  risk_level?: 'low' | 'medium' | 'high';
}

interface Message {
  role: 'bot' | 'user';
  content: string;
  recommendations?: Recommendation[];
  showKakaoLink?: boolean;
}

interface Recommendation {
  type: 'test' | 'counseling' | 'resource' | 'expert';
  title: string;
  description: string;
  link?: string;
  priority: 'high' | 'medium' | 'low';
}

interface CurationBotProps {
  concerns: ConcernData[];
  assessments: AssessmentData[];
}

// 카카오톡 오픈채팅 링크
const KAKAO_CHANNEL_URL = 'https://open.kakao.com/o/sHLdK3Ch';

export const CurationBot = ({ concerns, assessments }: CurationBotProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // 데이터 분석 기반 추천 생성
  const generateRecommendations = (): Recommendation[] => {
    const recommendations: Recommendation[] = [];
    
    // 고민 분석
    const highSeverityConcerns = concerns.filter(c => 
      c.analysis_severity === '높음' || c.analysis_severity === '심각'
    );
    
    // 검사 분석
    const highRiskAssessments = assessments.filter(a => a.risk_level === 'high');
    const mediumRiskAssessments = assessments.filter(a => a.risk_level === 'medium');
    
    // 고위험 고민이 있는 경우
    if (highSeverityConcerns.length > 0) {
      recommendations.push({
        type: 'expert',
        title: '전문 상담 추천',
        description: '기록하신 고민 중 전문가의 도움이 필요해 보이는 내용이 있어요. 전문 상담사와 이야기해보시는 건 어떨까요?',
        priority: 'high'
      });
    }
    
    // 고위험 검사 결과가 있는 경우
    if (highRiskAssessments.length > 0) {
      recommendations.push({
        type: 'counseling',
        title: '심층 상담 필요',
        description: `${highRiskAssessments.length}개의 검사에서 주의가 필요한 결과가 나왔어요. AI 상담이나 전문가 상담을 받아보시면 도움이 될 거예요.`,
        link: '/metaverse-voice-counseling',
        priority: 'high'
      });
    }
    
    // 중간 위험도 검사가 있는 경우
    if (mediumRiskAssessments.length > 0) {
      recommendations.push({
        type: 'resource',
        title: '마음 케어 프로그램',
        description: '스트레스 관리와 마음 건강을 위한 프로그램을 추천드려요.',
        link: '/mental-health',
        priority: 'medium'
      });
    }
    
    // 검사를 많이 안 했다면
    if (assessments.length < 3) {
      recommendations.push({
        type: 'test',
        title: '발달 검사 추천',
        description: '아이의 현재 상태를 더 정확히 파악하기 위해 추가 검사를 진행해보세요.',
        link: '/assessment',
        priority: 'medium'
      });
    }
    
    // 고민은 많은데 검사가 없는 경우
    if (concerns.length > 5 && assessments.length === 0) {
      recommendations.push({
        type: 'test',
        title: '종합 발달 검사 권장',
        description: '고민이 많이 누적되어 있어요. 종합 검사를 통해 현재 상태를 객관적으로 확인해보세요.',
        link: '/assessment',
        priority: 'high'
      });
    }
    
    // 기본 추천
    if (recommendations.length === 0) {
      recommendations.push({
        type: 'resource',
        title: '꾸준한 관찰 유지',
        description: '잘 하고 계세요! 지속적인 관찰과 기록이 아이의 성장에 큰 도움이 됩니다.',
        priority: 'low'
      });
    }
    
    return recommendations.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  };

  // 초기 메시지 생성
  const generateInitialMessage = (): Message => {
    const recommendations = generateRecommendations();
    const highPriorityCount = recommendations.filter(r => r.priority === 'high').length;
    
    let greeting = '';
    
    if (concerns.length === 0 && assessments.length === 0) {
      greeting = '안녕하세요! 👋 아직 기록된 데이터가 없어요. 고민을 기록하거나 검사를 진행하면 맞춤 분석을 해드릴게요!';
    } else if (highPriorityCount > 0) {
      greeting = `안녕하세요! 🤗 ${concerns.length}개의 고민과 ${assessments.length}개의 검사 결과를 분석했어요.\n\n⚠️ 주의가 필요한 부분이 있어요. 아래 추천을 확인해주세요!`;
    } else {
      greeting = `안녕하세요! 🌟 ${concerns.length}개의 고민과 ${assessments.length}개의 검사 결과를 분석했어요.\n\n전반적으로 잘 관리하고 계시네요! 아래 맞춤 추천을 확인해보세요.`;
    }
    
    return {
      role: 'bot',
      content: greeting,
      recommendations: recommendations.slice(0, 3)
    };
  };

  // 채팅 열릴 때 초기화
  useEffect(() => {
    if (isOpen && !hasInitialized) {
      const initialMessage = generateInitialMessage();
      setMessages([initialMessage]);
      setHasInitialized(true);
    }
  }, [isOpen, hasInitialized, concerns, assessments]);

  // 스크롤 자동 이동
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // 봇 응답 생성
  const generateBotResponse = async (userMessage: string): Promise<Message> => {
    const lowerMessage = userMessage.toLowerCase();
    
    // 상담 관련 키워드
    if (lowerMessage.includes('상담') || lowerMessage.includes('전문가') || lowerMessage.includes('도움')) {
      return {
        role: 'bot',
        content: '전문 상담을 원하시는군요! 💜\n\n저희 서비스에서는 두 가지 방법으로 상담을 받으실 수 있어요:\n\n1️⃣ 금쪽상담소에서 AI 상담사와 대화하기\n2️⃣ 카카오톡으로 전문 상담사에게 문의하기\n\n어떤 방법이 좋으실까요?',
        showKakaoLink: true
      };
    }
    
    // 검사 관련 키워드
    if (lowerMessage.includes('검사') || lowerMessage.includes('테스트')) {
      return {
        role: 'bot',
        content: `현재까지 ${assessments.length}개의 검사를 완료하셨어요! 📊\n\n${
          assessments.length < 5 
            ? '다양한 검사를 통해 아이의 발달 상태를 더 정확히 파악해보세요.' 
            : '꾸준히 검사를 진행하고 계시네요! 이전 결과와 비교해보시면 변화를 확인할 수 있어요.'
        }\n\n검사 페이지로 이동하시겠어요?`,
        recommendations: [{
          type: 'test',
          title: '발달 검사 바로가기',
          description: '다양한 발달 검사를 진행해보세요',
          link: '/assessment',
          priority: 'medium'
        }]
      };
    }
    
    // 고민 관련 키워드
    if (lowerMessage.includes('고민') || lowerMessage.includes('걱정') || lowerMessage.includes('힘들')) {
      const recentConcern = concerns[0];
      return {
        role: 'bot',
        content: `고민이 있으시군요. 언제든 말씀해주세요. 💕\n\n${
          recentConcern 
            ? `가장 최근에 기록하신 고민: "${recentConcern.concern_text.slice(0, 50)}..."\n\n이 고민에 대해 더 이야기하고 싶으시다면, AI 상담을 시작해보세요!` 
            : '새로운 고민을 기록하시면 AI가 분석해드릴게요!'
        }`,
        showKakaoLink: concerns.some(c => c.analysis_severity === '높음')
      };
    }
    
    // 카카오 관련
    if (lowerMessage.includes('카카오') || lowerMessage.includes('톡') || lowerMessage.includes('연락')) {
      return {
        role: 'bot',
        content: '카카오톡 채널을 통해 전문 상담사와 직접 상담하실 수 있어요! 💬\n\n아래 버튼을 눌러 채널을 추가해주세요.',
        showKakaoLink: true
      };
    }
    
    // 기본 응답
    return {
      role: 'bot',
      content: '네, 무엇이든 물어봐주세요! 🌈\n\n• 검사 결과 분석\n• 고민 상담\n• 전문가 연결\n\n위 내용에 대해 도움을 드릴 수 있어요!',
      recommendations: generateRecommendations().slice(0, 2)
    };
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    
    // 타이핑 효과를 위한 딜레이
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 500));
    
    const botResponse = await generateBotResponse(input);
    setMessages(prev => [...prev, botResponse]);
    setIsTyping(false);
  };

  const handleRecommendationClick = (recommendation: Recommendation) => {
    if (recommendation.type === 'expert' || recommendation.type === 'counseling' && !recommendation.link) {
      window.open(KAKAO_CHANNEL_URL, '_blank');
    } else if (recommendation.link) {
      setIsOpen(false);
      navigate(recommendation.link);
    }
  };

  const handleKakaoClick = () => {
    window.open(KAKAO_CHANNEL_URL, '_blank');
    toast({
      title: "카카오톡 채널 연결",
      description: "전문 상담사와 상담을 시작하세요!",
    });
  };

  // 플로팅 버튼 펄스 효과 (고위험 데이터가 있을 때)
  const hasHighPriority = concerns.some(c => c.analysis_severity === '높음') || 
                          assessments.some(a => a.risk_level === 'high');

  return (
    <>
      {/* 플로팅 봇 버튼 */}
      <motion.button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-24 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center",
          "bg-gradient-to-br from-primary to-purple-600 text-white",
          "hover:scale-110 transition-transform",
          hasHighPriority && "animate-pulse"
        )}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        <Bot className="w-6 h-6" />
        {hasHighPriority && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
            <span className="text-[10px] font-bold">!</span>
          </span>
        )}
      </motion.button>

      {/* 채팅 모달 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-24 right-4 z-50 w-[calc(100vw-2rem)] max-w-md"
          >
            <Card className="overflow-hidden shadow-2xl border-2 border-primary/20">
              {/* 헤더 */}
              <div className="bg-gradient-to-r from-primary to-purple-600 text-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold">AI 큐레이션 봇</h3>
                      <p className="text-xs text-white/80">맞춤 분석 & 상담 연결</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="text-white hover:bg-white/20 rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* 메시지 영역 */}
              <ScrollArea className="h-80 p-4" ref={scrollRef}>
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={cn(
                        "flex",
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                      )}
                    >
                      <div className={cn(
                        "max-w-[85%] rounded-2xl p-3",
                        message.role === 'user' 
                          ? 'bg-primary text-primary-foreground rounded-br-sm'
                          : 'bg-muted rounded-bl-sm'
                      )}>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        
                        {/* 추천 카드들 */}
                        {message.recommendations && message.recommendations.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {message.recommendations.map((rec, idx) => (
                              <motion.button
                                key={idx}
                                onClick={() => handleRecommendationClick(rec)}
                                className={cn(
                                  "w-full text-left p-3 rounded-xl border transition-all",
                                  "bg-background hover:bg-primary/5 hover:border-primary/30",
                                  rec.priority === 'high' && "border-red-200 bg-red-50/50 dark:bg-red-950/20"
                                )}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <div className="flex items-start gap-2">
                                  <div className={cn(
                                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                                    rec.type === 'expert' && "bg-purple-100 text-purple-600 dark:bg-purple-900/50",
                                    rec.type === 'counseling' && "bg-blue-100 text-blue-600 dark:bg-blue-900/50",
                                    rec.type === 'test' && "bg-green-100 text-green-600 dark:bg-green-900/50",
                                    rec.type === 'resource' && "bg-amber-100 text-amber-600 dark:bg-amber-900/50"
                                  )}>
                                    {rec.type === 'expert' && <Phone className="w-4 h-4" />}
                                    {rec.type === 'counseling' && <MessageCircle className="w-4 h-4" />}
                                    {rec.type === 'test' && <ClipboardCheck className="w-4 h-4" />}
                                    {rec.type === 'resource' && <Lightbulb className="w-4 h-4" />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1">
                                      <span className="font-semibold text-sm text-foreground">{rec.title}</span>
                                      {rec.priority === 'high' && (
                                        <AlertCircle className="w-3 h-3 text-red-500" />
                                      )}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{rec.description}</p>
                                  </div>
                                  <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                                </div>
                              </motion.button>
                            ))}
                          </div>
                        )}
                        
                        {/* 카카오톡 링크 */}
                        {message.showKakaoLink && (
                          <motion.button
                            onClick={handleKakaoClick}
                            className="w-full mt-3 p-3 rounded-xl bg-[#FEE500] text-[#3C1E1E] font-medium flex items-center justify-center gap-2 hover:bg-[#FDD800] transition-colors"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                              <path d="M12 3C6.5 3 2 6.58 2 11c0 2.73 1.79 5.13 4.5 6.57-.14.5-.52 1.81-.6 2.1-.1.37.14.36.29.26.12-.08 1.92-1.27 2.7-1.78.69.1 1.4.15 2.11.15 5.5 0 10-3.58 10-8s-4.5-8-10-8z"/>
                            </svg>
                            <span>카카오톡으로 전문가 상담받기</span>
                            <ExternalLink className="w-4 h-4" />
                          </motion.button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                  
                  {/* 타이핑 인디케이터 */}
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-muted rounded-2xl rounded-bl-sm p-3">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </ScrollArea>

              {/* 입력 영역 */}
              <div className="p-4 border-t bg-background/50">
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                  className="flex gap-2"
                >
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="무엇이든 물어보세요..."
                    className="flex-1 rounded-full bg-muted border-0"
                    disabled={isTyping}
                  />
                  <Button 
                    type="submit" 
                    size="icon" 
                    className="rounded-full shrink-0"
                    disabled={isTyping || !input.trim()}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
                
                {/* 빠른 액션 버튼들 */}
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full text-xs shrink-0"
                    onClick={() => { setInput('상담 받고 싶어요'); handleSend(); }}
                  >
                    💬 상담 받기
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full text-xs shrink-0"
                    onClick={() => { setInput('검사 결과 분석해줘'); handleSend(); }}
                  >
                    📊 검사 분석
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full text-xs shrink-0"
                    onClick={handleKakaoClick}
                  >
                    📱 카카오 연결
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
