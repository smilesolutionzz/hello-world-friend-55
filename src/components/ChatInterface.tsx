import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Send, Sparkles, AlertTriangle, ExternalLink, FileText, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface InstantReport {
  report: string;
  riskLevel: 'low' | 'medium' | 'high';
  needsExpertConsultation: boolean;
  timestamp: string;
}

const ChatInterface = () => {
  const [message, setMessage] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState<InstantReport | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || message.length < 50) {
      toast({
        title: "입력 확인",
        description: "최소 50자 이상 구체적으로 작성해주세요.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    setReport(null);
    
    try {
      const response = await fetch('https://ybhvjfkpwjwyufaynuyq.supabase.co/functions/v1/instant-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      if (response.ok) {
        const data = await response.json();
        setReport(data);
        
        // 위험 수준에 따른 토스트
        if (data.riskLevel === 'high') {
          toast({
            title: "⚠️ 중요 안내",
            description: "즉시 전문가 도움이 필요합니다. 119 또는 1577-0199로 연락하세요.",
            variant: "destructive"
          });
        }
      } else {
        throw new Error('Analysis failed');
      }
    } catch (error) {
      console.error('AI analysis error:', error);
      toast({
        title: "분석 오류",
        description: "일시적인 문제가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNewAnalysis = () => {
    setMessage("");
    setReport(null);
  };

  if (report) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
        {/* 위험 수준에 따른 긴급 알림 */}
        {report.riskLevel === 'high' && (
          <Card className="border-red-300 bg-red-50 p-6">
            <div className="flex items-center gap-3 text-red-800">
              <AlertTriangle className="w-6 h-6" />
              <div>
                <h3 className="font-bold text-lg">🚨 긴급상황 감지</h3>
                <p className="text-sm mt-1">
                  즉시 도움이 필요합니다. <strong>응급실: 119 / 자살예방: 1577-0199</strong>
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* AI 리포팅 결과 */}
        <Card className="p-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold text-brand-gradient">AI 즉시 리포팅 (참고용)</h2>
              </div>
              <div className="text-sm text-muted-foreground">
                {new Date(report.timestamp).toLocaleString('ko-KR')}
              </div>
            </div>

            {/* 법적 안전 공지 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                <span className="font-semibold">⚠️ 중요:</span> 이 리포팅은 참고용이며 의학적 진단이 아닙니다. 
                정확한 진단과 치료는 반드시 의료기관에서 받으시기 바랍니다.
              </p>
            </div>

            {/* AI 분석 결과 */}
            <div className="prose prose-lg max-w-none">
              <div className="whitespace-pre-line text-foreground leading-relaxed">
                {report.report}
              </div>
            </div>
          </div>
        </Card>

        {/* 추가 서비스 안내 */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 hover-glow cursor-pointer" onClick={() => window.location.href = '/assessment'}>
            <div className="flex items-center gap-4">
              <Clock className="w-8 h-8 text-primary" />
              <div>
                <h3 className="font-bold text-lg text-brand-gradient">3분 전문 체크</h3>
                <p className="text-sm text-muted-foreground">연령별 맞춤 심층 분석</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover-glow cursor-pointer" onClick={() => window.open('https://typebot.io/hilight-consult', '_blank')}>
            <div className="flex items-center gap-4">
              <ExternalLink className="w-8 h-8 text-primary" />
              <div>
                <h3 className="font-bold text-lg text-brand-gradient">전문가 상담 연결</h3>
                <p className="text-sm text-muted-foreground">즉시 상담 가능</p>
              </div>
            </div>
          </Card>
        </div>

        {report.needsExpertConsultation && (
          <Card className="border-orange-300 bg-orange-50 p-6">
            <div className="flex items-center gap-3 text-orange-800">
              <FileText className="w-6 h-6" />
              <div>
                <h4 className="font-bold">더 정확한 전문가 리포팅이 필요해 보입니다</h4>
                <p className="text-sm mt-1">
                  관찰일지를 작성하시면 전문가의 상세한 분석 리포팅을 받으실 수 있습니다.
                </p>
                <Button 
                  className="mt-3 btn-brand"
                  onClick={() => window.open('https://typebot.io/hilight-consult', '_blank')}
                >
                  관찰일지 작성하러 가기
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* 새 분석 버튼 */}
        <div className="flex justify-center">
          <Button onClick={handleNewAnalysis} variant="outline" className="px-8">
            새로운 고민 분석하기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6">
      {/* AIH Pro Beta Badge */}
      <div className="flex items-center justify-center mb-6 sm:mb-8">
        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-2xl px-4 sm:px-6 py-2 sm:py-3 shadow-lg border border-border">
          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary animate-pulse-glow" />
          <span className="text-lg sm:text-xl font-semibold text-brand-gradient">AI 즉시 리포팅</span>
          <span className="text-xs sm:text-sm bg-primary/20 text-primary px-2 py-1 rounded-full">beta</span>
        </div>
      </div>

      {/* Chat Input Form */}
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div className="relative">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="예시: 우리 아이가 20개월인데 아직도 엄마밖에 못하고, 울음을 멈추지 못해서 걱정이에요. 이런 상황이 정상적인 발달 과정인지 궁금합니다."
            className="chat-input resize-none min-h-[120px] sm:min-h-[150px] text-base sm:text-lg leading-relaxed"
            disabled={isAnalyzing}
            maxLength={500}
          />
          
          {/* Character Count */}
          <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 text-xs sm:text-sm text-muted-foreground">
            {message.length}/500 (최소 50자)
          </div>
        </div>

        {/* Guidelines */}
        <div className="text-xs sm:text-sm text-muted-foreground space-y-1 sm:space-y-2 px-1 sm:px-2">
          <p className="font-medium">📝 효과적인 리포팅을 위한 팁:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>최소 50자 이상으로 가능한 구체적으로 상황을 설명해주세요</li>
            <li>아이의 연령, 구체적인 행동, 지속 기간 등을 포함해주세요</li>
            <li>개인정보나 민감한 정보는 포함하지 말아주세요</li>
          </ul>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center sm:justify-end">
          <Button
            type="submit"
            disabled={isAnalyzing || message.length < 50}
            className="btn-brand w-full sm:w-auto min-w-[160px] h-12"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                AI 리포팅 중...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                즉시 리포팅 받기
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;