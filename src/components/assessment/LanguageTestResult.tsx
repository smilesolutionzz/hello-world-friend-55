import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ExternalLink, Download, Mail } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface LanguageTestResultProps {
  results: {
    answers: number[];
    total: number;
    average: number;
    ageGroup: string;
  };
  onBack: () => void;
}

const LanguageTestResult = ({ results, onBack }: LanguageTestResultProps) => {
  const { total, average, ageGroup } = results;
  const today = new Date().toLocaleDateString('ko-KR');

  // 점수에 따른 평가
  const getEvaluation = (score: number) => {
    if (score <= 40) {
      return {
        level: "주의 필요",
        description: "전문가 상담을 권장합니다.",
        color: "text-red-600"
      };
    } else if (score <= 60) {
      return {
        level: "경계선",
        description: "경계선 소견, 추가 평가 추천.",
        color: "text-yellow-600"
      };
    } else {
      return {
        level: "양호",
        description: "양호. 경과 관찰 권장.",
        color: "text-green-600"
      };
    }
  };

  const evaluation = getEvaluation(total);

  // 차트 데이터
  const chartData = [
    {
      name: '평균 점수',
      value: average,
      fullMark: 4
    }
  ];

  const handleExpertConsult = () => {
    window.open('https://typebot.io/hilight-consult', '_blank');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          뒤로가기
        </Button>
        <h1 className="text-2xl font-bold text-brand-gradient">검사 결과 리포트</h1>
        <div></div>
      </div>

      {/* Summary Card */}
      <Card className="p-8">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-brand-gradient">언어발달 검사 결과</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-8">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">총점</p>
              <p className="text-2xl font-bold">{total}점</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">평균</p>
              <p className="text-2xl font-bold">{average}점</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">연령대</p>
              <p className="text-2xl font-bold">{ageGroup}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">검사일</p>
              <p className="text-2xl font-bold">{today}</p>
            </div>
          </div>

          <div className="mt-8 p-6 bg-muted/50 rounded-lg">
            <p className="text-lg font-semibold mb-2">종합 평가</p>
            <p className={`text-xl font-bold ${evaluation.color}`}>{evaluation.level}</p>
            <p className="text-muted-foreground mt-2">{evaluation.description}</p>
          </div>
        </div>
      </Card>

      {/* Chart */}
      <Card className="p-8">
        <h3 className="text-xl font-semibold mb-6 text-center">점수 분포</h3>
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
      </Card>

      {/* Action Buttons */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-6">
          <h3 className="font-semibold mb-4">전문가 상담</h3>
          <p className="text-sm text-muted-foreground mb-4">
            더 자세한 분석과 상담이 필요하시다면 전문가와 연결해드립니다.
          </p>
          <Button 
            onClick={handleExpertConsult}
            className="w-full btn-brand flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            전문가 상담 연결
          </Button>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold mb-4">결과 저장 및 공유</h3>
          <p className="text-sm text-muted-foreground mb-4">
            검사 결과를 PDF로 저장하거나 알림으로 받아보세요.
          </p>
          <div className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full flex items-center gap-2"
              disabled
            >
              <Download className="w-4 h-4" />
              PDF 리포트 (추가 예정)
            </Button>
            <Button 
              variant="outline" 
              className="w-full flex items-center gap-2"
              disabled
            >
              <Mail className="w-4 h-4" />
              결과 저장 (추가 예정)
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LanguageTestResult;