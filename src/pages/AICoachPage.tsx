import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Brain, Heart, Target, Lightbulb, Send, Bot, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navigation from "@/components/Navigation";
import { TypingAnimation } from "@/components/ui/typing-animation";

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  category?: string;
}

interface CoachingSession {
  id: string;
  title: string;
  description: string;
  category: string;
  icon: React.ReactNode;
  color: string;
  messages: Message[];
}

const AICoachPage = () => {
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [sessions, setSessions] = useState<CoachingSession[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const coachingCategories = [
    {
      id: "stress",
      title: "스트레스 관리",
      description: "일상의 스트레스를 효과적으로 관리하는 방법을 배워보세요",
      icon: <Brain className="w-6 h-6" />,
      color: "bg-blue-500",
      initialMessage: "안녕하세요! 스트레스 관리 코치입니다. 오늘 어떤 스트레스를 겪고 계신가요?"
    },
    {
      id: "emotional",
      title: "감정 조절",
      description: "감정을 이해하고 건강하게 표현하는 방법을 익혀보세요",
      icon: <Heart className="w-6 h-6" />,
      color: "bg-pink-500",
      initialMessage: "안녕하세요! 감정 코치입니다. 지금 느끼고 있는 감정에 대해 말씀해 주세요."
    },
    {
      id: "goals",
      title: "목표 달성",
      description: "개인적인 목표를 설정하고 달성하는 전략을 세워보세요",
      icon: <Target className="w-6 h-6" />,
      color: "bg-green-500",
      initialMessage: "안녕하세요! 목표 달성 코치입니다. 어떤 목표를 이루고 싶으신가요?"
    },
    {
      id: "mindfulness",
      title: "마음챙김",
      description: "현재 순간에 집중하고 내면의 평화를 찾아보세요",
      icon: <Lightbulb className="w-6 h-6" />,
      color: "bg-purple-500",
      initialMessage: "안녕하세요! 마음챙김 코치입니다. 오늘 마음챙김을 실천해 보시겠어요?"
    }
  ];

  useEffect(() => {
    initializeSessions();
  }, []);

  const initializeSessions = () => {
    const initialSessions = coachingCategories.map(category => ({
      id: category.id,
      title: category.title,
      description: category.description,
      category: category.id,
      icon: category.icon,
      color: category.color,
      messages: [{
        id: '1',
        content: category.initialMessage,
        role: 'assistant' as const,
        timestamp: new Date(),
        category: category.id
      }]
    }));
    setSessions(initialSessions);
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !activeSession) return;

    const currentSession = sessions.find(s => s.id === activeSession);
    if (!currentSession) return;

    setLoading(true);

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: message,
      role: 'user',
      timestamp: new Date()
    };

    const updatedSessions = sessions.map(session => 
      session.id === activeSession 
        ? { ...session, messages: [...session.messages, userMessage] }
        : session
    );
    setSessions(updatedSessions);
    setMessage("");

    try {
      // Call AI coach function
      const { data, error } = await supabase.functions.invoke('ai-coach-advanced', {
        body: {
          message: message,
          sessionType: activeSession,
          conversationHistory: currentSession.messages.slice(-5) // Last 5 messages for context
        }
      });

      if (error) throw error;

      // Add AI response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response || "죄송합니다. 일시적인 오류가 발생했습니다.",
        role: 'assistant',
        timestamp: new Date(),
        category: activeSession
      };

      setSessions(prev => prev.map(session => 
        session.id === activeSession 
          ? { ...session, messages: [...session.messages, aiMessage] }
          : session
      ));

    } catch (error) {
      console.error('AI Coach error:', error);
      toast({
        title: "오류 발생",
        description: "AI 코치 응답에 실패했습니다. 다시 시도해 주세요.",
        variant: "destructive",
      });
    }

    setLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const currentSession = sessions.find(s => s.id === activeSession);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-8 pb-12">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">
              <TypingAnimation 
                phrases={["AI 개인 코치", "Personal AI Coach", "Smart Wellness Guide"]}
                className="text-gradient"
              />
            </h1>
            <p className="text-lg text-muted-foreground">
              24/7 개인 맞춤형 심리 코칭 서비스
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Coaching Categories */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>코칭 카테고리</CardTitle>
                  <CardDescription>원하는 코칭 영역을 선택해보세요</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {coachingCategories.map((category) => (
                    <Button
                      key={category.id}
                      variant={activeSession === category.id ? "default" : "outline"}
                      className="w-full justify-start h-auto p-4"
                      onClick={() => setActiveSession(category.id)}
                    >
                      <div className={`p-2 rounded-lg ${category.color} text-white mr-3`}>
                        {category.icon}
                      </div>
                      <div className="text-left">
                        <div className="font-medium">{category.title}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {category.description}
                        </div>
                      </div>
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Chat Interface */}
            <div className="lg:col-span-2">
              {activeSession ? (
                <Card className="h-[600px] flex flex-col">
                  <CardHeader className="flex-shrink-0">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${currentSession?.color} text-white`}>
                        {currentSession?.icon}
                      </div>
                      <div>
                        <CardTitle>{currentSession?.title} 코치</CardTitle>
                        <CardDescription>
                          개인 맞춤형 {currentSession?.title} 코칭
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  {/* Messages */}
                  <CardContent className="flex-1 flex flex-col">
                    <ScrollArea className="flex-1 pr-4">
                      <div className="space-y-4">
                        {currentSession?.messages.map((msg) => (
                          <div
                            key={msg.id}
                            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`flex items-start gap-2 max-w-[80%] ${
                              msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                            }`}>
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                msg.role === 'user' 
                                  ? 'bg-primary text-primary-foreground' 
                                  : `${currentSession?.color} text-white`
                              }`}>
                                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                              </div>
                              <div className={`p-3 rounded-lg ${
                                msg.role === 'user'
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-muted'
                              }`}>
                                <p className="text-sm">{msg.content}</p>
                                <p className="text-xs opacity-70 mt-1">
                                  {msg.timestamp.toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                        {loading && (
                          <div className="flex justify-start">
                            <div className="flex items-center gap-2">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentSession?.color} text-white`}>
                                <Bot className="w-4 h-4" />
                              </div>
                              <div className="bg-muted p-3 rounded-lg">
                                <div className="flex space-x-1">
                                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </ScrollArea>

                    {/* Message Input */}
                    <div className="flex gap-2 mt-4">
                      <Input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="메시지를 입력하세요..."
                        disabled={loading}
                      />
                      <Button 
                        onClick={handleSendMessage} 
                        disabled={!message.trim() || loading}
                        size="icon"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="h-[600px] flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">코칭 카테고리를 선택해주세요</h3>
                    <p className="text-muted-foreground">
                      왼쪽에서 원하는 코칭 영역을 선택하여 AI 코치와 대화를 시작하세요
                    </p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AICoachPage;