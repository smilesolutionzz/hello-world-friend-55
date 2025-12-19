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
  Brain,
  Sparkles
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

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
      
      const combinedData: CombinedAssessment[] = [];
      
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
      
      combinedData.sort((a, b) => new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime());
      
      const uniqueData = combinedData.filter((item, index, self) => {
        const isDuplicate = self.findIndex(other => {
          const timeDiff = Math.abs(new Date(item.completed_at).getTime() - new Date(other.completed_at).getTime());
          return timeDiff < 60000 && item.source !== other.source;
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

  const getRiskConfig = (level?: 'low' | 'medium' | 'high' | null) => {
    const defaultConfig = { 
      bgClass: "bg-emerald-500/10 border-emerald-500/20", 
      textClass: "text-emerald-600 dark:text-emerald-400",
      label: "낮음", 
      icon: CheckCircle,
      gradient: "from-emerald-500 to-green-500"
    };
    
    if (!level) return defaultConfig;
    
    const configs: Record<string, typeof defaultConfig> = {
      low: defaultConfig,
      medium: { 
        bgClass: "bg-amber-500/10 border-amber-500/20", 
        textClass: "text-amber-600 dark:text-amber-400",
        label: "보통", 
        icon: Clock,
        gradient: "from-amber-500 to-orange-500"
      },
      high: { 
        bgClass: "bg-rose-500/10 border-rose-500/20", 
        textClass: "text-rose-600 dark:text-rose-400",
        label: "높음", 
        icon: AlertTriangle,
        gradient: "from-rose-500 to-red-500"
      }
    };
    return configs[level] || defaultConfig;
  };

  const getRiskBadge = (level?: 'low' | 'medium' | 'high') => {
    if (!level) return null;
    const config = getRiskConfig(level);
    const Icon = config.icon;
    
    return (
      <Badge className={cn("border", config.bgClass, config.textClass)}>
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
    navigate(`/assessment/${assessment.id}`, { 
      state: { 
        assessment: assessment,
        showResults: true 
      } 
    });
  };

  const getScoreDisplay = (results: any) => {
    if (!results) return null;
    
    const totalScore = results.total_score || results.predicted_score || results.score;
    if (totalScore !== undefined) {
      return (
        <div className="text-right">
          <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
            {typeof totalScore === 'number' ? totalScore.toFixed(0) : totalScore}
            <span className="text-sm font-normal text-muted-foreground ml-1">점</span>
          </div>
        </div>
      );
    }
    return null;
  };

  // 이번 달 검사 수 계산
  const thisMonthCount = assessments.filter(a => {
    const date = new Date(a.completed_at);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;

  const stats = [
    {
      label: "총 검사",
      value: assessments.length,
      icon: TrendingUp,
      gradient: "from-blue-500 to-cyan-500",
      bgClass: "bg-blue-500/10"
    },
    {
      label: "이번 달",
      value: thisMonthCount,
      icon: Calendar,
      gradient: "from-emerald-500 to-green-500",
      bgClass: "bg-emerald-500/10"
    },
    {
      label: "기본 검사",
      value: assessments.filter(a => a.source === 'assessments').length,
      icon: FileText,
      gradient: "from-amber-500 to-orange-500",
      bgClass: "bg-amber-500/10"
    },
    {
      label: "프리미엄",
      value: assessments.filter(a => a.source === 'test_results').length,
      icon: Brain,
      gradient: "from-purple-500 to-pink-500",
      bgClass: "bg-purple-500/10"
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
            <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
          <p className="text-muted-foreground">검사 기록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 md:space-y-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h2 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            검사 기록
          </h2>
          <p className="text-sm text-muted-foreground mt-1">완료한 심리검사 결과를 확인하세요</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/premium-assessment')}
            className="rounded-xl border-border/50 hover:bg-muted/50"
          >
            <Sparkles className="w-4 h-4 mr-1.5 text-purple-500" />
            <span className="hidden sm:inline">프리미엄</span>
          </Button>
          <Button 
            size="sm" 
            onClick={() => navigate('/assessment')}
            className="rounded-xl bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/20"
          >
            <TrendingUp className="w-4 h-4 mr-1.5" />
            새 검사
          </Button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card className="p-3 md:p-4 bg-card/80 backdrop-blur-sm border-border/50 rounded-2xl hover:shadow-lg transition-all duration-300">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center",
                  stat.bgClass
                )}>
                  <stat.icon className={cn(
                    "w-5 h-5 md:w-6 md:h-6 bg-gradient-to-br bg-clip-text",
                    `text-transparent bg-gradient-to-r ${stat.gradient}`
                  )} style={{ filter: 'none' }} />
                  <stat.icon className={cn(
                    "w-5 h-5 md:w-6 md:h-6 absolute",
                    stat.gradient.includes('blue') ? 'text-blue-500' :
                    stat.gradient.includes('emerald') ? 'text-emerald-500' :
                    stat.gradient.includes('amber') ? 'text-amber-500' : 'text-purple-500'
                  )} />
                </div>
                <div>
                  <div className="text-xl md:text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Assessment List */}
      {assessments.length > 0 ? (
        <div className="space-y-3 md:space-y-4">
          {assessments.map((assessment, index) => {
            const riskConfig = getRiskConfig(assessment.risk_level);
            
            return (
              <motion.div
                key={`${assessment.source}-${assessment.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="group p-4 md:p-5 bg-card/80 backdrop-blur-sm border-border/50 rounded-2xl hover:shadow-xl hover:border-primary/30 transition-all duration-300 overflow-hidden relative">
                  {/* Subtle gradient accent */}
                  {assessment.risk_level && (
                    <div className={cn(
                      "absolute top-0 left-0 w-1 h-full bg-gradient-to-b",
                      riskConfig.gradient
                    )} />
                  )}
                  
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex items-start gap-3 md:gap-4 flex-1">
                      {/* Icon */}
                      <div className={cn(
                        "w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105",
                        assessment.source === 'test_results' 
                          ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20' 
                          : 'bg-gradient-to-br from-primary/20 to-blue-500/20'
                      )}>
                        {assessment.source === 'test_results' ? (
                          <Brain className="w-6 h-6 md:w-7 md:h-7 text-purple-500" />
                        ) : (
                          <User className="w-6 h-6 md:w-7 md:h-7 text-primary" />
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-base md:text-lg text-foreground">
                            {assessment.test_name}
                          </h3>
                          {assessment.source === 'test_results' && (
                            <Badge className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30 text-xs">
                              <Sparkles className="w-3 h-3 mr-1" />
                              프리미엄
                            </Badge>
                          )}
                        </div>
                        
                        {assessment.test_description && (
                          <p className="text-sm text-muted-foreground line-clamp-1">{assessment.test_description}</p>
                        )}
                        
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(assessment.completed_at).toLocaleDateString('ko-KR', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}</span>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2">
                          {assessment.age_group && (
                            <Badge variant="outline" className="text-xs rounded-lg border-border/50 bg-muted/50">
                              {getAgeGroupLabel(assessment.age_group)}
                              {assessment.age_at_assessment && ` · ${assessment.age_at_assessment}세`}
                            </Badge>
                          )}
                          {getRiskBadge(assessment.risk_level)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Score & Action */}
                    <div className="flex items-center justify-between md:justify-end gap-4 pt-2 md:pt-0 border-t md:border-t-0 border-border/30">
                      {getScoreDisplay(assessment.results)}
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="rounded-xl border-border/50 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
                        onClick={() => handleViewDetail(assessment)}
                      >
                        <Eye className="w-4 h-4 mr-1.5" />
                        상세
                      </Button>
                    </div>
                  </div>

                  {/* Analysis Preview */}
                  {assessment.analysis && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-4 p-3 md:p-4 rounded-xl bg-muted/30 border border-border/30"
                    >
                      <h4 className="font-medium text-sm mb-1.5 flex items-center gap-2 text-foreground">
                        <FileText className="w-4 h-4 text-primary" />
                        AI 분석
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                        {assessment.analysis}
                      </p>
                    </motion.div>
                  )}

                  {assessment.recommendations && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-3 p-3 md:p-4 rounded-xl bg-blue-500/5 border border-blue-500/20"
                    >
                      <h4 className="font-medium text-sm mb-1.5 text-blue-600 dark:text-blue-400">💡 권장사항</h4>
                      <p className="text-sm text-blue-700/80 dark:text-blue-300/80 leading-relaxed line-clamp-2">
                        {assessment.recommendations}
                      </p>
                    </motion.div>
                  )}
                </Card>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="p-8 md:p-12 text-center bg-card/80 backdrop-blur-sm border-border/50 rounded-3xl">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
              <TrendingUp className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-foreground">아직 검사 기록이 없습니다</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              심리검사를 통해 정확한 상태를 파악해보세요
            </p>
            <Button 
              onClick={() => navigate('/assessment')}
              className="rounded-xl bg-gradient-to-r from-primary to-primary/80 shadow-lg shadow-primary/20"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              첫 번째 검사 시작
            </Button>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default AssessmentHistory;