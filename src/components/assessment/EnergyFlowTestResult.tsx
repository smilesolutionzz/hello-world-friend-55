import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Zap, Sun, Moon, Battery, Clock, Heart, AlertTriangle, Download, Share2 } from "lucide-react";

interface EnergyFlowTestResultProps {
  results: {
    answers: Record<string, string>;
    totalScore: number;
    energyType: string;
    peakTime: string;
    recoveryStyle: string;
    burnoutRisk: string;
  };
  onBack: () => void;
}

export default function EnergyFlowTestResult({ results, onBack }: EnergyFlowTestResultProps) {
  const { totalScore, energyType, peakTime, recoveryStyle, burnoutRisk } = results;
  const maxScore = 32;
  const percentage = Math.round((totalScore / maxScore) * 100);

  const getEnergyTypeInfo = () => {
    switch (energyType) {
      case "활력충만형":
        return {
          color: "bg-green-500",
          description: "당신은 에너지 관리의 달인입니다! 활력이 넘치고 일상을 효율적으로 보내고 있어요.",
          tips: ["현재 라이프스타일 유지하기", "주변 사람들에게 긍정 에너지 나눠주기", "새로운 도전을 통해 성장하기"]
        };
      case "균형안정형":
        return {
          color: "bg-blue-500",
          description: "안정적인 에너지 패턴을 가지고 있어요. 조금만 더 신경 쓰면 활력이 더 높아질 수 있어요.",
          tips: ["규칙적인 수면 습관 강화", "가벼운 운동 추가하기", "충분한 수분 섭취"]
        };
      case "회복필요형":
        return {
          color: "bg-yellow-500",
          description: "에너지가 조금 부족한 상태예요. 휴식과 회복에 더 신경 쓸 필요가 있어요.",
          tips: ["충분한 수면 확보 (7-8시간)", "스트레스 관리 방법 찾기", "에너지 소모 활동 점검하기"]
        };
      default:
        return {
          color: "bg-red-500",
          description: "에너지 관리가 시급히 필요한 상태예요. 전문가 상담을 고려해보세요.",
          tips: ["즉시 휴식 취하기", "전문가 상담 받아보기", "생활 패턴 전면 점검"]
        };
    }
  };

  const getBurnoutRiskColor = () => {
    switch (burnoutRisk) {
      case "낮음": return "bg-green-100 text-green-800 border-green-200";
      case "보통": return "bg-blue-100 text-blue-800 border-blue-200";
      case "주의": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-red-100 text-red-800 border-red-200";
    }
  };

  const energyInfo = getEnergyTypeInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-4">
      <div className="max-w-3xl mx-auto pt-8 pb-16">
        <div className="mb-6">
          <Button variant="ghost" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            돌아가기
          </Button>
        </div>

        {/* 메인 결과 카드 */}
        <Card className="border-amber-200 shadow-xl mb-6 overflow-hidden">
          <div className={`${energyInfo.color} p-6 text-white`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Zap className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">일상 에너지 흐름 검사 결과</h2>
                  <p className="text-white/80">당신의 에너지 패턴 분석 리포트</p>
                </div>
              </div>
              <Badge className="bg-white/20 text-white text-lg px-4 py-2">
                {energyType}
              </Badge>
            </div>
          </div>
          <CardContent className="pt-6">
            <div className="text-center mb-6">
              <div className="text-5xl font-bold text-amber-600 mb-2">{percentage}점</div>
              <p className="text-muted-foreground">에너지 건강도 ({totalScore}/{maxScore})</p>
              <Progress value={percentage} className="w-full mt-4 h-3" />
            </div>
            <p className="text-lg text-center mb-6 bg-amber-50 p-4 rounded-lg">
              {energyInfo.description}
            </p>
          </CardContent>
        </Card>

        {/* 상세 분석 그리드 */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <Card className="border-amber-200">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="w-5 h-5 text-amber-600" />
                최적 활동 시간대
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                {peakTime.includes('아침') ? <Sun className="w-8 h-8 text-yellow-500" /> : 
                 peakTime.includes('밤') || peakTime.includes('야행') ? <Moon className="w-8 h-8 text-indigo-500" /> :
                 <Clock className="w-8 h-8 text-orange-500" />}
                <div>
                  <p className="font-semibold text-lg">{peakTime}</p>
                  <p className="text-sm text-muted-foreground">이 시간대에 중요한 일을 처리하세요</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Heart className="w-5 h-5 text-pink-600" />
                회복 스타일
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Battery className="w-8 h-8 text-green-500" />
                <div>
                  <p className="font-semibold text-lg">{recoveryStyle}</p>
                  <p className="text-sm text-muted-foreground">피곤할 때 이 방식이 효과적이에요</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 번아웃 위험도 */}
        <Card className="border-amber-200 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              번아웃 위험도
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge className={`text-lg px-6 py-2 ${getBurnoutRiskColor()}`}>
                  {burnoutRisk}
                </Badge>
                <p className="text-muted-foreground">
                  {burnoutRisk === "낮음" && "현재 상태를 잘 유지하고 있어요!"}
                  {burnoutRisk === "보통" && "가끔 휴식을 챙겨주세요"}
                  {burnoutRisk === "주의" && "에너지 관리에 신경 써주세요"}
                  {burnoutRisk === "높음" && "즉시 휴식이 필요해요"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 맞춤 추천 */}
        <Card className="border-amber-200 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-600" />
              맞춤 에너지 관리 팁
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {energyInfo.tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg">
                  <span className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    {index + 1}
                  </span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* 액션 버튼 */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button className="flex-1 bg-amber-600 hover:bg-amber-700">
            <Download className="w-4 h-4 mr-2" />
            결과 저장하기
          </Button>
          <Button variant="outline" className="flex-1">
            <Share2 className="w-4 h-4 mr-2" />
            공유하기
          </Button>
        </div>
      </div>
    </div>
  );
}
