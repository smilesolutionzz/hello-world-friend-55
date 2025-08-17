import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Download, 
  MessageCircle, 
  Calendar,
  TrendingUp,
  Users,
  Phone,
  Mail,
  ExternalLink
} from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

const ReportResult = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const score = parseInt(searchParams.get("score") || "0");
  const average = parseFloat(searchParams.get("avg") || "0");
  const ageGroup = searchParams.get("age") || "";
  const testType = searchParams.get("test") || "";
  
  const today = format(new Date(), "yyyy년 MM월 dd일", { locale: ko });

  // 점수 구간별 권고사항
  const getRecommendation = (totalScore: number) => {
    if (totalScore <= 40) {
      return {
        level: "권장",
        color: "bg-red-100 text-red-700",
        message: "전문가 상담을 권장합니다.",
        description: "언어발달에 있어 전문적인 평가와 개입이 필요할 수 있습니다."
      };
    } else if (totalScore <= 60) {
      return {
        level: "주의",
        color: "bg-yellow-100 text-yellow-700", 
        message: "경계선 소견, 추가 평가 추천.",
        description: "정기적인 관찰과 추가적인 평가를 통해 발달 상황을 점검해보세요."
      };
    } else {
      return {
        level: "양호",
        color: "bg-green-100 text-green-700",
        message: "양호. 경과 관찰 권장.",
        description: "현재 언어발달이 양호한 상태입니다. 지속적인 관찰을 통해 유지해주세요."
      };
    }
  };

  const recommendation = getRecommendation(score);

  const handleExpertConnection = () => {
    window.open("https://typebot.io/hilight-consult", "_blank");
  };

  const handlePDFDownload = () => {
    // 추후 구현 예정
    alert("PDF 리포트 기능은 추가 예정입니다.");
  };

  const handleSaveResults = async () => {
    setIsLoading(true);
    // 추후 저장 기능 구현 예정
    setTimeout(() => {
      alert("결과 저장 기능은 추가 예정입니다.");
      setIsLoading(false);
    }, 1000);
  };

  // 잘못된 접근 체크
  useEffect(() => {
    if (!score || !ageGroup || !testType) {
      navigate("/language-test");
    }
  }, [score, ageGroup, testType, navigate]);

  if (!score) {
    return null;
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-primary-glow/10">
        <div className="container mx-auto px-4 sm:px-6 pt-12 sm:pt-20 pb-12 sm:pb-16">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12 space-y-4 sm:space-y-6">
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-2xl px-6 sm:px-8 py-3 sm:py-4 shadow-lg border border-border">
                <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-primary animate-pulse-glow" />
                <span className="text-lg sm:text-2xl font-semibold text-brand-gradient">검사 결과 리포트</span>
              </div>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-foreground">
              언어발달 검사 결과
            </h1>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            {/* 요약 카드 */}
            <Card className="p-6 sm:p-8">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-foreground">검사 요약</h2>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">총점</span>
                      <span className="text-2xl font-bold text-primary">{score}점</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">평균</span>
                      <span className="text-xl font-semibold">{average.toFixed(1)}점</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">연령대</span>
                      <Badge variant="outline">{ageGroup}개월</Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">검사일</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {today}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">점수 분포</h3>
                  
                  {/* 간단한 바 차트 */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">현재 평균</span>
                      <span className="text-sm font-medium">{average.toFixed(1)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-primary h-3 rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${(average / 4) * 100}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>1.0</span>
                      <span>2.0</span>
                      <span>3.0</span>
                      <span>4.0</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* 권고사항 카드 */}
            <Card className="p-6 sm:p-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-bold text-foreground">전문가 권고사항</h2>
                  <Badge className={recommendation.color}>{recommendation.level}</Badge>
                </div>
                
                <div className="bg-primary/5 p-4 rounded-lg">
                  <h3 className="font-semibold text-primary mb-2">{recommendation.message}</h3>
                  <p className="text-muted-foreground">{recommendation.description}</p>
                </div>
              </div>
            </Card>

            {/* 액션 버튼들 */}
            <div className="grid sm:grid-cols-2 gap-4">
              <Card className="p-6">
                <div className="text-center space-y-4">
                  <Users className="w-12 h-12 text-primary mx-auto" />
                  <h3 className="text-lg font-semibold">전문가 상담</h3>
                  <p className="text-sm text-muted-foreground">전문가와 1:1 상담을 받아보세요</p>
                  <Button 
                    onClick={handleExpertConnection}
                    className="w-full"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    전문가 상담 연결
                  </Button>
                </div>
              </Card>

              <Card className="p-6">
                <div className="text-center space-y-4">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto" />
                  <h3 className="text-lg font-semibold text-muted-foreground">상세 리포트</h3>
                  <p className="text-sm text-muted-foreground">PDF 형태의 상세 분석 리포트</p>
                  <Button 
                    onClick={handlePDFDownload}
                    variant="outline"
                    disabled
                    className="w-full"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    PDF 리포트 (추가 예정)
                  </Button>
                </div>
              </Card>
            </div>

            {/* 추가 기능 버튼들 */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-primary" />
                추가 서비스 (추가 예정)
              </h3>
              
              <div className="grid sm:grid-cols-3 gap-4">
                <Button 
                  onClick={handleSaveResults}
                  variant="outline"
                  disabled={isLoading}
                  className="flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  {isLoading ? "저장 중..." : "결과 저장"}
                </Button>
                
                <Button 
                  variant="outline"
                  disabled
                  className="flex items-center justify-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  카카오 알림
                </Button>
                
                <Button 
                  variant="outline"
                  disabled
                  className="flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  이메일 발송
                </Button>
              </div>
            </Card>

            {/* 다시 검사하기 */}
            <div className="text-center">
              <Button 
                onClick={() => navigate("/language-test")}
                variant="outline"
                size="lg"
              >
                다시 검사하기
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportResult;