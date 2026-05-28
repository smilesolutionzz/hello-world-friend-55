import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import BusinessSEO from '@/components/b2b/BusinessSEO';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Building2, Users, AlertTriangle, TrendingDown, TrendingUp, Shield,
  EyeOff, FileDown, Bell, ArrowRight, CheckCircle2, Lock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import BusinessBreadcrumb from '@/components/b2b/BusinessBreadcrumb';
import { useToast } from '@/hooks/use-toast';

interface Institution {
  id: string;
  institution_name: string;
  institution_type: string;
  current_residents: number | null;
}

interface DeptStat {
  department_code: string | null;
  total_employees: number;
  participated_employees: number;
  avg_stress_score: number | null;
  avg_burnout_score: number | null;
  high_risk_count: number | null;
  is_masked: boolean;
}

const B2BHRDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const isDemo = searchParams.get('demo') === '1';
  const [loading, setLoading] = useState(true);
  const [institution, setInstitution] = useState<Institution | null>(null);
  const [deptStats, setDeptStats] = useState<DeptStat[]>([]);
  const [period, setPeriod] = useState<7 | 30 | 90>(30);
  const [demoMode, setDemoMode] = useState(isDemo);

  useEffect(() => {
    loadData();
  }, [period]);

  const loadDemo = () => {
    setInstitution({
      id: 'demo',
      institution_name: '(주)데모 컴퍼니',
      institution_type: '제조업 · 300인',
      current_residents: 312,
    });
    setDeptStats([
      { department_code: '연구개발', total_employees: 64, participated_employees: 48, avg_stress_score: 58, avg_burnout_score: 62, high_risk_count: 7, is_masked: false },
      { department_code: '영업', total_employees: 42, participated_employees: 31, avg_stress_score: 71, avg_burnout_score: 68, high_risk_count: 9, is_masked: false },
      { department_code: '운영', total_employees: 88, participated_employees: 59, avg_stress_score: 49, avg_burnout_score: 44, high_risk_count: 4, is_masked: false },
      { department_code: '인사·총무', total_employees: 18, participated_employees: 14, avg_stress_score: 53, avg_burnout_score: 51, high_risk_count: 2, is_masked: false },
      { department_code: '재무', total_employees: 12, participated_employees: 9, avg_stress_score: 47, avg_burnout_score: 42, high_risk_count: 1, is_masked: false },
      { department_code: '경영지원', total_employees: 4, participated_employees: 3, avg_stress_score: null, avg_burnout_score: null, high_risk_count: null, is_masked: true },
    ]);
    setDemoMode(true);
    setLoading(false);
  };

  const loadData = async () => {
    setLoading(true);
    try {
      if (isDemo) { loadDemo(); return; }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { loadDemo(); return; }

      const { data: inst } = await supabase
        .from('b2b_partner_institutions')
        .select('id, institution_name, institution_type, current_residents')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!inst) { loadDemo(); return; }
      setInstitution(inst);
      setDemoMode(false);

      const { data: stats, error } = await supabase.rpc('get_department_aggregated_stats', {
        p_institution_id: inst.id,
        p_period_days: period,
      });

      if (error) throw error;
      setDeptStats((stats as DeptStat[]) || []);
    } catch (e) {
      console.error(e);
      toast({ title: '데이터 로딩 실패', description: '데모 데이터로 표시합니다.', variant: 'destructive' });
      loadDemo();
    } finally {
      setLoading(false);
    }
  };

  const totalEmployees = deptStats.reduce((sum, d) => sum + d.total_employees, 0);
  const totalParticipated = deptStats.reduce((sum, d) => sum + d.participated_employees, 0);
  const totalHighRisk = deptStats.reduce((sum, d) => sum + (d.high_risk_count || 0), 0);
  const participationRate = totalEmployees > 0 ? Math.round((totalParticipated / totalEmployees) * 100) : 0;

  const getRiskColor = (score: number | null) => {
    if (score == null) return 'text-muted-foreground';
    if (score >= 70) return 'text-red-600';
    if (score >= 50) return 'text-amber-600';
    return 'text-emerald-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
        <div className="max-w-6xl mx-auto space-y-4">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!institution) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
          <CardHeader>
            <Building2 className="w-10 h-10 text-primary mb-2" />
            <CardTitle>아직 등록된 기관이 없어요</CardTitle>
            <CardDescription>
              HR 대시보드를 사용하려면 먼저 회사를 등록하고 임직원을 초대해야 합니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full" onClick={() => navigate('/b2b-jobcoach')}>
              기업 잡코치 도입 신청 <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
            <Button variant="outline" className="w-full" onClick={() => navigate('/b2b-demo-report')}>
              샘플 리포트 먼저 보기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <BusinessBreadcrumb current="HR 대시보드" />
      <div className="p-4 md:p-6">
      <BusinessSEO
        title="HR 대시보드 — AIHPRO 잡코치"
        description="임직원 정신건강 부서별 익명 집계, 위험군 알림, ROI 추정을 한 화면에서."
        path="/b2b-hr-dashboard"
      />

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Badge variant="outline" className="mb-2 gap-1">
              <Shield className="w-3 h-3" /> HR 전용 · 익명 집계 모드
            </Badge>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              {institution.institution_name} 임직원 정신건강 대시보드
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              직원 데이터는 부서별 5명 이상일 때만 익명 집계로 표시됩니다
            </p>
          </div>
          <div className="flex gap-2">
            {[7, 30, 90].map((d) => (
              <Button
                key={d}
                size="sm"
                variant={period === d ? 'default' : 'outline'}
                onClick={() => setPeriod(d as 7 | 30 | 90)}
              >
                {d}일
              </Button>
            ))}
          </div>
        </div>

        {demoMode && (
          <Alert className="border-amber-200 bg-amber-50/60">
            <Sparkles className="h-4 w-4 text-amber-700" />
            <AlertTitle className="text-amber-900">체험 모드 · 가상 데이터</AlertTitle>
            <AlertDescription className="text-amber-800 text-sm flex flex-wrap items-center gap-2">
              지금 보고 있는 화면은 시연용 가상 회사 데이터입니다. 실제 도입 시 우리 회사 데이터로 즉시 채워집니다.
              <Button size="sm" variant="outline" className="ml-1 h-7" onClick={() => navigate('/b2b-jobcoach')}>
                도입 상담 신청 <ArrowRight className="w-3 h-3 ml-1" />
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Privacy Notice */}
        <Alert className="border-emerald-200 bg-emerald-50/50">
          <EyeOff className="h-4 w-4 text-emerald-700" />
          <AlertTitle className="text-emerald-900">개인 식별 불가 · 법적 안전</AlertTitle>
          <AlertDescription className="text-emerald-800 text-sm">
            기본적으로 모든 데이터는 익명 처리되며, 5명 미만 부서는 자동 마스킹됩니다.
            직원이 명시적으로 '실명 공유'에 동의한 경우에만 EAP 담당자가 개별 코칭을 배정할 수 있습니다.
          </AlertDescription>
        </Alert>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-4">
              <Users className="w-5 h-5 text-blue-600 mb-2" />
              <p className="text-xs text-muted-foreground">전체 임직원</p>
              <p className="text-2xl font-bold">{totalEmployees}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mb-2" />
              <p className="text-xs text-muted-foreground">참여율</p>
              <p className="text-2xl font-bold">{participationRate}%</p>
              <p className="text-[10px] text-muted-foreground mt-1">{totalParticipated}명 활동</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <AlertTriangle className="w-5 h-5 text-amber-600 mb-2" />
              <p className="text-xs text-muted-foreground">고위험군</p>
              <p className="text-2xl font-bold text-amber-700">{totalHighRisk}명</p>
              <p className="text-[10px] text-muted-foreground mt-1">즉시 케어 권장</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <TrendingDown className="w-5 h-5 text-emerald-600 mb-2" />
              <p className="text-xs text-muted-foreground">예상 ROI</p>
              <p className="text-2xl font-bold text-emerald-700">
                {totalEmployees > 0 ? `+${Math.round((totalEmployees * 50000 * 0.15) / 10000)}만원` : '—'}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">월간 생산성 절감</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="heatmap" className="w-full">
          <TabsList>
            <TabsTrigger value="heatmap">부서별 히트맵</TabsTrigger>
            <TabsTrigger value="alerts">위험 알림</TabsTrigger>
            <TabsTrigger value="actions">권장 액션</TabsTrigger>
          </TabsList>

          {/* Heatmap */}
          <TabsContent value="heatmap" className="space-y-3">
            {deptStats.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  아직 참여한 임직원이 없습니다. 가입 코드를 직원에게 공유하세요.
                </CardContent>
              </Card>
            ) : (
              deptStats.map((d, i) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold">{d.department_code || '미분류'}</p>
                        <p className="text-xs text-muted-foreground">
                          {d.total_employees}명 중 {d.participated_employees}명 참여
                        </p>
                      </div>
                      {d.is_masked && (
                        <Badge variant="outline" className="gap-1 text-xs">
                          <Lock className="w-3 h-3" /> 5명 미만 마스킹
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-3 mt-3">
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase">스트레스</p>
                        <p className={`text-lg font-bold ${getRiskColor(d.avg_stress_score)}`}>
                          {d.avg_stress_score ?? '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase">번아웃</p>
                        <p className={`text-lg font-bold ${getRiskColor(d.avg_burnout_score)}`}>
                          {d.avg_burnout_score ?? '—'}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase">고위험</p>
                        <p className="text-lg font-bold text-red-600">
                          {d.high_risk_count ?? '—'}{!d.is_masked && '명'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Alerts */}
          <TabsContent value="alerts">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Bell className="w-4 h-4 text-amber-600" /> 실시간 위험 알림
                </CardTitle>
                <CardDescription>
                  자살·번아웃 위험 감지 시 즉시 표시 (직원 동의 없이도, 익명 처리)
                </CardDescription>
              </CardHeader>
              <CardContent>
                {totalHighRisk === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    현재 위험 신호 없음 ✓
                  </p>
                ) : (
                  <div className="space-y-2">
                    <Alert className="border-amber-200 bg-amber-50/50">
                      <AlertTriangle className="h-4 w-4 text-amber-700" />
                      <AlertTitle className="text-amber-900">{totalHighRisk}명의 고위험군 감지</AlertTitle>
                      <AlertDescription className="text-amber-800">
                        익명 1:1 코칭 자동 배정 시스템이 가동 중입니다. EAP 담당자에게 메시지를 보내거나 부서 관리자와 면담을 권장하세요.
                      </AlertDescription>
                    </Alert>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Actions */}
          <TabsContent value="actions">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">AI 추천 Top 3 액션</CardTitle>
                <CardDescription>이 달의 데이터 기반 우선순위</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { rank: 1, title: '고위험 부서 익명 1:1 코칭 캠페인', desc: '7일간 자율 참여 코칭 슬롯 5개 확보', impact: '이직률 -12%' },
                  { rank: 2, title: '리더 1on1 가이드 메일 발송', desc: '번아웃 점수 상위 3개 부서 리더 대상', impact: '참여율 +25%' },
                  { rank: 3, title: '월간 마음건강 워크숍 예약', desc: '외부 전문가 초청 (90분)', impact: '스트레스 -18%' },
                ].map((a) => (
                  <div key={a.rank} className="flex gap-3 p-3 rounded-lg border bg-card">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0">
                      {a.rank}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{a.title}</p>
                      <p className="text-xs text-muted-foreground">{a.desc}</p>
                    </div>
                    <Badge variant="outline" className="text-emerald-700 border-emerald-200 shrink-0 self-start">
                      <TrendingUp className="w-3 h-3 mr-1" /> {a.impact}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Bottom CTA */}
        <Card className="bg-gradient-to-br from-primary/5 to-blue-50">
          <CardContent className="p-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold">월간 종합 PDF 리포트</p>
              <p className="text-sm text-muted-foreground">경영진 보고용 자동 생성 (이사회·노사협의회 제출 가능)</p>
            </div>
            <Button onClick={() => navigate('/b2b-demo-report')} className="gap-2">
              <FileDown className="w-4 h-4" /> 리포트 다운로드
            </Button>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
};

export default B2BHRDashboard;
