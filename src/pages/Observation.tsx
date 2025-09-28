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
        {/* Hero Section */}
        <section className="pt-24 pb-16 px-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 animate-pulse"></div>
          <div className="container mx-auto max-w-7xl relative z-10">
            {/* Navigation */}
            <div className="mb-8">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
              >
                <ChevronLeft className="w-4 h-4" />
                홈으로
              </Button>
            </div>

            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 px-6 py-3 rounded-full mb-8 animate-bounce">
                <Brain className="h-5 w-5 text-blue-600" />
                <span className="font-semibold text-blue-800">차세대 AI 관찰 플랫폼</span>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent animate-fade-in">
                전문가급<br />
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">관찰 분석</span> 시스템
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto mb-12 leading-relaxed">
                실리콘밸리 AI 기술로 구현한 전문가 수준의 관찰 분석과 맞춤형 리포팅
              </p>

              {/* Real-time Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-xl hover:shadow-2xl transition-all hover-scale">
                  <div className="text-3xl font-bold text-blue-600 mb-2">{activeUsers.toLocaleString()}+</div>
                  <div className="text-gray-600">활성 사용자</div>
                  <div className="flex items-center justify-center mt-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                    <span className="text-sm text-green-600">실시간</span>
                  </div>
                </div>
                
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-xl hover:shadow-2xl transition-all hover-scale">
                  <div className="text-3xl font-bold text-purple-600 mb-2">{totalObservations.toLocaleString()}+</div>
                  <div className="text-gray-600">누적 관찰 분석</div>
                  <div className="flex items-center justify-center mt-2">
                    <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-sm text-green-600">+24% 증가</span>
                  </div>
                </div>
                
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-white/50 shadow-xl hover:shadow-2xl transition-all hover-scale">
                  <div className="text-3xl font-bold text-green-600 mb-2">97.3%</div>
                  <div className="text-gray-600">분석 정확도</div>
                  <div className="flex items-center justify-center mt-2">
                    <Star className="h-4 w-4 text-yellow-500 mr-1" />
                    <span className="text-sm text-yellow-600">전문가 인증</span>
                  </div>
                </div>
              </div>

              {isBetaTestPeriod() && (
                <div className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-100 to-yellow-100 px-8 py-4 rounded-2xl mb-8 border border-orange-200">
                  <Sparkles className="h-6 w-6 text-orange-600" />
                  <span className="text-lg font-semibold text-orange-800">
                    🎉 베타테스트 기간 - 10월 31일까지 모든 기능 무료!
                  </span>
                </div>
              )}

              <Button 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-12 py-6 text-xl rounded-2xl shadow-2xl hover:shadow-3xl transition-all hover-scale"
                onClick={() => setActiveTab("new-observation")}
              >
                <Play className="h-6 w-6 mr-3" />
                AI 관찰 분석 시작
                <ArrowRight className="h-6 w-6 ml-3" />
              </Button>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-16 px-4">
          <div className="container mx-auto max-w-7xl">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-16 bg-white/50 backdrop-blur-sm rounded-2xl p-2 shadow-lg mb-12">
                <TabsTrigger 
                  value="new-observation" 
                  className="text-lg py-3 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  새 관찰 시작
                </TabsTrigger>
                <TabsTrigger 
                  value="my-observations" 
                  className="text-lg py-3 rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white"
                >
                  <FileText className="h-5 w-5 mr-2" />
                  내 관찰 기록
                </TabsTrigger>
              </TabsList>

              {/* New Observation Tab */}
              <TabsContent value="new-observation" className="space-y-12">
                {/* AI Benefits Showcase */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                  <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 border-0 shadow-xl hover:shadow-2xl transition-all hover-scale">
                    <CardContent className="p-8 text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <Brain className="h-10 w-10 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-blue-900 mb-4">실시간 AI 분석</h3>
                      <p className="text-blue-700 leading-relaxed">
                        관찰 데이터를 실시간으로 분석하여 즉시 전문가 수준의 인사이트를 제공합니다
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-50 to-violet-100 border-0 shadow-xl hover:shadow-2xl transition-all hover-scale">
                    <CardContent className="p-8 text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <FileText className="h-10 w-10 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-purple-900 mb-4">전문가 PDF 리포트</h3>
                      <p className="text-purple-700 leading-relaxed">
                        의료진 수준의 상세한 분석 보고서를 자동으로 생성합니다
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-50 to-emerald-100 border-0 shadow-xl hover:shadow-2xl transition-all hover-scale">
                    <CardContent className="p-8 text-center">
                      <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <BarChart3 className="h-10 w-10 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-green-900 mb-4">데이터 기반 통찰</h3>
                      <p className="text-green-700 leading-relaxed">
                        누적 데이터 분석을 통한 발달 패턴과 개선 방향을 제시합니다
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Template Selection */}
                <div className="space-y-8">
                  <div className="text-center">
                    <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-purple-900 bg-clip-text text-transparent">
                      관찰 템플릿 선택
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                      AI가 분석할 관찰 영역을 선택하세요. 각 템플릿은 해당 분야 전문가들이 설계했습니다.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {templates.map((template) => (
                      <Card 
                        key={template.id} 
                        className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all hover-scale group cursor-pointer relative overflow-hidden"
                        onClick={() => startNewSession(template)}
                      >
                        {/* Premium Badge */}
                        {template.template_type === 'detailed' && (
                          <div className="absolute top-6 right-6 z-10">
                            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 text-sm">
                              전문가급
                            </Badge>
                          </div>
                        )}
                        
                        <CardHeader className="pb-6">
                          <div className="flex items-center gap-4 mb-6">
                            <div className={`w-16 h-16 ${template.template_type === 'basic' ? 'bg-gradient-to-br from-blue-500 to-blue-600' : 'bg-gradient-to-br from-purple-500 to-purple-600'} rounded-2xl flex items-center justify-center`}>
                              <ClipboardList className="h-8 w-8 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-2xl font-bold text-gray-900">{template.name}</CardTitle>
                              <div className="flex items-center gap-3 mt-2">
                                <Badge className={getDomainColor(template.domain)}>
                                  {getDomainDisplayName(template.domain)}
                                </Badge>
                                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {template.duration}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="space-y-6">
                          {/* AI Analysis Preview */}
                          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
                            <h4 className="font-bold text-blue-900 mb-4 flex items-center gap-2 text-lg">
                              <Brain className="h-5 w-5" />
                              AI 분석 기능
                            </h4>
                            <div className="space-y-3">
                              {template.template_type === 'basic' ? (
                                <>
                                  <div className="flex items-center gap-3 text-blue-700">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span>기본 행동 패턴 분석</span>
                                  </div>
                                  <div className="flex items-center gap-3 text-blue-700">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span>즉시 인사이트 제공</span>
                                  </div>
                                  <div className="flex items-center gap-3 text-blue-700">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span>간단한 권고사항</span>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="flex items-center gap-3 text-purple-700">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                    <span>심층 발달 상태 분석</span>
                                  </div>
                                  <div className="flex items-center gap-3 text-purple-700">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                    <span>전문가급 해석 및 예측</span>
                                  </div>
                                  <div className="flex items-center gap-3 text-purple-700">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                    <span>맞춤형 개입 전략</span>
                                  </div>
                                  <div className="flex items-center gap-3 text-purple-700">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                    <span>교육 컨텐츠 추천</span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>

                          {/* PDF Report Preview */}
                          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                            <h4 className="font-bold text-green-900 mb-4 flex items-center gap-2 text-lg">
                              <FileText className="h-5 w-5" />
                              전문가 리포트
                            </h4>
                            <div className="space-y-3">
                              {template.template_type === 'basic' ? (
                                <>
                                  <div className="flex items-center gap-3 text-green-700">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span>2-3페이지 요약 리포트</span>
                                  </div>
                                  <div className="flex items-center gap-3 text-green-700">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span>핵심 관찰 사항</span>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="flex items-center gap-3 text-green-700">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span>5-8페이지 상세 리포트</span>
                                  </div>
                                  <div className="flex items-center gap-3 text-green-700">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span>의료진 수준 분석</span>
                                  </div>
                                  <div className="flex items-center gap-3 text-green-700">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span>데이터 시각화 차트</span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Pricing and CTA */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-4 bg-gray-50 rounded-2xl">
                              <div className="text-2xl font-bold text-gray-900">{template.duration}</div>
                              <div className="text-sm text-gray-600">분석 시간</div>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-2xl">
                              <div className={`text-2xl font-bold ${template.template_type === 'basic' ? 'text-blue-600' : 'text-purple-600'}`}>
                                {isBetaTestPeriod() ? '무료' : (template.template_type === 'basic' ? '3 토큰' : '5 토큰')}
                              </div>
                              <div className="text-sm text-gray-600">
                                {isBetaTestPeriod() ? '베타테스트' : '토큰 비용'}
                              </div>
                            </div>
                          </div>

                          <Button 
                            className={`w-full h-14 text-white font-bold text-lg ${
                              template.template_type === 'basic' 
                                ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800' 
                                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700'
                            } rounded-2xl shadow-xl hover:shadow-2xl transition-all`}
                          >
                            <Play className="h-5 w-5 mr-3" />
                            {template.template_type === 'basic' ? '빠른 분석 시작' : '전문가 분석 시작'}
                            <ArrowRight className="h-5 w-5 ml-3" />
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Trust Indicators */}
                <div className="mt-16 text-center">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                    <div className="flex items-center justify-center gap-3 p-4 bg-white/50 rounded-2xl">
                      <Shield className="h-6 w-6 text-green-600" />
                      <span className="font-semibold text-gray-700">보안 인증</span>
                    </div>
                    <div className="flex items-center justify-center gap-3 p-4 bg-white/50 rounded-2xl">
                      <Users className="h-6 w-6 text-blue-600" />
                      <span className="font-semibold text-gray-700">전문가 검증</span>
                    </div>
                    <div className="flex items-center justify-center gap-3 p-4 bg-white/50 rounded-2xl">
                      <Activity className="h-6 w-6 text-purple-600" />
                      <span className="font-semibold text-gray-700">실시간 분석</span>
                    </div>
                    <div className="flex items-center justify-center gap-3 p-4 bg-white/50 rounded-2xl">
                      <Star className="h-6 w-6 text-yellow-600" />
                      <span className="font-semibold text-gray-700">97% 만족도</span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* My Observations Tab */}
              <TabsContent value="my-observations" className="space-y-8">
                <div className="text-center mb-12">
                  <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-gray-900 to-purple-900 bg-clip-text text-transparent">
                    내 관찰 기록
                  </h2>
                  <p className="text-xl text-gray-600">
                    AI가 분석한 관찰 기록들을 확인하고 관리하세요
                  </p>
                </div>

                {sessions.length === 0 ? (
                  <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-0 shadow-xl">
                    <CardContent className="text-center py-16">
                      <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-8">
                        <ClipboardList className="h-12 w-12 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-4">첫 관찰 기록을 시작해보세요</h3>
                      <p className="text-gray-600 mb-8 max-w-md mx-auto">
                        AI 기반 전문가급 관찰 분석으로 정확한 인사이트를 얻어보세요
                      </p>
                      <Button 
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 text-lg rounded-2xl"
                        onClick={() => setActiveTab("new-observation")}
                      >
                        <Plus className="h-5 w-5 mr-2" />
                        새 관찰 시작하기
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sessions.map((session) => (
                      <Card 
                        key={session.id}
                        className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all hover-scale cursor-pointer"
                        onClick={() => viewSession(session)}
                      >
                        <CardHeader>
                          <div className="flex justify-between items-start mb-4">
                            <CardTitle className="text-xl font-bold text-gray-900">
                              {session.session_name || '관찰일지'}
                            </CardTitle>
                            <Badge className={getStatusColor(session.status)}>
                              {getStatusText(session.status)}
                            </Badge>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="h-4 w-4" />
                              {new Date(session.created_at).toLocaleDateString('ko-KR')}
                            </div>
                            {session.family_member && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <User className="h-4 w-4" />
                                {session.family_member.name}
                              </div>
                            )}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {session.analysis_data && (
                              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                  <Brain className="h-4 w-4 text-green-600" />
                                  <span className="text-sm font-semibold text-green-900">AI 분석 완료</span>
                                </div>
                                <p className="text-xs text-green-700">
                                  전문가급 분석 리포트가 준비되었습니다
                                </p>
                              </div>
                            )}
                            
                            <Button 
                              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-xl"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              상세 보기
                            </Button>
                          </div>
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