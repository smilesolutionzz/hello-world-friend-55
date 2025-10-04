import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Lightbulb, TrendingUp, AlertCircle, Sparkles } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface ExpertAnalysisSectionProps {
  analysis: string;
  isLoading?: boolean;
  testType?: string;
}

export function ExpertAnalysisSection({ 
  analysis, 
  isLoading = false,
  testType 
}: ExpertAnalysisSectionProps) {
  
  if (isLoading) {
    return (
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary animate-pulse" />
            <CardTitle>전문가 상세 해석 작성 중...</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    );
  }

  // 분석 텍스트를 섹션별로 파싱 (숫자로 시작하는 섹션들)
  const sections = analysis.split(/\n(?=\d+\.\s)/).filter(s => s.trim());
  
  const getSectionIcon = (index: number) => {
    const icons = [
      <Brain className="w-5 h-5" />,
      <Sparkles className="w-5 h-5" />,
      <TrendingUp className="w-5 h-5" />,
      <AlertCircle className="w-5 h-5" />,
      <Lightbulb className="w-5 h-5" />
    ];
    return icons[index] || <Brain className="w-5 h-5" />;
  };

  const getSectionColor = (index: number) => {
    const colors = [
      'from-blue-500/10 to-blue-600/5 border-blue-200',
      'from-purple-500/10 to-purple-600/5 border-purple-200',
      'from-green-500/10 to-green-600/5 border-green-200',
      'from-orange-500/10 to-orange-600/5 border-orange-200',
      'from-pink-500/10 to-pink-600/5 border-pink-200'
    ];
    return colors[index] || colors[0];
  };

  return (
    <Card className="border-2 border-primary/20 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-primary/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">전문가 상세 해석</CardTitle>
          </div>
          <Badge className="bg-primary/90">
            <Sparkles className="w-3 h-3 mr-1" />
            AI 전문 분석
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          심리 전문가 수준의 심층 분석과 맞춤형 제언을 제공합니다
        </p>
      </CardHeader>
      
      <CardContent className="p-6 space-y-4">
        {sections.length > 1 ? (
          sections.map((section, index) => {
            const [title, ...content] = section.split('\n');
            const cleanTitle = title.replace(/^\d+\.\s*/, '').trim();
            
            return (
              <div 
                key={index}
                className={`bg-gradient-to-br ${getSectionColor(index)} rounded-xl p-5 border`}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-white/50 text-primary">
                    {getSectionIcon(index)}
                  </div>
                  <h3 className="font-semibold text-lg flex-1">{cleanTitle}</h3>
                </div>
                <div className="pl-11">
                  <p className="text-sm leading-relaxed whitespace-pre-line">
                    {content.join('\n').trim()}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-6 border border-primary/20">
            <p className="leading-relaxed whitespace-pre-line text-sm">
              {analysis}
            </p>
          </div>
        )}
        
        <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-muted">
          <p className="text-xs text-muted-foreground flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>
              이 분석은 AI 기반 심리 분석 시스템을 통해 생성되었습니다. 
              전문적인 의료 진단이나 치료를 대체할 수 없으며, 
              심각한 증상이 있을 경우 반드시 전문가와 상담하시기 바랍니다.
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
