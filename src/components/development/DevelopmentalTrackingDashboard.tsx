import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Brain, 
  Heart, 
  Users, 
  MessageSquare, 
  Target,
  Calendar,
  Plus,
  Eye,
  FileText,
  Zap,
  BarChart3,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DevelopmentalData {
  id: string;
  domain: string;
  skill_area: string;
  current_level: number;
  target_level: number;
  tracking_date: string;
  notes: string;
}

interface MLAnalysis {
  id: string;
  predicted_next_level: number;
  development_trajectory: 'improving' | 'stable' | 'concerning';
  risk_factors: string[];
  intervention_recommendations: string[];
  confidence_score: number;
  milestone_predictions: {
    domain: string;
    predicted_achievement_date: string;
    probability: number;
  }[];
  created_at: string;
}

interface DevelopmentalTrackingDashboardProps {
  userId?: string;
  studentId?: string;
}

const DevelopmentalTrackingDashboard = ({ userId, studentId }: DevelopmentalTrackingDashboardProps) => {
  const [trackingData, setTrackingData] = useState<DevelopmentalData[]>([]);
  const [mlAnalysis, setMlAnalysis] = useState<MLAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const { toast } = useToast();

  const domains = [
    { key: 'motor', label: '대소근육 운동', icon: Target, color: 'bg-blue-100 text-blue-800' },
    { key: 'language', label: '언어발달', icon: MessageSquare, color: 'bg-green-100 text-green-800' },
    { key: 'social', label: '사회성', icon: Users, color: 'bg-purple-100 text-purple-800' },
    { key: 'cognitive', label: '인지발달', icon: Brain, color: 'bg-orange-100 text-orange-800' },
    { key: 'adaptive', label: '적응행동', icon: Heart, color: 'bg-pink-100 text-pink-800' }
  ];

  useEffect(() => {
    fetchTrackingData();
    fetchLatestMlAnalysis();
  }, [userId, studentId]);

  const fetchTrackingData = async () => {
    try {
      let query = supabase
        .from('developmental_tracking')
        .select('*')
        .order('tracking_date', { ascending: false });

      if (studentId) {
        query = query.eq('student_id', studentId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTrackingData(data || []);
    } catch (error) {
      console.error('발달 추적 데이터 조회 오류:', error);
      toast({
        title: "오류 발생",
        description: "발달 추적 데이터를 불러오는데 실패했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLatestMlAnalysis = async () => {
    try {
      let query = supabase
        .from('developmental_ml_analysis')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      if (studentId) {
        query = query.eq('student_id', studentId);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      if (data && data.length > 0) {
        const analysis = data[0];
        const analysisResults = analysis.analysis_results as any;
        setMlAnalysis({
          id: analysis.id,
          predicted_next_level: analysisResults.predicted_next_level || 3,
          development_trajectory: analysisResults.development_trajectory || 'stable',
          risk_factors: analysisResults.risk_factors || [],
          intervention_recommendations: analysisResults.intervention_recommendations || [],
          confidence_score: analysisResults.confidence_score || 0.7,
          milestone_predictions: analysisResults.milestone_predictions || [],
          created_at: analysis.created_at
        });
      }
    } catch (error) {
      console.error('ML 분석 데이터 조회 오류:', error);
    }
  };

  const runMlAnalysis = async () => {
    if (trackingData.length < 3) {
      toast({
        title: "데이터 부족",
        description: "AI 분석을 위해서는 최소 3개 이상의 추적 데이터가 필요합니다.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('developmental-ml-analyzer', {
        body: {
          developmental_data: trackingData,
          student_id: studentId
        }
      });

      if (error) throw error;

      const analysisData = data.analysis;
      setMlAnalysis({
        id: data.analysis_id,
        predicted_next_level: analysisData.predicted_next_level || 3,
        development_trajectory: analysisData.development_trajectory || 'stable',
        risk_factors: analysisData.risk_factors || [],
        intervention_recommendations: analysisData.intervention_recommendations || [],
        confidence_score: analysisData.confidence_score || 0.7,
        milestone_predictions: analysisData.milestone_predictions || [],
        created_at: new Date().toISOString()
      });

      toast({
        title: "AI 분석 완료",
        description: "딥러닝 기반 발달 분석이 완료되었습니다.",
        variant: "default"
      });

    } catch (error) {
      console.error('ML 분석 실행 오류:', error);
      toast({
        title: "분석 실패",
        description: "AI 분석 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getDomainData = (domainKey: string) => {
    const domainData = trackingData.filter(item => item.domain === domainKey);
    if (domainData.length === 0) return null;

    const latestData = domainData[0];
    const progress = latestData.target_level ? 
      (latestData.current_level / latestData.target_level) * 100 : 
      (latestData.current_level / 5) * 100;

    return {
      ...latestData,
      progress,
      totalEntries: domainData.length
    };
  };

  const getOverallProgress = () => {
    if (trackingData.length === 0) return 0;
    
    const domainAverages = domains.map(domain => {
      const domainItems = trackingData.filter(item => item.domain === domain.key);
      if (domainItems.length === 0) return 0;
      
      const average = domainItems.reduce((sum, item) => sum + item.current_level, 0) / domainItems.length;
      return (average / 5) * 100;
    });

    return domainAverages.reduce((sum, avg) => sum + avg, 0) / domainAverages.length;
  };

  const getRecentProgress = () => {
    const recent = trackingData.slice(0, 10);
    const improvements = recent.filter(item => 
      item.target_level && item.current_level >= item.target_level
    ).length;
    
    return {
      totalRecent: recent.length,
      improvements,
      improvementRate: recent.length > 0 ? (improvements / recent.length) * 100 : 0
    };
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">로딩 중...</div>
        </CardContent>
      </Card>
    );
  }

  const overallProgress = getOverallProgress();
  const recentProgress = getRecentProgress();

  const getTrajectoryColor = (trajectory: string) => {
    switch (trajectory) {
      case 'improving': return 'text-green-600';
      case 'concerning': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  const getTrajectoryIcon = (trajectory: string) => {
    switch (trajectory) {
      case 'improving': return TrendingUp;
      case 'concerning': return AlertTriangle;
      default: return BarChart3;
    }
  };

  return (
    <div className="space-y-6">
      {/* AI 분석 현황 */}
      {mlAnalysis && (
        <Card className="border-l-4 border-l-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              AI 딥러닝 분석 결과
              <Badge variant="outline" className="ml-auto">
                신뢰도 {(mlAnalysis.confidence_score * 100).toFixed(0)}%
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">예측 다음 수준</p>
                <p className="text-2xl font-bold text-primary">
                  {mlAnalysis.predicted_next_level.toFixed(1)}/5
                </p>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">발달 궤도</p>
                <div className="flex items-center justify-center gap-2">
                  {(() => {
                    const IconComponent = getTrajectoryIcon(mlAnalysis.development_trajectory);
                    return <IconComponent className={`w-5 h-5 ${getTrajectoryColor(mlAnalysis.development_trajectory)}`} />;
                  })()}
                  <span className={`font-semibold ${getTrajectoryColor(mlAnalysis.development_trajectory)}`}>
                    {mlAnalysis.development_trajectory === 'improving' ? '개선 중' : 
                     mlAnalysis.development_trajectory === 'concerning' ? '주의 필요' : '안정적'}
                  </span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground">분석 완료</p>
                <p className="text-sm font-medium">
                  {new Date(mlAnalysis.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>

            {mlAnalysis.risk_factors.length > 0 && (
              <div className="mb-4">
                <h4 className="font-medium mb-2 text-red-700">위험 요소</h4>
                <div className="flex flex-wrap gap-2">
                  {mlAnalysis.risk_factors.map((factor, index) => (
                    <Badge key={index} variant="destructive" className="text-xs">
                      {factor}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-4">
              <h4 className="font-medium mb-2 text-blue-700">AI 추천 개입</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {mlAnalysis.intervention_recommendations.slice(0, 4).map((rec, index) => (
                  <div key={index} className="text-sm bg-blue-50 p-2 rounded border-l-2 border-blue-200">
                    {rec}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 종합 현황 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">전체 발달 수준</p>
                <p className="text-2xl font-bold">{overallProgress.toFixed(1)}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
            <Progress value={overallProgress} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">총 추적 항목</p>
                <p className="text-2xl font-bold">{trackingData.length}</p>
              </div>
              <Eye className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">목표 달성률</p>
                <p className="text-2xl font-bold">{recentProgress.improvementRate.toFixed(1)}%</p>
              </div>
              <Target className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">AI 분석 상태</p>
                <p className="text-lg font-bold">
                  {mlAnalysis ? '완료' : '대기 중'}
                </p>
              </div>
              <Zap className={`w-8 h-8 ${mlAnalysis ? 'text-green-600' : 'text-gray-400'}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 영역별 발달 현황 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            영역별 발달 현황
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedDomain} onValueChange={setSelectedDomain}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all">전체</TabsTrigger>
              {domains.map(domain => (
                <TabsTrigger key={domain.key} value={domain.key}>
                  {domain.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {domains.map(domain => {
                  const domainData = getDomainData(domain.key);
                  const IconComponent = domain.icon;
                  
                  return (
                    <Card key={domain.key} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <Badge className={domain.color}>
                            {domain.label}
                          </Badge>
                          <IconComponent className="w-5 h-5 text-muted-foreground" />
                        </div>
                        
                        {domainData ? (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>현재 수준</span>
                              <span className="font-medium">
                                {domainData.current_level}/5
                              </span>
                            </div>
                            <Progress value={domainData.progress} />
                            <p className="text-xs text-muted-foreground">
                              최근 업데이트: {new Date(domainData.tracking_date).toLocaleDateString()}
                            </p>
                          </div>
                        ) : (
                          <div className="text-center text-muted-foreground text-sm">
                            추적 데이터 없음
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {domains.map(domain => (
              <TabsContent key={domain.key} value={domain.key} className="mt-6">
                <div className="space-y-4">
                  {trackingData
                    .filter(item => item.domain === domain.key)
                    .slice(0, 5)
                    .map(item => (
                      <Card key={item.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium">{item.skill_area}</h4>
                            <Badge variant="outline">
                              {new Date(item.tracking_date).toLocaleDateString()}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mb-3">
                            <div>
                              <p className="text-sm text-muted-foreground">현재 수준</p>
                              <p className="text-lg font-bold">{item.current_level}/5</p>
                            </div>
                            {item.target_level && (
                              <div>
                                <p className="text-sm text-muted-foreground">목표 수준</p>
                                <p className="text-lg font-bold">{item.target_level}/5</p>
                              </div>
                            )}
                          </div>

                          {item.target_level && (
                            <Progress 
                              value={(item.current_level / item.target_level) * 100} 
                              className="mb-3"
                            />
                          )}

                          {item.notes && (
                            <p className="text-sm text-muted-foreground">
                              {item.notes}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* 행동 버튼들 */}
      <div className="flex gap-3 flex-wrap">
        <Button 
          onClick={() => {/* 새 추적 데이터 추가 모달 열기 */}}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          발달 추적 추가
        </Button>

        <Button 
          onClick={runMlAnalysis}
          disabled={isAnalyzing || trackingData.length < 3}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Brain className="w-4 h-4" />
          {isAnalyzing ? 'AI 분석 중...' : 'AI 딥러닝 분석'}
        </Button>
        
        <Button 
          variant="outline"
          onClick={() => {/* IEP 생성 페이지로 이동 */}}
          className="flex items-center gap-2"
        >
          <FileText className="w-4 h-4" />
          IEP 생성하기
        </Button>
        
        <Button 
          variant="outline"
          onClick={() => {/* 상세 리포트 생성 */}}
          className="flex items-center gap-2"
        >
          <Calendar className="w-4 h-4" />
          발달 리포트
        </Button>
      </div>
    </div>
  );
};

export default DevelopmentalTrackingDashboard;