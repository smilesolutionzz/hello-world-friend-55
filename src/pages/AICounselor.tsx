import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  MessageCircle, 
  Phone, 
  AlertTriangle, 
  Heart, 
  Clock,
  Send,
  Bot,
  Shield,
  Sparkles,
  Home
} from "lucide-react";
import { chatWithAICounselor } from "@/services/openai";
import { useNavigate } from "react-router-dom";

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: Date;
  riskLevel?: 'low' | 'medium' | 'high';
}

const AICounselor = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high'>('low');
  const [showEmergencyAlert, setShowEmergencyAlert] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 환영 메시지
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      sender: 'ai',
      content: `안녕하세요! 저는 24시간 AIH 심리상담사입니다. 🤗

언제든지 마음 편히 이야기해주세요. 제가 여기 있어요.

혹시 긴급상황이시라면 언제든 말씀해주시고, 전문가 연결이 필요한 경우 즉시 도움을 드리겠습니다.

오늘은 어떤 마음이신가요?`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // 고위험 상황 감지 시 응급 알림
    if (riskLevel === 'high') {
      setShowEmergencyAlert(true);
    }
  }, [riskLevel]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      content: currentMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage("");
    setIsTyping(true);

    try {
      // AI 상담사와 대화
      const conversationHistory = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' as const : 'assistant' as const,
        content: msg.content
      }));

      const { response, riskLevel: detectedRisk } = await chatWithAICounselor(
        currentMessage, 
        conversationHistory
      );

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        content: response,
        timestamp: new Date(),
        riskLevel: detectedRisk
      };

      setMessages(prev => [...prev, aiMessage]);
      setRiskLevel(detectedRisk);

    } catch (error) {
      console.error('AI Counselor Error:', error);
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        content: "죄송합니다. 일시적인 문제가 발생했습니다. 긴급한 상황이라면 정신건강위기상담전화 1577-0199로 연락해주세요.",
        timestamp: new Date(),
        riskLevel: 'medium'
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setRiskLevel('medium');
    }

    setIsTyping(false);
  };

  const handleEmergencyCall = () => {
    // 응급상담센터 연결
    window.open('tel:1577-0199');
  };

  const connectToExpert = () => {
    // 전문가 연결 페이지로 이동
    navigate('/assessment');
  };

  const connectToAIHExpert = () => {
    // AIH 전문가 카카오톡 오픈채팅 연결
    window.open('https://open.kakao.com/o/sHLdK3Ch', '_blank');
  };

  const getRiskBadge = (level: 'low' | 'medium' | 'high') => {
    const configs = {
      low: { color: "bg-green-100 text-green-700", label: "안정" },
      medium: { color: "bg-yellow-100 text-yellow-700", label: "주의" },
      high: { color: "bg-red-100 text-red-700", label: "위험" }
    };
    
    return (
      <Badge className={configs[level].color}>
        {configs[level].label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/10 to-soft-mint/20">
      {/* Emergency Alert */}
      {showEmergencyAlert && (
        <div className="fixed top-0 left-0 right-0 z-50 p-4">
          <Alert className="bg-red-50 border-red-200 max-w-4xl mx-auto">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              <div className="flex items-center justify-between">
                <span className="font-semibold">위기상황이 감지되었습니다. 즉시 전문가 도움을 받으시길 권합니다.</span>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                    onClick={connectToAIHExpert}
                  >
                    💬 AIH전문가연결
                  </Button>
                  <Button 
                    size="sm" 
                    variant="destructive"
                    onClick={handleEmergencyCall}
                  >
                    <Phone className="w-4 h-4 mr-1" />
                    응급상담 1577-0199
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setShowEmergencyAlert(false)}
                  >
                    닫기
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      )}

      <div className="container mx-auto px-6 pt-8 pb-16">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <Home className="w-4 h-4" />
              홈으로
            </Button>
            <div className="flex-1" />
          </div>
          
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center">
              <Bot className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-foreground mb-2">24시간 AIH 심리상담사</h1>
          <p className="text-muted-foreground mb-4">언제든지 안전하고 따뜻한 상담을 받으세요</p>
          
          <div className="flex items-center justify-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span>24시간 운영</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <span>안전한 대화</span>
            </div>
            <div className="flex items-center gap-2">
              <span>위험도:</span>
              {getRiskBadge(riskLevel)}
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="max-w-4xl mx-auto">
          <Card className="h-[600px] flex flex-col overflow-hidden">
            {/* Chat Messages */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {messages.map(message => (
                <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md ${message.sender === 'user' ? 'order-2' : 'order-1'}`}>
                    <div className={`px-4 py-3 rounded-2xl ${
                      message.sender === 'user' 
                        ? 'bg-primary text-white ml-4' 
                        : 'bg-white border shadow-sm mr-4'
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      <div className={`text-xs mt-2 flex items-center gap-2 ${
                        message.sender === 'user' ? 'text-white/70' : 'text-muted-foreground'
                      }`}>
                        <Clock className="w-3 h-3" />
                        {message.timestamp.toLocaleTimeString()}
                        {message.riskLevel && message.sender === 'ai' && (
                          <span className="ml-2">{getRiskBadge(message.riskLevel)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.sender === 'user' 
                      ? 'bg-primary order-1' 
                      : 'bg-gradient-to-br from-primary to-primary-glow order-2'
                  }`}>
                    {message.sender === 'user' ? (
                      <span className="text-white text-sm font-bold">나</span>
                    ) : (
                      <Bot className="w-4 h-4 text-white" />
                    )}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="max-w-xs lg:max-w-md mr-4">
                    <div className="bg-white border shadow-sm px-4 py-3 rounded-2xl">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                        <span className="text-sm text-muted-foreground">답변을 준비하고 있어요...</span>
                      </div>
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t p-4 bg-gray-50">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  placeholder="마음 편히 이야기해주세요..."
                  className="flex-1 px-4 py-3 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  disabled={isTyping}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!currentMessage.trim() || isTyping}
                  className="px-6 py-3 rounded-2xl"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span>💬 따뜻한 공감과 전문적 조언</span>
                  <span>🔒 안전한 익명 대화</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={connectToExpert}
                  className="text-xs"
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  전문가 연결
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Access Buttons */}
        <div className="max-w-4xl mx-auto mt-8">
          <div className="grid md:grid-cols-4 gap-4">
            <Card className="p-6 text-center hover-glow cursor-pointer" onClick={connectToAIHExpert}>
              <div className="w-8 h-8 text-orange-600 mx-auto mb-3 text-2xl">💬</div>
              <h3 className="font-semibold text-foreground mb-2">AIH 전문가</h3>
              <p className="text-sm text-muted-foreground mb-3">카카오톡 즉시 연결</p>
              <Badge className="bg-orange-100 text-orange-700">실시간 상담</Badge>
            </Card>
            
            <Card className="p-6 text-center hover-glow cursor-pointer" onClick={handleEmergencyCall}>
              <Phone className="w-8 h-8 text-red-600 mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-2">응급상담</h3>
              <p className="text-sm text-muted-foreground mb-3">24시간 위기상담 전화</p>
              <Badge className="bg-red-100 text-red-700">1577-0199</Badge>
            </Card>
            
            <Card className="p-6 text-center hover-glow cursor-pointer" onClick={connectToExpert}>
              <Heart className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-2">전문가 상담</h3>
              <p className="text-sm text-muted-foreground mb-3">1:1 전문 심리상담</p>
              <Badge className="bg-primary/20 text-primary">즉시 연결</Badge>
            </Card>
            
            <Card className="p-6 text-center hover-glow">
              <MessageCircle className="w-8 h-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-2">생명의전화</h3>
              <p className="text-sm text-muted-foreground mb-3">자살예방 전문상담</p>
              <Badge className="bg-green-100 text-green-700">1588-9191</Badge>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AICounselor;