import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Brain, TrendingUp, AlertCircle, CheckCircle, Loader2, BookOpen, Calculator, FileText, Focus, Archive, Lightbulb, Target } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTestResultActions } from "@/hooks/useTestResultActions";
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell, LineChart, Line, AreaChart, Area } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { RelatedTestRecommendations } from './RelatedTestRecommendations';

interface LearningDisabilityTestResultProps {
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

const LearningDisabilityTestResult = ({ results, onBack, onRestart }: LearningDisabilityTestResultProps) => {
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [learningDomains, setLearningDomains] = useState<any[]>([]);
  const [detailedAnalysis, setDetailedAnalysis] = useState<any>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const { toast } = useToast();
  const { saveTestResult, isSaving } = useTestResultActions();

  // 학습 영역별 분석 함수
  const analyzeLearningDomains = () => {
    const { answers } = results;
    
    // 각 영역별 문항 인덱스 (0-19, 총 20문항)
    const domains = {
      reading: [0, 1, 16], // 읽기 능력 (문항 1,2,17)
      writing: [2, 8, 17], // 쓰기 능력 (문항 3,9,18)
      math: [3, 18], // 수학 능력 (문항 4,19)
      attention: [6, 7, 12], // 주의집중 (문항 7,8,13)
      memory: [5, 11, 15], // 기억력 (문항 6,12,16)
      processing: [4, 10, 13, 17], // 정보처리 (문항 5,11,14,18)
      executive: [9, 14, 16, 19] // 실행기능 (문항 10,15,17,20)
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
      reading: "읽기 능력",
      writing: "쓰기 능력", 
      math: "수학 능력",
      attention: "주의집중",
      memory: "기억력",
      processing: "정보처리",
      executive: "실행기능"
    };
    return names[key as keyof typeof names];
  };

  const getDomainIcon = (key: string) => {
    const icons = {
      reading: <BookOpen className="w-5 h-5" />,
      writing: <FileText className="w-5 h-5" />,
      math: <Calculator className="w-5 h-5" />,
      attention: <Focus className="w-5 h-5" />,
      memory: <Archive className="w-5 h-5" />,
      processing: <Lightbulb className="w-5 h-5" />,
      executive: <Target className="w-5 h-5" />
    };
    return icons[key as keyof typeof icons];
  };

  useEffect(() => {
    const domains = analyzeLearningDomains();
    console.log('Learning domains data:', domains); // 디버깅용
    setLearningDomains(domains);
    
    // 상세 분석 데이터 생성
    const detailed = {
      difficultAreas: domains.filter(d => d.percentage >= 50),
      strengthAreas: domains.filter(d => d.percentage < 25),
      overallDifficulty: domains.reduce((sum, d) => sum + d.percentage, 0) / domains.length
    };
    setDetailedAnalysis(detailed);
    
    analyzeResults();
  }, [results]);

  const analyzeResults = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('analyze-test-results', {
        body: {
          testType: 'learning-disability',
          results: {
            ...results,
            learningDomains: learningDomains.length > 0 ? learningDomains : analyzeLearningDomains()
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
        testType: '학습장애 검사',
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
      setIsGeneratingPDF(true);
      const { downloadResultAsPDF } = await import('@/utils/pdfDownload');
      await downloadResultAsPDF(
        'learning-disability-pdf-content',
        'AIH_학습장애_검사결과',
        () => {
          toast({
            title: "PDF 다운로드 완료",
            description: "학습장애 검사 결과가 저장되었습니다.",
          });
        },
        (error) => {
          toast({
            title: "PDF 생성 실패",
            description: error.message,
            variant: "destructive",
          });
        }
      );
    } catch (error) {
      console.error('PDF 생성 오류:', error);
      toast({
        title: "PDF 생성 실패",
        description: "PDF 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* PDF 생성용 숨겨진 컨텐츠 */}
      <div id="learning-disability-pdf-content" className="hidden print:block">
        <div className="p-8 bg-white">
          <div className="text-center mb-6">
            <div className="text-xl font-bold text-indigo-600 mb-2">aihpro.com</div>
            <h1 className="text-3xl font-bold mb-2">AIH 학습장애 검사 결과</h1>
            <p className="text-gray-600">검사일: {new Date().toLocaleDateString('ko-KR')}</p>
          </div>
          
          <div className="mb-8 p-6 border-2 border-gray-200 rounded-lg">
            <h2 className="text-2xl font-bold mb-4">학습장애 전문 분석 결과</h2>
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-3xl font-bold text-orange-600">{results.total}</div>
                <div className="text-sm text-gray-600">총점</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600">{results.average.toFixed(1)}</div>
                <div className="text-sm text-gray-600">평균점수</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-lg font-bold text-red-600 px-4 py-2 bg-red-200 rounded inline-block">{results.severity}</div>
                <div className="text-sm text-gray-600 mt-2">평가등급</div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-xl font-bold text-blue-600">{results.ageGroup}</div>
                <div className="text-sm text-gray-600">연령대</div>
              </div>
            </div>
            {detailedAnalysis && (
              <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
                <h3 className="text-lg font-semibold mb-2 text-orange-700">종합 학습 어려움 지수</h3>
                <div className="text-3xl font-bold text-orange-600">{Math.round(detailedAnalysis.overallDifficulty)}%</div>
                <p className="text-sm text-gray-600 mt-1">전체 학습 영역의 평균 어려움 정도</p>
              </div>
            )}
          </div>
          
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-4">학습 영역별 상세 분석</h3>
            <div className="space-y-3">
              {learningDomains.map((domain, index) => (
                <div key={index} className="p-4 border-l-4 rounded" style={{ borderColor: domain.color }}>
                  <div className="flex justify-between items-center mb-2">
                    <strong className="text-lg">{domain.domain}</strong>
                    <span className="text-xl font-bold" style={{ color: domain.color }}>{domain.percentage}%</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>점수: {domain.score}/{domain.maxScore}</span>
                    <span className="px-3 py-1 rounded text-white font-semibold" style={{ backgroundColor: domain.color }}>{domain.level}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {detailedAnalysis && detailedAnalysis.difficultAreas.length > 0 && (
            <div className="mb-8 p-6 bg-red-50 border-2 border-red-200 rounded-lg">
              <h3 className="text-xl font-bold text-red-700 mb-3">🚨 어려움 영역 ({detailedAnalysis.difficultAreas.length}개)</h3>
              <div className="space-y-2">
                {detailedAnalysis.difficultAreas.map((area: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-white rounded">
                    <span className="font-medium">{area.domain}</span>
                    <span className="font-bold text-red-600">{area.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="mb-8 p-6 bg-gray-50 rounded-lg">
            <h3 className="text-xl font-bold mb-3">AI 전문가 분석</h3>
            <p className="whitespace-pre-wrap leading-relaxed">{analysis || '전문가 상담을 통해 정확한 평가를 받으시기 바랍니다.'}</p>
          </div>
          
          <div className="mt-8 p-4 bg-blue-50 rounded text-center text-sm text-gray-600">
            ※ 본 검사는 참고용 자가체크이며, 전문적인 진단을 대체하지 않습니다.<br/>
            학습 어려움이 지속되는 경우 반드시 전문가와 상담하시기 바랍니다.
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          뒤로가기
        </Button>
        <h1 className="text-2xl font-bold text-foreground">학습장애 검사 결과</h1>
      </div>

      {/* 학습장애 전문 분석 결과 카드 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-6 h-6 text-orange-600" />
            학습장애 전문 분석 결과
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 rounded-lg">
              <div className="text-3xl font-bold text-orange-600">{results.total}</div>
              <div className="text-sm text-muted-foreground">총점</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-lg">
              <div className="text-3xl font-bold text-green-600">{results.average.toFixed(1)}</div>
              <div className="text-sm text-muted-foreground">평균점수</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 rounded-lg">
              <Badge className={`${getSeverityColor(results.severity)} text-white text-lg px-4 py-2`}>
                {results.severity}
              </Badge>
              <div className="text-sm text-muted-foreground mt-2">평가등급</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-lg">
              <div className="text-2xl font-semibold text-blue-600">{results.ageGroup}</div>
              <div className="text-sm text-muted-foreground">연령대</div>
            </div>
          </div>
          
          {/* 종합 학습 어려움 지수 */}
          {detailedAnalysis && (
            <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950 p-6 rounded-xl border border-orange-200 dark:border-orange-800">
              <h3 className="text-lg font-semibold mb-3 text-orange-700 dark:text-orange-300">종합 학습 어려움 지수</h3>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Progress value={detailedAnalysis.overallDifficulty} className="h-3" />
                </div>
                <div className="text-2xl font-bold text-orange-600">
                  {Math.round(detailedAnalysis.overallDifficulty)}%
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                전체 학습 영역의 평균 어려움 정도를 나타냅니다
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 학습 영역별 차트 분석 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-600" />
            학습 영역별 상세 분석
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-8">
            {/* 학습 프로파일 레이더 차트 */}
            <div className="h-80">
              <h4 className="text-center font-semibold mb-4 text-orange-700 dark:text-orange-300">학습 영역별 프로파일</h4>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={learningDomains}>
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
                    name="어려움 %" 
                    dataKey="percentage" 
                    stroke="#F59E0B" 
                    fill="#F59E0B" 
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* 영역별 점수 막대 차트 */}
            <div className="h-80">
              <h4 className="text-center font-semibold mb-4 text-orange-700 dark:text-orange-300">영역별 점수 분포</h4>
              {learningDomains.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%" debounce={50}>
                  <BarChart 
                    data={learningDomains} 
                    margin={{ top: 5, right: 20, left: 0, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="domain"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      tick={{ fontSize: 10, fill: '#6b7280' }}
                      interval={0}
                    />
                    <YAxis 
                      domain={[0, 100]}
                      tick={{ fontSize: 11, fill: '#6b7280' }}
                      label={{ value: '어려움도 (%)', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      formatter={(value: any) => [`${value}%`, '어려움도']}
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '8px 12px'
                      }}
                    />
                    <Bar 
                      dataKey="percentage" 
                      radius={[4, 4, 0, 0]}
                      animationDuration={500}
                    >
                      {learningDomains.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  데이터를 불러오는 중...
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 영역별 상세 분석 카드들 */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {learningDomains.map((domain, index) => (
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

      {/* 어려움 영역 및 강점 영역 분석 */}
      {detailedAnalysis && (
        <div className="grid md:grid-cols-2 gap-6">
          {detailedAnalysis.difficultAreas.length > 0 && (
            <Card className="border-red-200 dark:border-red-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
                  <AlertCircle className="w-5 h-5" />
                  어려움 영역 ({detailedAnalysis.difficultAreas.length}개)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {detailedAnalysis.difficultAreas.map((area: any, index: number) => (
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

          {detailedAnalysis.strengthAreas.length > 0 && (
            <Card className="border-green-200 dark:border-green-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <CheckCircle className="w-5 h-5" />
                  강점 영역 ({detailedAnalysis.strengthAreas.length}개)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {detailedAnalysis.strengthAreas.map((area: any, index: number) => (
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

      {/* 연관 검사 추천 */}
      <RelatedTestRecommendations currentTestType="learning-disability" />

      {/* 액션 버튼들 */}
      <div className="flex flex-wrap gap-3">
        <Button 
          onClick={handleSaveReport}
          disabled={isSaving}
          className="bg-orange-600 hover:bg-orange-700"
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

export default LearningDisabilityTestResult;