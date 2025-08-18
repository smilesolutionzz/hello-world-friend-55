import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, Brain, ArrowLeft, ExternalLink } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChildAssessmentResultProps {
  results: {
    answers: Record<string, number>;
    total: number;
    average: number;
    ageGroup: string;
    gameScores: Record<string, number>;
  };
  onBack: () => void;
}

const ChildAssessmentResult = ({ results, onBack }: ChildAssessmentResultProps) => {
  const { total, average, ageGroup, gameScores } = results;
  
  const chartData = Object.entries(gameScores).map(([game, score]) => ({
    name: getShortGameName(game),
    value: score,
    fullMark: 100,
  }));

  const getShortGameName = (gameName: string) => {
    const names = {
      "색깔 스트룹 테스트": "주의집중",
      "작업기억 숫자게임": "작업기억",
      "표정 인식 게임": "사회인지"
    };
    return names[gameName as keyof typeof names] || gameName;
  };

  const getOverallEvaluation = (average: number) => {
    if (average >= 80) {
      return {
        level: "우수",
        description: "연령 대비 인지능력이 우수한 수준입니다.",
        color: "bg-green-100 text-green-800 border-green-200"
      };
    } else if (average >= 60) {
      return {
        level: "양호",
        description: "연령에 적합한 인지능력 수준입니다.",
        color: "bg-blue-100 text-blue-800 border-blue-200"
      };
    } else if (average >= 40) {
      return {
        level: "보통",
        description: "평균적인 인지능력 수준입니다.",
        color: "bg-yellow-100 text-yellow-800 border-yellow-200"
      };
    } else {
      return {
        level: "관찰 필요",
        description: "인지능력 지원이 필요할 수 있습니다.",
        color: "bg-orange-100 text-orange-800 border-orange-200"
      };
    }
  };

  const evaluation = getOverallEvaluation(average);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          뒤로가기
        </Button>
        <h1 className="text-3xl font-bold text-brand-gradient">아동청소년 게임검사 결과 (참고용)</h1>
        <div></div>
      </div>

      {/* 법적 안전 공지 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-blue-800 text-sm">
          <span className="font-semibold">📊 체크 결과 (참고용)</span><br />
          ⚠️ 이 결과는 참고용이며 의학적 진단이 절대 아닙니다. 지속적 어려움이 있으시면 반드시 전문의와 상담하세요.
        </p>
      </div>

      {/* Summary Card */}
      <Card className="p-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-foreground">검사 결과 요약</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">총점</span>
                <span className="text-2xl font-bold text-brand-gradient">{total}점</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">평균</span>
                <span className="text-2xl font-bold text-brand-gradient">{average.toFixed(1)}점</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">인지능력 수준</span>
                <Badge className={evaluation.color}>
                  {evaluation.level}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">연령대</span>
                <span className="text-lg">{ageGroup}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">검사일</span>
                <span className="text-lg">{new Date().toLocaleDateString('ko-KR')}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">게임별 점수</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </Card>

      {/* 전문가 해석 결과 */}
      <Card className="p-8">
        <h3 className="text-2xl font-bold text-foreground mb-6">✨ 결과 요약</h3>
        
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-lg font-medium mb-2">• 인지능력 점수: {total}점 / 300점</p>
              <p className="text-lg font-medium">• 능력수준: {evaluation.level}</p>
            </div>
            <div>
              <p className="text-lg font-medium mb-2">• 평균: {average.toFixed(1)}점</p>
              <p className="text-lg font-medium">• 연령대: {ageGroup}</p>
            </div>
          </div>
          
          <div className="bg-muted/30 rounded-lg p-6">
            <p className="text-lg leading-relaxed">
              <strong>해석:</strong> {evaluation.level === "우수" 
                ? `${ageGroup} 연령 기준으로 주의집중력, 작업기억, 사회인지 능력이 모두 우수한 수준입니다. 특히 복잡한 정보를 처리하고 기억하는 능력이 뛰어나며, 타인의 감정을 잘 이해하는 사회적 인지 능력도 발달되어 있습니다. 이러한 강점을 바탕으로 학습 능력과 사회적 관계 형성에서 긍정적인 결과를 기대할 수 있습니다. 다양한 인지 자극과 사회적 경험을 통해 지속적인 발달을 지원해주시기 바랍니다.`
                : evaluation.level === "양호"
                ? `${ageGroup} 연령에 적합한 인지능력을 보이고 있습니다. 주의집중, 기억, 사회인지 등 대부분의 영역에서 연령 기준에 맞는 수행을 보여주고 있어 정상적인 인지 발달을 하고 있다고 평가됩니다. 일상적인 학습 활동과 놀이를 통해 현재의 능력을 유지하고 발전시켜 나가시기 바랍니다. 아이의 관심사를 중심으로 한 활동들이 인지 발달에 도움이 될 것입니다.`
                : evaluation.level === "보통"
                ? `${ageGroup} 연령 기준으로 평균적인 인지능력 수준입니다. 일부 영역에서는 또래보다 빠른 발달을 보이고, 일부 영역에서는 시간이 더 필요할 수 있습니다. 개별적인 발달 패턴의 차이는 매우 자연스러운 현상입니다. 아이의 강점 영역을 찾아 격려하고, 부족한 부분은 재미있는 놀이와 활동을 통해 자연스럽게 향상시켜 나가시기 바랍니다. 충분한 시간과 인내심으로 아이만의 속도에 맞춰 발달을 지원해주세요.`
                : `일부 인지 영역에서 또래보다 느린 발달을 보이고 있어 추가적인 관심과 지원이 필요할 수 있습니다. 주의집중력, 기억력, 또는 사회인지 능력 중 일부에서 어려움이 있을 수 있으나, 적절한 지원과 훈련을 통해 충분히 개선 가능합니다. 소아정신과 전문의나 인지 발달 전문가와 상담하여 정확한 평가와 개별화된 지원 방안을 모색해보시기를 권장드립니다.`}
            </p>
          </div>
          
          <div className="text-center pt-4">
            <a 
              href="https://drive.google.com/file/d/17WD3mhW2T4TdkfxTzLpfH5bzFARxz_Vh/view?usp=drive_link"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-medium hover:underline"
            >
              👉 구독 후 더 정밀한 분석 리포트(PDF) 다운받기 (예시)
            </a>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="grid md:grid-cols-3 gap-4">
        <Button 
          className="btn-brand h-16"
          onClick={() => window.open('https://typebot.io/hilight-consult', '_blank')}
        >
          <ExternalLink className="w-5 h-5 mr-2" />
          <div className="text-left">
            <div className="font-semibold">전문가 상담 연결</div>
            <div className="text-sm opacity-90">즉시 상담 가능</div>
          </div>
        </Button>

        <Button 
          variant="outline" 
          className="h-16"
          disabled
        >
          <div className="text-left">
            <div className="font-semibold">PDF 리포트</div>
            <div className="text-sm text-muted-foreground">(추가 예정)</div>
          </div>
        </Button>

        <Button 
          variant="outline" 
          className="h-16"
          disabled
        >
          <div className="text-left">
            <div className="font-semibold">결과 저장</div>
            <div className="text-sm text-muted-foreground">(추가 예정)</div>
          </div>
        </Button>
      </div>

      {/* Additional Information */}
      <Card className="p-6 bg-blue-50 border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-2">참고사항</h4>
        <p className="text-blue-800 text-sm leading-relaxed">
          이 검사는 아동청소년 인지능력 선별을 위한 도구로, 의학적 진단을 대체할 수 없습니다. 
          정확한 인지능력 평가를 위해서는 반드시 전문의와 상담하시기 바랍니다.
        </p>
      </Card>
    </div>
  );
};

export default ChildAssessmentResult;