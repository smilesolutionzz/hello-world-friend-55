import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ClipboardList, Plus, Eye, Download, Calendar, User, AlertCircle } from "lucide-react";
import ObservationSessionForm from "@/components/observation/ObservationSessionForm";
import ObservationFormMobile from "@/components/observation/ObservationFormMobile";
import ObservationResults from "@/components/observation/ObservationResults";

const Observation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("templates");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load templates
      const { data: templatesData, error: templatesError } = await supabase
        .from('observation_templates')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (templatesError) throw templatesError;
      setTemplates(templatesData || []);

      // Load user sessions
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (profile) {
          const { data: sessionsData, error: sessionsError } = await supabase
            .from('observation_sessions')
            .select(`
              *,
              observation_templates(name, domain)
            `)
            .eq('profile_id', profile.id)
            .order('created_at', { ascending: false });

          if (sessionsError) throw sessionsError;
          setSessions(sessionsData || []);
        }
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
    setActiveTab("new-session");
  };

  const viewSession = (session: any) => {
    setSelectedSession(session);
    setActiveTab("session-results");
  };

  const handleSessionCreated = () => {
    setActiveTab("sessions");
    loadData();
    toast({
      title: "관찰 세션 생성 완료",
      description: "새로운 관찰 세션이 생성되었습니다.",
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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="templates">템플릿</TabsTrigger>
          <TabsTrigger value="sessions">내 관찰</TabsTrigger>
          <TabsTrigger value="new-mobile">새 관찰</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">관찰 템플릿 선택</h2>
            <p className="text-muted-foreground">
              관찰하고자 하는 영역에 맞는 템플릿을 선택하세요
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <Badge className={getDomainColor(template.domain)}>
                      {getDomainDisplayName(template.domain)}
                    </Badge>
                  </div>
                  <CardDescription className="min-h-[60px]">
                    {template.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ClipboardList className="h-4 w-4" />
                      {template.items?.length || 0}개 항목
                    </div>
                    <Button onClick={() => startNewSession(template)}>
                      <Plus className="h-4 w-4 mr-2" />
                      시작하기
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">내 관찰 세션</h2>
            <Button onClick={() => setActiveTab("new-mobile")}>
              <Plus className="h-4 w-4 mr-2" />
              새 관찰 시작
            </Button>
          </div>

          {sessions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <ClipboardList className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">아직 관찰 세션이 없습니다</h3>
                <p className="text-muted-foreground mb-4">
                  첫 번째 관찰을 시작해보세요
                </p>
                <Button onClick={() => setActiveTab("new-mobile")}>
                  새 관찰 시작하기
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
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{session.session_name}</h3>
                          <Badge className={getDomainColor(session.domain)}>
                            {getDomainDisplayName(session.domain)}
                          </Badge>
                          <Badge variant="outline" className={getStatusColor(session.status)}>
                            {getStatusText(session.status)}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-6 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {session.observer_name}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(session.observation_period_start).toLocaleDateString('ko-KR')} ~{' '}
                            {new Date(session.observation_period_end).toLocaleDateString('ko-KR')}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {session.status === 'analyzed' && (
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-1" />
                            PDF
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            setSelectedSession(session);
                            setActiveTab("session-results");
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          보기
                        </Button>
                      </div>
                    </div>

                    {session.status === 'analyzed' && session.analysis_data?.riskLevel && (
                      <div className="mt-4 p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            위험도: {session.analysis_data.riskLevel === 'low' ? '양호' : 
                                   session.analysis_data.riskLevel === 'medium' ? '보통' : '주의'}
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="new-mobile">
          <ObservationFormMobile
            onBack={() => setActiveTab("sessions")}
            onSuccess={async (sessionId) => {
              // Reload data and show results
              await loadData();
              const session = sessions.find(s => s.id === sessionId);
              if (session) {
                setSelectedSession(session);
                setActiveTab("session-results");
              }
            }}
          />
        </TabsContent>

        <TabsContent value="session-results">
          {selectedSession && (
            <ObservationResults
              session={selectedSession}
              onBack={() => setActiveTab("sessions")}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Observation;