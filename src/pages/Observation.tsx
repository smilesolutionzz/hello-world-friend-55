import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ClipboardList, Plus, Eye, Download, Calendar, User, AlertCircle, ChevronLeft } from "lucide-react";
import ObservationSessionForm from "@/components/observation/ObservationSessionForm";
import ObservationFormMobile from "@/components/observation/ObservationFormMobile";
import ObservationResults from "@/components/observation/ObservationResults";
import AuthenticationGuard from "@/components/observation/AuthenticationGuard";

const Observation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("new-observation");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load templates from database
      const { data: templatesData, error: templatesError } = await supabase
        .from('observation_templates')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (templatesError) throw templatesError;
      setTemplates(templatesData || []);

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
          .order('created_at', { ascending: false });

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
      child_development: '아동발달 추천',
      psychology: '심리상담 추천',
      elderly_care: '노인케어',
      workplace: '직장적응',
      learning: '학습능력',
      family: '가족상담',
      medical: '의료재활'
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
      medical: 'bg-red-100 text-red-800'
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

  const startNewSession = (template: any) => {
    setSelectedTemplate(template);
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">데이터 로딩 중...</div>
      </div>
    );
  }

  return (
    <AuthenticationGuard fallbackMessage="관찰일지 시스템을 사용하려면 로그인이 필요합니다.">
      <div className="container mx-auto px-4 py-8">
        {/* Header with Home Button */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="w-4 h-4" />
              홈으로
            </Button>
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">
            전영역 관찰일지 시스템
          </h1>
          <p className="text-xl text-muted-foreground">
            체계적 관찰과 AI 분석을 통한 전문 리포팅 플랫폼
          </p>
        </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="new-observation">새 관찰 시작</TabsTrigger>
          <TabsTrigger value="my-observations">내 관찰 기록</TabsTrigger>
        </TabsList>

        <TabsContent value="new-observation" className="space-y-8">
          {/* Value Proposition Header */}
          <div className="text-center space-y-4 mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full text-sm font-medium text-blue-800">
              🧠 AI + 전문가 분석
            </div>
            <h2 className="text-3xl font-bold tracking-tight">전문가급 관찰 분석을 받아보세요</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              간단한 관찰 기록으로 <span className="font-semibold text-primary">AI 심층 분석</span>과 
              <span className="font-semibold text-primary"> 전문가 수준의 PDF 리포트</span>를 제공받으세요
            </p>
          </div>

          {/* Benefits Preview */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4">
                <span className="text-white text-xl">🤖</span>
              </div>
              <h3 className="font-semibold text-blue-900 mb-2">실시간 AI 분석</h3>
              <p className="text-sm text-blue-700">
                관찰 직후 즉시 전문적인 해석과 인사이트 제공
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4">
                <span className="text-white text-xl">📋</span>
              </div>
              <h3 className="font-semibold text-purple-900 mb-2">전문가 PDF 리포트</h3>
              <p className="text-sm text-purple-700">
                의료진 수준의 상세한 관찰 분석 보고서
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4">
                <span className="text-white text-xl">📊</span>
              </div>
              <h3 className="font-semibold text-green-900 mb-2">데이터 기반 통찰</h3>
              <p className="text-sm text-green-700">
                누적 데이터를 통한 발달 패턴 분석
              </p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer border-2 hover:border-primary/50 relative overflow-hidden">
                {/* Premium Badge for Advanced Template */}
                {template.template_type === 'detailed' && (
                  <div className="absolute top-4 right-4 z-10">
                    <Badge className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                      전문가급
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4 relative">
                  <div className={`w-20 h-20 ${template.template_type === 'basic' ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-purple-500 to-purple-600'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <ClipboardList className="h-10 w-10 text-white" />
                  </div>
                  <CardTitle className="text-2xl mb-2">{template.name}</CardTitle>
                  <div className="flex items-center justify-center gap-4 mb-3">
                    <Badge className={getDomainColor(template.domain)}>
                      {getDomainDisplayName(template.domain)}
                    </Badge>
                     <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                       {template.duration}
                     </Badge>
                     <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                       {template.cost}
                     </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* AI Analysis Preview */}
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                      🤖 AI 분석 결과 미리보기
                    </h4>
                    <div className="text-sm text-blue-700 space-y-1">
                      {template.template_type === 'basic' ? (
                        <>
                          <div>• 기본 행동 패턴 분석</div>
                          <div>• 즉시 인사이트 제공</div>
                          <div>• 간단한 권고사항</div>
                        </>
                      ) : (
                        <>
                          <div>• 심층 발달 상태 분석</div>
                          <div>• 전문가급 해석</div>
                          <div>• 맞춤형 개입 전략</div>
                          <div>• 장기 발달 예측</div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* PDF Report Preview */}
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                    <h4 className="font-semibold text-purple-900 mb-2 flex items-center gap-2">
                      📋 전문가 PDF 리포트
                    </h4>
                    <div className="text-sm text-purple-700 space-y-1">
                      {template.template_type === 'basic' ? (
                        <>
                          <div>• 2-3페이지 요약 리포트</div>
                          <div>• 핵심 관찰 사항</div>
                          <div>• 기본 권고사항</div>
                        </>
                      ) : (
                        <>
                          <div>• 5-8페이지 상세 리포트</div>
                          <div>• 의료진 수준 분석</div>
                          <div>• 전문가 권고사항</div>
                          <div>• 데이터 시각화 차트</div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">추가 혜택</h4>
                    <div className="space-y-2">
                      {template.features.slice(0, 3).map((feature: string, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <div className={`w-2 h-2 rounded-full ${template.template_type === 'basic' ? 'bg-blue-500' : 'bg-purple-500'}`} />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Specs and Pricing */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">{template.duration}</div>
                      <div className="text-sm text-muted-foreground">분석 시간</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">{template.cost}</div>
                      <div className="text-sm text-muted-foreground">토큰 비용</div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Button 
                    className={`w-full h-12 text-white font-semibold ${
                      template.template_type === 'basic' 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                    }`}
                    size="lg"
                    onClick={() => {
                      setSelectedTemplate(template);
                      setActiveTab("start-session");
                    }}
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    {template.template_type === 'basic' ? '빠른 분석 시작하기' : '전문가 분석 시작하기'}
                  </Button>

                  {/* Value Guarantee */}
                  <div className="text-center">
                    <div className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-3 py-1 rounded-full">
                      ✅ {template.template_type === 'basic' ? '즉시 결과 보장' : '전문가급 분석 보장'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Comparison Guide */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-center mb-6">📋 템플릿 비교 가이드</h3>
              
              <div className="grid md:grid-cols-2 gap-8">
                {/* Basic Template */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">기본</span>
                    </div>
                    <h4 className="text-lg font-semibold">기본 관찰 템플릿</h4>
                  </div>
                  <div className="pl-11 space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-500">✓</span>
                      <span>빠르고 간단한 관찰 (10-15분)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-blue-500">✓</span>
                      <span>기본적인 행동 패턴 기록</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-blue-500">✓</span>
                      <span>일상적인 모니터링에 적합</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-blue-500">✓</span>
                      <span>처음 사용자도 쉽게 이용</span>
                    </div>
                  </div>
                </div>

                {/* Advanced Template */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">상세</span>
                    </div>
                    <h4 className="text-lg font-semibold">상세 분석 템플릿</h4>
                  </div>
                  <div className="pl-11 space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-purple-500">✓</span>
                      <span>전문가급 심층 분석 (25-30분)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-purple-500">✓</span>
                      <span>감정 상태 및 발달 단계 평가</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-purple-500">✓</span>
                      <span>상세한 PDF 리포트 제공</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-purple-500">✓</span>
                      <span>전문적인 개선 방안 제시</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 text-center">
                <div className="inline-flex items-center gap-4 px-6 py-3 bg-white rounded-lg border">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                  <span className="text-sm font-medium">
                    <strong>권장:</strong> 처음 사용하시는 경우 기본 템플릿으로 시작한 후, 
                    더 자세한 분석이 필요하면 상세 템플릿을 이용해보세요.
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-observations" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">내 관찰 기록</h2>
              <p className="text-muted-foreground mt-1">지금까지 작성한 관찰일지를 확인하고 관리하세요</p>
            </div>
            <Button 
              onClick={() => setActiveTab("new-observation")}
              className="btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              새 관찰 시작
            </Button>
          </div>

          {sessions.length === 0 ? (
            <Card className="border-dashed border-2">
              <CardContent className="text-center py-16">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <ClipboardList className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-3">아직 관찰 기록이 없습니다</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  첫 번째 관찰일지를 작성해보세요. 체계적인 관찰과 AI 분석을 통해 
                  전문적인 인사이트를 얻을 수 있습니다.
                </p>
                <Button 
                  onClick={() => setActiveTab("new-observation")}
                  size="lg"
                  className="btn-primary"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  첫 관찰일지 작성하기
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {sessions.map((session) => (
                <Card key={session.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                         <div className="flex items-center gap-3 mb-3">
                           <h3 className="text-lg font-semibold">{session.summary || '관찰 세션'}</h3>
                           <Badge className={getDomainColor(session.session_type)}>
                             {getDomainDisplayName(session.session_type)}
                           </Badge>
                           <Badge 
                             variant="outline" 
                             className={`${getStatusColor(session.status)} border-0`}
                           >
                             {getStatusText(session.status)}
                           </Badge>
                         </div>
                         
                         <div className="flex items-center gap-6 text-sm text-muted-foreground">
                           <div className="flex items-center gap-2">
                             <User className="h-4 w-4" />
                             <span>가족구성원: {session.family_member?.name || '미지정'}</span>
                           </div>
                           <div className="flex items-center gap-2">
                             <Calendar className="h-4 w-4" />
                             <span>
                               {new Date(session.created_at).toLocaleDateString('ko-KR')}
                               {session.duration_minutes && ` (${session.duration_minutes}분)`}
                             </span>
                           </div>
                         </div>

                         {session.status === 'analyzed' && session.observations?.analysis?.riskLevel && (
                           <div className="mt-4 p-3 bg-muted rounded-lg">
                             <div className="flex items-center gap-2">
                               <AlertCircle className="h-4 w-4" />
                               <span className="text-sm font-medium">
                                 분석 결과: {session.observations.analysis.riskLevel === 'low' ? '양호' : 
                                           session.observations.analysis.riskLevel === 'medium' ? '보통' : '주의 필요'}
                               </span>
                             </div>
                           </div>
                         )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {session.status === 'analyzed' && (
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            PDF 다운로드
                          </Button>
                        )}
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => {
                            setSelectedSession(session);
                            setActiveTab("view-results");
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          상세보기
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Simplified Session Start */}
        <TabsContent value="start-session">
          {selectedTemplate && (
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-4 mb-6">
                <Button 
                  variant="ghost" 
                  onClick={() => setActiveTab("new-observation")}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  템플릿 선택으로 돌아가기
                </Button>
              </div>
              
              <ObservationFormMobile
                onBack={() => setActiveTab("new-observation")}
                onSuccess={async (sessionId) => {
                  await loadData();
                  const session = sessions.find(s => s.id === sessionId);
                  if (session) {
                    setSelectedSession(session);
                    setActiveTab("view-results");
                  } else {
                    setActiveTab("my-observations");
                  }
                  toast({
                    title: "관찰일지 작성 완료",
                    description: "AI 분석이 완료되었습니다. 결과를 확인해보세요.",
                  });
                }}
                templateType={selectedTemplate?.template_type}
              />
            </div>
          )}
        </TabsContent>

        {/* Results View */}
        <TabsContent value="view-results">
          {selectedSession && (
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-4 mb-6">
                <Button 
                  variant="ghost" 
                  onClick={() => setActiveTab("my-observations")}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  내 관찰 기록으로 돌아가기
                </Button>
              </div>
              
              <ObservationResults
                session={selectedSession}
                onBack={() => setActiveTab("my-observations")}
              />
            </div>
          )}
        </TabsContent>
      </Tabs>
      </div>
    </AuthenticationGuard>
  );
};

export default Observation;