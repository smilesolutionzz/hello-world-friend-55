import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RefreshCw, Download, Share2, Briefcase, Wrench, Microscope, Palette, Users, TrendingUp, FileText } from "lucide-react";
import { useShareText } from "@/utils/shareUtils";

interface CareerInterestResultProps {
  result: {
    answers: Record<string, number>;
    scores: Record<string, number>;
    topTypes: string[];
    total: number;
    average: number;
  };
  onRestart: () => void;
}

const typeConfig = {
  realistic: {
    name: "현실형 (R)",
    icon: Wrench,
    color: "bg-brown-500",
    description: "실제적이고 체계적인 활동을 선호하며, 기계나 도구를 다루는 일을 좋아합니다.",
    careers: ["기계공학자", "전기기술자", "건축가", "농업기술자", "자동차정비사", "요리사"],
    characteristics: ["실용적", "현실적", "체계적", "솔직함"]
  },
  investigative: {
    name: "탐구형 (I)", 
    icon: Microscope,
    color: "bg-blue-500",
    description: "과학적이고 분석적인 활동을 선호하며, 복잡한 문제를 해결하는 것을 좋아합니다.",
    careers: ["과학자", "의사", "연구원", "약사", "교수", "데이터분석가"],
    characteristics: ["분석적", "논리적", "호기심", "독립적"]
  },
  artistic: {
    name: "예술형 (A)",
    icon: Palette,
    color: "bg-purple-500", 
    description: "창의적이고 자유로운 활동을 선호하며, 예술적 표현을 즐깁니다.",
    careers: ["디자이너", "음악가", "작가", "배우", "사진작가", "영화감독"],
    characteristics: ["창의적", "독창적", "표현력", "감성적"]
  },
  social: {
    name: "사회형 (S)",
    icon: Users,
    color: "bg-green-500",
    description: "다른 사람을 돕고 가르치는 활동을 선호하며, 사회적 상호작용을 즐깁니다.",
    careers: ["교사", "상담사", "간호사", "사회복지사", "인사담당자", "코치"],
    characteristics: ["친화적", "이해심", "협력적", "책임감"]
  },
  enterprising: {
    name: "진취형 (E)",
    icon: TrendingUp,
    color: "bg-orange-500",
    description: "리더십을 발휘하고 설득하는 활동을 선호하며, 경영이나 판매에 관심이 많습니다.",
    careers: ["경영자", "영업사원", "변호사", "정치인", "마케터", "기업가"],
    characteristics: ["리더십", "설득력", "야심적", "외향적"]
  },
  conventional: {
    name: "관습형 (C)",
    icon: FileText,
    color: "bg-gray-500",
    description: "체계적이고 규칙적인 활동을 선호하며, 정확성과 질서를 중시합니다.",
    careers: ["회계사", "은행원", "비서", "사무원", "공무원", "경리담당자"],
    characteristics: ["체계적", "정확성", "신뢰성", "책임감"]
  }
};

export default function CareerInterestResult({ result, onRestart }: CareerInterestResultProps) {
  const topType = result.topTypes[0];
  const topConfig = typeConfig[topType as keyof typeof typeConfig];
  const TopIcon = topConfig.icon;
  const { shareAsText } = useShareText();

  const handleShare = () => {
    const topThreeTypes = result.topTypes
      .map(type => typeConfig[type as keyof typeof typeConfig].name)
      .join(', ');
    
    const shareContent = `직업 흥미 검사 결과\n\n나의 직업 흥미 유형:\n1순위: ${topConfig.name}\n상위 3유형: ${topThreeTypes}`;
    shareAsText(shareContent, "직업 흥미 검사 결과");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/20 to-warm-lavender/30 p-4">
      <div className="max-w-4xl mx-auto pt-8 space-y-6">
        {/* 결과 헤더 */}
        <Card>
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TopIcon className="w-8 h-8 text-primary" />
              <CardTitle className="text-2xl">직업 흥미 검사 결과</CardTitle>
            </div>
            <div className="space-y-4">
              <Badge variant="default" className="text-lg px-4 py-2">
                {topConfig.name}
              </Badge>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                {topConfig.description}
              </p>
            </div>
          </CardHeader>
        </Card>

        {/* 상위 3개 유형 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5" />
              나의 상위 직업 흥미 유형
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {result.topTypes.slice(0, 3).map((type, index) => {
                const config = typeConfig[type as keyof typeof typeConfig];
                const Icon = config.icon;
                const score = result.scores[type];
                const progressValue = (score / 5) * 100;
                
                return (
                  <div key={type} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${config.color} text-white`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{index + 1}순위: {config.name}</h3>
                          <p className="text-sm text-muted-foreground">{config.description}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{score.toFixed(1)}</p>
                        <p className="text-xs text-muted-foreground">/ 5.0</p>
                      </div>
                    </div>
                    <Progress value={progressValue} className="mb-3" />
                    <div className="flex flex-wrap gap-2">
                      {config.characteristics.map((char, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {char}
                        </Badge>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 전체 유형 점수 */}
        <Card>
          <CardHeader>
            <CardTitle>전체 흥미 유형 점수</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {Object.entries(result.scores).map(([type, score]) => {
                const config = typeConfig[type as keyof typeof typeConfig];
                const Icon = config.icon;
                const progressValue = (score / 5) * 100;
                
                return (
                  <div key={type} className="flex items-center gap-3">
                    <div className={`p-1.5 rounded ${config.color} text-white`}>
                      <Icon className="w-3 h-3" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium">{config.name}</span>
                        <span className="text-sm">{score.toFixed(1)}</span>
                      </div>
                      <Progress value={progressValue} className="h-2" />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 추천 직업 */}
        <Card>
          <CardHeader>
            <CardTitle>추천 직업 분야</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {result.topTypes.slice(0, 2).map((type, index) => {
                const config = typeConfig[type as keyof typeof typeConfig];
                return (
                  <div key={type}>
                    <h4 className="font-semibold mb-2">{config.name} 관련 직업</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {config.careers.map((career, idx) => (
                        <div key={idx} className="p-2 bg-muted rounded text-sm text-center">
                          {career}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 진로 개발 제안 */}
        <Card>
          <CardHeader>
            <CardTitle>진로 개발 제안</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold mb-2">핵심 강점 활용</h4>
                <p className="text-sm text-muted-foreground">
                  {topConfig.name} 유형의 특성을 살려 관련 분야에서 전문성을 기르세요.
                  {topConfig.characteristics.join(', ')} 등의 강점을 활용할 수 있는 기회를 찾아보세요.
                </p>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold mb-2">다양한 경험 쌓기</h4>
                <p className="text-sm text-muted-foreground">
                  상위 흥미 유형과 관련된 인턴십, 봉사활동, 프로젝트 등에 참여해보세요.
                  실제 경험을 통해 자신의 적성을 더 구체적으로 파악할 수 있습니다.
                </p>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold mb-2">지속적인 탐색</h4>
                <p className="text-sm text-muted-foreground">
                  흥미는 시간과 경험에 따라 변할 수 있습니다. 
                  정기적으로 자신의 관심사를 점검하고 새로운 분야를 탐색해보세요.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 액션 버튼 */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={onRestart} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            다시 검사하기
          </Button>
          <Button onClick={handleShare} className="flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            결과 공유하기
          </Button>
          <Button variant="secondary" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            결과 저장하기
          </Button>
        </div>
      </div>
    </div>
  );
}