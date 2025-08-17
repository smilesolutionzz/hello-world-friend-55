import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Video, 
  FileText, 
  Clock, 
  User,
  Calendar,
  Phone,
  Star,
  Heart,
  Sparkles
} from "lucide-react";
import { ExpertProfile } from "@/types/assessment";

interface ConsultationRoomProps {
  expert: ExpertProfile;
  onEndSession: () => void;
}

const ConsultationRoom = ({ expert, onEndSession }: ConsultationRoomProps) => {
  const [sessionStarted, setSessionStarted] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [messages, setMessages] = useState<Array<{id: string, sender: 'user' | 'expert', text: string, time: string}>>([]);
  const [currentMessage, setCurrentMessage] = useState("");

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = () => {
    if (currentMessage.trim()) {
      const newMessage = {
        id: Date.now().toString(),
        sender: 'user' as const,
        text: currentMessage,
        time: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, newMessage]);
      setCurrentMessage("");
      
      // 전문가 응답 시뮬레이션
      setTimeout(() => {
        const expertReply = {
          id: (Date.now() + 1).toString(),
          sender: 'expert' as const,
          text: "네, 말씀해주신 내용을 잘 들었습니다. 좀 더 자세히 설명해주실 수 있을까요?",
          time: new Date().toLocaleTimeString()
        };
        setMessages(prev => [...prev, expertReply]);
      }, 1000 + Math.random() * 2000);
    }
  };

  const startSession = () => {
    setSessionStarted(true);
    // 세션 타이머 시작
    const timer = setInterval(() => {
      setSessionTime(prev => prev + 1);
    }, 1000);

    // Welcome message
    const welcomeMessage = {
      id: 'welcome',
      sender: 'expert' as const,
      text: `안녕하세요, ${expert.name}입니다. 오늘 어떤 고민을 나누고 싶으신가요?`,
      time: new Date().toLocaleTimeString()
    };
    setMessages([welcomeMessage]);

    return () => clearInterval(timer);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/10 to-soft-mint/20">
      {!sessionStarted ? (
        // Pre-session screen
        <div className="container mx-auto px-6 pt-20 pb-16">
          <div className="max-w-4xl mx-auto">
            <Card className="overflow-hidden hover-glow">
              <div className="p-8 space-y-8">
                {/* Expert Header */}
                <div className="text-center space-y-4">
                  <div className="w-24 h-24 mx-auto bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center text-white text-3xl font-bold">
                    {expert.name.charAt(0)}
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-foreground">{expert.name}</h1>
                    <div className="flex items-center justify-center gap-2 mt-2">
                      <Star className="w-5 h-5 text-yellow-500 fill-current" />
                      <span className="font-semibold">{expert.rating}</span>
                      <span className="text-muted-foreground">• {expert.experienceYears}년 경력</span>
                    </div>
                  </div>
                </div>

                {/* Expert Info */}
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground">전문 분야</h3>
                    <div className="flex flex-wrap gap-2">
                      {expert.specialty.map((spec, idx) => (
                        <Badge key={idx} className="bg-primary/20 text-primary">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-foreground">자격증</h3>
                    <div className="space-y-1">
                      {expert.credentials.map((cred, idx) => (
                        <div key={idx} className="text-sm text-muted-foreground flex items-center gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full" />
                          {cred}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Session Info */}
                <div className="bg-calm-blue/20 p-6 rounded-xl">
                  <h3 className="font-semibold text-foreground mb-4">상담 세션 정보</h3>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>50분 세션</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-primary" />
                      <span>공감적 접근</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span>개별 맞춤 상담</span>
                    </div>
                  </div>
                </div>

                {/* Start Session */}
                <div className="text-center space-y-4">
                  <p className="text-muted-foreground">
                    편안한 마음으로 상담을 시작해보세요. 모든 대화는 안전하게 보호됩니다.
                  </p>
                  <div className="flex justify-center gap-4">
                    <Button variant="outline" onClick={onEndSession}>
                      나가기
                    </Button>
                    <Button onClick={startSession} className="btn-brand">
                      상담 시작하기
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      ) : (
        // Active session screen
        <div className="h-screen flex flex-col">
          {/* Session Header */}
          <div className="bg-white border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center text-white font-bold">
                  {expert.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{expert.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span>상담 중</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold text-primary">{formatTime(sessionTime)}</div>
                  <div className="text-xs text-muted-foreground">세션 시간</div>
                </div>
                <Button variant="destructive" onClick={onEndSession}>
                  상담 종료
                </Button>
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex">
            {/* Messages */}
            <div className="flex-1 flex flex-col">
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {messages.map(message => (
                  <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender === 'user' 
                        ? 'bg-primary text-white' 
                        : 'bg-white border shadow-sm'
                    }`}>
                      <p className="text-sm">{message.text}</p>
                      <div className={`text-xs mt-1 ${
                        message.sender === 'user' ? 'text-white/70' : 'text-muted-foreground'
                      }`}>
                        {message.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="border-t p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="메시지를 입력하세요..."
                    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <Button onClick={handleSendMessage} className="px-6">
                    전송
                  </Button>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="w-80 border-l bg-gray-50 p-4 space-y-4">
              <h4 className="font-semibold text-foreground">상담 도구</h4>
              
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Video className="w-4 h-4 mr-2" />
                  화상통화 시작
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  상담 노트
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  다음 예약
                </Button>
              </div>

              <div className="bg-white p-4 rounded-lg border">
                <h5 className="font-medium text-foreground mb-2">상담 진행도</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>초기 면담</span>
                    <span className="text-green-600">완료</span>
                  </div>
                  <div className="flex justify-between">
                    <span>문제 파악</span>
                    <span className="text-blue-600">진행중</span>
                  </div>
                  <div className="flex justify-between">
                    <span>목표 설정</span>
                    <span className="text-muted-foreground">예정</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsultationRoom;