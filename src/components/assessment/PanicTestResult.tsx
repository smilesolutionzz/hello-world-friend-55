import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Heart, ArrowLeft, ExternalLink } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PanicTestResultProps {
  results: {
    answers: number[];
    total: number;
    average: number;
    severity: string;
  };
  onBack: () => void;
}

const PanicTestResult = ({ results, onBack }: PanicTestResultProps) => {
  const { total, average, severity } = results;
  
  const chartData = [
    {
      name: '평균 점수',
      value: average,
      fullMark: 4,
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "정상":
        return "bg-green-100 text-green-800 border-green-200";
      case "경미":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "중등도":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "심각":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRecommendation = (severity: string) => {
    switch (severity) {
      case "정상":
        return {
          icon: <CheckCircle className="w-6 h-6 text-green-600" />,
          title: "양호한 상태",
          description: "현재 공황장애 증상이 거의 없는 상태입니다. 정기적인 자가관리를 통해 현재 상태를 유지하시기 바랍니다."
        };
      case "경미":
        return {
          icon: <Heart className="w-6 h-6 text-yellow-600" />,
          title: "경미한 증상",
          description: "가벼운 불안 증상이 있을 수 있습니다. 스트레스 관리와 이완 기법을 통해 증상을 완화할 수 있습니다."
        };
      case "중등도":
        return {
          icon: <AlertTriangle className="w-6 h-6 text-orange-600" />,
          title: "중등도 증상",
          description: "공황장애 증상이 중등도 수준입니다. 전문가와 상담하여 적절한 치료 방법을 찾아보시는 것을 권장합니다."
        };
      case "심각":
        return {
          icon: <AlertTriangle className="w-6 h-6 text-red-600" />,
          title: "심각한 증상",
          description: "즉시 전문가의 도움이 필요합니다. 정신건강의학과 전문의와 상담받으시기를 적극 권장드립니다."
        };
      default:
        return {
          icon: <Heart className="w-6 h-6 text-gray-600" />,
          title: "검사 완료",
          description: "검사가 완료되었습니다."
        };
    }
  };

  const recommendation = getRecommendation(severity);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          뒤로가기
        </Button>
        <h1 className="text-3xl font-bold text-brand-gradient">불안감 체크 결과 (참고용)</h1>
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
                <span className="text-2xl font-bold text-brand-gradient">{average}점</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">심각도</span>
                <Badge className={getSeverityColor(severity)}>
                  {severity}
                </Badge>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">검사일</span>
                <span className="text-lg">{new Date().toLocaleDateString('ko-KR')}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold">점수 분포</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 4]} />
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
              <p className="text-lg font-medium mb-2">• 불안감 점수: {total}점 / 84점</p>
              <p className="text-lg font-medium">• 심각도: {severity}</p>
            </div>
            <div>
              <p className="text-lg font-medium mb-2">• 평균: {average}점</p>
              <p className="text-lg font-medium">• 검사일: {new Date().toLocaleDateString('ko-KR')}</p>
            </div>
          </div>
          
          <div className="bg-muted/30 rounded-lg p-6">
            <p className="text-lg leading-relaxed">
              <strong>해석:</strong> {severity === "정상" 
                ? "현재 공황장애 증상이 거의 없는 양호한 상태입니다. 정기적인 자가관리와 스트레스 관리를 통해 현재 상태를 유지하시기 바랍니다."
                : severity === "경미"
                ? "가벼운 불안 증상이 있을 수 있습니다. 규칙적인 운동과 이완 기법, 스트레스 관리를 통해 증상을 완화할 수 있습니다."
                : severity === "중등도"
                ? "공황장애 증상이 중등도 수준으로 나타나고 있습니다. 전문가와 상담하여 적절한 치료 방법을 찾아보시는 것을 권장합니다."
                : "심각한 공황장애 증상이 확인됩니다. 즉시 전문가의 도움이 필요하며, 정신건강의학과 전문의와 상담받으시기를 적극 권장드립니다."}
            </p>
          </div>
          
          <div className="text-center pt-4">
            <p className="text-primary font-medium">
              👉 더 정밀한 분석 리포트(PDF) 받아보기
            </p>
          </div>
        </div>
      </Card>

      {/* Recommendation Card */}
      <Card className="p-8">
        <div className="flex items-start gap-4">
          {recommendation.icon}
          <div className="flex-1 space-y-4">
            <h3 className="text-2xl font-bold text-foreground">{recommendation.title}</h3>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {recommendation.description}
            </p>
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
          이 검사는 자가진단 도구로, 의학적 진단을 대체할 수 없습니다. 
          정확한 진단과 치료를 위해서는 반드시 전문의와 상담하시기 바랍니다.
        </p>
      </Card>
    </div>
  );
};

export default PanicTestResult;