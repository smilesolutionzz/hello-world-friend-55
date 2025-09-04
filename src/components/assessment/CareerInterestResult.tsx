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
  technical: {
    name: "실무형 (T)",
    icon: Wrench,
    color: "bg-brown-500",
    description: "실제적이고 체계적인 활동을 선호하며, 기계나 도구를 다루는 일을 좋아합니다.",
    careers: ["기계공학자", "전기기술자", "건축가", "IT개발자", "자동차정비사", "요리사"],
    characteristics: ["실용적", "현실적", "체계적", "솔직함"]
  },
  analytical: {
    name: "분석형 (A)", 
    icon: Microscope,
    color: "bg-blue-500",
    description: "과학적이고 분석적인 활동을 선호하며, 복잡한 문제를 해결하는 것을 좋아합니다.",
    careers: ["과학자", "의사", "연구원", "약사", "교수", "데이터분석가"],
    characteristics: ["분석적", "논리적", "호기심", "독립적"]
  },
  creative: {
    name: "창작형 (C)",
    icon: Palette,
    color: "bg-purple-500", 
    description: "창의적이고 자유로운 활동을 선호하며, 예술적 표현을 즐깁니다.",
    careers: ["디자이너", "음악가", "작가", "배우", "사진작가", "영화감독"],
    characteristics: ["창의적", "독창적", "표현력", "감성적"]
  },
  social: {
    name: "소통형 (S)",
    icon: Users,
    color: "bg-green-500",
    description: "다른 사람을 돕고 가르치는 활동을 선호하며, 사회적 상호작용을 즐깁니다.",
    careers: ["교사", "상담사", "간호사", "사회복지사", "인사담당자", "코치"],
    characteristics: ["친화적", "이해심", "협력적", "책임감"]
  },
  leadership: {
    name: "리더형 (L)",
    icon: TrendingUp,
    color: "bg-orange-500",
    description: "사업적이고 경쟁적인 활동을 선호하며, 리더십을 발휘하는 것을 좋아합니다.",
    careers: ["CEO", "영업관리자", "변호사", "정치인", "마케팅전문가", "컨설턴트"],
    characteristics: ["야심적", "설득력", "지배적", "자신감"]
  },
  organized: {
    name: "체계형 (O)",
    icon: FileText,
    color: "bg-gray-500",
    description: "체계적이고 규칙적인 활동을 선호하며, 정확성과 세심함을 중시합니다.",
    careers: ["회계사", "은행원", "비서", "사서", "세무사", "품질관리자"],
    characteristics: ["조직적", "정확함", "신중함", "안정지향"]
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
    
    const shareContent = `AI 직업 성향 분석 결과\n\n나의 직업 성향 유형:\n1순위: ${topConfig.name}\n상위 3유형: ${topThreeTypes}`;
    shareAsText(shareContent, "AI 직업 성향 분석 결과");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/20 to-warm-lavender/30 p-4">
      <div className="max-w-4xl mx-auto pt-8 space-y-6">
        {/* 결과 헤더 */}
        <Card>
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <TopIcon className="w-8 h-8 text-primary" />
              <CardTitle className="text-2xl">AI 직업 성향 분석 결과</CardTitle>
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
              나의 상위 직업 성향 유형
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
            <CardTitle>전체 성향 유형 점수</CardTitle>
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

        {/* 진로 개발 제안 - 대폭 확장 */}
        <Card>
          <CardHeader>
            <CardTitle>✨ 상세 진로 개발 분석</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                <h4 className="text-xl font-semibold text-purple-800 mb-4">🔍 전문가 진로 분석</h4>
                <div className="prose prose-purple max-w-none">
                  <p className="text-base leading-relaxed text-gray-800 whitespace-pre-line">
                    당신의 직업 흥미 프로필은 {topConfig.name} 유형이 가장 높게 나타났습니다. 이는 {topConfig.description.toLowerCase()}

**7가지 구체적 진로 개발 전략:**
• **핵심 역량 강화**: {topConfig.name} 유형의 핵심 특성인 {topConfig.characteristics.join(', ')} 능력을 체계적으로 개발
• **실무 경험 확보**: 관련 분야의 인턴십, 아르바이트, 프로젝트 참여로 실제 업무 경험 쌓기
• **네트워킹 구축**: 해당 분야 전문가들과의 멘토링, 세미나 참석으로 인맥 형성
• **자격증 취득**: {topConfig.name} 관련 직종에서 요구되는 전문 자격증이나 인증 취득
• **포트폴리오 구축**: 자신의 역량과 경험을 보여줄 수 있는 체계적인 포트폴리오 제작
• **지속적 학습**: 해당 분야의 최신 트렌드와 기술 동향을 지속적으로 학습하고 업데이트
• **다면적 접근**: 상위 2-3개 흥미 유형을 결합한 융합 분야 탐색으로 차별화된 경쟁력 확보

**단계별 실행 계획 (6개월-2년):**
1단계(1-3개월): 관심 분야 정보 수집 및 기초 지식 습득
2단계(3-9개월): 실무 경험 및 관련 프로젝트 참여
3단계(9-18개월): 전문 역량 강화 및 네트워크 확장  
4단계(18-24개월): 구체적 진로 목표 설정 및 취업/진학 준비

**재평가 권장:** 진로 개발 과정에서 6개월 간격으로 흥미와 적성 변화를 재평가하여 진로 방향을 조정하시기 바랍니다.
                  </p>
                </div>
              </div>
              
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