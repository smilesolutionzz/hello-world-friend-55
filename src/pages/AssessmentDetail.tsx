import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Brain, TrendingUp, Calendar, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AssessmentDetail {
  id: string;
  user_id: string;
  results: any;
  analysis: string;
  created_at: string;
  age_group?: string;
}

export default function AssessmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [assessment, setAssessment] = useState<AssessmentDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadAssessmentDetail();
    }
  }, [id]);

  const loadAssessmentDetail = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setAssessment(data);
    } catch (error: any) {
      console.error('Error loading assessment detail:', error);
      toast({
        title: "검사 상세 로드 실패",
        description: error.message,
        variant: "destructive",
      });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getScoreInterpretation = (score: number) => {
    if (score >= 6) return { level: "높음", color: "bg-red-500", description: "매우 강한 특성" };
    if (score >= 5) return { level: "중상", color: "bg-orange-500", description: "강한 특성" };
    if (score >= 4) return { level: "보통", color: "bg-yellow-500", description: "일반적 특성" };
    if (score >= 3) return { level: "중하", color: "bg-green-500", description: "약한 특성" };
    return { level: "낮음", color: "bg-blue-500", description: "매우 약한 특성" };
  };

  const translateCategory = (category: string) => {
    const translations: Record<string, string> = {
      // TCI 요인
      'novelty_seeking': '자극추구',
      'harm_avoidance': '위험회피', 
      'reward_dependence': '사회적 민감성',
      'persistence': '인내력',
      'self_directedness': '자율성',
      'cooperativeness': '협조성',
      'self_transcendence': '자기초월',
      
      // Big Five 요인
      'extraversion': '외향성',
      'agreeableness': '친화성',
      'conscientiousness': '성실성',
      'neuroticism': '신경성',
      'openness': '개방성',
      
      // 연애성격분석테스트 요인
      'passionate_romantic': '열정적 로맨티스트 (매우 열정적)',
      'stable_companion': '안정적 동반자 (안정 특성)',
      'independent_individualist': '독립적 개인주의자 (독립 특성)',
      'realistic_planner': '계획적 현실주의자 (현실 특성)',
      
      // ADHD 관련 요인
      'attention': '주의집중',
      'hyperactivity': '과잉행동',
      'impulsivity': '충동성',
      'inattention': '부주의',
      'executive_function': '실행기능',
      'working_memory': '작업기억',
      
      // 기타 심리학적 영역
      'social_energy': '사회적 에너지',
      'decision_making': '의사결정',
      'emotional_regulation': '감정조절',
      'adaptability': '적응성',
      'stress_tolerance': '스트레스 내성',
      'anxiety': '불안',
      'depression': '우울',
      'self_esteem': '자존감',
      'resilience': '회복력',
      'communication_skills': '의사소통',
      'problem_solving': '문제해결',
      'focus': '집중력',
      'memory': '기억력'
    };
    return translations[category.toLowerCase()] || category.replace(/_/g, ' ');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">검사 결과를 찾을 수 없습니다</h2>
          <Button onClick={() => navigate('/dashboard')}>
            대시보드로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  const results = assessment.results || {};
  const resultEntries = Object.entries(results);
  const totalScore = resultEntries.reduce((sum: number, [_, score]) => sum + (Number(score) || 0), 0);
  const averageScore = resultEntries.length > 0 ? totalScore / resultEntries.length : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/30 to-blue-50/30">
      <div className="container mx-auto px-6 pt-8 pb-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            대시보드로 돌아가기
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              검사 상세 결과
            </h1>
            <p className="text-lg text-muted-foreground">
              프리미엄 심리검사 • AI 심층 분석
            </p>
          </div>
          
          <div className="w-20" />
        </div>

        {/* Overall Score Card */}
        <div className="max-w-6xl mx-auto mb-8">
          <Card className="overflow-hidden hover-glow border-purple-200">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-600 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">프리미엄 심리검사</CardTitle>
                  <p className="text-purple-100 mt-1">AI 기반 심층 분석 결과</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{results.predicted_score?.toFixed(1) || averageScore.toFixed(1)}</div>
                  <div className="text-sm text-purple-100">AI 예측 점수</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    영역별 상세 점수
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(results).map(([category, score]) => {
                      const interpretation = getScoreInterpretation(Number(score));
                      return (
                        <div key={category} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">
                              {translateCategory(category)}
                            </span>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={`${interpretation.color} text-white`}>
                                {interpretation.level}
                              </Badge>
                              <span className="font-bold">{Number(score).toFixed(1)}</span>
                            </div>
                          </div>
                          <Progress value={(Number(score) / 7) * 100} className="h-2" />
                          <p className="text-xs text-muted-foreground">{interpretation.description}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-600" />
                    검사 정보
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium">검사일:</span> {new Date(assessment.created_at).toLocaleDateString('ko-KR')}</p>
                    <p><span className="font-medium">검사 유형:</span> 프리미엄 전문 검사</p>
                    <p><span className="font-medium">상태:</span> 완료</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Analysis Section */}
        <div className="max-w-6xl mx-auto mb-8">
          <Card className="overflow-hidden hover-glow">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
              <CardTitle className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">AI 심층 분석 보고서</h2>
                  <p className="text-sm text-muted-foreground">전문가 수준의 해석 및 권장사항</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {assessment.analysis || "분석 데이터가 없습니다."}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Professional Notice */}
        <div className="max-w-6xl mx-auto">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6 text-center">
              <h4 className="font-semibold text-blue-900 mb-2">전문 심리검사 결과 안내</h4>
              <p className="text-blue-800 text-sm leading-relaxed">
                본 검사 결과는 AI 기반 심층 분석을 통해 제공되는 참고 자료입니다. 
                정확한 진단이나 치료가 필요한 경우 반드시 전문가와 상담하시기 바랍니다.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}