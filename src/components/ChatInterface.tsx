import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Send, Sparkles, AlertTriangle, ExternalLink, FileText, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useIsMobile } from "@/hooks/use-mobile";
import { VoiceInputButton } from "@/components/ui/VoiceInputButton";

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
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || message.length < 30) {
      toast({
        title: "입력 확인",
        description: "최소 30자 이상 구체적으로 작성해주세요.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    setReport(null);
    
    try {
      console.log('🚀 즉시 리포팅 시작:', message);
      
      const { data, error } = await supabase.functions.invoke('instant-report', {
        body: { message }
      });

      console.log('📡 서버 응답:', data);
      console.log('❌ 에러 확인:', error);

      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }

      if (!data || !data.report) {
        console.error('응답 오류:', data);
        throw new Error(data?.error || '서버 응답 오류');
      }

      setReport(data);
      
      // 성공 토스트
      toast({
        title: "✅ 분석 완료",
        description: "AIH 리포팅이 성공적으로 생성되었습니다!",
        variant: "default"
      });

      // 위험 수준에 따른 추가 토스트
      if (data.riskLevel === 'high') {
        toast({
          title: "⚠️ 긴급 상황 감지",
          description: "즉시 전문가 도움이 필요합니다. 119 또는 1577-0199로 연락하세요.",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error('💥 AIH 분석 오류:', error);
      const errorMessage = error?.message?.includes('토큰') ? 
        '토큰이 부족합니다. 토큰을 충전 후 다시 시도해주세요.' :
        '분석 중 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      
      toast({
        title: "❌ 분석 실패",
        description: errorMessage,
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

        {/* AIH 리포팅 결과 */}
        <Card className="p-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold text-brand-gradient">AIH 즉시 리포팅 (참고용)</h2>
              </div>
              <div className="text-sm text-muted-foreground">
                {new Date(report.timestamp).toLocaleString('ko-KR')}
              </div>
            </div>

            {/* 법적 안전 공지 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800 text-sm">
                <span className="font-semibold">⚠️ 중요:</span> 이 리포팅은 참고용이며 전문적 평가가 아닙니다. 
                정확한 평가와 지원은 반드시 전문기관에서 받으시기 바랍니다.
              </p>
            </div>

            {/* AIH 분석 결과 */}
            <div className="prose prose-lg max-w-none">
              <div className="whitespace-pre-line text-foreground leading-relaxed">
                {report.report}
              </div>
            </div>
          </div>
        </Card>

        {/* 추가 서비스 안내 */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 hover-glow cursor-pointer" onClick={() => navigate('/assessment')}>
            <div className="flex items-center gap-4">
              <Clock className="w-8 h-8 text-primary" />
              <div>
                <h3 className="font-bold text-lg text-brand-gradient">3분 전문 체크</h3>
                <p className="text-sm text-muted-foreground">연령별 맞춤 심층 분석</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover-glow cursor-pointer" onClick={() => navigate('/expert-hiring')}>
            <div className="flex items-center gap-4">
              <ExternalLink className="w-8 h-8 text-primary" />
              <div>
                <h3 className="font-bold text-lg text-brand-gradient">전문가 상담 연결</h3>
                <p className="text-sm text-muted-foreground">검증된 전문가와 1:1 상담</p>
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
                  onClick={() => navigate('/expert-hiring')}
                >
                  전문가 상담 받기
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
          <span className="text-lg sm:text-xl font-semibold text-brand-gradient">AIH 즉시 리포팅</span>
          <span className="text-xs sm:text-sm bg-primary/20 text-primary px-2 py-1 rounded-full">beta</span>
        </div>
      </div>

      {/* Chat Input Form */}
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div className="relative">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="예시: 14개월 아기가 아직 걷지 못해요... / 고3 아들이 극도로 예민해져서 힘들어요... / 육아 스트레스로 아이에게 화를 자주 내요..."
            className="chat-input resize-none min-h-[140px] sm:min-h-[150px] text-sm sm:text-lg leading-relaxed px-4 py-4 sm:px-6 sm:py-5 pr-20"
            disabled={isAnalyzing}
            maxLength={500}
          />
          
          {/* Voice Input Button - moved to bottom right */}
          <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4">
            <VoiceInputButton
              onTranscription={(text) => setMessage(prev => prev + text)}
              disabled={isAnalyzing}
              className="bg-primary/10 hover:bg-primary/20 text-primary border-primary/20"
            />
          </div>
          
          {/* Character Count */}
          <div className="absolute bottom-3 sm:bottom-4 left-4 sm:left-6 text-xs sm:text-sm text-muted-foreground bg-background/80 backdrop-blur-sm px-2 py-1 rounded">
            {message.length}/500 (최소 30자)
          </div>
        </div>

        {/* Guidelines */}
        <div className="text-xs sm:text-sm text-muted-foreground space-y-1 sm:space-y-2 px-1 sm:px-2">
          <p className="font-medium">📝 효과적인 리포팅을 위한 팁:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>최소 30자 이상으로 가능한 구체적으로 상황을 설명해주세요</li>
            <li>대상자의 연령, 구체적인 행동, 지속 기간 등을 포함해주세요</li>
            <li>개인정보나 민감한 정보는 포함하지 말아주세요</li>
          </ul>
        </div>

        {/* Submit Button */}
        <div className={`flex ${isMobile ? 'justify-center' : 'justify-end'}`}>
          <Button
            type="submit"
            disabled={isAnalyzing || message.length < 30}
            className={`btn-brand ${isMobile ? 'w-full' : 'w-auto'} min-w-[160px] h-12 text-sm sm:text-base`}
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                AIH 리포팅 중...
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