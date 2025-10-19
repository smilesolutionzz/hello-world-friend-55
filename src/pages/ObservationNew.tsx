import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ClipboardList, Plus, Eye, ChevronLeft, Clock, Sparkles, Video, Brain, Zap } from "lucide-react";
import ObservationFormMobile from "@/components/observation/ObservationFormMobile";
import ObservationDetailView from "@/components/observation/ObservationDetailView";
import AuthenticationGuard from "@/components/observation/AuthenticationGuard";
import { UnifiedNavigation } from "@/components/navigation/UnifiedNavigation";

const ObservationNew = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("new-observation");
  const [loading, setLoading] = useState(true);

  // 단일 관찰 템플릿 정의
  const observationTemplate = {
    id: 'main-observation',
    name: '관찰 템플릿',
    description: '심도있는 행동 관찰 및 AI 분석',
    domain: 'comprehensive',
    duration: '5-15분',
      features: [
        '체계적 행동 관찰 기록',
        '🎥 AI 비디오 행동 분석 (NEW)',
        '전문가급 AI 분석 및 해석',
        '맞춤형 개선 권고사항',
        '상세한 PDF 리포트 제공',
        '발달 영역별 점수 분석',
        '장기적 추적 관리'
      ],
    template_type: 'comprehensive'
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load user sessions
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: sessionsData, error: sessionsError } = await supabase
          .from('observation_sessions')
          .select(`
            *,
            family_member:family_members(name)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20);

        if (sessionsError) throw sessionsError;
        setSessions(sessionsData || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "데이터 로딩 오류",
        description: "데이터를 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDomainDisplayName = (domain: string) => {
    const names = {
      child_development: '아동발달',
      psychology: '심리상담',
      elderly_care: '노인케어',
      workplace: '직장적응',
      learning: '학습능력',
      family: '가족상담',
      medical: '의료재활',
      general: '일반관찰'
    };
    return names[domain as keyof typeof names] || domain;
  };

  const getDomainColor = (domain: string) => {
    const colors = {
      child_development: 'bg-blue-100 text-blue-800',
      psychology: 'bg-purple-100 text-purple-800',
      elderly_care: 'bg-green-100 text-green-800',
      workplace: 'bg-orange-100 text-orange-800',
      learning: 'bg-indigo-100 text-indigo-800',
      family: 'bg-pink-100 text-pink-800',
      medical: 'bg-red-100 text-red-800',
      general: 'bg-gray-100 text-gray-800'
    };
    return colors[domain as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      in_progress: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-blue-100 text-blue-800',
      analyzed: 'bg-green-100 text-green-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts = {
      in_progress: '진행중',
      completed: '완료',
      analyzed: '분석완료'
    };
    return texts[status as keyof typeof texts] || status;
  };

  const startNewSession = () => {
    setActiveTab("start-session");
  };

  const viewSession = (session: any) => {
    setSelectedSession(session);
    setActiveTab("view-results");
  };

  const handleSessionCreated = () => {
    setActiveTab("my-observations");
    loadData();
    toast({
      title: "관찰일지 작성 완료",
      description: "새로운 관찰일지가 생성되었습니다.",
    });
  };

  const handleBack = () => {
    if (activeTab === "start-session") {
      setActiveTab("new-observation");
    } else if (activeTab === "view-results") {
      setActiveTab("my-observations");
      setSelectedSession(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">데이터 로딩 중...</div>
      </div>
    );
  }

  // 세션 시작 화면
  if (activeTab === "start-session") {
    return (
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <ObservationFormMobile 
          template={observationTemplate}
          onSessionCreated={handleSessionCreated}
          onBack={handleBack}
        />
      </div>
    );
  }

  // 결과 상세보기 화면
  if (activeTab === "view-results" && selectedSession) {
    return (
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <ObservationDetailView 
          session={selectedSession}
          onBack={handleBack}
        />
      </div>
    );
  }

  return (
    <AuthenticationGuard fallbackMessage="관찰일지 시스템을 사용하려면 로그인이 필요합니다.">
      <UnifiedNavigation />
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-4 sm:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-4xl font-bold text-foreground mb-2 sm:mb-4 break-keep">
            🧠 AI 관찰일지 시스템
          </h1>
          <p className="text-sm sm:text-lg md:text-xl text-muted-foreground break-keep">
            전문가급 AI 분석과 맞춤형 리포트로 체계적인 관찰 관리
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-auto">
            <TabsTrigger value="new-observation" className="text-xs sm:text-sm py-2 px-2 break-keep">
              새 관찰 시작
            </TabsTrigger>
            <TabsTrigger value="my-observations" className="text-xs sm:text-sm py-2 px-2 break-keep">
              내 관찰 기록 ({sessions.length})
            </TabsTrigger>
          </TabsList>

          {/* 새 관찰 시작 */}
          <TabsContent value="new-observation" className="space-y-8">
            {/* Value Proposition */}
            <div className="text-center space-y-4 mb-8 px-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full text-sm font-medium text-blue-800">
                <Sparkles className="h-4 w-4" />
                AI 전문가 분석
              </div>
              <h2 className="text-lg sm:text-2xl md:text-3xl font-bold tracking-tight break-keep">
                전문가급 관찰 분석을 경험하세요
              </h2>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto break-keep">
                간단한 관찰 기록으로 <span className="font-semibold text-primary">즉시 AI 분석</span>과 
                <span className="font-semibold text-primary"> 전문 PDF 리포트</span>를 받아보세요
              </p>
            </div>

            {/* AI 비디오 분석 기능 강조 */}
            <div className="max-w-4xl mx-auto px-2 mb-8">
              <Card className="bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 border-2 border-purple-200">
                <CardHeader className="text-center pb-4">
                  <div className="inline-flex items-center gap-2 mx-auto mb-4 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full text-sm font-medium">
                    <Video className="h-4 w-4" />
                    NEW FEATURE
                  </div>
                  <CardTitle className="text-xl sm:text-2xl text-purple-800 mb-2">
                    🎥 AI 비디오 행동 분석
                  </CardTitle>
                  <CardDescription className="text-base text-purple-700 max-w-2xl mx-auto">
                    비디오를 업로드하면 AI가 자동으로 발달 관련 이슈를 분석해드립니다
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                    <div className="text-center p-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Brain className="h-6 w-6 text-purple-600" />
                      </div>
                      <h4 className="font-semibold text-purple-800 mb-2">말더듬/조음 분석</h4>
                      <p className="text-sm text-purple-600">언어 발달 상태와 조음 문제를 자동 감지</p>
                    </div>
                    <div className="text-center p-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Zap className="h-6 w-6 text-blue-600" />
                      </div>
                      <h4 className="font-semibold text-blue-800 mb-2">틱/운동 분석</h4>
                      <p className="text-sm text-blue-600">비자발적 운동이나 틱 증상을 정밀 분석</p>
                    </div>
                    <div className="text-center p-4">
                      <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Eye className="h-6 w-6 text-indigo-600" />
                      </div>
                      <h4 className="font-semibold text-indigo-800 mb-2">자폐 스펙트럼 선별</h4>
                      <p className="text-sm text-indigo-600">사회적 상호작용과 의사소통 패턴 분석</p>
                    </div>
                    <div className="text-center p-4">
                      <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Brain className="h-6 w-6 text-rose-600" />
                      </div>
                      <h4 className="font-semibold text-rose-800 mb-2">정서/행동 분석</h4>
                      <p className="text-sm text-rose-600">감정 표현과 행동 패턴의 종합 분석</p>
                    </div>
                    <div className="text-center p-4">
                      <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Zap className="h-6 w-6 text-emerald-600" />
                      </div>
                      <h4 className="font-semibold text-emerald-800 mb-2">ADHD/노인인지</h4>
                      <p className="text-sm text-emerald-600">주의력과 인지 기능 저하 패턴 감지</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-lg p-4 border border-purple-200">
                      <h5 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                        📋 상세 분석 결과 제공
                      </h5>
                      <ul className="text-sm text-purple-700 space-y-2">
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0"></span>
                          위험도 평가 (낮음/보통/높음)
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0"></span>
                          특정 패턴 감지 및 빈도 분석
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0"></span>
                          전문가 권고사항 및 개선 방안
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-2 flex-shrink-0"></span>
                          추가 검사 필요성 여부 판단
                        </li>
                      </ul>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                      <h5 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                        🎯 지원 분야
                      </h5>
                      <ul className="text-sm text-blue-700 space-y-2">
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></span>
                          언어 발달 및 의사소통 장애
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></span>
                          자폐 스펙트럼 및 발달 지연
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></span>
                          ADHD 및 주의력 결핍
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></span>
                          정서 행동 및 노인 인지 기능
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* 템플릿 */}
            <div className="max-w-2xl mx-auto px-2">
              {(() => {
                const template = observationTemplate;
                return (
                <Card className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer border-2 hover:border-primary/50 relative overflow-hidden group">
                  {/* Premium Badge */}
                  <div className="absolute top-4 right-4 z-10">
                    <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                      전문가급
                    </Badge>
                  </div>
                  
                  <CardHeader className="text-center pb-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                      <ClipboardList className="h-10 w-10 text-white" />
                    </div>
                    <CardTitle className="text-2xl mb-2">{template.name}</CardTitle>
                    <CardDescription className="text-base mb-3">
                      {template.description}
                    </CardDescription>
                    <div className="flex items-center justify-center gap-2 mb-3 flex-wrap">
                      <Badge className="bg-purple-100 text-purple-800" variant="secondary">
                        종합분석
                      </Badge>
                      <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                        <Clock className="h-3 w-3 mr-1" />
                        {template.duration}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* 특징 */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">포함 기능</h4>
                      <div className="space-y-2">
                        {template.features.map((feature: string, index: number) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <div className="w-2 h-2 rounded-full bg-purple-500" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* 비용 정보 */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-lg font-bold text-primary">{template.duration}</div>
                        <div className="text-xs text-muted-foreground">분석 시간</div>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-lg font-bold text-purple-600">
                          5 토큰
                        </div>
                        <div className="text-xs text-muted-foreground">이용 비용</div>
                      </div>
                    </div>

                    {/* CTA Button */}
                    <Button 
                      className="w-full h-11 text-white font-semibold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      onClick={() => startNewSession()}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      관찰 분석 시작하기
                    </Button>

                    {/* 보장 */}
                    <div className="text-center">
                      <div className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-3 py-1 rounded-full">
                        ✅ 전문가급 심도깊은 분석 보장
                      </div>
                    </div>
                  </CardContent>
                </Card>
                );
              })()}
            </div>
          </TabsContent>

          {/* 내 관찰 기록 */}
          <TabsContent value="my-observations" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">내 관찰 기록</h3>
                <p className="text-sm text-muted-foreground">
                  총 {sessions.length}개의 관찰 기록이 있습니다
                </p>
              </div>
            </div>

            {sessions.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <ClipboardList className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h4 className="text-lg font-medium mb-2">아직 관찰 기록이 없습니다</h4>
                  <p className="text-muted-foreground mb-4">
                    첫 번째 관찰일지를 작성해보세요
                  </p>
                  <Button onClick={() => setActiveTab("new-observation")}>
                    <Plus className="h-4 w-4 mr-2" />
                    새 관찰 시작하기
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sessions.map((session) => (
                  <Card key={session.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base mb-1">
                            {session.observations?.session_name || 
                             `${getDomainDisplayName(session.observations?.domain || 'general')} 관찰`}
                          </CardTitle>
                          <CardDescription className="text-sm">
                            {session.observations?.observer_name || '관찰자'}
                          </CardDescription>
                        </div>
                        <Badge className={getStatusColor(session.status)} variant="secondary">
                          {getStatusText(session.status)}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge className={getDomainColor(session.observations?.domain || 'general')} variant="outline">
                          {getDomainDisplayName(session.observations?.domain || 'general')}
                        </Badge>
                        <span>•</span>
                        <span>{new Date(session.created_at).toLocaleDateString('ko-KR')}</span>
                      </div>
                      
                      {/* 점수 정보 */}
                      {session.observations?.analysis_data?.score?.overall && (
                        <div className="flex items-center gap-2">
                          <div className="text-sm text-muted-foreground">전체 점수:</div>
                          <div className="text-sm font-medium">
                            {session.observations.analysis_data.score.overall}/100
                          </div>
                        </div>
                      )}
                      
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full"
                        onClick={() => viewSession(session)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        상세보기
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AuthenticationGuard>
  );
};

export default ObservationNew;