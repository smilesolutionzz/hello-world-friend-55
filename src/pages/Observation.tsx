import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  ClipboardList, 
  Plus, 
  Eye, 
  Calendar, 
  User, 
  Brain,
  Sparkles,
  ArrowRight,
  Clock,
  FileText,
  CheckCircle2,
  Loader2
} from "lucide-react";
import ObservationSessionForm from "@/components/observation/ObservationSessionForm";
import ObservationFormMobile from "@/components/observation/ObservationFormMobile";
import ObservationResults from "@/components/observation/ObservationResults";
import AuthenticationGuard from "@/components/observation/AuthenticationGuard";
import { isBetaTestPeriod } from '@/utils/betaTest';
import { UnifiedNavigation } from "@/components/navigation/UnifiedNavigation";

const Observation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"new" | "history" | "form" | "results">("new");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const { data: templatesData, error: templatesError } = await supabase
        .from('observation_templates')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      if (templatesError) throw templatesError;
      setTemplates(templatesData || []);

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: sessionsData, error: sessionsError } = await supabase
          .from('observation_sessions')
          .select(`*, family_member:family_members(name)`)
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
    const names: Record<string, string> = {
      child_development: '아동발달',
      psychology: '심리상담',
      elderly_care: '노인케어',
      workplace: '직장적응',
      learning: '학습능력',
      family: '가족상담',
      medical: '의료재활'
    };
    return names[domain] || domain;
  };

  const getStatusConfig = (status: string) => {
    const config: Record<string, { bg: string; text: string; label: string }> = {
      in_progress: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', label: '진행중' },
      completed: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', label: '완료' },
      analyzed: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400', label: '분석완료' }
    };
    return config[status] || { bg: 'bg-slate-100', text: 'text-slate-700', label: status };
  };

  const startNewSession = (template: any) => {
    setSelectedTemplate(template);
    setActiveTab("form");
  };

  const viewSession = (session: any) => {
    setSelectedSession(session);
    setActiveTab("results");
  };

  const handleSessionCreated = () => {
    setActiveTab("history");
    loadData();
    toast({
      title: "관찰일지 작성 완료",
      description: "새로운 관찰일지가 생성되었습니다.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto" />
          <p className="text-slate-500">로딩 중...</p>
        </div>
      </div>
    );
  }

  // Form View
  if (activeTab === "form" && selectedTemplate) {
    return (
      <AuthenticationGuard fallbackMessage="AI 관찰일지를 사용하려면 로그인이 필요합니다.">
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
          <UnifiedNavigation />
          <div className="h-20" />
          <div className="container mx-auto max-w-4xl px-4 py-8">
            <button 
              onClick={() => setActiveTab("new")}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white mb-6 transition-colors"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              <span>뒤로가기</span>
            </button>
            
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                {selectedTemplate.name}
              </h1>
              <p className="text-slate-500">AI가 분석할 관찰 데이터를 입력해주세요</p>
            </div>
            
            <div className="block md:hidden">
              <ObservationFormMobile 
                template={selectedTemplate}
                onSessionCreated={handleSessionCreated}
                onBack={() => setActiveTab("new")}
              />
            </div>
            <div className="hidden md:block">
              <ObservationSessionForm onSessionCreated={handleSessionCreated} />
            </div>
          </div>
        </div>
      </AuthenticationGuard>
    );
  }

  // Results View
  if (activeTab === "results" && selectedSession) {
    return (
      <AuthenticationGuard fallbackMessage="AI 관찰일지를 사용하려면 로그인이 필요합니다.">
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
          <UnifiedNavigation />
          <div className="h-20" />
          <div className="container mx-auto max-w-6xl px-4 py-8">
            <ObservationResults 
              session={selectedSession} 
              onBack={() => setActiveTab("history")}
            />
          </div>
        </div>
      </AuthenticationGuard>
    );
  }

  return (
    <AuthenticationGuard fallbackMessage="AI 관찰일지를 사용하려면 로그인이 필요합니다.">
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
        <UnifiedNavigation />
        
        {/* Hero */}
        <div className="h-20" />
        <section className="py-12 px-4">
          <div className="container mx-auto max-w-4xl text-center">
            {isBetaTestPeriod() && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                베타테스트 무료 이용중
              </div>
            )}
            
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              AI 관찰일지
            </h1>
            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto mb-10">
              간단한 관찰 기록으로 전문가 수준의 분석 리포트를 받아보세요
            </p>

            {/* Steps */}
            <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-12">
              {[
                { step: 1, icon: ClipboardList, label: '템플릿 선택', color: 'from-blue-500 to-cyan-500' },
                { step: 2, icon: FileText, label: '관찰 기록', color: 'from-violet-500 to-purple-500' },
                { step: 3, icon: Brain, label: 'AI 분석', color: 'from-emerald-500 to-teal-500' },
              ].map((item) => (
                <div key={item.step} className="flex flex-col items-center">
                  <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-3 shadow-lg`}>
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tab Navigation */}
        <section className="px-4 pb-8">
          <div className="container mx-auto max-w-4xl">
            <div className="flex justify-center gap-2 mb-8">
              <button
                onClick={() => setActiveTab("new")}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  activeTab === "new"
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <Plus className="w-4 h-4 inline mr-2" />
                새 관찰
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  activeTab === "history"
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                <FileText className="w-4 h-4 inline mr-2" />
                내 기록 ({sessions.length})
              </button>
            </div>

            {/* New Observation */}
            {activeTab === "new" && (
              <div className="space-y-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => startNewSession(template)}
                    className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-lg transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                        template.template_type === 'basic' 
                          ? 'bg-gradient-to-br from-blue-500 to-cyan-500' 
                          : 'bg-gradient-to-br from-violet-500 to-purple-500'
                      }`}>
                        <ClipboardList className="w-7 h-7 text-white" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                            {template.name}
                          </h3>
                          {template.template_type === 'detailed' && (
                            <Badge className="bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 border-0 text-xs">
                              상세
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {getDomainDisplayName(template.domain)} • {template.duration}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className={`text-sm font-semibold ${
                          template.template_type === 'basic' ? 'text-blue-600' : 'text-violet-600'
                        }`}>
                          {isBetaTestPeriod() ? '무료' : (template.template_type === 'basic' ? '3 토큰' : '5 토큰')}
                        </span>
                        <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-slate-900 dark:group-hover:bg-white transition-colors">
                          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-white dark:group-hover:text-slate-900 transition-colors" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* History */}
            {activeTab === "history" && (
              <>
                {sessions.length === 0 ? (
                  <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 text-center border border-slate-200 dark:border-slate-800">
                    <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                      <ClipboardList className="w-8 h-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                      아직 기록이 없습니다
                    </h3>
                    <p className="text-slate-500 mb-6">첫 관찰일지를 작성해보세요</p>
                    <Button 
                      onClick={() => setActiveTab("new")}
                      className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      새 관찰 시작
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sessions.map((session) => {
                      const status = getStatusConfig(session.status);
                      return (
                        <div
                          key={session.id}
                          onClick={() => viewSession(session)}
                          className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-lg transition-all cursor-pointer group"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                session.analysis_data 
                                  ? 'bg-gradient-to-br from-emerald-500 to-teal-500' 
                                  : 'bg-slate-100 dark:bg-slate-800'
                              }`}>
                                {session.analysis_data ? (
                                  <CheckCircle2 className="w-6 h-6 text-white" />
                                ) : (
                                  <FileText className="w-6 h-6 text-slate-400" />
                                )}
                              </div>
                              
                              <div>
                                <h3 className="font-semibold text-slate-900 dark:text-white mb-1">
                                  {session.session_name || '관찰일지'}
                                </h3>
                                <div className="flex items-center gap-3 text-sm text-slate-500">
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5" />
                                    {new Date(session.created_at).toLocaleDateString('ko-KR')}
                                  </span>
                                  {session.family_member && (
                                    <span className="flex items-center gap-1">
                                      <User className="w-3.5 h-3.5" />
                                      {session.family_member.name}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <Badge className={`${status.bg} ${status.text} border-0`}>
                                {status.label}
                              </Badge>
                              <Button 
                                size="sm" 
                                className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100"
                              >
                                <Eye className="w-4 h-4 mr-1" />
                                보기
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </AuthenticationGuard>
  );
};

export default Observation;
