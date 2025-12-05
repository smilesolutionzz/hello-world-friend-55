import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Calendar, 
  User, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  FileText,
  Eye,
  Brain
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface CombinedAssessment {
  id: string;
  source: 'assessments' | 'test_results';
  test_name: string;
  test_description?: string;
  age_group?: string;
  age_at_assessment?: number;
  results: any;
  analysis?: string;
  risk_level?: 'low' | 'medium' | 'high';
  recommendations?: string;
  completed_at: string;
  profile_name?: string;
}

const AssessmentHistory = () => {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<CombinedAssessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssessments();
  }, []);

  const loadAssessments = async () => {
    try {
      console.log('📊 AssessmentHistory: Loading all assessments...');
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('❌ User not authenticated');
        setLoading(false);
        return;
      }
      
      // Load from assessments table
      const { data: assessmentsData, error: assessmentsError } = await supabase
        .from('assessments')
        .select(`
          *,
          profile:profiles(display_name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (assessmentsError) {
        console.error('❌ Error loading assessments:', assessmentsError);
      }
      
      // Load from test_results table
      const { data: testResultsData, error: testResultsError } = await supabase
        .from('test_results')
        .select(`
          *,
          test_types(name, description)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (testResultsError) {
        console.error('❌ Error loading test_results:', testResultsError);
      }
      
      // Transform and combine data
      const combinedData: CombinedAssessment[] = [];
      
      // Transform assessments data
      if (assessmentsData) {
        assessmentsData.forEach(assessment => {
          combinedData.push({
            id: assessment.id,
            source: 'assessments',
            test_name: getTestNameFromAgeGroup(assessment.age_group),
            age_group: assessment.age_group,
            age_at_assessment: assessment.age_at_assessment,
            results: assessment.results,
            analysis: assessment.analysis,
            risk_level: assessment.risk_level as any,
            recommendations: assessment.recommendations ? assessment.recommendations.join(', ') : undefined,
            completed_at: assessment.created_at,
            profile_name: assessment.profile?.display_name
          });
        });
      }
      
      // Transform test_results data
      if (testResultsData) {
        testResultsData.forEach(result => {
          const scores = result.scores as any;
          combinedData.push({
            id: result.id,
            source: 'test_results',
            test_name: result.test_types?.name || '심리검사',
            test_description: result.test_types?.description,
            results: scores,
            analysis: scores?.analysis || undefined,
            risk_level: scores?.severity === '심각' || scores?.severity === '심한 우울' || scores?.severity === '높음' ? 'high' as const :
                       scores?.severity === '중등도' || scores?.severity === '중등도 우울' || scores?.severity === '보통' ? 'medium' as const :
                       scores?.severity ? 'low' as const : undefined,
            age_group: scores?.ageGroup,
            completed_at: result.completed_at || result.created_at
          });
        });
      }
      
      // Sort by date
      combinedData.sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());
      
      // Remove duplicates (prefer test_results if same time)
      const uniqueData = combinedData.filter((item, index, self) => {
        const isDuplicate = self.findIndex(other => {
          const timeDiff = Math.abs(new Date(item.completed_at).getTime() - new Date(other.completed_at).getTime());
          return timeDiff < 60000 && item.source !== other.source; // Within 1 minute
        });
        return isDuplicate === -1 || isDuplicate === index;
      });
      
      console.log('✅ Total assessments loaded:', uniqueData.length);
      setAssessments(uniqueData);
    } catch (error) {
      console.error('❌ Error loading assessments:', error);
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

  const getRiskBadge = (level?: 'low' | 'medium' | 'high') => {
    if (!level) return null;
    
    const configs = {
      low: { color: "bg-green-100 text-green-700", label: "낮음", icon: CheckCircle },
      medium: { color: "bg-yellow-100 text-yellow-700", label: "보통", icon: Clock },
      high: { color: "bg-red-100 text-red-700", label: "높음", icon: AlertTriangle }
    };
    
    const config = configs[level];
    if (!config) return null;
    const Icon = config.icon;
    
    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        위험도 {config.label}
      </Badge>
    );
  };

  const getAgeGroupLabel = (ageGroup?: string) => {
    const labels: Record<string, string> = {
      infant: "유아",
      child: "아동/청소년", 
      adult: "성인"
    };
    return labels[ageGroup || ''] || '';
  };

  const handleViewDetail = (assessment: CombinedAssessment) => {
    if (assessment.source === 'test_results') {
      // test_results는 /assessment/:id로 이동
      navigate(`/assessment/${assessment.id}`);
    } else {
      // assessments는 /assessment-detail/:id로 이동
      navigate(`/assessment-detail/${assessment.id}`, { 
        state: { 
          assessment: assessment,
          showResults: true 
        } 
      });
    }
  };

  const getScoreDisplay = (results: any) => {
    if (!results) return null;
    
    const totalScore = results.total_score || results.predicted_score || results.score;
    if (totalScore !== undefined) {
      return (
        <div className="text-right">
          <div className="text-2xl font-bold text-primary">{typeof totalScore === 'number' ? totalScore.toFixed(0) : totalScore}점</div>
          <div className="text-xs text-slate-400">총점</div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-400">검사 기록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-xl md:text-2xl font-bold text-white whitespace-normal break-words">검사 기록</h2>
          <p className="text-sm md:text-base text-slate-400 mt-1 whitespace-normal break-words">완료한 모든 심리검사 결과를 확인하세요</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
          <Button variant="outline" size="sm" onClick={() => navigate('/premium-assessment')} className="w-full sm:w-auto">
            <FileText className="w-4 h-4 mr-2" />
            프리미엄 검사
          </Button>
          <Button size="sm" onClick={() => navigate('/assessment')} className="w-full sm:w-auto">
            <TrendingUp className="w-4 h-4 mr-2" />
            새 검사 시작
          </Button>
        </div>
      </div>

      {/* Assessment Analytics */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        <Card className="p-3 md:p-4 bg-[#0F1823] border-slate-800">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-900/30 rounded-full flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-lg md:text-xl font-bold text-white">{assessments.length}</div>
              <div className="text-xs md:text-sm text-slate-400">총 검사 수</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-3 md:p-4 bg-[#0F1823] border-slate-800">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-green-400" />
            </div>
            <div>
              <div className="text-lg md:text-xl font-bold text-white">
                {assessments.filter(a => a.risk_level === 'low').length}
              </div>
              <div className="text-xs md:text-sm text-slate-400">정상 범위</div>
            </div>
          </div>
        </Card>

        <Card className="p-3 md:p-4 bg-[#0F1823] border-slate-800">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-yellow-900/30 rounded-full flex items-center justify-center flex-shrink-0">
              <Clock className="w-4 h-4 md:w-5 md:h-5 text-yellow-400" />
            </div>
            <div>
              <div className="text-lg md:text-xl font-bold text-white">
                {assessments.filter(a => a.risk_level === 'medium').length}
              </div>
              <div className="text-xs md:text-sm text-slate-400">주의 필요</div>
            </div>
          </div>
        </Card>

        <Card className="p-3 md:p-4 bg-[#0F1823] border-slate-800">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-purple-900/30 rounded-full flex items-center justify-center flex-shrink-0">
              <Brain className="w-4 h-4 md:w-5 md:h-5 text-purple-400" />
            </div>
            <div>
              <div className="text-lg md:text-xl font-bold text-white">
                {assessments.filter(a => a.source === 'test_results').length}
              </div>
              <div className="text-xs md:text-sm text-slate-400">프리미엄 검사</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Assessment List */}
      {assessments.length > 0 ? (
        <div className="space-y-3 md:space-y-4">
          {assessments.map(assessment => (
            <Card key={`${assessment.source}-${assessment.id}`} className="p-4 md:p-6 bg-[#0F1823] border-slate-800 hover:border-slate-700 transition-colors">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex items-start gap-3 md:gap-4 flex-1">
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                    assessment.source === 'test_results' 
                      ? 'bg-gradient-to-br from-purple-500/20 to-blue-500/20' 
                      : 'bg-primary/20'
                  }`}>
                    {assessment.source === 'test_results' ? (
                      <Brain className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
                    ) : (
                      <User className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-base md:text-lg text-white">{assessment.test_name}</h3>
                      {assessment.source === 'test_results' && (
                        <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30 text-xs">
                          프리미엄
                        </Badge>
                      )}
                    </div>
                    {assessment.test_description && (
                      <p className="text-sm text-slate-400 mt-1">{assessment.test_description}</p>
                    )}
                    <div className="flex items-center gap-2 text-xs md:text-sm text-slate-400 mt-2">
                      <Calendar className="w-3 h-3 md:w-4 md:h-4 flex-shrink-0" />
                      <span>{new Date(assessment.completed_at).toLocaleDateString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {assessment.age_group && (
                        <Badge variant="outline" className="text-xs">
                          {getAgeGroupLabel(assessment.age_group)}
                          {assessment.age_at_assessment && ` (${assessment.age_at_assessment}세)`}
                        </Badge>
                      )}
                      {getRiskBadge(assessment.risk_level)}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  {getScoreDisplay(assessment.results)}
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="flex-shrink-0"
                    onClick={() => handleViewDetail(assessment)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    상세보기
                  </Button>
                </div>
              </div>

              {assessment.analysis && (
                <div className="bg-slate-900/30 rounded-lg p-4 mt-4 border border-slate-800">
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-2 text-white">
                    <FileText className="w-4 h-4" />
                    AI 분석 결과
                  </h4>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {assessment.analysis.substring(0, 200)}
                    {assessment.analysis.length > 200 && "..."}
                  </p>
                </div>
              )}

              {assessment.recommendations && (
                <div className="bg-blue-900/20 rounded-lg p-4 mt-4 border border-blue-800/30">
                  <h4 className="font-medium text-sm mb-2 text-blue-300">권장사항</h4>
                  <p className="text-sm text-blue-200 leading-relaxed">
                    {assessment.recommendations.substring(0, 150)}
                    {assessment.recommendations.length > 150 && "..."}
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center bg-[#0F1823] border-slate-800">
          <TrendingUp className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2 text-white">아직 검사 기록이 없습니다</h3>
          <p className="text-slate-400 mb-6">
            심리검사를 통해 정확한 상태를 파악해보세요
          </p>
          <Button onClick={() => navigate('/assessment')}>
            <TrendingUp className="w-4 h-4 mr-2" />
            첫 번째 검사 시작하기
          </Button>
        </Card>
      )}
    </div>
  );
};

export default AssessmentHistory;
