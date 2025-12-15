import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { 
  MessageCircle, 
  Send, 
  X, 
  Bot,
  HelpCircle,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "서비스는 어떻게 시작하나요?",
    answer: "안녕하세요! 🌟 AIHPRO 시작은 아주 간단해요!\n\n1️⃣ 회원가입 후 로그인\n2️⃣ 상단 메뉴에서 '검사하기' 클릭\n3️⃣ 원하는 검사 선택 (ADHD, 우울증, 스트레스 등)\n4️⃣ 3~5분 안에 검사 완료!\n\n검사 결과는 AI가 분석해서 상세한 리포트를 제공해드려요. 무료로 시작할 수 있으니 부담없이 시작해보세요! 💪"
  },
  {
    question: "캐시는 어떻게 사용하나요?",
    answer: "캐시는 프리미엄 기능을 이용할 때 사용돼요! 💎\n\n📌 캐시 사용처:\n• AI 심층 분석 리포트 생성\n• 전문가 1:1 상담 예약\n• 맞춤형 솔루션 추천\n• 고급 검사 결과 분석\n\n📌 캐시 획득 방법:\n• 회원가입 시 무료 캐시 지급\n• 친구 추천하면 1,000원 보너스\n• 프리미엄 패스 가입 시 무제한 이용\n• 이벤트 참여로 추가 획득!\n\n설정 > 캐시에서 잔액과 사용 내역을 확인하실 수 있어요!"
  },
  {
    question: "검사 결과는 정확한가요?",
    answer: "AIHPRO의 검사는 과학적으로 검증된 도구를 사용해요! 📊\n\n✅ 사용하는 검사 도구:\n• ADHD: 국제 표준 ASRS 기반\n• 우울증: PHQ-9, BDI 등 공인 척도\n• 불안: GAD-7 표준화 검사\n\n✅ AI 분석 특징:\n• 수천 건의 데이터로 학습된 AI\n• 패턴 인식으로 개인화된 분석\n• 전문가 자문을 거친 해석 제공\n\n⚠️ 단, 자가진단 도구로 의학적 진단을 대체하지 않아요. 정확한 진단은 전문가 상담을 권장드려요!"
  },
  {
    question: "전문가 상담은 어떻게 받나요?",
    answer: "전문가 상담 예약은 간단해요! 👨‍⚕️\n\n📌 상담 예약 방법:\n1️⃣ 메뉴에서 '전문가 상담' 클릭\n2️⃣ 분야별 전문가 목록 확인\n3️⃣ 원하는 전문가 선택\n4️⃣ 가능한 시간대에 예약\n5️⃣ 토큰으로 결제 완료!\n\n📌 상담 진행:\n• 화상/채팅/전화 상담 선택 가능\n• 예약 시간에 맞춰 상담 시작\n• 상담 후 요약 리포트 제공\n\n첫 상담은 할인 혜택이 있으니 꼭 확인해보세요! 🎁"
  },
  {
    question: "개인정보는 안전한가요?",
    answer: "네, 개인정보 보호를 최우선으로 해요! 🔒\n\n✅ 보안 조치:\n• 모든 데이터 암호화 저장\n• SSL 보안 통신 적용\n• 정기적인 보안 감사 실시\n\n✅ 개인정보 정책:\n• 검사 결과는 본인만 열람 가능\n• 제3자 제공 절대 금지\n• 원할 때 언제든 삭제 요청 가능\n• 익명 분석만 서비스 개선에 활용\n\n개인정보처리방침에서 자세한 내용을 확인하실 수 있어요!"
  },
  {
    question: "구독은 어떤 혜택이 있나요?",
    answer: "구독하시면 다양한 혜택을 받으실 수 있어요! ⭐\n\n📌 무료 플랜:\n• 기본 검사 무제한\n• 간단한 결과 분석\n\n📌 프리미엄 패스 (월 29,900원):\n• 모든 검사 무제한 이용\n• AI 심층 분석 리포트\n• 전문가 상담 우선 예약\n• 프리미엄 리포트 무료\n• 광고 없는 쾌적한 환경\n\n📌 신규회원 혜택:\n• 첫 달 무료 체험!\n• 언제든 해지 가능\n\n구독 페이지에서 자세한 요금제를 확인해보세요!"
  }
];

interface PlatformGuideFAQProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PlatformGuideFAQ: React.FC<PlatformGuideFAQProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '안녕하세요! 🌟 AIHPRO 플랫폼 가이드입니다.\n\n궁금한 점이 있으시면 아래 자주 묻는 질문을 클릭하거나, 직접 질문해주세요!'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleFAQClick = (faq: FAQItem) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: faq.question
    };

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: faq.answer
    };

    setMessages(prev => [...prev, userMessage, assistantMessage]);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue
    };

    // 간단한 키워드 매칭으로 답변 찾기
    const matchedFAQ = faqData.find(faq => 
      faq.question.includes(inputValue) || 
      inputValue.includes('시작') || 
      inputValue.includes('토큰') ||
      inputValue.includes('검사') ||
      inputValue.includes('상담') ||
      inputValue.includes('보안') ||
      inputValue.includes('구독')
    );

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: matchedFAQ?.answer || 
        '죄송해요, 해당 질문에 대한 답변을 찾지 못했어요. 😅\n\n아래 자주 묻는 질문을 확인하시거나, 고객센터로 문의해주세요!\n\n📧 support@aihpro.com\n📞 1588-0000'
    };

    setMessages(prev => [...prev, userMessage, assistantMessage]);
    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="fixed bottom-24 right-4 z-50 w-[380px] max-w-[calc(100vw-2rem)]"
      >
        <Card className="shadow-2xl border-primary/20 overflow-hidden">
          {/* Header */}
          <CardHeader className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">플랫폼 가이드</CardTitle>
                  <p className="text-xs opacity-80">무엇이든 물어보세요!</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-primary-foreground hover:bg-white/20"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {/* Messages Area */}
            <ScrollArea className="h-[350px] p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center mr-2 flex-shrink-0">
                        <Sparkles className="w-4 h-4 text-primary" />
                      </div>
                    )}
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-muted rounded-bl-md'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-line">{message.content}</p>
                    </div>
                  </motion.div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* FAQ Suggestions */}
            <div className="border-t bg-muted/30 p-3">
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                <HelpCircle className="w-3 h-3" />
                자주 묻는 질문
              </p>
              <div className="flex flex-wrap gap-2">
                {faqData.slice(0, 4).map((faq, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="text-xs h-auto py-1.5 px-3 rounded-full border-primary/30 hover:bg-primary/10 hover:text-primary"
                    onClick={() => handleFAQClick(faq)}
                  >
                    {faq.question}
                  </Button>
                ))}
              </div>
            </div>

            {/* Input Area */}
            <div className="border-t p-3">
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="질문을 입력하세요..."
                  className="flex-1 rounded-full"
                />
                <Button
                  onClick={handleSendMessage}
                  size="icon"
                  className="rounded-full"
                  disabled={!inputValue.trim()}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground text-center mt-2">
                이 가이드는 플랫폼 이용 안내를 제공하며, 전문 상담을 대체하지 않습니다.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

// Floating Button Component
export const PlatformGuideFAQButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg hover:shadow-xl transition-all flex items-center justify-center"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
            >
              <MessageCircle className="w-6 h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      <PlatformGuideFAQ isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default PlatformGuideFAQButton;
