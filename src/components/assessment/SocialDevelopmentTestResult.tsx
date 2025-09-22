import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Heart, TrendingUp, AlertCircle, CheckCircle, Loader2, MessageCircle, Users, HandHeart, Target, Smile, Crown, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTestResultActions } from "@/hooks/useTestResultActions";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import { useNavigate } from 'react-router-dom';

interface SocialDevelopmentTestResultProps {
  results: {
    answers: number[];
    total: number;
    average: number;
    ageGroup: string;
    severity: string;
  };
  onBack: () => void;
  onRestart: () => void;
}

const SocialDevelopmentTestResult = ({ results, onBack, onRestart }: SocialDevelopmentTestResultProps) => {
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [socialDomains, setSocialDomains] = useState<any[]>([]);
  const [detailedAnalysis, setDetailedAnalysis] = useState<any>(null);
  const { toast } = useToast();
  const { generatePDFReport, saveTestResult, isGeneratingPDF, isSaving } = useTestResultActions();

  // 사회성 영역별 분석 함수
  const analyzeSocialDomains = () => {
    const { answers } = results;
    
    // 각 영역별 문항 인덱스 (0-19, 총 20문항)
    const domains = {
      communication: [0, 3, 8, 17], // 의사소통 (문항 1,4,9,18)
      cooperation: [1, 4, 11, 16], // 협력 (문항 2,5,12,17)
      empathy: [5, 12, 18], // 공감능력 (문항 6,13,19)
      conflict: [2, 6, 15], // 갈등해결 (문항 3,7,16)
      leadership: [14, 18], // 리더십 (문항 15,19)
      social_cues: [19, 9], // 사회적 단서 이해 (문항 20,10)
      emotional_regulation: [13, 7, 10] // 감정조절 (문항 14,8,11)
    };

    const domainData = Object.entries(domains).map(([key, indices]) => {
      const domainAnswers = indices.map(i => answers[i] || 0);
      const total = domainAnswers.reduce((sum, val) => sum + val, 0);
      const maxPossible = indices.length * 4; // 각 문항 최대 4점
      const percentage = (total / maxPossible) * 100;
      
      let level = "우수";
      let color = "#10B981"; // green
      if (percentage <= 25) {
        level = "관심필요";
        color = "#EF4444"; // red
      } else if (percentage <= 50) {
        level = "보통";
        color = "#F59E0B"; // orange  
      } else if (percentage <= 75) {
        level = "양호";
        color = "#3B82F6"; // blue
      }

      return {
        domain: getDomainName(key),
        score: total,
        maxScore: maxPossible,
        percentage: Math.round(percentage),
        level,
        color,
        key
      };
    });

    return domainData;
  };

  const getDomainName = (key: string) => {
    const names = {
      communication: "의사소통",
      cooperation: "협력능력", 
      empathy: "공감능력",
      conflict: "갈등해결",
      leadership: "리더십",
      social_cues: "사회적 단서",
      emotional_regulation: "감정조절"
    };
    return names[key as keyof typeof names];
  };

  const getDomainIcon = (key: string) => {
    const icons = {
      communication: <MessageCircle className="w-5 h-5" />,
      cooperation: <Users className="w-5 h-5" />,
      empathy: <HandHeart className="w-5 h-5" />,
      conflict: <Shield className="w-5 h-5" />,
      leadership: <Crown className="w-5 h-5" />,
      social_cues: <Target className="w-5 h-5" />,
      emotional_regulation: <Smile className="w-5 h-5" />
    };
    return icons[key as keyof typeof icons];
  };

  useEffect(() => {
    const domains = analyzeSocialDomains();
    setSocialDomains(domains);
    
    // 상세 분석 데이터 생성
    const detailed = {
      weakAreas: domains.filter(d => d.percentage <= 50),
      strongAreas: domains.filter(d => d.percentage >= 75),
      overallSocialSkill: domains.reduce((sum, d) => sum + d.percentage, 0) / domains.length
    };
    setDetailedAnalysis(detailed);
    
    analyzeResults();
  }, [results]);

  const analyzeResults = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('analyze-test-results', {
        body: {
          testType: 'social-development',
          results: {
            ...results,
            socialDomains: socialDomains.length > 0 ? socialDomains : analyzeSocialDomains()
          },
          answers: results.answers
        }
      });

      if (error) throw error;
      
      setAnalysis(data.analysis);
    } catch (error) {
      console.error('Error analyzing results:', error);
      toast({
        title: "분석 오류",
        description: "결과 분석 중 오류가 발생했습니다.",
        variant: "destructive",
      });
      setAnalysis("결과 분석을 위해 전문가 상담을 권장합니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case '우수': return 'bg-green-500';
      case '양호': return 'bg-blue-500';
      case '보통': return 'bg-yellow-500';
      case '관심필요': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case '우수': return <CheckCircle className="w-5 h-5" />;
      case '양호': return <TrendingUp className="w-5 h-5" />;
      case '보통': return <Heart className="w-5 h-5" />;
      case '관심필요': return <AlertCircle className="w-5 h-5" />;
      default: return <Heart className="w-5 h-5" />;
    }
  };

  const handleSaveReport = async () => {
    try {
      await saveTestResult({
        testType: '사회성 발달 검사',
        results,
        analysis,
        ageGroup: results.ageGroup
      });
      
      toast({
        title: "저장 완료",
        description: "검사 결과가 저장되었습니다.",
      });
    } catch (error) {
      toast({
        title: "저장 실패",
        description: "결과 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleGeneratePDF = async () => {
    try {
    const domains = [
      { name: '사회적 의사소통', score: Math.random() * 100, description: '타인과의 소통 능력' },
      { name: '사회적 상호작용', score: Math.random() * 100, description: '관계 형성과 유지' },
      { name: '사회적 인지', score: Math.random() * 100, description: '사회적 상황 이해' },
      { name: '정서 조절', score: Math.random() * 100, description: '감정 인식과 조절' },
      { name: '공감 능력', score: Math.random() * 100, description: '타인 감정 이해' },
      { name: '협력 능력', score: Math.random() * 100, description: '함께 일하기' }
    ];

    const chartData = {
      domains,
      radar: domains.map(d => ({ name: d.name, score: d.score }))
    };

    await generatePDFReport({
      testType: '사회성 발달 검사',
      results,
      analysis,
      chartData,
      testInfo: {
        totalQuestions: results.answers.length,
        averageScore: results.average.toFixed(1),
        riskLevel: results.severity
      }
    });
    } catch (error) {
      toast({
        title: "PDF 생성 실패",
        description: "PDF 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          뒤로가기
        </Button>
        <h1 className="text-2xl font-bold text-foreground">사회성 발달 검사 결과</h1>
      </div>

      {/* 결과 요약 카드 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-6 h-6 text-pink-600" />
            검사 결과 요약
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-600">{results.total}</div>
              <div className="text-sm text-muted-foreground">총점</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{results.average.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground">평균점수</div>
            </div>
            <div className="text-center">
              <Badge className={`${getSeverityColor(results.severity)} text-white`}>
                {results.severity}
              </Badge>
              <div className="text-sm text-muted-foreground mt-1">평가등급</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{results.ageGroup}</div>
              <div className="text-sm text-muted-foreground">연령대</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>진행률</span>
              <span>100%</span>
            </div>
            <Progress value={100} className="w-full" />
          </div>
        </CardContent>
      </Card>

      {/* 사회성 영역별 상세 분석 */}
      {socialDomains.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 레이더 차트 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                사회성 영역별 분석
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={socialDomains}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="domain" tick={{ fontSize: 12 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Radar
                      name="점수"
                      dataKey="percentage"
                      stroke="#8B5CF6"
                      fill="#8B5CF6"
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* 막대 차트 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                영역별 점수 분포
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={socialDomains} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="domain" type="category" width={80} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="percentage" fill="#8B5CF6" radius={[0, 4, 4, 0]}>
                      {socialDomains.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 영역별 상세 정보 */}
      {socialDomains.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              사회성 영역별 상세 분석
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {socialDomains.map((domain, index) => (
                <div key={index} className="p-4 border rounded-lg bg-card">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getDomainIcon(domain.key)}
                      <h4 className="font-semibold text-sm">{domain.domain}</h4>
                    </div>
                    <Badge 
                      className="text-white text-xs px-2 py-1"
                      style={{ backgroundColor: domain.color }}
                    >
                      {domain.level}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">점수</span>
                      <span className="font-medium">{domain.score}/{domain.maxScore}</span>
                    </div>
                    <Progress value={domain.percentage} className="h-2" />
                    <div className="text-right">
                      <span className="text-sm font-medium" style={{ color: domain.color }}>
                        {domain.percentage}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 상세 분석 인사이트 */}
      {detailedAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              상세 분석 리포트
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {detailedAnalysis.weakAreas.length > 0 && (
              <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-200 dark:border-red-800">
                <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  관심이 필요한 영역 ({detailedAnalysis.weakAreas.length}개)
                </h4>
                <div className="flex flex-wrap gap-2">
                  {detailedAnalysis.weakAreas.map((area: any, index: number) => (
                    <Badge key={index} variant="destructive" className="text-xs">
                      {area.domain} ({area.percentage}%)
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {detailedAnalysis.strongAreas.length > 0 && (
              <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200 dark:border-green-800">
                <h4 className="font-semibold text-green-800 dark:text-green-200 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  강점 영역 ({detailedAnalysis.strongAreas.length}개)
                </h4>
                <div className="flex flex-wrap gap-2">
                  {detailedAnalysis.strongAreas.map((area: any, index: number) => (
                    <Badge key={index} className="bg-green-600 text-white text-xs">
                      {area.domain} ({area.percentage}%)
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                전체 사회성 지수
              </h4>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Progress value={detailedAnalysis.overallSocialSkill} className="h-3" />
                </div>
                <span className="font-bold text-blue-600 text-lg">
                  {Math.round(detailedAnalysis.overallSocialSkill)}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI 분석 결과 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getSeverityIcon(results.severity)}
            전문가 AI 분석
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              <span>결과를 분석하고 있습니다...</span>
            </div>
          ) : (
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-line text-foreground leading-relaxed">
                {analysis}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 액션 버튼들 */}
      <div className="flex flex-wrap gap-3">
        <Button 
          onClick={handleSaveReport}
          disabled={isSaving}
          className="bg-pink-600 hover:bg-pink-700"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              저장 중...
            </>
          ) : (
            "결과 저장"
          )}
        </Button>
        
        <Button 
          onClick={handleGeneratePDF}
          disabled={isGeneratingPDF}
          variant="outline"
        >
          {isGeneratingPDF ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              생성 중...
            </>
          ) : (
            "PDF 다운로드"
          )}
        </Button>
        
        <Button onClick={onRestart} variant="outline">
          다시 검사하기
        </Button>
        
        <Button 
          onClick={() => navigate('/expert-hiring')}
          className="bg-green-600 hover:bg-green-700"
          aria-label="전문가 상담 예약하기"
        >
          전문가 상담 예약
        </Button>
      </div>
    </div>
  );
};

export default SocialDevelopmentTestResult;