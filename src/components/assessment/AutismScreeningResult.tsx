import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Brain, Heart, Eye, Users } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface AutismScreeningResultProps {
  results: {
    answers: number[];
    total: number;
    average: number;
    ageGroup: string;
    riskLevel: string;
    concernAreas: string[];
  };
  onBack: () => void;
  onNewTest: () => void;
}

const AutismScreeningResult = ({ results, onBack, onNewTest }: AutismScreeningResultProps) => {
  const { total, ageGroup, riskLevel, concernAreas } = results;

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case "낮은 위험도": return "text-green-600 bg-green-50";
      case "중간 위험도": return "text-yellow-600 bg-yellow-50";
      case "높은 위험도": return "text-red-600 bg-red-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const getRiskLevelIcon = (level: string) => {
    switch (level) {
      case "낮은 위험도": return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "중간 위험도": return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case "높은 위험도": return <AlertTriangle className="w-5 h-5 text-red-600" />;
      default: return <Brain className="w-5 h-5 text-gray-600" />;
    }
  };

  const getRecommendations = () => {
    if (riskLevel === "높은 위험도") {
      return [
        "소아정신건강의학과 또는 발달센터에서 정밀 진단을 받으시기 바랍니다",
        "조기 발견과 중재가 중요하므로 빠른 시일 내 전문가 상담을 권장합니다",
        "행동분석치료(ABA), 언어치료, 작업치료 등을 고려해볼 수 있습니다",
        "가족 구성원들도 자폐스펙트럼에 대한 이해를 높이시기 바랍니다"
      ];
    } else if (riskLevel === "중간 위험도") {
      return [
        "발달센터나 소아청소년과에서 추가 관찰과 평가를 받아보시기 바랍니다",
        "사회적 의사소통 기술 향상을 위한 놀이치료나 사회성 그룹을 고려해보세요",
        "정기적인 발달 모니터링을 통해 변화를 지켜보시기 바랍니다",
        "환경 조성과 일상 루틴 구조화가 도움이 될 수 있습니다"
      ];
    } else {
      return [
        "현재 자폐스펙트럼 관련 주요 특성은 관찰되지 않습니다",
        "그러나 다른 발달 영역에 대한 지속적인 관심이 필요합니다",
        "정기적인 발달 검진을 통해 전반적인 성장을 확인하시기 바랍니다",
        "궁금한 점이 있으시면 언제든 발달 전문가와 상담해보세요"
      ];
    }
  };

  const developmentCenters = [
    { name: "한국발달장애인지원센터", phone: "02-123-4567", area: "전국" },
    { name: "서울시발달장애인지원센터", phone: "02-234-5678", area: "서울" },
    { name: "경기도발달장애인지원센터", phone: "031-345-6789", area: "경기" },
    { name: "부산발달장애인지원센터", phone: "051-456-7890", area: "부산" }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 결과 요약 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getRiskLevelIcon(riskLevel)}
            자폐스펙트럼 선별검사 결과
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{total}점</div>
              <div className="text-sm text-muted-foreground">총점</div>
            </div>
            <div className="text-center">
              <Badge className={getRiskLevelColor(riskLevel)}>{riskLevel}</Badge>
              <div className="text-sm text-muted-foreground mt-1">위험도 수준</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{ageGroup}</div>
              <div className="text-sm text-muted-foreground">연령대</div>
            </div>
          </div>

          {concernAreas.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2">관심 영역:</h4>
              <div className="flex flex-wrap gap-2">
                {concernAreas.map((area, index) => (
                  <Badge key={index} variant="secondary">{area}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 영역별 분석 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            영역별 분석
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">사회적 의사소통</span>
              </div>
              <Progress value={Math.min((results.answers.slice(0, 5).reduce((a, b) => a + b, 0) / 5) * 100, 100)} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium">제한적 반복행동</span>
              </div>
              <Progress value={Math.min((results.answers.slice(5, 10).reduce((a, b) => a + b, 0) / 5) * 100, 100)} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">감각처리</span>
              </div>
              <Progress value={Math.min((results.answers.slice(10).reduce((a, b) => a + b, 0) / (results.answers.length - 10)) * 100, 100)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 권장사항 */}
      <Card>
        <CardHeader>
          <CardTitle>전문가 권장사항</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {getRecommendations().map((recommendation, index) => (
              <li key={index} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                <span className="text-sm">{recommendation}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* 발달센터 정보 */}
      {(riskLevel === "높은 위험도" || riskLevel === "중간 위험도") && (
        <Card>
          <CardHeader>
            <CardTitle>발달센터 연계 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {developmentCenters.map((center, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <h4 className="font-semibold">{center.name}</h4>
                  <p className="text-sm text-muted-foreground">📞 {center.phone}</p>
                  <p className="text-sm text-muted-foreground">📍 {center.area}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 <strong>조기 중재의 중요성:</strong> 자폐스펙트럼은 조기 발견과 적절한 중재를 통해 
                사회적 의사소통 능력과 적응 기능을 크게 향상시킬 수 있습니다.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 액션 버튼 */}
      <div className="flex gap-4 justify-center">
        <Button variant="outline" onClick={onBack}>
          뒤로가기
        </Button>
        <Button onClick={onNewTest} className="btn-brand">
          다른 검사 하기
        </Button>
      </div>
    </div>
  );
};

export default AutismScreeningResult;