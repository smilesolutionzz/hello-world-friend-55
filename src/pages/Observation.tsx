import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  ClipboardList, 
  Plus, 
  Eye, 
  Download, 
  Calendar, 
  User, 
  AlertCircle, 
  ChevronLeft,
  Brain,
  Sparkles,
  Target,
  TrendingUp,
  Star,
  ArrowRight,
  Play,
  Zap,
  Shield,
  FileText,
  BarChart3,
  Users,
  Activity,
  Clock
} from "lucide-react";
import ObservationSessionForm from "@/components/observation/ObservationSessionForm";
import ObservationFormMobile from "@/components/observation/ObservationFormMobile";
import ObservationResults from "@/components/observation/ObservationResults";
import AuthenticationGuard from "@/components/observation/AuthenticationGuard";
import IEPGenerationMotivation from "@/components/observation/IEPGenerationMotivation";
import { isBetaTestPeriod } from '@/utils/betaTest';
import { UnifiedNavigation } from "@/components/navigation/UnifiedNavigation";

const Observation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("new-observation");
  const [loading, setLoading] = useState(true);
  const [activeUsers, setActiveUsers] = useState(2847);
  const [totalObservations, setTotalObservations] = useState(15623);

  useEffect(() => {
    loadData();
    
    // 실시간 지표 업데이트
    const timer = setInterval(() => {
      setActiveUsers(prev => prev + Math.floor(Math.random() * 3));
      setTotalObservations(prev => prev + Math.floor(Math.random() * 2));
    }, 10000);
    
    return () => clearInterval(timer);
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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse mx-auto"></div>
          <div className="text-xl font-semibold text-gray-700">AI 시스템 로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <AuthenticationGuard fallbackMessage="차세대 AI 관찰일지 시스템을 사용하려면 로그인이 필요합니다.">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Unified Navigation */}
        <UnifiedNavigation />
        
        {/* Hero Section - Simplified */}
        <section className="pt-24 pb-12 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="text-center mb-12">
              {isBetaTestPeriod() && (
                <div className="inline-flex items-center gap-2 bg-orange-50 px-4 py-2 rounded-full mb-6 border border-orange-200">
                  <Sparkles className="h-4 w-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-800">
                    베타테스트 기간 - 10월 31일까지 무료
                  </span>
                </div>
              )}
              
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
                AI 관찰일지 작성
              </h1>
              
              <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
                간단한 관찰 기록으로 전문가 수준의 분석 리포트를 받아보세요
              </p>

              {/* Simple 3-Step Guide */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mb-8">
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                    1
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">템플릿 선택</h3>
                  <p className="text-sm text-gray-600">관찰 주제를 고르세요</p>
                </div>
                
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                    2
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">관찰 기록</h3>
                  <p className="text-sm text-gray-600">간단히 입력하세요</p>
                </div>
                
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="w-10 h-10 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3 font-bold">
                    3
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">AI 분석</h3>
                  <p className="text-sm text-gray-600">즉시 결과를 받아보세요</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-8 px-4">
          <div className="container mx-auto max-w-6xl">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-12 bg-white rounded-lg p-1 shadow mb-8 max-w-md mx-auto">
                <TabsTrigger 
                  value="new-observation" 
                  className="text-sm data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md"
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  새 관찰
                </TabsTrigger>
                <TabsTrigger 
                  value="my-observations" 
                  className="text-sm data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-md"
                >
                  <FileText className="h-4 w-4 mr-1.5" />
                  내 기록
                </TabsTrigger>
              </TabsList>

              {/* New Observation Tab */}
              <TabsContent value="new-observation" className="space-y-8">
                {/* Template Selection */}
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2 text-gray-900">
                      관찰 템플릿 선택하기
                    </h2>
                    <p className="text-gray-600">
                      관찰하고 싶은 주제를 선택해주세요
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                    {templates.map((template) => (
                      <Card 
                        key={template.id} 
                        className="bg-white hover:shadow-lg transition-all cursor-pointer border-2 hover:border-blue-300"
                        onClick={() => startNewSession(template)}
                      >
                        <CardHeader>
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 ${template.template_type === 'basic' ? 'bg-blue-100' : 'bg-purple-100'} rounded-lg flex items-center justify-center flex-shrink-0`}>
                              <ClipboardList className={`h-6 w-6 ${template.template_type === 'basic' ? 'text-blue-600' : 'text-purple-600'}`} />
                            </div>
                            <div className="flex-1">
                              <CardTitle className="text-xl font-bold text-gray-900 mb-2">{template.name}</CardTitle>
                              <CardDescription className="text-sm">
                                {getDomainDisplayName(template.domain)}
                              </CardDescription>
                            </div>
                            {template.template_type === 'detailed' && (
                              <Badge className="bg-purple-100 text-purple-700 border-0">
                                상세
                              </Badge>
                            )}
                          </div>
                        </CardHeader>
                        
                        <CardContent className="space-y-4">
                          {/* Key Features */}
                          <div className="space-y-2">
                            {template.template_type === 'basic' ? (
                              <>
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                  <span>기본 행동 패턴 분석</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                  <span>2-3페이지 리포트</span>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                                  <span>심층 발달 상태 분석</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                                  <span>5-8페이지 전문가 리포트</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-700">
                                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                                  <span>교육 컨텐츠 추천</span>
                                </div>
                              </>
                            )}
                          </div>

                          {/* Info Row */}
                          <div className="flex items-center justify-between pt-4 border-t">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Clock className="h-4 w-4" />
                              <span>{template.duration}</span>
                            </div>
                            <div className={`text-sm font-semibold ${template.template_type === 'basic' ? 'text-blue-600' : 'text-purple-600'}`}>
                              {isBetaTestPeriod() ? '무료' : (template.template_type === 'basic' ? '3 토큰' : '5 토큰')}
                            </div>
                          </div>

                          <Button 
                            className={`w-full ${
                              template.template_type === 'basic' 
                                ? 'bg-blue-600 hover:bg-blue-700' 
                                : 'bg-purple-600 hover:bg-purple-700'
                            } text-white`}
                          >
                            시작하기
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

              </TabsContent>

              {/* My Observations Tab */}
              <TabsContent value="my-observations" className="space-y-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold mb-2 text-gray-900">
                    내 관찰 기록
                  </h2>
                  <p className="text-gray-600">
                    작성한 관찰일지를 확인하세요
                  </p>
                </div>

                {sessions.length === 0 ? (
                  <Card className="bg-white max-w-md mx-auto">
                    <CardContent className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ClipboardList className="h-8 w-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">아직 작성한 관찰일지가 없습니다</h3>
                      <p className="text-gray-600 mb-6 text-sm">
                        첫 관찰일지를 작성해보세요
                      </p>
                      <Button 
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => setActiveTab("new-observation")}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        새 관찰 시작
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sessions.map((session) => (
                      <Card 
                        key={session.id}
                        className="bg-white hover:shadow-md transition-all cursor-pointer"
                        onClick={() => viewSession(session)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-base font-semibold text-gray-900">
                              {session.session_name || '관찰일지'}
                            </CardTitle>
                            <Badge className={getStatusColor(session.status)} variant="outline">
                              {getStatusText(session.status)}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="h-3.5 w-3.5" />
                              {new Date(session.created_at).toLocaleDateString('ko-KR')}
                            </div>
                            {session.family_member && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <User className="h-3.5 w-3.5" />
                                {session.family_member.name}
                              </div>
                            )}
                          </div>

                          {session.analysis_data && (
                            <div className="bg-green-50 rounded-lg p-2 border border-green-200">
                              <div className="flex items-center gap-2">
                                <Brain className="h-3.5 w-3.5 text-green-600" />
                                <span className="text-xs font-medium text-green-700">분석 완료</span>
                              </div>
                            </div>
                          )}
                          
                          <Button 
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm"
                            size="sm"
                          >
                            <Eye className="h-3.5 w-3.5 mr-1.5" />
                            결과 보기
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Session Form Tab */}
              <TabsContent value="start-session">
                {selectedTemplate && (
                  <div className="max-w-4xl mx-auto">
                    <div className="mb-8 text-center">
                      <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        {selectedTemplate.name} 시작
                      </h2>
                      <p className="text-gray-600">
                        AI가 분석할 관찰 데이터를 입력해주세요
                      </p>
                    </div>
                    <div className="block md:hidden">
                      <ObservationFormMobile 
                        template={selectedTemplate}
                        onSessionCreated={handleSessionCreated}
                        onBack={() => setActiveTab("new-observation")}
                      />
                    </div>
                    <div className="hidden md:block">
                      <ObservationSessionForm 
                        onSessionCreated={handleSessionCreated}
                      />
                    </div>
                  </div>
                )}
              </TabsContent>

              {/* Results Tab */}
              <TabsContent value="view-results">
                {selectedSession && (
                  <div className="max-w-6xl mx-auto">
                    <ObservationResults 
                      session={selectedSession} 
                      onBack={() => setActiveTab("my-observations")}
                    />
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </div>
    </AuthenticationGuard>
  );
};

export default Observation;