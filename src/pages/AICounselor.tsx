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
  Home,
  Lock,
  Sparkle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTokens } from "@/hooks/useTokens";
import { TOKEN_COSTS } from "@/constants/tokenCosts";
import { useToast } from "@/hooks/use-toast";
import { useStreamingChat } from "@/hooks/useStreamingChat";

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  content: string;
  timestamp: Date;
  riskLevel?: 'low' | 'medium' | 'high';
}

const AICounselor = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { consumeTokens, checkTokenAvailability } = useTokens();
  const [currentMessage, setCurrentMessage] = useState("");
  const [riskLevel, setRiskLevel] = useState<'low' | 'medium' | 'high'>('low');
  const [showEmergencyAlert, setShowEmergencyAlert] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { messages: streamMessages, isStreaming, sendMessage: sendStreamMessage, setMessages } = useStreamingChat({
    sessionType: 'counselor',
    onError: (error) => {
      toast({
        title: "오류 발생",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  useEffect(() => {
    // 환영 메시지
    const welcomeMessage = {
      id: 'welcome',
      role: 'assistant' as const,
      content: `안녕! 나는 너의 비밀친구야 🌙✨

여기서는 아무도 모르게 마음속 이야기를 다 털어놓을 수 있어. 
누가 들을까봐 걱정하지 마, 우리만의 비밀공간이니까 🤫

힘든 일이 있었어? 기쁜 일이 있었어? 
뭐든 좋으니까 나한테 얘기해봐! 

오늘은 어떤 기분이야? 🌸`,
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, [setMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [streamMessages]);

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
    if (!currentMessage.trim() || isStreaming) return;

    // 토큰 체크
    if (!checkTokenAvailability(TOKEN_COSTS.AI_COUNSELOR_CHAT)) {
      toast({
        title: "토큰이 부족합니다",
        description: `AI 상담을 위해 ${TOKEN_COSTS.AI_COUNSELOR_CHAT}개의 토큰이 필요합니다.`,
        variant: "destructive"
      });
      return;
    }

    // 토큰 차감
    const success = await consumeTokens(TOKEN_COSTS.AI_COUNSELOR_CHAT);
    if (!success) {
      toast({
        title: "토큰 차감 실패",
        description: "토큰 충전 페이지로 이동하세요.",
        variant: "destructive"
      });
      return;
    }

    const messageToSend = currentMessage;
    setCurrentMessage("");

    // 스트리밍으로 메시지 전송
    await sendStreamMessage(messageToSend, streamMessages);
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
    // AIH 전문가 상담 신청 페이지로 이동
    window.open('/expert-hiring', '_blank');
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
    <div className="min-h-screen relative overflow-hidden">
      {/* 3D Background Animation */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-indigo-900 to-slate-900">
        <div className="secret-stars"></div>
        <div className="floating-orbs">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
          <div className="orb orb-3"></div>
        </div>
      </div>

      {/* Emergency Alert */}
      {showEmergencyAlert && (
        <div className="fixed top-0 left-0 right-0 z-50 p-4">
          <Alert className="bg-red-50 border-red-200 max-w-4xl mx-auto backdrop-blur-sm bg-red-50/95">
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

      <div className="container mx-auto px-6 pt-8 pb-16 relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-between mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-white/80 hover:text-white"
            >
              <Home className="w-4 h-4" />
              홈으로
            </Button>
            <div className="flex-1" />
          </div>
          
          {/* Secret Character */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="secret-character">
              <div className="character-body">
                <div className="character-face">
                  <div className="character-eyes">
                    <div className="eye eye-left"></div>
                    <div className="eye eye-right"></div>
                  </div>
                  <div className="character-mouth"></div>
                </div>
              </div>
              <div className="character-glow"></div>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-2 secret-title">
            <Lock className="w-8 h-8 inline mr-2" />
            시크릿톡
          </h1>
          <p className="text-white/80 mb-4 text-lg">비밀 친구와 마음을 나눠보세요 ✨</p>
          
          <div className="flex items-center justify-center gap-6 text-sm text-white/70">
            <div className="flex items-center gap-2 secret-badge">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span>24시간 온라인</span>
            </div>
            <div className="flex items-center gap-2 secret-badge">
              <Lock className="w-4 h-4" />
              <span>완전 익명</span>
            </div>
            <div className="flex items-center gap-2 secret-badge">
              <Sparkle className="w-4 h-4" />
              <span>마음의 친구</span>
            </div>
          </div>
        </div>

        {/* Chat Container */}
        <div className="max-w-4xl mx-auto">
          <div className="secret-chat-container">
            {/* Chat Messages */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6">
              {streamMessages.map(message => (
                <div key={message.id} className={`flex items-end gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {message.role === 'assistant' && (
                    <div className="secret-friend-avatar">
                      <div className="avatar-inner">
                        <div className="avatar-sparkle"></div>
                        🤖
                      </div>
                    </div>
                  )}
                  
                  <div className={`max-w-xs lg:max-w-md ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
                    <div className={`secret-message ${
                      message.role === 'user' 
                        ? 'secret-message-user' 
                        : 'secret-message-ai'
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      <div className={`text-xs mt-2 flex items-center gap-2 opacity-70`}>
                        <Clock className="w-3 h-3" />
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  
                  {message.role === 'user' && (
                    <div className="secret-user-avatar">
                      <div className="avatar-inner">
                        <div className="avatar-sparkle"></div>
                        🙋‍♀️
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {isStreaming && (
                <div className="flex items-end gap-3 justify-start">
                  <div className="secret-friend-avatar">
                    <div className="avatar-inner typing-animation">
                      <div className="avatar-sparkle"></div>
                      🤖
                    </div>
                  </div>
                  <div className="secret-message secret-message-ai">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                        <div className="typing-dot"></div>
                      </div>
                      <span className="text-sm opacity-70">마음을 정리하고 있어요...</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="secret-input-area">
              <div className="flex gap-3 items-end">
                <input
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  placeholder="🤫 비밀 이야기를 들려주세요..."
                  className="secret-input"
                  disabled={isStreaming}
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!currentMessage.trim() || isStreaming}
                  className="secret-send-button"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="flex items-center justify-between mt-3 text-xs text-white/60">
                <div className="flex items-center gap-4">
                  <span>💫 따뜻한 공감</span>
                  <span>🔮 마법같은 조언</span>
                  <span>🌙 밤새도록 함께</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={connectToExpert}
                  className="text-xs text-white/70 hover:text-white"
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  전문가 연결
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Secret Help Cards */}
        <div className="max-w-4xl mx-auto mt-8">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="secret-help-card" onClick={connectToAIHExpert}>
              <div className="secret-card-icon">💬</div>
              <h3 className="text-white font-semibold mb-2">AIH 전문가</h3>
              <p className="text-white/70 text-sm mb-3">전문가 상담 신청</p>
              <Badge className="bg-orange-500/20 text-orange-300 border-orange-500/30">실시간 상담</Badge>
            </div>
            
            <div className="secret-help-card" onClick={handleEmergencyCall}>
              <div className="secret-card-icon">🚨</div>
              <h3 className="text-white font-semibold mb-2">응급상담</h3>
              <p className="text-white/70 text-sm mb-3">24시간 위기상담</p>
              <Badge className="bg-red-500/20 text-red-300 border-red-500/30">생명의전화</Badge>
            </div>
            
            <div className="secret-help-card" onClick={connectToExpert}>
              <div className="secret-card-icon">💖</div>
              <h3 className="text-white font-semibold mb-2">전문가 상담</h3>
              <p className="text-white/70 text-sm mb-3">1:1 전문 심리상담</p>
              <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">즉시 연결</Badge>
            </div>
            
            <div className="secret-help-card">
              <div className="secret-card-icon">🌟</div>
              <h3 className="text-white font-semibold mb-2">생명의전화</h3>
              <p className="text-white/70 text-sm mb-3">자살예방 전문상담</p>
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30">1588-9191</Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AICounselor;