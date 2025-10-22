import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, CheckCircle, AlertCircle, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AdaptiveBehaviorResultProps {
  results: {
    answers: number[];
    total: number;
    average: number;
    level: string;
  };
}

const AdaptiveBehaviorResult = ({ results }: AdaptiveBehaviorResultProps) => {
  const navigate = useNavigate();

  const getLevelInfo = (level: string) => {
    switch (level) {
      case '높음':
        return {
          color: 'text-green-600',
          bgColor: 'bg-green-50 dark:bg-green-950/20',
          icon: TrendingUp,
          message: '적응행동 수준이 높습니다. 일상생활과 사회적 기능이 우수합니다.',
          recommendation: '현재의 긍정적인 발달을 유지하고 더욱 향상시킬 수 있도록 지속적인 지원이 필요합니다.'
        };
      case '중간':
        return {
          color: 'text-blue-600',
          bgColor: 'bg-blue-50 dark:bg-blue-950/20',
          icon: CheckCircle,
          message: '적응행동 수준이 평균입니다. 일부 영역에서 추가 지원이 필요할 수 있습니다.',
          recommendation: '취약한 영역을 파악하여 집중적인 훈련과 지원을 제공하는 것이 좋습니다.'
        };
      case '낮음':
        return {
          color: 'text-orange-600',
          bgColor: 'bg-orange-50 dark:bg-orange-950/20',
          icon: AlertCircle,
          message: '적응행동 수준이 낮습니다. 일상생활에서 상당한 지원이 필요합니다.',
          recommendation: '전문가의 체계적인 지원과 적응행동 훈련 프로그램 참여를 권장합니다.'
        };
      default:
        return {
          color: 'text-red-600',
          bgColor: 'bg-red-50 dark:bg-red-950/20',
          icon: AlertCircle,
          message: '적응행동 수준이 매우 낮습니다. 일상생활 전반에서 집중적인 지원이 필요합니다.',
          recommendation: '발달장애 전문가의 종합적인 평가와 개별화된 지원 계획이 시급히 필요합니다.'
        };
    }
  };

  const info = getLevelInfo(results.level);
  const Icon = info.icon;
  const percentage = Math.round((results.average / 3) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-secondary/30 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-brand-gradient mb-2">적응행동 평가 결과</h1>
          <p className="text-muted-foreground">검사 결과를 확인하세요</p>
        </div>

        {/* Score Card */}
        <Card className={`mb-6 ${info.bgColor}`}>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-32 h-32 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center shadow-lg">
                <div className="text-center">
                  <div className={`text-4xl font-bold ${info.color}`}>{percentage}%</div>
                  <div className="text-sm text-muted-foreground">독립성</div>
                </div>
              </div>
            </div>
            <CardTitle className={`text-2xl ${info.color}`}>
              <Icon className="w-8 h-8 mx-auto mb-2" />
              {results.level}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-lg font-medium">{info.message}</p>
            <p className="text-muted-foreground">{info.recommendation}</p>
          </CardContent>
        </Card>

        {/* Detailed Analysis */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>상세 분석</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">총점</div>
                <div className="text-2xl font-bold">{results.total}점</div>
                <div className="text-xs text-muted-foreground">최대 54점</div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">평균</div>
                <div className="text-2xl font-bold">{results.average.toFixed(1)}점</div>
                <div className="text-xs text-muted-foreground">문항당 평균</div>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <h4 className="font-semibold">평가 영역</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between p-3 bg-muted rounded-lg">
                  <span>일상생활 기술</span>
                  <span className="font-semibold">5개 항목</span>
                </div>
                <div className="flex justify-between p-3 bg-muted rounded-lg">
                  <span>사회적 기술</span>
                  <span className="font-semibold">4개 항목</span>
                </div>
                <div className="flex justify-between p-3 bg-muted rounded-lg">
                  <span>의사소통 기술</span>
                  <span className="font-semibold">3개 항목</span>
                </div>
                <div className="flex justify-between p-3 bg-muted rounded-lg">
                  <span>자기관리 기술</span>
                  <span className="font-semibold">3개 항목</span>
                </div>
                <div className="flex justify-between p-3 bg-muted rounded-lg">
                  <span>지역사회 적응</span>
                  <span className="font-semibold">3개 항목</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <h4 className="font-semibold">주요 권장사항</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>개별화된 교육 프로그램(IEP) 수립이 필요합니다</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>단계별, 체계적인 적응행동 훈련이 도움이 됩니다</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>작업치료, 언어치료 등 전문 치료 서비스를 고려하세요</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>가족 교육 및 지원 서비스가 필요합니다</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>다음 단계</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              className="w-full" 
              size="lg"
              onClick={() => navigate('/consultation-reservation')}
            >
              전문가 상담 예약하기
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/dashboard')}
            >
              <Home className="w-4 h-4 mr-2" />
              대시보드로 이동
            </Button>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>⚠️ 중요 안내:</strong> 이 검사 결과는 선별 도구이며 정식 진단이 아닙니다. 
              정확한 평가와 개별 지원 계획 수립을 위해서는 반드시 발달장애 전문가의 
              종합적인 평가가 필요합니다.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdaptiveBehaviorResult;
