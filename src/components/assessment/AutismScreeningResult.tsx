import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, Brain, Heart, Eye, Users, FileText } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface DevelopmentalScreeningResultProps {
  results: {
    answers: number[];
    total: number;
    average: number;
    ageGroup: string;
    concernLevel: string;
    strengthAreas: string[];
    challengeAreas: string[];
  };
  onBack: () => void;
  onNewTest: () => void;
}

const DevelopmentalScreeningResult = ({ results, onBack, onNewTest }: DevelopmentalScreeningResultProps) => {
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const navigate = useNavigate();

  // AI 분석 실행
  useEffect(() => {
    if (results.useAIAnalysis) {
      generateAIAnalysis();
    }
  }, [results]);

  const generateAIAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const { data, error } = await supabase.functions.invoke('developmental-screening-analyzer', {
        body: { 
          results: {
            answers: results.answers,
            ageGroup: results.ageGroup === '아동청소년' ? 'child' : 'adult',
            total: results.total
          },
          ageGroup: results.ageGroup === '아동청소년' ? 'child' : 'adult',
          age: null
        }
      });

      if (error) {
        console.error('AI analysis error:', error);
        setAnalysisError('AI 분석 중 오류가 발생했습니다.');
        return;
      }

      setAiAnalysis(data.analysis);
    } catch (error) {
      console.error('Analysis error:', error);
      setAnalysisError('분석 요청 중 오류가 발생했습니다.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getConcernLevelColor = (level: string) => {
    switch (level) {
      case "minimal": return "text-green-600 bg-green-50";
      case "mild": return "text-blue-600 bg-blue-50";
      case "moderate": return "text-yellow-600 bg-yellow-50";
      case "significant": return "text-orange-600 bg-orange-50";
      case "high": return "text-red-600 bg-red-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };
  const { total, ageGroup, concernLevel, strengthAreas, challengeAreas } = results;

  const getConcernLevelColor = (level: string) => {
    switch (level) {
      case "일반적 발달":
      case "일반적 특성": return "text-green-600 bg-green-50";
      case "관찰 권장":
      case "개인적 특성": return "text-blue-600 bg-blue-50";
      case "지원 필요":
      case "지원 고려": return "text-yellow-600 bg-yellow-50";
      case "전문가 상담 권장":
      case "전문 상담 권장": return "text-orange-600 bg-orange-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const getConcernLevelIcon = (level: string) => {
    switch (level) {
      case "일반적 발달":
      case "일반적 특성": return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "관찰 권장":
      case "개인적 특성": return <Brain className="w-5 h-5 text-blue-600" />;
      case "지원 필요":
      case "지원 고려": return <Eye className="w-5 h-5 text-yellow-600" />;
      case "전문가 상담 권장":
      case "전문 상담 권장": return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      default: return <Brain className="w-5 h-5 text-gray-600" />;
    }
  };

  const getRecommendations = () => {
    if (concernLevel === "전문가 상담 권장" || concernLevel === "전문 상담 권장") {
      return [
        "발달센터나 전문기관에서 정밀 평가를 받으시기 바랍니다",
        "개별 맞춤형 지원 계획 수립이 필요합니다",
        "행동지원, 사회성 향상, 감각통합 등 다각적 접근을 고려해보세요",
        "가족과 주변 환경의 이해와 지원이 중요합니다"
      ];
    } else if (concernLevel === "지원 필요" || concernLevel === "지원 고려") {
      return [
        "발달센터에서 추가 관찰과 평가를 받아보시기 바랍니다",
        "사회적 기술 향상을 위한 그룹 활동이나 프로그램 참여를 고려해보세요",
        "정기적인 발달 모니터링을 통해 변화를 지켜보시기 바랍니다",
        "환경 조성과 일상 루틴의 구조화가 도움이 될 수 있습니다"
      ];
    } else if (concernLevel === "관찰 권장" || concernLevel === "개인적 특성") {
      return [
        "현재 특별한 문제는 없으나 지속적인 관심이 필요합니다",
        "개인의 고유한 특성으로 이해하고 강점을 활용해보세요",
        "필요시 발달 전문가와의 상담을 고려해보시기 바랍니다",
        "정기적인 발달 점검을 통해 성장 과정을 확인하세요"
      ];
    } else {
      return [
        "현재 발달 특성이 일반적인 범위 내에 있습니다",
        "개인의 강점을 더욱 발전시킬 수 있는 기회를 제공해보세요",
        "다양한 경험을 통해 전반적인 성장을 지원해주세요",
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
            {getConcernLevelIcon(concernLevel)}
            AIH 발달특성 선별체크 결과
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{total}점</div>
              <div className="text-sm text-muted-foreground">총점</div>
            </div>
            <div className="text-center">
              <Badge className={getConcernLevelColor(concernLevel)}>{concernLevel}</Badge>
              <div className="text-sm text-muted-foreground mt-1">평가 수준</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{ageGroup}</div>
              <div className="text-sm text-muted-foreground">연령대</div>
            </div>
          </div>

          {strengthAreas.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2 text-green-700">강점 영역:</h4>
              <div className="flex flex-wrap gap-2">
                {strengthAreas.map((area, index) => (
                  <Badge key={index} variant="secondary" className="bg-green-50 text-green-700">{area}</Badge>
                ))}
              </div>
            </div>
          )}

          {challengeAreas.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold mb-2 text-orange-700">지원 영역:</h4>
              <div className="flex flex-wrap gap-2">
                {challengeAreas.map((area, index) => (
                  <Badge key={index} variant="secondary" className="bg-orange-50 text-orange-700">{area}</Badge>
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
                <span className="text-sm font-medium">사회적 특성</span>
              </div>
              <Progress value={Math.min((results.answers.slice(0, 4).reduce((a, b) => a + b, 0) / 4) * 100, 100)} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium">환경 적응성</span>
              </div>
              <Progress value={Math.min((results.answers.slice(4, 8).reduce((a, b) => a + b, 0) / 4) * 100, 100)} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">개별 특성</span>
              </div>
              <Progress value={Math.min((results.answers.slice(8).reduce((a, b) => a + b, 0) / (results.answers.length - 8)) * 100, 100)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 권장사항 */}
      <Card>
        <CardHeader>
          <CardTitle>발달 지원 권장사항</CardTitle>
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
      {(concernLevel === "전문가 상담 권장" || concernLevel === "전문 상담 권장" || concernLevel === "지원 필요" || concernLevel === "지원 고려") && (
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
                💡 <strong>개별화 지원의 중요성:</strong> 모든 개인은 고유한 특성과 강점을 가지고 있습니다. 
                적절한 지원과 환경 조성을 통해 개인의 잠재력을 최대한 발휘할 수 있습니다.
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
        <Button onClick={onNewTest} variant="outline">
          다른 검사 하기
        </Button>
        <Button 
          onClick={() => {
            // IEP 생성 페이지로 이동하는 로직 추가
            window.location.href = '/iep-generator';
          }}
          className="btn-brand flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />
          개별교육계획(IEP) 생성하기
        </Button>
      </div>
    </div>
  );
};

export default DevelopmentalScreeningResult;