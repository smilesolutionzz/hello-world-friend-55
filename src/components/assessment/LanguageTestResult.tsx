import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ExternalLink, Download, Mail, UserCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();

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
      name: '총점',
      value: total,
      fullMark: 100
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
              <p className="text-sm text-muted-foreground">연령대</p>
              <p className="text-2xl font-bold">{ageGroup}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">평가 결과</p>
              <p className="text-2xl font-bold">{evaluation.level}</p>
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

      {/* 전문가 해석 결과 */}
      <Card className="p-8">
        <h3 className="text-2xl font-bold text-foreground mb-6">✨ 결과 요약</h3>
        
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-lg font-medium mb-2">• 언어발달 점수: {total}점 / 100점</p>
              <p className="text-lg font-medium">• 평가: {evaluation.level}</p>
            </div>
            <div>
              <p className="text-lg font-medium">• 연령대: {ageGroup}</p>
            </div>
          </div>
          
          <div className="bg-muted/30 rounded-lg p-6">
            <p className="text-lg leading-relaxed">
              <strong>해석:</strong> {evaluation.level === "양호" 
                ? "언어발달이 연령대 기준으로 양호한 수준입니다. 현재의 언어적 상호작용과 학습 환경을 유지하며, 지속적인 언어 자극을 제공하시기 바랍니다."
                : evaluation.level === "경계선"
                ? "언어발달이 경계선 수준으로, 추가적인 관찰과 언어 자극이 필요합니다. 일상 대화를 늘리고 책 읽기 등의 활동을 통해 개선할 수 있습니다."
                : "언어발달에 주의가 필요한 상태입니다. 전문가와의 상담을 통해 개별적인 언어치료 계획을 수립하시기를 권장드립니다."}
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

      {/* Chart */}
      <Card className="p-8">
        <h3 className="text-xl font-semibold mb-6 text-center">점수 분포</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
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

        {/* Expert Consultation CTA */}
        <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0">
              <UserCheck className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-foreground mb-1">언어 전문가 상담 받기</h4>
              <p className="text-sm text-muted-foreground mb-3">
                언어발달 검사 결과를 바탕으로 전문가 상담을 받아보세요.
              </p>
              <Button 
                onClick={() => navigate('/expert?category=언어&mode=online')}
                className="gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                언어치료사 연결
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LanguageTestResult;