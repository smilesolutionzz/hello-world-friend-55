import { useState, useEffect } from "react";
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
  FileText,
  CheckCircle2,
  Loader2,
  Star,
  Zap
} from "lucide-react";
import ObservationSessionForm from "@/components/observation/ObservationSessionForm";
import ObservationFormMobile from "@/components/observation/ObservationFormMobile";
import ObservationResults from "@/components/observation/ObservationResults";
import AuthenticationGuard from "@/components/observation/AuthenticationGuard";
import { isBetaTestPeriod } from '@/utils/betaTest';
import { UnifiedNavigation } from "@/components/navigation/UnifiedNavigation";

const Observation = () => {
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
      in_progress: { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', label: '진행중' },
      completed: { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', label: '완료' },
      analyzed: { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', label: '분석완료' }
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
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 animate-pulse" />
            <Loader2 className="w-8 h-8 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin" />
          </div>
          <p className="text-amber-700 dark:text-amber-300" style={{ fontFamily: "'Gowun Batang', serif" }}>로딩 중...</p>
        </div>
      </div>
    );
  }

  // Form View
  if (activeTab === "form" && selectedTemplate) {
    return (
      <AuthenticationGuard fallbackMessage="AI 관찰일지를 사용하려면 로그인이 필요합니다.">
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
          <UnifiedNavigation />
          <div className="h-20" />
          <div className="container mx-auto max-w-4xl px-4 py-8">
            <button 
              onClick={() => setActiveTab("new")}
              className="flex items-center gap-2 text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 mb-6 transition-colors"
            >
              <ArrowRight className="w-4 h-4 rotate-180" />
              <span style={{ fontFamily: "'Gowun Batang', serif" }}>뒤로가기</span>
            </button>
            
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-amber-900 dark:text-amber-100 mb-2" style={{ fontFamily: "'Gowun Batang', serif" }}>
                ✍️ {selectedTemplate.name}
              </h1>
              <p className="text-amber-600/70 dark:text-amber-400/70">AI가 분석할 관찰 데이터를 입력해주세요</p>
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
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
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
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden">
        {/* 일기장 배경 패턴 */}
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              repeating-linear-gradient(
                0deg,
                transparent,
                transparent 31px,
                #d4a574 31px,
                #d4a574 32px
              )
            `,
            backgroundSize: '100% 32px'
          }} />
        </div>
        
        <UnifiedNavigation />
        
        {/* Hero - 일기장 스타일 */}
        <div className="h-20" />
        <section className="py-8 px-4 relative z-10">
          <div className="container mx-auto max-w-4xl text-center">
            {isBetaTestPeriod() && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-sm font-medium mb-6 backdrop-blur-sm">
                <Sparkles className="w-4 h-4" />
                베타테스트 무료 이용중
              </div>
            )}
            
            {/* 일기장 느낌의 타이틀 */}
            <div className="relative inline-block mb-6">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-700 via-orange-600 to-rose-600 dark:from-amber-400 dark:via-orange-400 dark:to-rose-400 bg-clip-text text-transparent" style={{ fontFamily: "'Gowun Batang', serif" }}>
                📔 AI 관찰일지
              </h1>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full" />
            </div>
            
            <p className="text-lg text-amber-800/70 dark:text-amber-200/70 max-w-xl mx-auto mb-8" style={{ fontFamily: "'Gowun Batang', serif" }}>
              매일의 관찰을 기록하고, AI가 전문가 수준의 분석을 제공합니다
            </p>

            {/* 일기장 스타일 단계 표시 */}
            <div className="flex justify-center items-center gap-4 md:gap-8 mb-8">
              {[
                { step: 1, icon: ClipboardList, label: '📝 템플릿 선택' },
                { step: 2, icon: FileText, label: '✍️ 관찰 기록' },
                { step: 3, icon: Brain, label: '🔍 AI 분석' },
              ].map((item, idx) => (
                <div key={item.step} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white/80 dark:bg-slate-800/80 border-2 border-amber-300 dark:border-amber-600 shadow-lg flex items-center justify-center">
                      <item.icon className="w-6 h-6 md:w-7 md:h-7 text-amber-600 dark:text-amber-400" />
                    </div>
                    <span className="text-xs md:text-sm font-medium text-amber-700 dark:text-amber-300 mt-3" style={{ fontFamily: "'Gowun Batang', serif" }}>{item.label}</span>
                  </div>
                  {idx < 2 && (
                    <div className="w-8 md:w-16 h-[2px] bg-gradient-to-r from-amber-300 to-amber-200 mx-2 md:mx-4 mt-[-20px]" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Tab Navigation - 일기장 스타일 */}
        <section className="px-4 pb-12 relative z-10">
          <div className="container mx-auto max-w-3xl">
            <div className="flex justify-center gap-3 mb-8">
              <button
                onClick={() => setActiveTab("new")}
                className={`px-6 py-3 rounded-2xl font-medium transition-all flex items-center gap-2 ${
                  activeTab === "new"
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30'
                    : 'bg-white/80 dark:bg-slate-800/80 text-amber-700 dark:text-amber-300 hover:bg-white dark:hover:bg-slate-700 border-2 border-amber-200 dark:border-amber-700'
                }`}
                style={{ fontFamily: "'Gowun Batang', serif" }}
              >
                <Plus className="w-4 h-4" />
                새 관찰
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`px-6 py-3 rounded-2xl font-medium transition-all flex items-center gap-2 ${
                  activeTab === "history"
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30'
                    : 'bg-white/80 dark:bg-slate-800/80 text-amber-700 dark:text-amber-300 hover:bg-white dark:hover:bg-slate-700 border-2 border-amber-200 dark:border-amber-700'
                }`}
                style={{ fontFamily: "'Gowun Batang', serif" }}
              >
                <FileText className="w-4 h-4" />
                내 기록
                {sessions.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 text-xs">{sessions.length}</span>
                )}
              </button>
            </div>

            {/* New Observation - 일기장 카드 스타일 */}
            {activeTab === "new" && (
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-amber-800 dark:text-amber-300" style={{ fontFamily: "'Gowun Batang', serif" }}>
                    📋 어떤 관찰을 기록하시겠어요?
                  </h2>
                  <p className="text-amber-600/70 dark:text-amber-400/70 text-sm mt-2">템플릿을 선택하면 맞춤 질문이 제공됩니다</p>
                </div>
                {templates.map((template, idx) => (
                  <div
                    key={template.id}
                    onClick={() => startNewSession(template)}
                    className="group relative bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl p-6 border-2 border-amber-200 dark:border-amber-700 hover:border-amber-400 dark:hover:border-amber-500 transition-all cursor-pointer hover:shadow-xl hover:shadow-amber-500/10 hover:-translate-y-1"
                  >
                    <div className="relative flex items-center gap-5">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                        template.template_type === 'basic' 
                          ? 'bg-gradient-to-br from-amber-400 to-orange-400' 
                          : 'bg-gradient-to-br from-rose-400 to-pink-500'
                      } shadow-lg`}>
                        <ClipboardList className="w-8 h-8 text-white" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-bold text-amber-900 dark:text-amber-100" style={{ fontFamily: "'Gowun Batang', serif" }}>
                            {template.name}
                          </h3>
                          {template.template_type === 'detailed' && (
                            <Badge className="bg-gradient-to-r from-rose-500/20 to-pink-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 text-xs">
                              <Star className="w-3 h-3 mr-1" />
                              상세
                            </Badge>
                          )}
                        </div>
                        <p className="text-amber-700/60 dark:text-amber-300/60 text-sm">
                          {getDomainDisplayName(template.domain)} • {template.duration}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className={`px-4 py-2 rounded-xl text-sm font-bold ${
                          isBetaTestPeriod() 
                            ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' 
                            : 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                        }`}>
                          {isBetaTestPeriod() ? (
                            <span className="flex items-center gap-1">
                              <Zap className="w-3 h-3" />
                              무료
                            </span>
                          ) : (
                            template.template_type === 'basic' ? '300원' : '500원'
                          )}
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center group-hover:bg-gradient-to-r group-hover:from-amber-500 group-hover:to-orange-500 transition-all duration-300">
                          <ArrowRight className="w-5 h-5 text-amber-500 group-hover:text-white transition-colors" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* History - 일기장 스타일 */}
            {activeTab === "history" && (
              <>
                {sessions.length === 0 ? (
                  <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl p-12 text-center border-2 border-amber-200 dark:border-amber-700">
                    <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-6">
                      <ClipboardList className="w-10 h-10 text-amber-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-amber-900 dark:text-amber-100 mb-2" style={{ fontFamily: "'Gowun Batang', serif" }}>
                      아직 기록이 없습니다
                    </h3>
                    <p className="text-amber-600/70 dark:text-amber-400/70 mb-8">첫 관찰일지를 작성해보세요</p>
                    <Button 
                      onClick={() => setActiveTab("new")}
                      className="bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:opacity-90 rounded-xl px-6 py-3 h-auto shadow-lg shadow-amber-500/30"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      새 관찰 시작
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-center mb-6">
                      <h2 className="text-xl font-bold text-amber-800 dark:text-amber-300" style={{ fontFamily: "'Gowun Batang', serif" }}>
                        📖 나의 관찰 기록
                      </h2>
                    </div>
                    {sessions.map((session) => {
                      const status = getStatusConfig(session.status);
                      return (
                        <div
                          key={session.id}
                          onClick={() => viewSession(session)}
                          className="group relative bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-2xl p-5 border-2 border-amber-200 dark:border-amber-700 hover:border-amber-400 dark:hover:border-amber-500 transition-all cursor-pointer hover:shadow-lg"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                                session.analysis_data 
                                  ? 'bg-gradient-to-br from-emerald-400 to-teal-400 shadow-lg shadow-emerald-500/30' 
                                  : 'bg-amber-100 dark:bg-amber-900/30'
                              }`}>
                                {session.analysis_data ? (
                                  <CheckCircle2 className="w-7 h-7 text-white" />
                                ) : (
                                  <FileText className="w-7 h-7 text-amber-500" />
                                )}
                              </div>
                              
                              <div>
                                <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-1 text-lg" style={{ fontFamily: "'Gowun Batang', serif" }}>
                                  {session.session_name || '관찰일지'}
                                </h3>
                                <div className="flex items-center gap-4 text-sm text-amber-600/70 dark:text-amber-400/70">
                                  <span className="flex items-center gap-1.5">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(session.created_at).toLocaleDateString('ko-KR')}
                                  </span>
                                  {session.family_member && (
                                    <span className="flex items-center gap-1.5">
                                      <User className="w-4 h-4" />
                                      {session.family_member.name}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                              <Badge className={`${status.bg} ${status.text} border-0 backdrop-blur-sm`}>
                                {status.label}
                              </Badge>
                              <Button 
                                size="sm" 
                                className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-800/50 rounded-xl h-10 px-4"
                              >
                                <Eye className="w-4 h-4 mr-2" />
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
