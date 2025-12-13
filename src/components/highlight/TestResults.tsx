import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, Share, Brain } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTokenGuard } from '@/hooks/useTokenGuard';
import { generateTestResultPDF } from '@/utils/pdfGenerator';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface TestResult {
  id: string;
  scores: any;
  completed_at: string;
  test_types: {
    name: string;
    description: string;
  };
  ai_analysis?: string;
  expert_feedback?: string;
}

const PremiumFeature = ({ children }: { children: React.ReactNode }) => {
  const { allowed, loading } = useTokenGuard(2);
  const navigate = useNavigate();
  
  if (loading) {
    return <div className="animate-pulse bg-muted h-20 rounded"></div>;
  }
  
  if (!allowed) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>프리미엄 기능</CardTitle>
          <CardDescription>
            이 기능은 프리미엄 플랜에서만 사용할 수 있습니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => navigate('/token-subscription')}>
            토큰 구매하기
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return <>{children}</>;
};

export const TestResults = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      fetchTestResult();
    }
  }, [id]);

  const fetchTestResult = async () => {
    try {
      // First try to fetch from test_results table
      const { data: testResultData, error: testResultError } = await supabase
        .from('test_results')
        .select(`
          id,
          scores,
          completed_at,
          created_at,
          test_types(name, description)
        `)
        .eq('id', id)
        .maybeSingle();

      if (testResultData) {
        setResult({
          id: testResultData.id,
          scores: testResultData.scores || {},
          completed_at: testResultData.completed_at || testResultData.created_at,
          test_types: {
            name: testResultData.test_types?.name || '심리검사',
            description: testResultData.test_types?.description || '심리검사 결과'
          }
        });
        setLoading(false);
        return;
      }

      // If not found in test_results, try assessments table
      const { data: assessmentData, error: assessmentError } = await supabase
        .from('assessments')
        .select(`
          id,
          results,
          created_at,
          analysis,
          age_group
        `)
        .eq('id', id)
        .maybeSingle();

      if (assessmentError) throw assessmentError;
      
      if (assessmentData) {
        setResult({
          id: assessmentData.id,
          scores: assessmentData.results || {},
          completed_at: assessmentData.created_at,
          test_types: {
            name: getTestNameFromAgeGroup(assessmentData.age_group),
            description: "심리검사 결과"
          },
          ai_analysis: assessmentData.analysis
        });
      } else {
        toast({
          title: "결과를 찾을 수 없습니다",
          description: "해당 검사 결과가 존재하지 않습니다.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error fetching test result:', error);
      toast({
        title: "결과 로드 실패",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = (scores: any) => {
    // scores 안에 results가 중첩되어 있는 경우 처리
    const actualScores = scores?.results || scores;
    
    // scores 객체가 없거나 빈 경우 처리
    if (!actualScores || typeof actualScores !== 'object') return [];
    
    return Object.entries(actualScores)
      .filter(([key]) => !['total', 'total_score', 'predicted_score', 'score', 'ageGroup', 'severity', 'answers', 'testType', 'analysis', 'testInfo', 'savedAt', 'chartData', 'riskLevel', 'scoreSummary', 'average'].includes(key))
      .filter(([_, value]) => typeof value === 'number')
      .map(([key, value]) => ({
        name: getKoreanLabel(key),
        score: value as number,
        fullMark: 100
      }));
  };

  const getTestNameFromAgeGroup = (ageGroup: string) => {
    const names: Record<string, string> = {
      infant: '영유아 발달검사',
      child: '아동/청소년 심리검사',
      adult: '성인 심리검사'
    };
    return names[ageGroup] || '심리검사';
  };

  const getKoreanLabel = (key: string) => {
    const labels: Record<string, string> = {
      vocabulary: '어휘력',
      grammar: '문법',
      comprehension: '이해력',
      expression: '표현력',
      stress_management: '스트레스 관리',
      emotional_regulation: '감정 조절',
      adaptability: '적응력',
      social_support: '사회적 지지',
      attention: '주의력',
      hyperactivity: '과잉행동',
      impulsivity: '충동성',
      executive: '실행기능',
      executive_function: '실행기능',
      language: '언어능력',
      novelty_seeking: '자극추구',
      harm_avoidance: '위험회피',
      reward_dependence: '사회적 민감성',
      persistence: '인내력',
      self_directedness: '자율성',
      cooperativeness: '협조성',
      self_transcendence: '자기초월',
      extraversion: '외향성',
      agreeableness: '친화성',
      conscientiousness: '성실성',
      neuroticism: '신경성',
      openness: '개방성',
      passionate_romantic: '열정적 로맨티스트',
      stable_companion: '안정적 동반자',
      independent_individualist: '독립적 개인주의자',
      realistic_planner: '계획적 현실주의자',
      inattention: '부주의',
      working_memory: '작업기억',
      emotional_problems: '정서적 문제',
      behavioral_problems: '행동적 문제',
      social_adaptation: '사회적 적응',
      identity_development: '정체성 발달',
      social_interaction: '사회적 상호작용',
      communication: '의사소통',
      behavioral_patterns: '행동 패턴',
      sensory_responses: '감각 반응',
      anxiety: '불안',
      depression: '우울',
      self_esteem: '자존감',
      resilience: '회복력',
      focus: '집중력',
      memory: '기억력'
    };
    return labels[key] || key.replace(/_/g, ' ');
  };

  const getScoreLevel = (score: number) => {
    if (score >= 80) return { level: '우수', color: 'bg-green-500' };
    if (score >= 60) return { level: '보통', color: 'bg-yellow-500' };
    return { level: '개선필요', color: 'bg-red-500' };
  };

  const generateAIAnalysis = (scores: Record<string, number>, testName: string) => {
    const totalScore = scores.total_score || scores.predicted_score || 0;
    const { level } = getScoreLevel(totalScore);
    
    if (testName.includes('언어')) {
      return `언어 검사 결과, 전체 점수는 ${totalScore}점으로 '${level}' 수준입니다. 어휘력과 표현력을 중심으로 꾸준한 학습을 권장합니다.`;
    } else if (testName.includes('회복력')) {
      return `회복력 검사 결과, 전체 점수는 ${totalScore}점으로 '${level}' 수준입니다. 스트레스 관리 기법과 감정 조절 능력 향상에 집중해보세요.`;
    } else if (testName.includes('ADHD')) {
      return `ADHD 검사 결과, 전체 점수는 ${totalScore}점으로 '${level}' 수준입니다. 주의력과 실행기능 향상을 위한 구체적인 계획을 세워보시기 바랍니다.`;
    }
    return `검사 결과, 전체 점수는 ${totalScore}점으로 '${level}' 수준입니다. 상세 결과를 확인하시고 필요시 전문가 상담을 권장드립니다.`;
  };

  const handleDownloadPDF = async () => {
    try {
      const testName = result?.test_types?.name || '심리검사';
      const testDate = new Date(result?.completed_at || Date.now()).toLocaleDateString('ko-KR');
      
      await generateTestResultPDF(testName, '사용자', testDate, 'pdf-content');
      
      toast({
        title: "PDF 다운로드 완료",
        description: "검사 결과가 PDF로 저장되었습니다.",
      });
    } catch (error) {
      toast({
        title: "PDF 다운로드 실패",
        description: "PDF 생성 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">검사 결과를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <Card className="p-8 text-center max-w-md">
          <Brain className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">결과를 찾을 수 없습니다</h2>
          <p className="text-muted-foreground mb-4">해당 검사 결과가 존재하지 않거나 접근 권한이 없습니다.</p>
          <Button onClick={() => navigate(-1)}>
            뒤로가기
          </Button>
        </Card>
      </div>
    );
  }

  const chartData = generateChartData(result.scores);
  // Handle nested scores format from auto-save
  const scoresData = result.scores?.results || result.scores;
  const totalScore = scoresData?.total || result.scores?.scoreSummary?.total || result.scores.predicted_score || result.scores.total_score || result.scores.score || 0;
  const { level, color } = getScoreLevel(typeof totalScore === 'number' ? totalScore : 0);
  const aiAnalysis = result.ai_analysis || result.scores?.analysis || generateAIAnalysis(result.scores, result.test_types.name);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              돌아가기
            </Button>
            <div>
              <h1 className="font-semibold">{result.test_types.name} 결과</h1>
              <p className="text-sm text-muted-foreground">
                {new Date(result.completed_at).toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Share className="w-4 h-4 mr-2" />
              공유
            </Button>
            <PremiumFeature>
              <Button size="sm" onClick={handleDownloadPDF}>
                <Download className="w-4 h-4 mr-2" />
                PDF 다운로드
              </Button>
            </PremiumFeature>
          </div>
        </div>
      </div>

      <div id="pdf-content" className="container mx-auto px-4 py-8 space-y-6">
        {/* 총점 카드 */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-600 text-white text-center">
            <CardTitle className="text-2xl">검사 결과</CardTitle>
            <div className="flex items-center justify-center gap-4 mt-4">
              <div className="text-5xl font-bold">
                {typeof totalScore === 'number' ? totalScore.toFixed(0) : totalScore}점
              </div>
              <Badge className={`${color} text-white text-lg px-4 py-1`}>
                {level}
              </Badge>
            </div>
            <p className="text-purple-100 mt-2">
              {result.test_types.description}
            </p>
          </CardHeader>
        </Card>

        {/* 차트 섹션 */}
        {chartData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>영역별 점수 (바 차트)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Bar dataKey="score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>영역별 점수 (레이더 차트)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={chartData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <PolarRadiusAxis domain={[0, 100]} />
                      <Radar
                        name="점수"
                        dataKey="score"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.3}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 상세 점수 */}
        {chartData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>영역별 상세 점수</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {chartData.map((item) => {
                  const scoreLevel = getScoreLevel(item.score);
                  return (
                    <div key={item.name} className="p-4 rounded-lg bg-muted/50 border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{item.name}</span>
                        <Badge className={`${scoreLevel.color} text-white`}>
                          {scoreLevel.level}
                        </Badge>
                      </div>
                      <div className="text-2xl font-bold text-primary">
                        {typeof item.score === 'number' ? item.score.toFixed(1) : item.score}점
                      </div>
                      <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${scoreLevel.color} transition-all duration-500`}
                          style={{ width: `${Math.min(item.score, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI 분석 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-500" />
              AI 분석
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {aiAnalysis}
            </p>
          </CardContent>
        </Card>

        {/* 전문가 피드백 */}
        <PremiumFeature>
          {result.expert_feedback ? (
            <Card>
              <CardHeader>
                <CardTitle>전문가 피드백</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">
                  {result.expert_feedback}
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>전문가 피드백</CardTitle>
                <CardDescription>
                  전문가 피드백이 아직 작성되지 않았습니다.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </PremiumFeature>
      </div>
    </div>
  );
};
