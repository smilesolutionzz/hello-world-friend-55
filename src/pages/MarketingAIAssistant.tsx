import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Send, 
  Bot, 
  User, 
  TrendingUp, 
  Building2, 
  Users, 
  Target,
  BarChart3,
  Sparkles,
  Upload,
  FileText
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

type InstitutionData = {
  name?: string;
  type?: string;
  targetAudience?: string;
  currentMarketing?: string;
  budget?: string;
  goals?: string;
};

export default function MarketingAIAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [institutionData, setInstitutionData] = useState<InstitutionData>({});
  const [showDataForm, setShowDataForm] = useState(true);
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleDataSubmit = () => {
    if (!institutionData.name || !institutionData.type) {
      toast({
        title: "정보 입력 필요",
        description: "최소한 기관명과 유형을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setShowDataForm(false);
    const welcomeMessage: Message = {
      role: "assistant",
      content: `안녕하세요! ${institutionData.name}의 마케팅 전략을 분석하는 AI 어시스턴트입니다.\n\n입력하신 기관 정보를 바탕으로 맞춤형 마케팅 전략을 제안해드리겠습니다.\n\n다음과 같은 질문을 해주세요:\n- 우리 기관에 적합한 마케팅 채널은?\n- 타겟 고객층 분석과 세분화 전략\n- 경쟁사 대비 차별화 포인트\n- 마케팅 예산 배분 전략\n- 효과적인 콘텐츠 마케팅 방안\n\n무엇을 도와드릴까요?`,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  };

  const streamChat = async (userMessage: Message) => {
    const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/marketing-ai-assistant`;
    
    try {
      const response = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: messages.concat(userMessage).map(m => ({
            role: m.role,
            content: m.content
          })),
          institutionData,
        }),
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("요청 한도를 초과했습니다. 잠시 후 다시 시도해주세요.");
        }
        if (response.status === 402) {
          throw new Error("크레딧이 부족합니다.");
        }
        throw new Error("AI 응답을 가져오는데 실패했습니다.");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("스트림을 읽을 수 없습니다.");

      const decoder = new TextDecoder();
      let textBuffer = "";
      let assistantContent = "";

      // 즉시 빈 assistant 메시지 추가
      const assistantMessage: Message = {
        role: "assistant",
        content: "",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const newMessages = [...prev];
                const lastMsg = newMessages[newMessages.length - 1];
                if (lastMsg.role === "assistant") {
                  lastMsg.content = assistantContent;
                }
                return newMessages;
              });
            }
          } catch (e) {
            // 파싱 실패 시 다음 청크 기다림
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (error) {
      console.error("Streaming error:", error);
      toast({
        title: "오류",
        description: error instanceof Error ? error.message : "메시지 전송 중 오류가 발생했습니다.",
        variant: "destructive",
      });
      // 에러 발생 시 마지막 assistant 메시지 제거
      setMessages(prev => prev.filter(m => m.content !== ""));
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    await streamChat(userMessage);
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (showDataForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
        <div className="max-w-2xl mx-auto pt-12">
          <Card className="border-2 border-primary/20 shadow-xl">
            <CardHeader className="space-y-2 bg-gradient-to-r from-primary/10 to-secondary/10">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-primary/20">
                  <TrendingUp className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-3xl">마케팅 AI 어시스턴트</CardTitle>
                  <p className="text-muted-foreground mt-1">
                    기관 데이터 기반 맞춤형 마케팅 전략을 제안합니다
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-primary" />
                    기관명 *
                  </Label>
                  <Input
                    id="name"
                    placeholder="예: ABC 심리상담센터"
                    value={institutionData.name || ""}
                    onChange={(e) => setInstitutionData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type" className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" />
                    기관 유형 *
                  </Label>
                  <Input
                    id="type"
                    placeholder="예: 심리상담센터, 정신건강의학과, 교육기관 등"
                    value={institutionData.type || ""}
                    onChange={(e) => setInstitutionData(prev => ({ ...prev, type: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target" className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    주요 타겟 고객
                  </Label>
                  <Input
                    id="target"
                    placeholder="예: 20-30대 직장인, 학부모, 청소년 등"
                    value={institutionData.targetAudience || ""}
                    onChange={(e) => setInstitutionData(prev => ({ ...prev, targetAudience: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="marketing" className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" />
                    현재 진행 중인 마케팅
                  </Label>
                  <Textarea
                    id="marketing"
                    placeholder="예: 인스타그램 광고, 블로그 운영, 지역 전단지 등"
                    value={institutionData.currentMarketing || ""}
                    onChange={(e) => setInstitutionData(prev => ({ ...prev, currentMarketing: e.target.value }))}
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget" className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    월 마케팅 예산
                  </Label>
                  <Input
                    id="budget"
                    placeholder="예: 100-300만원"
                    value={institutionData.budget || ""}
                    onChange={(e) => setInstitutionData(prev => ({ ...prev, budget: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goals" className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    마케팅 목표
                  </Label>
                  <Textarea
                    id="goals"
                    placeholder="예: 신규 고객 유입 증대, 브랜드 인지도 향상 등"
                    value={institutionData.goals || ""}
                    onChange={(e) => setInstitutionData(prev => ({ ...prev, goals: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>

              <Button 
                onClick={handleDataSubmit} 
                className="w-full py-6 text-lg"
                size="lg"
              >
                <Upload className="w-5 h-5 mr-2" />
                분석 시작하기
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                * 필수 항목입니다. 더 많은 정보를 제공할수록 정확한 분석이 가능합니다.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="max-w-5xl mx-auto h-screen flex flex-col p-4">
        <Card className="flex-1 flex flex-col border-2 border-primary/20 shadow-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">마케팅 AI 어시스턴트</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {institutionData.name} - 데이터 기반 전략 분석
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="gap-1">
                <Sparkles className="w-3 h-3" />
                AI 분석
              </Badge>
            </div>
          </CardHeader>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4 pb-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex gap-3 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-5 h-5 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl p-4 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm md:text-base whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </p>
                    <p className="text-xs opacity-70 mt-2">
                      {message.timestamp.toLocaleTimeString("ko-KR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {message.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-secondary" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-primary animate-pulse" />
                  </div>
                  <div className="bg-muted rounded-2xl p-4">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" />
                      <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce delay-100" />
                      <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="border-t p-4 bg-background">
            <div className="flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="마케팅 전략에 대해 질문하세요..."
                className="min-h-[60px] resize-none"
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                size="icon"
                className="h-[60px] w-[60px] flex-shrink-0"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Shift + Enter로 줄바꿈, Enter로 전송
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
