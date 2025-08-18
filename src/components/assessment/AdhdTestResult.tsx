import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ExternalLink, MessageCircle, Users } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface AdhdTestResultProps {
  results: {
    answers: number[];
    total: number;
    average: number;
    ageGroup: string;
    severity: string;
  };
  onBack: () => void;
  onStartAIChat?: () => void;
  onStartRealTimeChat?: () => void;
}

const AdhdTestResult = ({ results, onBack, onStartAIChat, onStartRealTimeChat }: AdhdTestResultProps) => {
  const { total, average, ageGroup, severity } = results;
  
  const getOverallEvaluation = (severity: string) => {
    if (severity === "정상 범위") {
      return {
        level: "정상 범위",
        description: "ADHD 증상이 일반적인 범위 내에 있습니다.",
        color: "bg-green-100 text-green-800 border-green-200"
      };
    } else if (severity === "경계선 수준") {
      return {
        level: "경계선 수준",
        description: "일부 ADHD 증상이 나타날 수 있어 관찰이 필요합니다.",
        color: "bg-yellow-100 text-yellow-800 border-yellow-200"
      };
    } else if (severity === "중등도 수준") {
      return {
        level: "중등도 수준",
        description: "ADHD 증상이 중등도 수준으로 전문가 상담을 권장합니다.",
        color: "bg-orange-100 text-orange-800 border-orange-200"
      };
    } else {
      return {
        level: "심각한 수준",
        description: "ADHD 증상이 심각한 수준으로 즉시 전문가 도움이 필요합니다.",
        color: "bg-red-100 text-red-800 border-red-200"
      };
    }
  };
  
  // ADHD 증상 영역별 분석 (부주의, 과잉행동-충동성)
  const inattentionScore = results.answers.slice(0, 9).reduce((sum, score) => sum + score, 0);
  const hyperactivityScore = results.answers.slice(9, 18).reduce((sum, score) => sum + score, 0);
  
  const chartData = [
    {
      name: "부주의 증상",
      value: inattentionScore,
      fullMark: 27,
    },
    {
      name: "과잉행동/충동성",
      value: hyperactivityScore,
      fullMark: 27,
    }
  ];

  const evaluation = getOverallEvaluation(severity);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          뒤로가기
        </Button>
        <h1 className="text-3xl font-bold text-brand-gradient">ADHD 자가체크 결과 (참고용)</h1>
        <div></div>
      </div>

      {/* 법적 안전 공지 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-blue-800 text-sm">
          <span className="font-semibold">📊 체크 결과 (참고용)</span><br />
          ⚠️ 이 결과는 참고용이며 의학적 진단이 절대 아닙니다. ADHD가 의심되면 반드시 정신건강의학과 전문의와 상담하세요.
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
                <span className="text-lg font-medium">평가 결과</span>
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
            <h3 className="text-xl font-semibold">증상 영역별 점수</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis domain={[0, 27]} />
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
        <h3 className="text-2xl font-bold text-foreground mb-6">✨ 결과 해석</h3>
        
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-lg font-medium mb-2">• ADHD 체크 점수: {total}점 / 54점</p>
              <p className="text-lg font-medium">• 평가 결과: {evaluation.level}</p>
            </div>
            <div>
              <p className="text-lg font-medium mb-2">• 부주의 증상: {inattentionScore}점</p>
              <p className="text-lg font-medium">• 과잉행동/충동성: {hyperactivityScore}점</p>
            </div>
          </div>
          
          <div className="bg-muted/30 rounded-lg p-6">
            <p className="text-lg leading-relaxed">
              <strong>해석:</strong> {evaluation.level === "정상 범위" 
                ? "ADHD 자가체크 결과 현재 증상들이 일반적인 범위 내에 있는 것으로 나타났습니다. 부주의나 과잉행동/충동성 증상이 일상생활에 큰 지장을 주지 않는 수준입니다. 하지만 스트레스나 환경 변화로 인해 증상이 나타날 수 있으므로, 규칙적인 생활 패턴과 적절한 스트레스 관리를 통해 현재의 안정적인 상태를 유지하시기 바랍니다."
                : evaluation.level === "경계선 수준"
                ? "ADHD 자가체크 결과 일부 증상들이 경계선 수준에 있어 주의 깊은 관찰이 필요합니다. 부주의나 과잉행동/충동성 증상이 때때로 일상생활에 영향을 미칠 수 있습니다. 생활 습관 개선, 시간 관리 기술 훈련, 규칙적인 운동 등을 통해 증상을 관리해보시고, 증상이 지속되거나 악화될 경우 정신건강의학과 전문의와 상담받으시기를 권장합니다."
                : evaluation.level === "중등도 수준"
                ? "ADHD 자가체크 결과 중등도 수준의 증상이 확인되어 전문가의 정확한 평가가 필요합니다. 부주의나 과잉행동/충동성 증상이 학업, 업무, 또는 대인관계에서 상당한 어려움을 야기할 수 있습니다. 정신건강의학과에서 정확한 진단을 받고 적절한 치료 계획을 수립하시기를 강력히 권장드립니다. 약물치료와 행동치료를 병행하면 증상 개선에 많은 도움이 됩니다."
                : "ADHD 자가체크 결과 심각한 수준의 증상이 확인되어 즉시 전문가의 도움이 필요합니다. 현재 증상들이 일상생활 전반에 상당한 지장을 주고 있을 가능성이 높습니다. 정신건강의학과에서 정확한 진단과 즉시 치료를 받으시기를 적극 권장드립니다. ADHD는 적절한 치료를 통해 충분히 관리 가능한 질환이므로 전문가와 상담하여 맞춤형 치료 계획을 수립하시기 바랍니다."}
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
      <div className="grid md:grid-cols-5 gap-4">
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

        {onStartAIChat && (
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white h-16"
            onClick={onStartAIChat}
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            <div className="text-left">
              <div className="font-semibold">AI 상담 시작</div>
              <div className="text-sm opacity-90">맞춤 상담 제공</div>
            </div>
          </Button>
        )}

        {onStartRealTimeChat && (
          <Button 
            className="bg-green-600 hover:bg-green-700 text-white h-16"
            onClick={onStartRealTimeChat}
          >
            <Users className="w-5 h-5 mr-2" />
            <div className="text-left">
              <div className="font-semibold">실시간 채팅</div>
              <div className="text-sm opacity-90">전문가와 직접</div>
            </div>
          </Button>
        )}

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
          이 검사는 ADHD 증상 체크를 위한 선별도구로, 의학적 진단을 대체할 수 없습니다. 
          정확한 진단과 치료를 위해서는 반드시 정신건강의학과 전문의와 상담하시기 바랍니다.
        </p>
      </Card>
    </div>
  );
};

export default AdhdTestResult;