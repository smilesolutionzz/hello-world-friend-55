import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Send, Bot, User, Heart, Zap, Brain, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface AICoachChatProps {
  userId?: string;
  moodBefore?: number;
  onSessionComplete?: (sessionId: string) => void;
}

export const AICoachChat: React.FC<AICoachChatProps> = ({
  userId,
  moodBefore,
  onSessionComplete
}) => {
  const [activeSession, setActiveSession] = useState<'mood_coaching' | 'energy_coaching' | 'stress_management' | 'goal_setting'>('mood_coaching');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [actionItems, setActionItems] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const sessionTypes = {
    mood_coaching: { 
      icon: Heart, 
      label: '기분 코칭', 
      color: 'text-pink-600',
      description: '감정을 이해하고 긍정적인 변화를 만들어보세요'
    },
    energy_coaching: { 
      icon: Zap, 
      label: '에너지 관리', 
      color: 'text-yellow-600',
      description: '활력을 높이고 지속가능한 에너지를 유지해요'
    },
    stress_management: { 
      icon: Brain, 
      label: '스트레스 관리', 
      color: 'text-purple-600',
      description: '스트레스를 완화하고 평온함을 찾아보세요'
    },
    goal_setting: { 
      icon: Target, 
      label: '목표 설정', 
      color: 'text-blue-600',
      description: '명확한 목표를 세우고 달성 계획을 만들어요'
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Reset messages when session type changes
    setMessages([]);
    setActionItems([]);
    
    // Add welcome message for new session
    const welcomeMessages = {
      mood_coaching: '안녕하세요! 감정 코칭 세션에 오신 것을 환영합니다. 오늘 기분은 어떠신가요?',
      energy_coaching: '에너지 관리 코칭에 오신 것을 환영합니다! 현재 에너지 레벨은 어떠신가요?',
      stress_management: '스트레스 관리 세션입니다. 현재 어떤 스트레스를 느끼고 계신가요?',
      goal_setting: '목표 설정 코칭에 오신 것을 환영합니다! 어떤 목표를 설정하고 싶으신가요?'
    };

    setMessages([{
      role: 'assistant',
      content: welcomeMessages[activeSession],
      timestamp: new Date().toISOString()
    }]);
  }, [activeSession]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.functions.invoke('ai-coach', {
        body: {
          userId: user.id,
          sessionType: activeSession,
          message: inputMessage.trim(),
          conversationHistory: messages,
          moodBefore
        }
      });

      if (error) throw error;

      if (data.success) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.response,
          timestamp: new Date().toISOString()
        };

        setMessages(prev => [...prev, assistantMessage]);
        
        if (data.actionItems) {
          setActionItems(data.actionItems);
        }

        if (data.sessionId) {
          onSessionComplete?.(data.sessionId);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "메시지 전송 실패",
        description: "잠시 후 다시 시도해주세요.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Session Type Selector */}
      <Tabs value={activeSession} onValueChange={(value) => setActiveSession(value as any)} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-4">
          {Object.entries(sessionTypes).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <TabsTrigger key={key} value={key} className="flex items-center gap-1 text-xs">
                <Icon className="w-3 h-3" />
                <span className="hidden sm:inline">{config.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {Object.entries(sessionTypes).map(([key, config]) => (
          <TabsContent key={key} value={key} className="mt-0">
            <Card className="h-[500px] flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <config.icon className={`w-5 h-5 ${config.color}`} />
                  <CardTitle className="text-lg">{config.label}</CardTitle>
                </div>
                <p className="text-sm text-muted-foreground">{config.description}</p>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col p-0">
                {/* Messages */}
                <ScrollArea className="flex-1 px-4">
                  <div className="space-y-4 py-4">
                    {messages.map((message, index) => (
                      <div key={index} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}>
                        <Avatar className={`w-8 h-8 ${message.role === 'user' ? 'order-2' : ''}`}>
                          <AvatarFallback>
                            {message.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`max-w-[80%] ${message.role === 'user' ? 'order-1' : ''}`}>
                          <div className={`rounded-lg p-3 ${
                            message.role === 'user' 
                              ? 'bg-primary text-primary-foreground ml-auto' 
                              : 'bg-muted'
                          }`}>
                            <p className="text-sm leading-relaxed">{message.content}</p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1 px-1">
                            {new Date(message.timestamp).toLocaleTimeString('ko-KR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {isLoading && (
                      <div className="flex gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback>
                            <Bot className="w-4 h-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-muted rounded-lg p-3">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100"></div>
                            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200"></div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Action Items */}
                {actionItems.length > 0 && (
                  <div className="px-4 py-2 border-t bg-muted/50">
                    <p className="text-xs font-medium mb-2">실행 계획:</p>
                    <div className="flex flex-wrap gap-1">
                      {actionItems.map((item, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input */}
                <div className="p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="메시지를 입력하세요..."
                      disabled={isLoading}
                      className="flex-1"
                    />
                    <Button 
                      onClick={sendMessage} 
                      disabled={!inputMessage.trim() || isLoading}
                      size="icon"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};