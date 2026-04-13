import { useState, useEffect, useRef } from "react";
import CounselingRoom from "@/components/3d/CounselingRoom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Bot, User, AlertTriangle, ExternalLink, Phone, ArrowLeft, Mic } from "lucide-react";
import { VoiceInputButton } from "@/components/ui/VoiceInputButton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIChatInterfaceProps {
  assessmentResults?: any;
  onClose?: () => void;
}

const AIChatInterface = ({ assessmentResults, onClose }: AIChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [needsProfessionalHelp, setNeedsProfessionalHelp] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Save consultation to database
  const saveConsultationToDatabase = async (sessionId: string, summary: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Create consultation record
      const { data: consultation, error: consultationError } = await supabase
        .from('consultations')
        .insert({
          user_id: user.id,
          expert_id: null, // AI consultation
          consultation_type: 'text',
          status: 'completed',
          notes: summary,
          duration_minutes: Math.ceil(messages.length * 2), // Estimate duration
          price: 0 // Free AI consultation
        })
        .select()
        .single();

      if (consultationError) {
        console.error('Error saving consultation:', consultationError);
        return;
      }

      // Also save to timeline activities
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        const { data: familyMember } = await supabase
          .from('family_members')
          .select('family_id')
          .eq('user_id', user.id)
          .maybeSingle();

        await supabase
          .from('timeline_activities')
          .insert({
            family_id: familyMember?.family_id || null,
            member_id: profile.id,
            type: 'CONSULT',
            title: 'AI 상담 세션',
            summary: summary,
            tags: ['AI상담', '통합건강'],
            files: [],
            actor: { role: 'user', name: user.email || '사용자' },
            meta: { 
              consultation_id: consultation.id,
              session_id: sessionId, 
              message_count: messages.length,
              session_date: new Date().toISOString()
            }
          });
      }

      console.log('Consultation saved successfully');
    } catch (error) {
      console.error('Error saving consultation:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Add welcome message based on assessment results
    const welcomeMessage = getWelcomeMessage(assessmentResults);
    setMessages([{
      id: crypto.randomUUID(),
      role: 'assistant',
      content: welcomeMessage,
      timestamp: new Date()
    }]);
  }, [assessmentResults]);

  const getWelcomeMessage = (results?: any) => {
    if (!results) {
      return "안녕하세요! 저는 여러분의 마음건강을 도와드리는 AI 상담사입니다. 편안하게 이야기해주세요. 😊";
    }

    const { testType, severity, ageGroup } = results;
    
    if (testType === 'adhd') {
      return `안녕하세요! 주의집중력 자가체크 결과(${severity})를 바탕으로 상담을 도와드리겠습니다. 주의집중력 증상 관리나 일상생활에서 어려운 점이 있으시면 언제든 말씀해주세요. 🧠`;
    } else if (testType === 'depression') {
      return `안녕하세요! 우울감 체크 결과(${severity})를 확인했습니다. 지금 느끼고 계신 어려움들을 함께 나누어보면서, 조금씩 나아갈 수 있는 방법을 찾아보아요. 💙`;
    } else if (testType === 'panic') {
      return `안녕하세요! 불안감 체크 결과(${severity})를 바탕으로 상담해드리겠습니다. 불안한 마음을 다스리는 방법들을 함께 찾아보아요. 🌱`;
    } else if (testType === 'language') {
      return `안녕하세요! ${ageGroup} 언어발달 체크 결과를 확인했습니다. 언어발달에 대한 궁금한 점이나 걱정되는 부분이 있으시면 편하게 말씀해주세요. 👶`;
    }

    return `안녕하세요! ${ageGroup} 검사 결과를 바탕으로 맞춤 상담을 도와드리겠습니다. 무엇이든 편하게 이야기해주세요. ✨`;
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      console.log('Sending message to AI counselor:', userMessage.content);
      
      const { data, error } = await supabase.functions.invoke('ai-counselor-chat', {
        body: {
          message: userMessage.content,
          assessmentResults,
          conversationHistory: messages.map(m => ({ role: m.role, content: m.content }))
        }
      });

      if (error) {
        console.error('Supabase function error:', error);
        throw new Error(error.message);
      }

      console.log('AI counselor response:', data);

      const aiMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.response || "죄송합니다. 응답을 생성하는 중 오류가 발생했습니다.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      
      if (data.needsProfessionalHelp) {
        setNeedsProfessionalHelp(true);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: "죄송합니다. 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "오류 발생",
        description: "메시지 전송 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      
      // Save consultation if it's been going for a while
      if (messages.length >= 4) {
        const sessionId = crypto.randomUUID();
        const summary = `총 ${messages.length + 1}개의 메시지로 구성된 AI 상담 세션이 완료되었습니다. 마지막 상담 내용: "${userMessage.content.substring(0, 50)}..."`;
        await saveConsultationToDatabase(sessionId, summary);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <CounselingRoom>
      <div className="min-h-screen bg-gradient-to-br from-transparent via-calm-blue/10 to-warm-lavender/20 p-6 backdrop-blur-sm">
        <div className="container mx-auto max-w-4xl">
          {/* Back Button */}
          {onClose && (
            <Button variant="outline" onClick={onClose} className="mb-6 flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              뒤로가기
            </Button>
          )}
          
          {/* Header */}
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-brand-gradient mb-2">AIH 해결사</h1>
            <p className="text-gray-800 font-medium bg-white/70 backdrop-blur-sm rounded-lg px-4 py-2 mx-auto inline-block">전문적이고 따뜻한 상담 서비스</p>
          </div>

          {/* Emergency Notice */}
          {needsProfessionalHelp && (
            <Card className="mb-6 p-4 bg-red-50 border-red-200 backdrop-blur-md bg-white/80">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-red-800 mb-2">🚨 전문가 상담 권장</h3>
                  <p className="text-red-700 text-sm mb-3">
                    현재 상황에서는 전문가의 직접적인 도움이 필요할 수 있습니다.
                  </p>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => window.open('https://open.kakao.com/o/sHLdK3Ch', '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      즉시 전문가 상담
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => window.open('/expert-hiring?urgent=true', '_self')}
                    >
                      <Phone className="w-4 h-4 mr-1" />
                      긴급 전문가 매칭
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Assessment Results Summary */}
          {assessmentResults && (
            <Card className="mb-6 p-4 bg-blue-50 border-blue-200 backdrop-blur-md bg-white/80">
              <h3 className="font-semibold text-blue-900 mb-2">📊 검사 결과 요약</h3>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{assessmentResults.testType === 'adhd' ? 'ADHD 체크' : assessmentResults.testType === 'depression' ? '우울감 체크' : assessmentResults.testType === 'panic' ? '불안감 체크' : assessmentResults.testType === 'language' ? '언어발달 체크' : '심리평가'}</Badge>
                <Badge variant="secondary">{assessmentResults.ageGroup || assessmentResults.severity}</Badge>
                <Badge variant="secondary">총점: {assessmentResults.total}점</Badge>
              </div>
            </Card>
          )}

          {/* Chat Interface */}
          <Card className="flex flex-col h-[500px] backdrop-blur-md bg-white/80 border-white/30">
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.role === 'user' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>
                      <div className={`rounded-lg p-3 ${
                        message.role === 'user' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        <span className="text-xs opacity-70 mt-1 block">
                          {message.timestamp.toLocaleTimeString('ko-KR', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="bg-muted rounded-lg p-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="border-t p-4">
              <div className="flex gap-2 items-end">
                <div className="flex-1 relative">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="무엇이든 편하게 이야기해주세요..."
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <div className="absolute bottom-1.5 right-1.5">
                    <VoiceInputButton
                      onTranscription={(text) => setInput(prev => prev ? `${prev} ${text}` : text)}
                      className="h-7 w-7"
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <Button 
                  onClick={sendMessage} 
                  disabled={!input.trim() || isLoading}
                  className="btn-brand"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                이 상담은 참고용입니다. 긴급 시 플랫폼 내 전문가 매칭을 이용하세요.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </CounselingRoom>
  );
};

export default AIChatInterface;