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
  Eye
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Assessment {
  id: string;
  age_group: string;
  age_at_assessment: number;
  results: any;
  analysis?: string;
  risk_level?: 'low' | 'medium' | 'high';
  recommendations?: string;
  completed_at: string;
  profile: {
    display_name: string;
  };
}

const AssessmentHistory = () => {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAssessments();
  }, []);

  const loadAssessments = async () => {
    try {
      const { data, error } = await supabase
        .from('assessments')
        .select(`
          *,
          profile:profiles(display_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      // Transform data to match Assessment interface
      const assessments = data?.map(assessment => ({
        ...assessment,
        completed_at: assessment.created_at
      })) || [];
      setAssessments(assessments as any);
    } catch (error) {
      console.error('Error loading assessments:', error);
    }
    setLoading(false);
  };

  const getRiskBadge = (level?: 'low' | 'medium' | 'high') => {
    if (!level) return null;
    
    const configs = {
      low: { color: "bg-green-100 text-green-700", label: "낮음", icon: CheckCircle },
      medium: { color: "bg-yellow-100 text-yellow-700", label: "보통", icon: Clock },
      high: { color: "bg-red-100 text-red-700", label: "높음", icon: AlertTriangle }
    };
    
    const config = configs[level];
    const Icon = config.icon;
    
    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        위험도 {config.label}
      </Badge>
    );
  };

  const getAgeGroupLabel = (ageGroup: string) => {
    const labels = {
      infant: "유아",
      child: "아동/청소년", 
      adult: "성인"
    };
    return labels[ageGroup as keyof typeof labels] || ageGroup;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">검사 기록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">검사 기록</h2>
          <p className="text-muted-foreground">가족 구성원들의 심리검사 기록을 관리하세요</p>
        </div>
        <Button onClick={() => navigate('/assessment')}>
          <TrendingUp className="w-4 h-4 mr-2" />
          새 검사 시작
        </Button>
      </div>

      {/* Assessment List */}
      {assessments.length > 0 ? (
        <div className="space-y-4">
          {assessments.map(assessment => (
            <Card key={assessment.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{assessment.profile.display_name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {new Date(assessment.completed_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">
                        {getAgeGroupLabel(assessment.age_group)} ({assessment.age_at_assessment}세)
                      </Badge>
                      {getRiskBadge(assessment.risk_level)}
                    </div>
                  </div>
                </div>
                
                <Button variant="outline" size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  상세보기
                </Button>
              </div>

              {assessment.analysis && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    AI 분석 결과
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {assessment.analysis.substring(0, 200)}
                    {assessment.analysis.length > 200 && "..."}
                  </p>
                </div>
              )}

              {assessment.recommendations && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-sm mb-2 text-blue-700">권장사항</h4>
                  <p className="text-sm text-blue-600 leading-relaxed">
                    {assessment.recommendations.substring(0, 150)}
                    {assessment.recommendations.length > 150 && "..."}
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <TrendingUp className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">아직 검사 기록이 없습니다</h3>
          <p className="text-muted-foreground mb-6">
            3분 심리검사를 통해 정확한 상태를 파악해보세요
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