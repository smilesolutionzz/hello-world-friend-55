import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, Brain, TrendingUp, Calendar, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateTestResultPDF } from '@/utils/pdfGenerator';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';
import { useLanguage } from '@/i18n/LanguageContext';

interface AssessmentDetail {
  id: string;
  user_id: string;
  results: any;
  analysis: string;
  created_at: string;
  age_group?: string;
  test_type?: string;
}

interface EnhancedAnalysis {
  id: string;
  assessment_type: string;
  raw_results: any;
  enhanced_analysis: string;
  score_interpretation: any;
  recommendations: string[];
  risk_level: string;
  created_at: string;
}

export default function AssessmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isEnglish } = useLanguage();
  const [assessment, setAssessment] = useState<AssessmentDetail | null>(null);
  const [enhancedAnalysis, setEnhancedAnalysis] = useState<EnhancedAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      // 페이지 visibility 변경 시 세션 복원 대기
      const loadWithSessionCheck = async () => {
        // 세션 복원을 위한 짧은 대기
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          // 세션이 없으면 잠시 대기 후 다시 확인 (모바일 앱 전환 후 복귀 시)
          await new Promise(resolve => setTimeout(resolve, 500));
          const { data: { session: retrySession } } = await supabase.auth.getSession();
          if (!retrySession) {
            navigate('/auth');
            return;
          }
        }
        loadAssessmentDetail();
      };
      loadWithSessionCheck();
    }
  }, [id]);

  const loadAssessmentDetail = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      // Load basic assessment
      const { data: assessmentData, error: assessmentError } = await supabase
        .from('assessments')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (assessmentError) throw assessmentError;
      
      // assessments 테이블에서 못 찾으면 test_results 테이블에서 검색
      if (!assessmentData) {
        const { data: testResultData, error: testResultError } = await supabase
          .from('test_results')
          .select(`*, test_types(name, description)`)
          .eq('id', id)
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (testResultError) throw testResultError;
        
        if (testResultData) {
          const scores = testResultData.scores as any;
          setAssessment({
            id: testResultData.id,
            user_id: testResultData.user_id,
            results: scores,
            analysis: scores?.analysis || '',
            created_at: testResultData.completed_at || testResultData.created_at,
            age_group: scores?.ageGroup,
            test_type: testResultData.test_types?.name
          });
          setLoading(false);
          return;
        }
        
        toast({
          title: "검사 결과를 찾을 수 없습니다",
          description: "삭제되었거나 접근 권한이 없습니다.",
          variant: "destructive",
        });
        navigate('/assessment');
        return;
      }
      
      setAssessment(assessmentData);

      // Load enhanced analysis if available
      const { data: enhancedData } = await supabase
        .from('assessment_enhanced_analysis')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (enhancedData) {
        setEnhancedAnalysis(enhancedData);
      }
    } catch (error: any) {
      console.error('Error loading assessment detail:', error);
      toast({
        title: "검사 상세 로드 실패",
        description: error.message,
        variant: "destructive",
      });
      navigate('/assessment');
    } finally {
      setLoading(false);
    }
  };

  const getScoreInterpretation = (score: number) => {
    if (score >= 6) return { level: isEnglish ? "High" : "높음", color: "bg-red-500", description: isEnglish ? "Very strong trait" : "매우 강한 특성" };
    if (score >= 5) return { level: isEnglish ? "Above Avg" : "중상", color: "bg-orange-500", description: isEnglish ? "Strong trait" : "강한 특성" };
    if (score >= 4) return { level: isEnglish ? "Average" : "보통", color: "bg-yellow-500", description: isEnglish ? "Typical trait" : "일반적 특성" };
    if (score >= 3) return { level: isEnglish ? "Below Avg" : "중하", color: "bg-green-500", description: isEnglish ? "Mild trait" : "약한 특성" };
    return { level: isEnglish ? "Low" : "낮음", color: "bg-blue-500", description: isEnglish ? "Very mild trait" : "매우 약한 특성" };
  };

  const translateCategory = (category: string) => {
    const translationsKo: Record<string, string> = {
      'novelty_seeking': '자극추구', 'harm_avoidance': '위험회피', 'reward_dependence': '사회적 민감성',
      'persistence': '인내력', 'self_directedness': '자율성', 'cooperativeness': '협조성', 'self_transcendence': '자기초월',
      'extraversion': '외향성', 'agreeableness': '친화성', 'conscientiousness': '성실성', 'neuroticism': '신경성', 'openness': '개방성',
      'passionate_romantic': '열정적 로맨티스트', 'stable_companion': '안정적 동반자', 'independent_individualist': '독립적 개인주의자', 'realistic_planner': '계획적 현실주의자',
      'attention': '주의집중', 'hyperactivity': '과잉행동', 'impulsivity': '충동성', 'inattention': '부주의', 'executive_function': '실행기능', 'working_memory': '작업기억',
      'emotional_problems': '정서적 문제', 'behavioral_problems': '행동적 문제', 'social_adaptation': '사회적 적응', 'identity_development': '정체성 발달',
      'internalizing_problems': '내재화 문제', 'externalizing_problems': '외현화 문제', 'attention_problems': '주의력 문제', 'social_competence': '사회적 역량',
      'social_interaction': '사회적 상호작용', 'communication': '의사소통', 'behavioral_patterns': '행동 패턴', 'sensory_responses': '감각 반응',
      'warmth_acceptance': '온정수용', 'behavioral_control': '행동통제', 'psychological_control': '심리통제', 'autonomy_support': '자율성지지', 'communication_support': '의사소통지지',
      'social_energy': '사회적 에너지', 'decision_making': '의사결정', 'emotional_regulation': '감정조절', 'adaptability': '적응성', 'stress_tolerance': '스트레스 내성',
      'anxiety': '불안', 'depression': '우울', 'self_esteem': '자존감', 'resilience': '회복력', 'communication_skills': '의사소통', 'problem_solving': '문제해결', 'focus': '집중력', 'memory': '기억력',
    };
    const translationsEn: Record<string, string> = {
      'novelty_seeking': 'Novelty Seeking', 'harm_avoidance': 'Harm Avoidance', 'reward_dependence': 'Reward Dependence',
      'persistence': 'Persistence', 'self_directedness': 'Self-Directedness', 'cooperativeness': 'Cooperativeness', 'self_transcendence': 'Self-Transcendence',
      'extraversion': 'Extraversion', 'agreeableness': 'Agreeableness', 'conscientiousness': 'Conscientiousness', 'neuroticism': 'Neuroticism', 'openness': 'Openness',
      'passionate_romantic': 'Passionate Romantic', 'stable_companion': 'Stable Companion', 'independent_individualist': 'Independent Individualist', 'realistic_planner': 'Realistic Planner',
      'attention': 'Attention', 'hyperactivity': 'Hyperactivity', 'impulsivity': 'Impulsivity', 'inattention': 'Inattention', 'executive_function': 'Executive Function', 'working_memory': 'Working Memory',
      'emotional_problems': 'Emotional Problems', 'behavioral_problems': 'Behavioral Problems', 'social_adaptation': 'Social Adaptation', 'identity_development': 'Identity Development',
      'internalizing_problems': 'Internalizing', 'externalizing_problems': 'Externalizing', 'attention_problems': 'Attention Problems', 'social_competence': 'Social Competence',
      'social_interaction': 'Social Interaction', 'communication': 'Communication', 'behavioral_patterns': 'Behavioral Patterns', 'sensory_responses': 'Sensory Responses',
      'warmth_acceptance': 'Warmth & Acceptance', 'behavioral_control': 'Behavioral Control', 'psychological_control': 'Psychological Control', 'autonomy_support': 'Autonomy Support', 'communication_support': 'Communication Support',
      'social_energy': 'Social Energy', 'decision_making': 'Decision Making', 'emotional_regulation': 'Emotional Regulation', 'adaptability': 'Adaptability', 'stress_tolerance': 'Stress Tolerance',
      'anxiety': 'Anxiety', 'depression': 'Depression', 'self_esteem': 'Self-Esteem', 'resilience': 'Resilience', 'communication_skills': 'Communication', 'problem_solving': 'Problem Solving', 'focus': 'Focus', 'memory': 'Memory',
    };
    const map = isEnglish ? translationsEn : translationsKo;
    return map[category.toLowerCase()] || category.replace(/_/g, ' ');
  };

  const handleDownloadPDF = async () => {
    try {
      const testDate = new Date(assessment?.created_at || Date.now()).toLocaleDateString(isEnglish ? 'en-US' : 'ko-KR');
      
      await generateTestResultPDF(isEnglish ? 'Premium Assessment' : '프리미엄 심리검사', isEnglish ? 'User' : '사용자', testDate, 'pdf-content');
      
      toast({
        title: isEnglish ? "PDF Downloaded" : "PDF 다운로드 완료",
        description: isEnglish ? "Results saved as PDF." : "검사 결과가 PDF로 저장되었습니다.",
      });
    } catch (error) {
      toast({
        title: isEnglish ? "PDF Download Failed" : "PDF 다운로드 실패", 
        description: isEnglish ? "An error occurred." : "PDF 생성 중 오류가 발생했습니다.",
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

  if (!assessment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{isEnglish ? 'Results not found' : '검사 결과를 찾을 수 없습니다'}</h2>
          <Button onClick={() => navigate('/assessment')}>
            {isEnglish ? 'Go Back' : '뒤로가기'}
          </Button>
        </div>
      </div>
    );
  }

  const results = assessment.results || {};
  
  // Extract scores from results more reliably
  const getScoreValue = (value: any): number | null => {
    if (value === null || value === undefined) return null;
    const num = Number(value);
    return isNaN(num) ? null : num;
  };

  // Filter and process result entries
  const resultEntries = Object.entries(results)
    .filter(([key, value]) => {
      // Exclude metadata keys
      if (['ageGroup', 'severity', 'answers', 'testType', 'analysis', 'testInfo', 'savedAt'].includes(key)) return false;
      // Include only valid numeric values
      return getScoreValue(value) !== null;
    })
    .map(([key, value]) => [key, getScoreValue(value)!] as [string, number]);
  
  const totalScore = resultEntries.reduce((sum, [_, score]) => sum + score, 0);
  const averageScore = resultEntries.length > 0 ? totalScore / resultEntries.length : 0;

  // Use enhanced analysis data if available
  const displayAnalysis = enhancedAnalysis?.enhanced_analysis || assessment.analysis || (isEnglish ? "No analysis data available." : "분석 데이터가 없습니다.");
  const scoreInterpretation = enhancedAnalysis?.score_interpretation || {};
  const recommendations = enhancedAnalysis?.recommendations || [];
  const riskLevel = enhancedAnalysis?.risk_level || (isEnglish ? 'N/A' : '정보 없음');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/30 to-blue-50/30">
      <UnifiedNavigation />
      <div className="container mx-auto px-4 sm:px-6 pt-4 sm:pt-8 pb-16">
        {/* Header - 모바일 최적화 */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 sm:mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/assessment')}
            className="flex items-center gap-2 w-fit"
            size="sm"
          >
            <ArrowLeft className="w-4 h-4" />
            {isEnglish ? 'Back' : '뒤로가기'}
          </Button>
          
          <div className="flex-1 text-center">
            <h1 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              {isEnglish ? 'Detailed Results' : '검사 상세 결과'}
            </h1>
             <p className="text-sm sm:text-lg text-muted-foreground">
              {isEnglish ? 'Premium Assessment • Expert Analysis' : '프리미엄 심리검사 • 전문가 심층 분석'}
            </p>
          </div>
          
          <Button onClick={handleDownloadPDF} size="sm" className="w-fit self-center sm:self-auto">
            <Download className="w-4 h-4 mr-2" />
            PDF
          </Button>
        </div>

        <div id="pdf-content">
        {/* Overall Score Card */}
        <div className="max-w-6xl mx-auto mb-6 sm:mb-8">
          <Card className="overflow-hidden hover-glow border-purple-200">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-600 text-white p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle className="text-lg sm:text-2xl">{isEnglish ? 'Premium Assessment' : '프리미엄 심리검사'}</CardTitle>
                  <p className="text-purple-100 mt-1 text-sm sm:text-base">{isEnglish ? 'AI-Powered Deep Analysis' : 'AI 기반 심층 분석 결과'}</p>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-2xl sm:text-3xl font-bold">{results.predicted_score?.toFixed(1) || averageScore.toFixed(1)}</div>
                  <div className="text-xs sm:text-sm text-purple-100">{isEnglish ? 'AI Predicted Score' : 'AI 예측 점수'}</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    {isEnglish ? 'Domain Scores' : '영역별 상세 점수'}
                  </h3>
                  <div className="space-y-3">
                    {resultEntries.map(([category, score]) => {
                      const numScore = Number(score) || 0;
                      const interpretation = getScoreInterpretation(numScore);
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
                              <span className="font-bold">{numScore.toFixed(1)}</span>
                            </div>
                          </div>
                          <Progress value={(numScore / 7) * 100} className="h-2" />
                          <p className="text-xs text-muted-foreground">{interpretation.description}</p>
                        </div>
                      );
                    })}
                    
                    {resultEntries.length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>{isEnglish ? 'No score data to display.' : '표시할 점수 데이터가 없습니다.'}</p>
                      </div>
                    )}
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
                  <h2 className="text-xl font-bold">심층 분석 보고서</h2>
                  <p className="text-sm text-muted-foreground">전문가 수준의 해석 및 권장사항</p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {/* 점수 해석 */}
              {scoreInterpretation && Object.keys(scoreInterpretation).length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <span className="text-2xl">📊</span>
                    점수 해석
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {scoreInterpretation.normalized !== undefined && (
                      <div className="bg-blue-50 dark:bg-blue-950/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                        <div className="text-sm text-muted-foreground mb-1">표준화 점수</div>
                        <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">{scoreInterpretation.normalized}</div>
                      </div>
                    )}
                    {scoreInterpretation.percentile !== undefined && (
                      <div className="bg-purple-50 dark:bg-purple-950/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                        <div className="text-sm text-muted-foreground mb-1">백분위</div>
                        <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">{scoreInterpretation.percentile}%</div>
                      </div>
                    )}
                    {scoreInterpretation.normativeLevel && (
                      <div className="bg-green-50 dark:bg-green-950/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                        <div className="text-sm text-muted-foreground mb-1">규준 수준</div>
                        <div className="text-2xl font-bold text-green-700 dark:text-green-400">{scoreInterpretation.normativeLevel}</div>
                      </div>
                    )}
                    {scoreInterpretation.tScore !== undefined && (
                      <div className="bg-orange-50 dark:bg-orange-950/20 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
                        <div className="text-sm text-muted-foreground mb-1">T 점수</div>
                        <div className="text-2xl font-bold text-orange-700 dark:text-orange-400">{scoreInterpretation.tScore}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 위험도 */}
              {riskLevel && riskLevel !== '정보 없음' && (
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                    <span className="text-2xl">⚠️</span>
                    위험도 평가
                  </h3>
                  <div className={`rounded-xl p-4 border-2 ${
                    riskLevel === 'high' ? 'bg-red-50 border-red-300 dark:bg-red-950/20' :
                    riskLevel === 'medium' ? 'bg-orange-50 border-orange-300 dark:bg-orange-950/20' :
                    'bg-green-50 border-green-300 dark:bg-green-950/20'
                  }`}>
                    <Badge className={`${
                      riskLevel === 'high' ? 'bg-red-500' :
                      riskLevel === 'medium' ? 'bg-orange-500' :
                      'bg-green-500'
                    } text-white text-lg px-4 py-1`}>
                      {riskLevel === 'high' ? '높음' : riskLevel === 'medium' ? '중간' : '낮음'}
                    </Badge>
                  </div>
                </div>
              )}

              {/* AI 분석 내용 */}
              <div className="border-t pt-6">
                <h3 className="font-semibold text-base sm:text-lg mb-4 flex items-center gap-2">
                  <span className="text-xl sm:text-2xl">🤖</span>
                  상세 분석
                </h3>
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-foreground leading-relaxed bg-card rounded-xl p-4 sm:p-6 border border-border shadow-sm text-sm sm:text-base">
                    {displayAnalysis}
                  </div>
                </div>
              </div>

              {/* 추천 사항 */}
              {recommendations && recommendations.length > 0 && (
                <div className="border-t pt-6">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <span className="text-2xl">💡</span>
                    전문가 권장사항
                  </h3>
                  <div className="space-y-3">
                    {recommendations.map((rec: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-3 bg-muted/30 rounded-lg p-4 border border-border/50">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-primary font-bold">{idx + 1}</span>
                        </div>
                        <p className="text-foreground flex-1 leading-relaxed">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Professional Notice */}
        <div className="max-w-6xl mx-auto">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6 text-center">
              <h4 className="font-semibold text-blue-900 mb-2">전문 심리검사 결과 안내</h4>
              <p className="text-blue-800 text-sm leading-relaxed">
                본 검사 결과는 전문가 지식 기반으로 작성된 참고 자료입니다. 
                정확한 진단이나 치료가 필요한 경우 반드시 전문가와 상담하시기 바랍니다.
              </p>
              <p className="text-blue-600/60 text-[11px] mt-2">전문가 지식 기반 AI 엔진 분석</p>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    </div>
  );
}