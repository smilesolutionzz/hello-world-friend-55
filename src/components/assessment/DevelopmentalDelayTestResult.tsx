import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Brain, TrendingUp, AlertCircle, CheckCircle, Loader2, MessageCircle, Activity, Users, Lightbulb, Heart, Zap, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTestResultActions } from "@/hooks/useTestResultActions";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LineChart, Line, AreaChart, Area } from 'recharts';

interface DevelopmentalDelayTestResultProps {
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

const DevelopmentalDelayTestResult = ({ results, onBack, onRestart }: DevelopmentalDelayTestResultProps) => {
  const [analysis, setAnalysis] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [developmentalDomains, setDevelopmentalDomains] = useState<any[]>([]);
  const [detailedAnalysis, setDetailedAnalysis] = useState<any>(null);
  const { toast } = useToast();
  const { generatePDFReport, saveTestResult, isGeneratingPDF, isSaving } = useTestResultActions();

  // 발달 영역별 분석 함수
  const analyzeDevelopmentalDomains = () => {
    const { answers } = results;
    
    // 각 영역별 문항 인덱스 (0-19, 총 20문항)
    const domains = {
      language: [0, 3, 6, 12], // 언어발달 (문항 1,4,7,13)
      motor: [2, 9, 10, 15], // 운동발달 (문항 3,10,11,16)
      cognitive: [5, 13, 16, 17], // 인지발달 (문항 6,14,17,18)
      social: [1, 7, 14, 18], // 사회성발달 (문항 2,8,15,19)
      adaptive: [4, 8, 11, 19], // 적응행동 (문항 5,9,12,20)
      attention: [5, 13, 14], // 주의집중 (문항 6,14,15)
      emotional: [1, 8, 18] // 정서발달 (문항 2,9,19)
    };

    const domainData = Object.entries(domains).map(([key, indices]) => {
      const domainAnswers = indices.map(i => answers[i] || 0);
      const total = domainAnswers.reduce((sum, val) => sum + val, 0);
      const maxPossible = indices.length * 4; // 각 문항 최대 4점
      const percentage = (total / maxPossible) * 100;
      
      let level = "정상";
      let color = "#10B981"; // green
      if (percentage >= 75) {
        level = "심각";
        color = "#EF4444"; // red
      } else if (percentage >= 50) {
        level = "중등도";
        color = "#F59E0B"; // orange
      } else if (percentage >= 25) {
        level = "경미";
        color = "#EAB308"; // yellow
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
      language: "언어발달",
      motor: "운동발달", 
      cognitive: "인지발달",
      social: "사회성발달",
      adaptive: "적응행동",
      attention: "주의집중",
      emotional: "정서발달"
    };
    return names[key as keyof typeof names];
  };

  const getDomainIcon = (key: string) => {
    const icons = {
      language: <MessageCircle className="w-5 h-5" />,
      motor: <Activity className="w-5 h-5" />,
      cognitive: <Lightbulb className="w-5 h-5" />,
      social: <Users className="w-5 h-5" />,
      adaptive: <Target className="w-5 h-5" />,
      attention: <Zap className="w-5 h-5" />,
      emotional: <Heart className="w-5 h-5" />
    };
    return icons[key as keyof typeof icons];
  };

  useEffect(() => {
    const domains = analyzeDevelopmentalDomains();
    setDevelopmentalDomains(domains);
    
    // 상세 분석 데이터 생성
    const detailed = {
      delayedAreas: domains.filter(d => d.percentage >= 50),
      normalAreas: domains.filter(d => d.percentage < 25),
      overallDelay: domains.reduce((sum, d) => sum + d.percentage, 0) / domains.length
    };
    setDetailedAnalysis(detailed);
    
    analyzeResults();
  }, [results]);

  const analyzeResults = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('analyze-test-results', {
        body: {
          testType: 'developmental-delay',
          results: {
            ...results,
            developmentalDomains: developmentalDomains.length > 0 ? developmentalDomains : analyzeDevelopmentalDomains()
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
      case '정상': return 'bg-green-500';
      case '경미': return 'bg-yellow-500';
      case '중등도': return 'bg-orange-500';
      case '심각': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case '정상': return <CheckCircle className="w-5 h-5" />;
      case '경미': return <TrendingUp className="w-5 h-5" />;
      case '중등도': return <AlertCircle className="w-5 h-5" />;
      case '심각': return <AlertCircle className="w-5 h-5" />;
      default: return <Brain className="w-5 h-5" />;
    }
  };

  const handleSaveReport = async () => {
    try {
      await saveTestResult({
        testType: '발달지연 검사',
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
      await generatePDFReport({
        testType: '발달지연 검사',
        results,
        analysis,
        testInfo: {
          totalQuestions: results.answers.length,
          completedAt: new Date().toLocaleString('ko-KR')
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
        <h1 className="text-2xl font-bold text-foreground">발달지연 검사 결과</h1>
      </div>

      {/* 전문 발달 분석 결과 카드 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-blue-600" />
            발달지연 전문 분석 결과
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">{results.total}</div>
              <div className="text-sm text-muted-foreground">총점</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-lg">
              <div className="text-3xl font-bold text-green-600">{results.average.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground">평균점수</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 rounded-lg">
              <Badge className={`${getSeverityColor(results.severity)} text-white text-lg px-4 py-2`}>
                {results.severity}
              </Badge>
              <div className="text-sm text-muted-foreground mt-2">평가등급</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 rounded-lg">
              <div className="text-2xl font-semibold text-purple-600">{results.ageGroup}</div>
              <div className="text-sm text-muted-foreground">연령대</div>
            </div>
          </div>
          
          {/* 종합 발달 지연도 표시 */}
          {detailedAnalysis && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 p-6 rounded-xl border border-blue-200 dark:border-blue-800">
              <h3 className="text-lg font-semibold mb-3 text-blue-700 dark:text-blue-300">종합 발달 지연도</h3>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Progress value={detailedAnalysis.overallDelay} className="h-3" />
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(detailedAnalysis.overallDelay)}%
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                전체 발달 영역의 평균 지연도를 나타냅니다
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 발달 영역별 차트 분석 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-indigo-600" />
            발달 영역별 상세 분석
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8">
            {/* 발달 프로파일 레이더 차트 */}
            <div className="h-80">
              <h4 className="text-center font-semibold mb-4 text-blue-700 dark:text-blue-300">발달 영역별 프로파일</h4>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={developmentalDomains}>
                  <PolarGrid />
                  <PolarAngleAxis 
                    dataKey="domain" 
                    tick={{ fontSize: 10, fill: 'currentColor' }}
                    className="text-muted-foreground"
                  />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, 100]} 
                    tick={{ fontSize: 9, fill: 'currentColor' }}
                    className="text-muted-foreground"
                  />
                  <Radar 
                    name="지연도 %" 
                    dataKey="percentage" 
                    stroke="#3B82F6" 
                    fill="#3B82F6" 
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* 영역별 점수 막대 차트 */}
            <div className="h-80">
              <h4 className="text-center font-semibold mb-4 text-blue-700 dark:text-blue-300">영역별 점수 분포</h4>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={developmentalDomains} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis 
                    type="category" 
                    dataKey="domain" 
                    width={70}
                    tick={{ fontSize: 10 }}
                  />
                  <Tooltip 
                    formatter={(value, name) => [`${value}%`, '지연도']}
                    labelFormatter={(label) => `${label}`}
                  />
                  <Bar dataKey="percentage" radius={[0, 4, 4, 0]}>
                    {developmentalDomains.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 영역별 상세 분석 카드들 */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {developmentalDomains.map((domain, index) => (
          <Card key={index} className={`border-l-4 ${domain.level === '심각' ? 'border-l-red-500' : domain.level === '중등도' ? 'border-l-orange-500' : domain.level === '경미' ? 'border-l-yellow-500' : 'border-l-green-500'}`}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                {getDomainIcon(domain.key)}
                {domain.domain}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">점수</span>
                  <span className="font-semibold">{domain.score}/{domain.maxScore}</span>
                </div>
                <Progress value={domain.percentage} className="h-2" />
                <div className="flex justify-between items-center">
                  <Badge 
                    className={`${getSeverityColor(domain.level)} text-white text-xs`}
                  >
                    {domain.level}
                  </Badge>
                  <span className="text-lg font-bold" style={{ color: domain.color }}>
                    {domain.percentage}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 지연 영역 및 정상 영역 분석 */}
      {detailedAnalysis && (
        <div className="grid md:grid-cols-2 gap-6">
          {detailedAnalysis.delayedAreas.length > 0 && (
            <Card className="border-red-200 dark:border-red-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
                  <AlertCircle className="w-5 h-5" />
                  지연 영역 ({detailedAnalysis.delayedAreas.length}개)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {detailedAnalysis.delayedAreas.map((area: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                      <div className="flex items-center gap-2">
                        {getDomainIcon(area.key)}
                        <span className="font-medium">{area.domain}</span>
                      </div>
                      <Badge variant="destructive">{area.percentage}%</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {detailedAnalysis.normalAreas.length > 0 && (
            <Card className="border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <CheckCircle className="w-5 h-5" />
                  정상 영역 ({detailedAnalysis.normalAreas.length}개)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {detailedAnalysis.normalAreas.map((area: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                      <div className="flex items-center gap-2">
                        {getDomainIcon(area.key)}
                        <span className="font-medium">{area.domain}</span>
                      </div>
                      <Badge className="bg-green-500 text-white">{area.percentage}%</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
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
          className="bg-blue-600 hover:bg-blue-700"
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
          onClick={() => window.open('https://example.com/expert-consultation', '_blank')}
          className="bg-green-600 hover:bg-green-700"
        >
          전문가 상담 예약
        </Button>
      </div>
    </div>
  );
};

export default DevelopmentalDelayTestResult;