import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  AlertTriangle,
  Activity,
  Hand,
  Info
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { 
  DEVELOPMENTAL_DOMAINS, 
  getDevelopmentalDomainsForAge, 
  getAgeGroup, 
  getDetailedAgeGroup,
  type DevelopmentalDomain 
} from '@/data/developmentalDomains';
import DevelopmentalTrackingModal from './DevelopmentalTrackingModal';

interface DevelopmentalData {
  id: string;
  domain: string;
  skill_area: string;
  current_level: number;
  target_level: number;
  tracking_date: string;
  notes: string;
  student_id?: string;
  user_id: string;
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
  birthDate?: string;
}

const LifespanDevelopmentalTracker = ({ userId, studentId, birthDate }: DevelopmentalTrackingDashboardProps) => {
  const { user } = useAuthGuard();
  const [trackingData, setTrackingData] = useState<DevelopmentalData[]>([]);
  const [mlAnalysis, setMlAnalysis] = useState<MLAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [selectedProfile, setSelectedProfile] = useState<string>('');
  const [familyProfiles, setFamilyProfiles] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // 현재 선택된 프로필의 연령대별 발달 영역
  const currentBirthDate = birthDate || selectedProfile;
  const ageGroup = currentBirthDate ? getAgeGroup(currentBirthDate) : 'child';
  const detailedAgeGroup = currentBirthDate ? getDetailedAgeGroup(currentBirthDate) : 'child';
  const availableDomains = currentBirthDate ? getDevelopmentalDomainsForAge(currentBirthDate) : DEVELOPMENTAL_DOMAINS.child;

  useEffect(() => {
    if (user) {
      fetchFamilyProfiles();
    }
  }, [user]);

  useEffect(() => {
    if (selectedProfile || birthDate) {
      fetchTrackingData();
      fetchLatestMlAnalysis();
    }
  }, [selectedProfile, birthDate, userId, studentId]);

  const fetchFamilyProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('family_members')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // 사용자 본인 정보도 포함
      const { data: profileData } = await supabase
        .from('profiles')
        .select('birth_date, display_name')
        .eq('user_id', user?.id)
        .single();

      const profiles = [
        ...(profileData?.birth_date ? [{
          id: 'self',
          name: profileData.display_name || '본인',
          birth_date: profileData.birth_date,
          relationship: 'self'
        }] : []),
        ...(data || [])
      ];

      setFamilyProfiles(profiles);
      
      // 첫 번째 프로필 자동 선택
      if (profiles.length > 0 && !selectedProfile) {
        setSelectedProfile(profiles[0].birth_date);
      }
    } catch (error) {
      console.error('가족 프로필 조회 오류:', error);
    }
  };

  const fetchTrackingData = async () => {
    if (!selectedProfile && !birthDate) return;
    
    setIsLoading(true);
    try {
      let query = supabase
        .from('developmental_tracking')
        .select('*')
        .eq('user_id', user?.id)
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
        .eq('user_id', user?.id)
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
          student_id: studentId,
          age_group: ageGroup,
          detailed_age_group: detailedAgeGroup
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
        description: "생애주기별 맞춤 AI 분석이 완료되었습니다.",
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

  const handleModalSave = () => {
    fetchTrackingData();
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
    
    const domainAverages = availableDomains.map(domain => {
      const domainItems = trackingData.filter(item => item.domain === domain.key);
      if (domainItems.length === 0) return 0;
      
      const average = domainItems.reduce((sum, item) => sum + item.current_level, 0) / domainItems.length;
      return (average / 5) * 100;
    });

    return domainAverages.reduce((sum, avg) => sum + avg, 0) / domainAverages.length;
  };

  const getAgeGroupLabel = (ageGroup: string) => {
    switch (ageGroup) {
      case 'child': return '아동 발달';
      case 'adult': return '성인 심리';
      case 'elderly': return '노인 인지';
      default: return '발달 추적';
    }
  };

  const getDetailedAgeGroupLabel = (detailedAge: string) => {
    const labels: Record<string, string> = {
      'infant': '영아기 (0-1세)',
      'toddler': '걸음마기 (1-3세)',
      'preschool': '학령전기 (3-6세)',
      'school': '학령기 (6-18세)',
      'young_adult': '청년기 (19-35세)',
      'middle_adult': '중년기 (35-65세)',
      'young_elderly': '초기 노년기 (65-75세)',
      'old_elderly': '후기 노년기 (75세+)'
    };
    return labels[detailedAge] || '';
  };

  const getIconComponent = (iconName: string) => {
    const icons: Record<string, any> = {
      'Activity': Activity,
      'Hand': Hand,
      'MessageSquare': MessageSquare,
      'Heart': Heart,
      'Brain': Brain,
      'Users': Users,
      'Target': Target
    };
    return icons[iconName] || Brain;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p>데이터를 불러오는 중...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const overallProgress = getOverallProgress();

  return (
    <div className="space-y-6">
      {/* 프로필 선택 및 연령대 정보 */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              생애주기별 발달 추적 시스템
            </div>
            <Badge variant="outline" className="text-sm">
              {getAgeGroupLabel(ageGroup)}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">추적 대상 선택</label>
              <Select value={selectedProfile} onValueChange={setSelectedProfile}>
                <SelectTrigger>
                  <SelectValue placeholder="가족 구성원을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {familyProfiles.map((profile) => (
                    <SelectItem key={profile.id} value={profile.birth_date}>
                      {profile.name} ({profile.relationship === 'self' ? '본인' : profile.relationship})
                      {profile.birth_date && ` - ${getDetailedAgeGroupLabel(getDetailedAgeGroup(profile.birth_date))}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedProfile && (
              <div>
                <label className="text-sm font-medium mb-2 block">발달 단계</label>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="font-medium">{getDetailedAgeGroupLabel(detailedAgeGroup)}</p>
                  <p className="text-sm text-muted-foreground">
                    {availableDomains.length}개 발달 영역 추적 가능
                  </p>
                </div>
              </div>
            )}
          </div>

          {!selectedProfile && familyProfiles.length === 0 && (
            <Alert className="mt-4">
              <Info className="w-4 h-4" />
              <AlertDescription>
                발달 추적을 시작하려면 먼저 가족 구성원 정보를 등록해주세요.
                <Button 
                  variant="link" 
                  className="h-auto p-0 ml-2"
                  onClick={() => navigate('/dashboard?tab=family')}
                >
                  가족 관리로 이동
                </Button>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {selectedProfile && (
        <>
          {/* AI 분석 현황 */}
          {mlAnalysis && (
            <Card className="border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-green-600" />
                  {getAgeGroupLabel(ageGroup)} AI 분석 결과
                  <Badge variant="outline" className="ml-auto">
                    신뢰도 {(mlAnalysis.confidence_score * 100).toFixed(0)}%
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">예측 발달 수준</p>
                    <p className="text-2xl font-bold text-primary">
                      {mlAnalysis.predicted_next_level.toFixed(1)}/5
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">발달 양상</p>
                    <div className="flex items-center justify-center gap-2">
                      <TrendingUp className={`w-5 h-5 ${
                        mlAnalysis.development_trajectory === 'improving' ? 'text-green-600' : 
                        mlAnalysis.development_trajectory === 'concerning' ? 'text-red-600' : 'text-yellow-600'
                      }`} />
                      <span className={`font-semibold ${
                        mlAnalysis.development_trajectory === 'improving' ? 'text-green-600' : 
                        mlAnalysis.development_trajectory === 'concerning' ? 'text-red-600' : 'text-yellow-600'
                      }`}>
                        {mlAnalysis.development_trajectory === 'improving' ? '향상 중' : 
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

                {mlAnalysis.intervention_recommendations.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2 text-blue-700">
                      {ageGroup === 'child' ? '발달 지원 방안' : 
                       ageGroup === 'adult' ? '심리적 지원 방안' : '인지 보호 방안'}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {mlAnalysis.intervention_recommendations.slice(0, 4).map((rec, index) => (
                        <div key={index} className="text-sm bg-blue-50 p-2 rounded border-l-2 border-blue-200">
                          {rec}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
                    <p className="text-sm text-muted-foreground">추적 데이터</p>
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
                    <p className="text-sm text-muted-foreground">추적 영역</p>
                    <p className="text-2xl font-bold">{availableDomains.length}</p>
                  </div>
                  <Target className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">AI 분석</p>
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
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  {getAgeGroupLabel(ageGroup)} 영역별 현황
                </CardTitle>
                <Button onClick={() => setIsModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  새 데이터 추가
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={selectedDomain} onValueChange={setSelectedDomain}>
                <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${Math.min(availableDomains.length + 1, 6)}, 1fr)` }}>
                  <TabsTrigger value="all">전체</TabsTrigger>
                  {availableDomains.slice(0, 5).map(domain => (
                    <TabsTrigger key={domain.key} value={domain.key}>
                      {domain.label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value="all" className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availableDomains.map(domain => {
                      const domainData = getDomainData(domain.key);
                      const IconComponent = getIconComponent(domain.icon);
                      
                      return (
                        <Card key={domain.key} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <Badge className={domain.color}>
                                {domain.label}
                              </Badge>
                              <IconComponent className="w-5 h-5 text-muted-foreground" />
                            </div>
                            
                            <p className="text-xs text-muted-foreground mb-2">
                              {domain.description}
                            </p>
                            
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
                                  최근: {new Date(domainData.tracking_date).toLocaleDateString()}
                                </p>
                              </div>
                            ) : (
                              <div className="text-center text-muted-foreground text-sm py-4">
                                <p>추적 데이터 없음</p>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="mt-2"
                                  onClick={() => setIsModalOpen(true)}
                                >
                                  데이터 추가
                                </Button>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </TabsContent>

                {availableDomains.map(domain => (
                  <TabsContent key={domain.key} value={domain.key} className="mt-6">
                    <div className="space-y-4">
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <h3 className="font-medium mb-2">{domain.label}</h3>
                        <p className="text-sm text-muted-foreground">{domain.description}</p>
                      </div>
                      
                      <div className="grid gap-4">
                        {domain.subDomains.map(subDomain => {
                          const subDomainData = trackingData.filter(item => 
                            item.domain === domain.key && item.skill_area === subDomain.key
                          );
                          
                          return (
                            <Card key={subDomain.key}>
                              <CardContent className="p-4">
                                <h4 className="font-medium mb-2">{subDomain.label}</h4>
                                <p className="text-sm text-muted-foreground mb-3">{subDomain.description}</p>
                                
                                {subDomainData.length > 0 ? (
                                  <div className="space-y-2">
                                    {subDomainData.slice(0, 3).map((data, index) => (
                                      <div key={index} className="flex justify-between items-center p-2 bg-muted/30 rounded">
                                        <span className="text-sm">{new Date(data.tracking_date).toLocaleDateString()}</span>
                                        <Badge variant="outline">{data.current_level}/5</Badge>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-muted-foreground">추적 데이터가 없습니다.</p>
                                )}
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>

          {/* 액션 버튼들 */}
          <div className="flex gap-4 justify-center">
            <Button 
              onClick={runMlAnalysis}
              disabled={isAnalyzing || trackingData.length < 3}
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  AI 분석 중...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  AI 발달 분석 실행
                </>
              )}
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => navigate('/observation')}
              size="lg"
            >
              <FileText className="w-4 h-4 mr-2" />
              관찰일지 작성
            </Button>
          </div>
        </>
      )}

      {/* 발달 추적 모달 */}
      <DevelopmentalTrackingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleModalSave}
        studentId={studentId}
        availableDomains={availableDomains}
        ageGroup={ageGroup}
      />
    </div>
  );
};

export default LifespanDevelopmentalTracker;