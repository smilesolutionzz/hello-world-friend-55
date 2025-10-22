import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, TrendingDown, CheckCircle, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ChallengingBehaviorResultProps {
  results: {
    answers: number[];
    total: number;
    average: number;
    severity: string;
  };
}

const ChallengingBehaviorResult = ({ results }: ChallengingBehaviorResultProps) => {
  const navigate = useNavigate();

  const getSeverityInfo = (severity: string) => {
    switch (severity) {
      case '심각':
        return {
          color: 'text-red-600',
          bgColor: 'bg-red-50 dark:bg-red-950/20',
          icon: AlertTriangle,
          message: '도전행동이 매우 심각한 수준입니다. 전문가의 즉각적인 개입이 필요합니다.',
          recommendation: '행동치료 전문가, 발달장애 전문의와의 상담을 권장합니다.'
        };
      case '중등도':
        return {
          color: 'text-orange-600',
          bgColor: 'bg-orange-50 dark:bg-orange-950/20',
          icon: TrendingDown,
          message: '도전행동이 중등도 수준입니다. 조기 개입이 필요합니다.',
          recommendation: '행동치료사와의 상담을 통해 행동 지원 계획을 수립하시기 바랍니다.'
        };
      case '경도':
        return {
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
          icon: CheckCircle,
          message: '경미한 수준의 도전행동이 관찰됩니다.',
          recommendation: '정기적인 관찰과 예방적 개입이 도움이 될 수 있습니다.'
        };
      default:
        return {
          color: 'text-green-600',
          bgColor: 'bg-green-50 dark:bg-green-950/20',
          icon: CheckCircle,
          message: '도전행동이 거의 관찰되지 않습니다.',
          recommendation: '현재의 긍정적인 환경과 지원을 유지하시기 바랍니다.'
        };
    }
  };

  const info = getSeverityInfo(results.severity);
  const Icon = info.icon;
  const percentage = Math.round((results.average / 3) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-secondary/30 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-brand-gradient mb-2">도전행동 평가 결과</h1>
          <p className="text-muted-foreground">검사 결과를 확인하세요</p>
        </div>

        {/* Score Card */}
        <Card className={`mb-6 ${info.bgColor}`}>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-32 h-32 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center shadow-lg">
                <div className="text-center">
                  <div className={`text-4xl font-bold ${info.color}`}>{percentage}%</div>
                  <div className="text-sm text-muted-foreground">심각도</div>
                </div>
              </div>
            </div>
            <CardTitle className={`text-2xl ${info.color}`}>
              <Icon className="w-8 h-8 mx-auto mb-2" />
              {results.severity}
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
                <div className="text-xs text-muted-foreground">최대 45점</div>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">평균</div>
                <div className="text-2xl font-bold">{results.average.toFixed(1)}점</div>
                <div className="text-xs text-muted-foreground">문항당 평균</div>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <h4 className="font-semibold">주요 권장사항</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>행동의 기능(원인)을 파악하기 위한 기능적 행동 분석(FBA)을 권장합니다</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>긍정적 행동 지원(PBS) 계획 수립이 필요합니다</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>대체 행동 교육 및 의사소통 기술 향상이 도움이 됩니다</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>환경 수정 및 예측 가능한 일과 구조화가 필요합니다</span>
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
              정확한 평가와 진단을 위해서는 반드시 발달장애 전문의, 임상심리사, 행동치료사 등 
              전문가의 종합적인 평가가 필요합니다.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChallengingBehaviorResult;
