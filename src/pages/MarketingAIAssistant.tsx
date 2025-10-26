import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { downloadResultAsPDF } from "@/utils/pdfDownload";
import ReactMarkdown from "react-markdown";
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
  FileText,
  Download,
  Loader2
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
  const [report, setReport] = useState<string>("");
  const [institutionData, setInstitutionData] = useState<InstitutionData>({});
  const [showDataForm, setShowDataForm] = useState(true);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleDataSubmit = async () => {
    if (!institutionData.name || !institutionData.type) {
      toast({
        title: "정보 입력 필요",
        description: "최소한 기관명과 유형을 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setShowDataForm(false);
    setIsGeneratingReport(true);

    try {
      const { data: reportData, error } = await supabase.functions.invoke('marketing-ai-assistant', {
        body: { 
          type: 'generate_report',
          institutionData 
        }
      });

      if (error) throw error;

      setReport(reportData.report);
      toast({
        title: "리포트 생성 완료",
        description: "종합 마케팅 전략 리포트가 생성되었습니다.",
      });
    } catch (error) {
      console.error('리포트 생성 오류:', error);
      toast({
        title: "오류 발생",
        description: "리포트 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingReport(false);
    }
  };

  const handleDownloadPDF = () => {
    downloadResultAsPDF(
      'marketing-report',
      `마케팅전략리포트_${institutionData?.name}_${new Date().toISOString().split('T')[0]}`,
      () => {
        toast({
          title: "다운로드 완료",
          description: "PDF 파일이 다운로드되었습니다.",
        });
      },
      (error) => {
        toast({
          title: "다운로드 실패",
          description: error.message,
          variant: "destructive",
        });
      }
    );
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
          type: 'chat',
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
                    AI가 종합 마케팅 전략 리포트를 생성합니다
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
                리포트 생성하기
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

  if (isGeneratingReport) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-2 border-primary/20">
          <CardContent className="p-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-12 h-12 text-primary animate-spin" />
              <h3 className="text-xl font-semibold text-center">마케팅 전략 리포트 생성 중...</h3>
              <p className="text-muted-foreground text-center text-sm">
                AI가 귀하의 기관에 맞는 종합 마케팅 전략을 분석하고 있습니다.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="max-w-7xl mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 리포트 영역 */}
          <div className="lg:col-span-2">
            <Card className="border-2 border-primary/20 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/20">
                      <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">종합 마케팅 전략 리포트</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {institutionData.name}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleDownloadPDF}
                    variant="outline"
                    size="sm"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    PDF
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <ScrollArea className="h-[calc(100vh-220px)]">
                  <div id="marketing-report" className="prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown>{report}</ReactMarkdown>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* 채팅 영역 */}
          <div className="lg:col-span-1">
            <Card className="border-2 border-primary/20 shadow-xl h-full flex flex-col">
              <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10 border-b">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-primary" />
                  <CardTitle className="text-lg">추가 질문</CardTitle>
                </div>
                <p className="text-xs text-muted-foreground">
                  리포트에 대해 궁금한 점을 물어보세요
                </p>
              </CardHeader>
              <CardContent className="p-4 flex-1 flex flex-col min-h-0">
                <ScrollArea className="flex-1 pr-2 mb-4">
                  <div className="space-y-3">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex gap-2 ${
                          message.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {message.role === 'assistant' && (
                          <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                            <Bot className="w-4 h-4 text-primary" />
                          </div>
                        )}
                        <div
                          className={`max-w-[85%] rounded-lg p-3 text-sm ${
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="whitespace-pre-wrap text-xs">{message.content}</p>
                        </div>
                        {message.role === 'user' && (
                          <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center flex-shrink-0">
                            <User className="w-4 h-4 text-secondary" />
                          </div>
                        )}
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex gap-2 justify-start">
                        <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                          <Bot className="w-4 h-4 text-primary animate-pulse" />
                        </div>
                        <div className="bg-muted rounded-lg p-3">
                          <div className="flex gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" />
                            <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce delay-100" />
                            <div className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce delay-200" />
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                <div className="flex gap-2 pt-2 border-t">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="질문을 입력하세요..."
                    className="min-h-[50px] resize-none text-sm"
                    rows={2}
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    size="icon"
                    className="h-[50px] w-[50px] flex-shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
