import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const PersonalityAnalysis = () => {
  const [analysis, setAnalysis] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<any>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [dataCounts, setDataCounts] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadLastAnalysis();
  }, []);

  const loadLastAnalysis = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('personality_analysis')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading last analysis:', error);
        return;
      }

      if (data) {
        setLastAnalysis(data);
        setAnalysis(data.analysis_text);
      }
    } catch (error) {
      console.error('Error in loadLastAnalysis:', error);
    }
  };

  const generateAnalysis = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "로그인이 필요해",
          description: "먼저 로그인해줘!",
          variant: "destructive"
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('personality-analyzer', {
        body: { userId: user.id }
      });

      if (error) {
        console.error('Error invoking function:', error);
        throw error;
      }

      if (data.error) {
        if (data.error === 'insufficient_data') {
          setAnalysis(data.analysis);
          setSuggestions(data.suggestions || []);
          setDataCounts(data.dataCounts);
          toast({
            title: "데이터 부족",
            description: data.message,
            variant: "destructive"
          });
        } else {
          toast({
            title: "오류 발생",
            description: data.error,
            variant: "destructive"
          });
          if (data.analysis) {
            setAnalysis(data.analysis);
          }
        }
        return;
      }

      setAnalysis(data.analysis);
      setSuggestions([]);
      setDataCounts(null);
      toast({
        title: "분석 완료!",
        description: "너에 대한 종합 분석이 완료됐어 👀"
      });
      
      await loadLastAnalysis();
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "분석 실패",
        description: "분석 중 문제가 생겼어. 잠시 후 다시 시도해줘!",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatAnalysisText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // 숫자로 시작하는 카테고리 제목
      if (/^\d+\)/.test(line.trim())) {
        return (
          <div key={idx} className="mt-6 mb-2">
            <h3 className="text-lg font-bold text-primary">{line}</h3>
          </div>
        );
      }
      // "한 줄로 요약하면" 같은 특별 섹션
      if (line.includes('한 줄로 요약') || line.includes('요약하면')) {
        return (
          <div key={idx} className="mt-6 p-4 bg-primary/5 rounded-lg border-l-4 border-primary">
            <p className="text-foreground font-semibold">{line}</p>
          </div>
        );
      }
      // 일반 텍스트
      if (line.trim()) {
        return (
          <p key={idx} className="text-foreground/90 leading-relaxed mb-2">
            {line}
          </p>
        );
      }
      return <div key={idx} className="h-2" />;
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <CardTitle className="text-2xl">나는 어떤 사람일까?</CardTitle>
          </div>
          <Button
            onClick={generateAnalysis}
            disabled={isLoading}
            variant="default"
            size="sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                분석 중...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                {analysis ? "다시 분석하기" : "분석 시작"}
              </>
            )}
          </Button>
        </div>
        {lastAnalysis && (
          <p className="text-sm text-muted-foreground mt-2">
            마지막 분석: {new Date(lastAnalysis.created_at).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        )}
      </CardHeader>
      <CardContent>
        {!analysis && !isLoading && (
          <div className="text-center py-12">
            <Sparkles className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground mb-4">
              너의 검사 결과와 상담 내역을 바탕으로<br />
              ChatGPT처럼 친근하게 성향을 분석해줄게!
            </p>
            <Button onClick={generateAnalysis} size="lg">
              <Sparkles className="w-4 h-4 mr-2" />
              나 분석하기
            </Button>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-12">
            <Loader2 className="w-16 h-16 mx-auto mb-4 animate-spin text-primary" />
            <p className="text-muted-foreground">
              너에 대해 열심히 분석하고 있어...<br />
              잠시만 기다려줘! 🤔
            </p>
          </div>
        )}

        {analysis && !isLoading && (
          <div className="prose prose-sm max-w-none">
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg p-6 mb-6">
              <p className="text-lg text-foreground leading-relaxed">
                {formatAnalysisText(analysis)}
              </p>
            </div>

            {dataCounts && suggestions.length > 0 && (
              <div className="mt-6 p-6 bg-muted/50 rounded-lg border-2 border-primary/20">
                <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  더 정확한 분석을 위한 추천
                </h4>
                <div className="mb-4 text-sm text-muted-foreground">
                  현재 데이터: {dataCounts.total}개 / 권장: {dataCounts.required}개 이상
                </div>
                <div className="space-y-2">
                  {suggestions.map((suggestion, idx) => (
                    <div 
                      key={idx}
                      className="p-3 bg-background rounded-lg border border-border hover:border-primary/50 transition-colors"
                    >
                      <p className="text-sm text-foreground">{suggestion}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {lastAnalysis?.data_sources && !dataCounts && (
              <div className="mt-6 pt-6 border-t border-border">
                <p className="text-xs text-muted-foreground text-center">
                  📊 이 분석은 검사 {lastAnalysis.data_sources.assessments_count}건, 
                  상담 {lastAnalysis.data_sources.consultations_count}건, 
                  관찰 {lastAnalysis.data_sources.observations_count}건의 데이터를 기반으로 했어
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
