import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, Share } from 'lucide-react';
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
  const { allowed, loading } = useTokenGuard(2); // 2 토큰 필요
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
      const { data, error } = await supabase
        .from('assessments')
        .select(`
          id,
          results,
          created_at,
          analysis,
          age_group,
          profile:profiles(display_name)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      
      // Transform data to match TestResult interface
      const transformedData = {
        id: data.id,
        scores: data.results || {},
        completed_at: data.created_at,
        test_types: {
          name: getTestNameFromAgeGroup(data.age_group),
          description: "심리검사 결과"
        },
        ai_analysis: data.analysis
      };
      
      setResult(transformedData);
    } catch (error: any) {
      toast({
        title: "결과 로드 실패",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = (scores: Record<string, number>) => {
    return Object.entries(scores)
      .filter(([key]) => key !== 'total_score')
      .map(([key, value]) => ({
        name: getKoreanLabel(key),
        score: value,
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
      language: '언어능력'
    };
    return labels[key] || key;
  };

  const getScoreLevel = (score: number) => {
    if (score >= 80) return { level: '우수', color: 'bg-green-500' };
    if (score >= 60) return { level: '보통', color: 'bg-yellow-500' };
    return { level: '개선필요', color: 'bg-red-500' };
  };

  const generateAIAnalysis = (scores: Record<string, number>, testName: string) => {
    const totalScore = scores.total_score || 0;
    const { level } = getScoreLevel(totalScore);
    
    if (testName.includes('언어')) {
      return `언어 검사 결과, 전체 점수는 ${totalScore}점으로 '${level}' 수준입니다. 어휘력과 표현력을 중심으로 꾸준한 학습을 권장합니다.`;
    } else if (testName.includes('회복력')) {
      return `회복력 검사 결과, 전체 점수는 ${totalScore}점으로 '${level}' 수준입니다. 스트레스 관리 기법과 감정 조절 능력 향상에 집중해보세요.`;
    } else if (testName.includes('ADHD')) {
      return `ADHD 검사 결과, 전체 점수는 ${totalScore}점으로 '${level}' 수준입니다. 주의력과 실행기능 향상을 위한 구체적인 계획을 세워보시기 바랍니다.`;
    }
    return `검사 결과, 전체 점수는 ${totalScore}점으로 '${level}' 수준입니다.`;
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">결과를 찾을 수 없습니다.</p>
      </div>
    );
  }

  const chartData = generateChartData(result.scores);
  const { level, color } = getScoreLevel(result.scores.total_score || 0);
  const aiAnalysis = result.ai_analysis || generateAIAnalysis(result.scores, result.test_types.name);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              돌아가기
            </Button>
            <div>
              <h1 className="font-semibold">{result.test_types.name} 결과</h1>
              <p className="text-sm text-muted-foreground">
                {new Date(result.completed_at).toLocaleDateString('ko-KR')}
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
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">AI 예측 점수</CardTitle>
            <div className="flex items-center justify-center gap-4 mt-4">
              <div className="text-4xl font-bold text-primary">
                {result.scores.predicted_score || result.scores.total_score || 0}점
              </div>
              <Badge className={`${color} text-white`}>
                {level}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              AI가 분석한 표준화된 예측 점수
            </p>
          </CardHeader>
        </Card>

        {/* 차트 섹션 */}
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
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="score" fill="hsl(var(--primary))" />
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
                    <PolarAngleAxis dataKey="name" />
                    <PolarRadiusAxis domain={[0, 100]} />
                    <Radar
                      name="점수"
                      dataKey="score"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI 분석 */}
        <Card>
          <CardHeader>
            <CardTitle>AI 분석</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
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