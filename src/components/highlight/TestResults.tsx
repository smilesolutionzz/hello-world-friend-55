import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Brain, Calendar, FileText, RotateCcw, Sparkles, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TestResult {
  id: string;
  scores: any;
  completed_at: string;
  test_types: {
    name: string;
    description: string;
  };
  ai_analysis?: string;
  age_group?: string;
  source?: 'assessments' | 'test_results';
}

export const TestResults = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Check if assessment data was passed via navigation state
  const passedAssessment = location.state?.assessment;

  useEffect(() => {
    if (passedAssessment) {
      // Use passed data directly
      setResult({
        id: passedAssessment.id,
        scores: passedAssessment.results,
        completed_at: passedAssessment.completed_at,
        test_types: {
          name: passedAssessment.test_name,
          description: passedAssessment.test_description || '심리검사 결과'
        },
        ai_analysis: passedAssessment.analysis,
        age_group: passedAssessment.age_group,
        source: passedAssessment.source
      });
      setLoading(false);
    } else if (id) {
      fetchTestResult();
    }
  }, [id, passedAssessment]);

  const fetchTestResult = async () => {
    try {
      // First try to fetch from test_results table
      const { data: testResultData } = await supabase
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
          },
          source: 'test_results'
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
          ai_analysis: assessmentData.analysis,
          age_group: assessmentData.age_group,
          source: 'assessments'
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

  const getTestNameFromAgeGroup = (ageGroup?: string) => {
    const names: Record<string, string> = {
      infant: '영유아 발달검사',
      child: '아동/청소년 심리검사',
      adult: '성인 심리검사'
    };
    return names[ageGroup || ''] || '심리검사';
  };

  const getAgeGroupLabel = (ageGroup?: string) => {
    const labels: Record<string, string> = {
      infant: "유아",
      child: "아동/청소년",
      adult: "성인"
    };
    return labels[ageGroup || ''] || '';
  };

  const handleRetakeTest = () => {
    // Navigate to appropriate test page based on age group or test type
    if (result?.age_group) {
      navigate('/assessment', { state: { ageGroup: result.age_group } });
    } else if (result?.source === 'test_results') {
      navigate('/premium-assessment');
    } else {
      navigate('/assessment');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-slate-50">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
          <p className="text-muted-foreground">검사 결과를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-slate-50 p-4">
        <Card className="p-8 text-center max-w-md rounded-2xl border-border/50">
          <Brain className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">결과를 찾을 수 없습니다</h2>
          <p className="text-muted-foreground mb-6">해당 검사 결과가 존재하지 않거나 접근 권한이 없습니다.</p>
          <Button onClick={() => navigate('/assessment')} className="rounded-xl">
            <ArrowLeft className="w-4 h-4 mr-2" />
            돌아가기
          </Button>
        </Card>
      </div>
    );
  }

  const aiAnalysis = result.ai_analysis || result.scores?.analysis;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/20 to-blue-50/20 dark:from-background dark:via-purple-950/10 dark:to-blue-950/10">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/assessment')}
            className="rounded-xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            돌아가기
          </Button>
          
          <Button 
            onClick={handleRetakeTest}
            size="sm"
            className="rounded-xl bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/20"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            다시 검사하기
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 md:py-8 space-y-6 max-w-3xl">
        {/* Test Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="overflow-hidden rounded-2xl border-border/50 bg-card/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-600 text-white p-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                  {result.source === 'test_results' ? (
                    <Sparkles className="w-7 h-7 text-white" />
                  ) : (
                    <Brain className="w-7 h-7 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <CardTitle className="text-xl md:text-2xl text-white">
                      {result.test_types.name}
                    </CardTitle>
                    {result.source === 'test_results' && (
                      <Badge className="bg-white/20 text-white border-white/30 text-xs">
                        프리미엄
                      </Badge>
                    )}
                  </div>
                  <p className="text-purple-100 text-sm">{result.test_types.description}</p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-5 space-y-4">
              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(result.completed_at).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                {result.age_group && (
                  <Badge variant="outline" className="rounded-lg border-border/50 bg-muted/50">
                    {getAgeGroupLabel(result.age_group)}
                  </Badge>
                )}
              </div>

              {/* AI Analysis */}
              {aiAnalysis && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border/30">
                  <h3 className="font-semibold text-sm mb-2 flex items-center gap-2 text-foreground">
                    <FileText className="w-4 h-4 text-primary" />
                    AI 분석 결과
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {aiAnalysis}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Action Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          {/* Retake Test */}
          <Card 
            className={cn(
              "group p-4 rounded-2xl border-border/50 bg-card/80 backdrop-blur-sm",
              "hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer"
            )}
            onClick={handleRetakeTest}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                <RotateCcw className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">다시 검사하기</h3>
                <p className="text-sm text-muted-foreground">같은 유형의 검사를 다시 진행합니다</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>

          {/* More Tests */}
          <Card 
            className={cn(
              "group p-4 rounded-2xl border-border/50 bg-card/80 backdrop-blur-sm",
              "hover:shadow-lg hover:border-purple-500/30 transition-all cursor-pointer"
            )}
            onClick={() => navigate('/premium-assessment')}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Sparkles className="w-6 h-6 text-purple-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">다른 검사 보기</h3>
                <p className="text-sm text-muted-foreground">프리미엄 심리검사 둘러보기</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>

          {/* Expert Consultation */}
          <Card 
            className={cn(
              "group p-4 rounded-2xl border-border/50 bg-card/80 backdrop-blur-sm",
              "hover:shadow-lg hover:border-blue-500/30 transition-all cursor-pointer"
            )}
            onClick={() => navigate('/experts')}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Brain className="w-6 h-6 text-blue-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">전문가 상담</h3>
                <p className="text-sm text-muted-foreground">검사 결과에 대해 전문가와 상담하세요</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
