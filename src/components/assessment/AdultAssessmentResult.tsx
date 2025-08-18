import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertTriangle, Brain, ArrowLeft, ExternalLink } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AdultAssessmentResultProps {
  results: {
    answers: Record<string, number>;
    total: number;
    average: number;
    ageGroup: string;
    categoryScores: Record<string, number>;
  };
  onBack: () => void;
}

const AdultAssessmentResult = ({ results, onBack }: AdultAssessmentResultProps) => {
  const { total, average, ageGroup, categoryScores } = results;
  
  const chartData = Object.entries(categoryScores).map(([category, score]) => ({
    name: getCategoryName(category),
    value: score,
    fullMark: 3,
  }));

  const getCategoryName = (category: string) => {
    const names = {
      depression: "우울 척도",
      anxiety: "불안 척도",
      personality: "성격 5요인",
      workplace: "직장 적응도"
    };
    return names[category as keyof typeof names] || category;
  };

  const getOverallEvaluation = (average: number) => {
    if (average <= 0.5) {
      return {
        level: "양호",
        description: "전반적인 정신건강 상태가 양호합니다.",
        color: "bg-green-100 text-green-800 border-green-200"
      };
    } else if (average <= 1.0) {
      return {
        level: "경미한 증상",
        description: "일부 영역에서 경미한 증상이 있을 수 있습니다.",
        color: "bg-yellow-100 text-yellow-800 border-yellow-200"
      };
    } else if (average <= 2.0) {
      return {
        level: "중등도 증상",
        description: "중등도 수준의 증상으로 관심이 필요합니다.",
        color: "bg-orange-100 text-orange-800 border-orange-200"
      };
    } else {
      return {
        level: "심각한 증상",
        description: "즉시 전문가의 도움이 필요합니다.",
        color: "bg-red-100 text-red-800 border-red-200"
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
        <h1 className="text-3xl font-bold text-brand-gradient">성인 임상심리평가 결과 (참고용)</h1>
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
                <span className="text-lg font-medium">종합 평가</span>
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
            <h3 className="text-xl font-semibold">영역별 점수</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis domain={[0, 3]} />
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
              <p className="text-lg font-medium mb-2">• 심리평가 점수: {total}점 / {Object.keys(categoryScores).length * 3}점</p>
              <p className="text-lg font-medium">• 종합평가: {evaluation.level}</p>
            </div>
            <div>
              <p className="text-lg font-medium mb-2">• 평균: {average.toFixed(1)}점</p>
              <p className="text-lg font-medium">• 연령대: {ageGroup}</p>
            </div>
          </div>
          
          <div className="bg-muted/30 rounded-lg p-6">
            <p className="text-lg leading-relaxed">
              <strong>해석:</strong> {evaluation.level === "양호" 
                ? "종합적인 심리평가 결과 전반적인 정신건강 상태가 양호한 수준으로 나타났습니다. 우울 및 불안 증상이 정상 범위에 있으며, 성격적 특성도 건강하게 발달되어 있고 직장이나 사회생활에서의 적응 능력도 우수합니다. 현재의 건강한 정신상태를 유지하기 위해 규칙적인 생활 패턴, 적절한 스트레스 관리, 그리고 균형 잡힌 사회적 관계를 지속해 나가시기 바랍니다. 정기적인 자기 점검을 통해 심리적 웰빙을 계속 유지해주세요."
                : evaluation.level === "경미한 증상"
                ? "일부 심리적 영역에서 경미한 증상이나 스트레스 반응이 나타나고 있습니다. 이는 일상생활의 스트레스나 환경 변화에 대한 자연스러운 반응일 수 있으며, 적절한 자기관리를 통해 충분히 개선 가능한 수준입니다. 규칙적인 운동, 충분한 휴식, 스트레스 해소 활동 등을 통해 증상을 완화시킬 수 있습니다. 증상이 지속되거나 악화될 경우 전문가와의 상담을 고려해보시기 바랍니다."
                : evaluation.level === "중등도 증상"
                ? "중등도 수준의 심리적 증상이 확인되어 적극적인 관심과 관리가 필요합니다. 우울이나 불안 증상이 일상생활에 일부 영향을 미치고 있을 수 있으며, 직장이나 사회적 적응에서도 어려움을 경험할 수 있습니다. 전문가와의 상담을 통해 정확한 평가를 받고 적절한 치료 계획을 수립하시기를 강력히 권장드립니다. 인지행동치료나 상담 치료를 통해 증상 개선을 기대할 수 있습니다."
                : "심각한 수준의 심리적 증상이 확인되어 즉시 전문가의 도움이 필요합니다. 현재 상태는 일상생활에 상당한 영향을 미치고 있을 가능성이 높으며, 방치할 경우 더욱 악화될 수 있습니다. 정신건강의학과 전문의와 상담하여 정확한 진단과 적절한 치료를 받으시기를 적극 권장드립니다. 약물치료와 심리치료를 병행하여 증상 완화와 기능 회복을 도모하는 것이 중요합니다."}
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
          이 검사는 성인 임상심리평가를 위한 선별도구로, 의학적 진단을 대체할 수 없습니다. 
          정확한 진단과 치료를 위해서는 반드시 정신건강의학과 전문의와 상담하시기 바랍니다.
        </p>
      </Card>
    </div>
  );
};

export default AdultAssessmentResult;