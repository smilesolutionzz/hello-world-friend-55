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
      
      // Mock templates data
      const templatesData = [
        { 
          id: '1', 
          name: '기본 관찰 템플릿', 
          description: '기본적인 행동 관찰을 위한 템플릿',
          domain: 'child_development',
          is_active: true,
          items: ['behavior', 'duration', 'triggers']
        },
        { 
          id: '2', 
          name: '상세 분석 템플릿', 
          description: '상세한 분석을 위한 고급 템플릿',
          domain: 'psychology',
          is_active: true,
          items: ['behavior', 'duration', 'triggers', 'severity']
        }
      ];
      const templatesError = null;

      if (templatesError) throw templatesError;
      setTemplates(templatesData || []);

      // Load user sessions
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Mock sessions data
        const sessionsData = [
          {
            id: '1',
            session_name: '샘플 관찰 세션',
            domain: 'child_development',
            status: 'completed',
            observer_name: '관찰자',
            observation_period_start: new Date().toISOString(),
            observation_period_end: new Date().toISOString(),
            analysis_data: { riskLevel: 'low' }
          }
        ];
        const sessionsError = null;

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
        <div className="mb-8">
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

        <TabsContent value="new-observation" className="space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">새 관찰 시작하기</h2>
            <p className="text-lg text-muted-foreground">
              관찰하고자 하는 영역에 맞는 템플릿을 선택하고 바로 시작하세요
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer border-2 hover:border-primary/50">
                <CardHeader className="text-center pb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center mx-auto mb-4">
                    <ClipboardList className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-xl">{template.name}</CardTitle>
                  <Badge className={`${getDomainColor(template.domain)} mx-auto`}>
                    {getDomainDisplayName(template.domain)}
                  </Badge>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <CardDescription className="min-h-[60px] text-base">
                    {template.description}
                  </CardDescription>
                  
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <ClipboardList className="h-4 w-4" />
                    {template.items?.length || 0}개 관찰 항목
                  </div>
                  
                  <Button 
                    className="w-full btn-primary"
                    size="lg"
                    onClick={() => {
                      setSelectedTemplate(template);
                      setActiveTab("start-session");
                    }}
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    이 템플릿으로 시작하기
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Start Guide */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600" />
                관찰일지 작성 가이드
              </h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-start gap-2">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">1</span>
                  <div>
                    <div className="font-medium">템플릿 선택</div>
                    <div className="text-muted-foreground">관찰 목적에 맞는 템플릿을 선택하세요</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">2</span>
                  <div>
                    <div className="font-medium">관찰 기록</div>
                    <div className="text-muted-foreground">체계적으로 관찰 내용을 기록하세요</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">3</span>
                  <div>
                    <div className="font-medium">AI 분석</div>
                    <div className="text-muted-foreground">전문가 수준의 AI 분석 결과를 받아보세요</div>
                  </div>
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
                          <h3 className="text-lg font-semibold">{session.session_name}</h3>
                          <Badge className={getDomainColor(session.domain)}>
                            {getDomainDisplayName(session.domain)}
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
                            <span>관찰자: {session.observer_name}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(session.observation_period_start).toLocaleDateString('ko-KR')} ~ 
                              {new Date(session.observation_period_end).toLocaleDateString('ko-KR')}
                            </span>
                          </div>
                        </div>

                        {session.status === 'analyzed' && session.analysis_data?.riskLevel && (
                          <div className="mt-4 p-3 bg-muted rounded-lg">
                            <div className="flex items-center gap-2">
                              <AlertCircle className="h-4 w-4" />
                              <span className="text-sm font-medium">
                                분석 결과: {session.analysis_data.riskLevel === 'low' ? '양호' : 
                                          session.analysis_data.riskLevel === 'medium' ? '보통' : '주의 필요'}
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