import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp, TrendingDown, Minus, Sparkles, Calendar,
  Activity, Target, ArrowRight, FileText, AlertCircle, Compass,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend,
} from 'recharts';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import CoachingBadge from '@/components/branding/CoachingBadge';
import MindTrackProgressWidget from '@/components/mind-track/MindTrackProgressWidget';
import MindTrackMilestoneReportFlow from '@/components/mind-track/MindTrackMilestoneReportFlow';

interface ReportPoint {
  id: string;
  created_at: string;
  report_number: number;
  overall_score: number | null;
  risk_level: string | null;
  dimension_scores: any;
  data_source_counts: any;
  data_span_days: number | null;
  report_data: any;
}

const RISK_RANK: Record<string, number> = { low: 1, medium: 2, high: 3, critical: 4 };

/**
 * 종단 추적 대시보드 (My Journey)
 * 사용자의 모든 프리미엄 리포트를 시간축으로 비교 분석.
 * - 종합 점수 라인 차트
 * - 차원별(인지/정서/행동 등) 변화 추이
 * - RCI 기반 통계적 변화 판정 (Reliable Change Index)
 * - 다음 권장 재검사 시점 안내
 */
const MyJourney: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState<ReportPoint[]>([]);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setAuthChecked(true);
      if (!user) {
        setLoading(false);
        return;
      }
      const { data, error } = await supabase
        .from('premium_report_history')
        .select('id, created_at, report_number, overall_score, risk_level, dimension_scores, data_source_counts, data_span_days, report_data')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })
        .limit(50);

      if (error) {
        toast({ title: '리포트를 불러오지 못했어요', description: error.message, variant: 'destructive' });
      } else {
        setReports((data as ReportPoint[]) || []);
      }
      setLoading(false);
    };
    load();
  }, [toast]);

  // ─── 차트 데이터 변환 ───
  const chartData = useMemo(() => {
    return reports.map((r, i) => ({
      idx: i + 1,
      label: `#${r.report_number || i + 1}`,
      date: new Date(r.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
      overall: r.overall_score ?? 0,
      risk: r.risk_level ? RISK_RANK[r.risk_level] : 0,
    }));
  }, [reports]);

  // ─── RCI 기반 변화 판정 (간이 산출) ───
  // RCI = (X2 - X1) / SEM, SEM = SD * sqrt(1 - reliability), reliability=0.85 가정
  const rciAnalysis = useMemo(() => {
    if (reports.length < 2) return null;
    const first = reports[0];
    const last = reports[reports.length - 1];
    const x1 = first.overall_score ?? 0;
    const x2 = last.overall_score ?? 0;
    const SD = 15; // 표준편차 가정 (T-score 기준)
    const reliability = 0.85;
    const SEM = SD * Math.sqrt(1 - reliability);
    const SEdiff = SEM * Math.sqrt(2);
    const rci = SEdiff > 0 ? (x2 - x1) / SEdiff : 0;
    const days = Math.round(
      (new Date(last.created_at).getTime() - new Date(first.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );

    let verdict: 'improved' | 'stable' | 'declined' = 'stable';
    if (rci >= 1.96) verdict = 'improved';
    else if (rci <= -1.96) verdict = 'declined';

    return { rci, verdict, x1, x2, delta: x2 - x1, days, count: reports.length };
  }, [reports]);

  // ─── 다음 권장 재검사 일정 ───
  const nextRetest = useMemo(() => {
    if (reports.length === 0) return null;
    const last = reports[reports.length - 1];
    const lastDate = new Date(last.created_at);
    const next = new Date(lastDate);
    next.setMonth(next.getMonth() + 3);
    const today = new Date();
    const daysLeft = Math.round((next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return { date: next, daysLeft, isOverdue: daysLeft < 0 };
  }, [reports]);

  // ─── 차원별 누적 데이터 ───
  const dimensionTrend = useMemo(() => {
    return reports.map((r, i) => {
      const dims = (r.dimension_scores || {}) as Record<string, number>;
      return {
        label: `#${r.report_number || i + 1}`,
        ...dims,
      };
    });
  }, [reports]);

  const dimensionKeys = useMemo(() => {
    const keys = new Set<string>();
    reports.forEach(r => {
      Object.keys((r.dimension_scores || {}) as Record<string, number>).forEach(k => keys.add(k));
    });
    return Array.from(keys).slice(0, 5);
  }, [reports]);

  const dimensionColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  // ─── 미인증 ───
  if (authChecked && !loading && reports.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <UnifiedNavigation />
        <div className="container mx-auto px-4 pt-28 pb-20 max-w-3xl">
          <CoachingBadge variant="card" className="mb-6" />
          <Card className="p-8 text-center border-2 border-dashed border-slate-200">
            <Compass className="w-12 h-12 mx-auto text-slate-300 mb-4" />
            <h2 className="text-xl font-bold text-slate-900 mb-2 break-keep">아직 종단 분석할 리포트가 없어요</h2>
            <p className="text-sm text-slate-500 mb-6 break-keep">
              프리미엄 리포트를 2개 이상 생성하면<br />변화 추이를 통계적으로 분석해드립니다.
            </p>
            <Button onClick={() => navigate('/report-generator-pro')} className="gap-2">
              <FileText className="w-4 h-4" />
              첫 리포트 생성하기
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <UnifiedNavigation />
        <div className="container mx-auto px-4 pt-28 pb-20 max-w-5xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-64 bg-slate-100 rounded" />
            <div className="h-64 bg-slate-100 rounded-2xl" />
            <div className="h-48 bg-slate-100 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  const verdictMeta = {
    improved: { label: '통계적으로 의미 있는 향상', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', icon: TrendingUp },
    stable: { label: '안정적 유지', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', icon: Minus },
    declined: { label: '주의 필요한 변화', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', icon: TrendingDown },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50/40">
      <UnifiedNavigation />
      <div className="container mx-auto px-4 pt-24 pb-20 max-w-5xl">
        <MindTrackProgressWidget />
        {/* 헤더 */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <CoachingBadge variant="card" className="mb-4" />
          <div className="flex items-center gap-2 mb-2">
            <Compass className="w-5 h-5 text-primary" />
            <span className="text-xs font-bold text-primary uppercase tracking-wider">My Journey</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 mb-2 break-keep">
            나의 종단 추적 대시보드
          </h1>
          <p className="text-sm sm:text-base text-slate-600 break-keep">
            총 <strong className="text-slate-900">{reports.length}개</strong>의 리포트를 시간축으로 비교 분석합니다.
            RCI(신뢰변화지수) 기반 통계적 변화 판정을 제공합니다.
          </p>
        </motion.div>

        {/* RCI 변화 판정 카드 */}
        {rciAnalysis && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <Card className={`border-2 ${verdictMeta[rciAnalysis.verdict].bg} p-5 sm:p-6`}>
              <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
                <div className="flex items-center gap-2">
                  {React.createElement(verdictMeta[rciAnalysis.verdict].icon, {
                    className: `w-5 h-5 ${verdictMeta[rciAnalysis.verdict].color}`,
                  })}
                  <h3 className={`text-base sm:text-lg font-bold ${verdictMeta[rciAnalysis.verdict].color} break-keep`}>
                    {verdictMeta[rciAnalysis.verdict].label}
                  </h3>
                </div>
                <Badge variant="outline" className="text-[10px]">RCI = {rciAnalysis.rci.toFixed(2)}</Badge>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Stat label="첫 리포트" value={`${rciAnalysis.x1}점`} />
                <Stat label="최신 리포트" value={`${rciAnalysis.x2}점`} />
                <Stat
                  label="변화량"
                  value={`${rciAnalysis.delta > 0 ? '+' : ''}${rciAnalysis.delta}점`}
                  highlight={rciAnalysis.delta !== 0}
                />
                <Stat label="추적 기간" value={`${rciAnalysis.days}일`} />
              </div>
              <p className="text-[11px] sm:text-xs text-slate-600 mt-4 leading-relaxed break-keep">
                ※ RCI(Reliable Change Index, Jacobson & Truax 1991)는 측정오차를 고려한 통계적 변화 판정 지수입니다.
                |RCI| ≥ 1.96이면 95% 신뢰수준에서 유의미한 변화로 간주됩니다.
              </p>
            </Card>
          </motion.div>
        )}

        {/* 종합 점수 추이 차트 */}
        {chartData.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="mb-6"
          >
            <Card className="p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-1">
                <Activity className="w-4 h-4 text-primary" />
                <h3 className="text-base sm:text-lg font-bold text-slate-900">종합 점수 변화 추이</h3>
              </div>
              <p className="text-xs text-slate-500 mb-4 break-keep">
                각 리포트의 종합 점수를 시간순으로 비교합니다.
              </p>
              <div className="h-64 sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="label" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        background: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        fontSize: '12px',
                      }}
                      formatter={(v: number) => [`${v}점`, '종합 점수']}
                      labelFormatter={(_, payload) => payload?.[0]?.payload?.date || ''}
                    />
                    <ReferenceLine y={70} stroke="#94a3b8" strokeDasharray="3 3" label={{ value: '기준선', fontSize: 10, fill: '#94a3b8' }} />
                    <Line
                      type="monotone"
                      dataKey="overall"
                      stroke="hsl(var(--primary))"
                      strokeWidth={3}
                      dot={{ r: 5, fill: 'hsl(var(--primary))' }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>
        )}

        {/* 차원별 변화 차트 */}
        {dimensionKeys.length > 0 && dimensionTrend.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6"
          >
            <Card className="p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4 text-primary" />
                <h3 className="text-base sm:text-lg font-bold text-slate-900">영역별 세부 변화</h3>
              </div>
              <p className="text-xs text-slate-500 mb-4 break-keep">
                인지·정서·행동 등 영역별 점수를 함께 추적합니다.
              </p>
              <div className="h-64 sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dimensionTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="label" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        background: 'white',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    {dimensionKeys.map((key, i) => (
                      <Line
                        key={key}
                        type="monotone"
                        dataKey={key}
                        stroke={dimensionColors[i % dimensionColors.length]}
                        strokeWidth={2}
                        dot={{ r: 3 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>
        )}

        {/* 다음 재검사 권장 */}
        {nextRetest && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mb-6"
          >
            <Card className={`p-5 border-2 ${nextRetest.isOverdue ? 'border-amber-300 bg-amber-50' : 'border-blue-200 bg-blue-50/50'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${nextRetest.isOverdue ? 'bg-amber-100' : 'bg-blue-100'}`}>
                  {nextRetest.isOverdue ? <AlertCircle className="w-5 h-5 text-amber-700" /> : <Calendar className="w-5 h-5 text-blue-700" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold break-keep ${nextRetest.isOverdue ? 'text-amber-900' : 'text-blue-900'}`}>
                    {nextRetest.isOverdue
                      ? `재검사 권장 시기가 ${Math.abs(nextRetest.daysLeft)}일 지났어요`
                      : `다음 권장 재검사: ${Math.abs(nextRetest.daysLeft)}일 후`}
                  </p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    {nextRetest.date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <Button size="sm" onClick={() => navigate('/report-generator-pro')} className="gap-1.5 flex-shrink-0">
                  <Sparkles className="w-3.5 h-3.5" />
                  재검사
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {/* 리포트 타임라인 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-4 h-4 text-primary" />
              <h3 className="text-base sm:text-lg font-bold text-slate-900">리포트 타임라인</h3>
            </div>
            <div className="space-y-3">
              {[...reports].reverse().map((r, i) => (
                <div
                  key={r.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                    #{r.report_number || reports.length - i}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      종합 {r.overall_score ?? '—'}점
                      {r.risk_level && (
                        <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          위험도 {r.risk_level}
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {new Date(r.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' })}
                      {r.data_span_days && ` · ${r.data_span_days}일치 데이터`}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => navigate(`/report-generator-pro?id=${r.id}`)}
                    className="text-xs"
                  >
                    보기 <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

const Stat: React.FC<{ label: string; value: string; highlight?: boolean }> = ({ label, value, highlight }) => (
  <div className="rounded-xl bg-white/70 p-3">
    <p className="text-[10px] text-slate-500 font-medium mb-0.5">{label}</p>
    <p className={`text-lg font-bold ${highlight ? 'text-primary' : 'text-slate-800'}`}>{value}</p>
  </div>
);

export default MyJourney;
