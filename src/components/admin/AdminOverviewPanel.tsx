import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Users, CreditCard, FileText, TrendingUp, Brain, 
  CheckCircle, XCircle, Clock, Activity, BarChart3,
  ArrowUpRight, ArrowDownRight, Minus
} from 'lucide-react';
import { format } from 'date-fns';

interface OverviewStats {
  totalUsers: number;
  todayUsers: number;
  weekUsers: number;
  monthUsers: number;
  totalTests: number;
  weekTests: number;
  totalReports: number;
  weekReports: number;
  totalObservations: number;
  totalAiObs: number;
  totalCoaching: number;
  paidSubscribers: number;
  activeSubscribers: number;
  cancelledSubscribers: number;
  lifetimeSubscribers: number;
  totalRevenue: number;
}

interface RecentActivity {
  type: 'signup' | 'test' | 'report' | 'subscription';
  user_name: string;
  user_id: string;
  detail: string;
  created_at: string;
}

interface PaidUser {
  user_id: string;
  display_name: string | null;
  email: string | null;
  phone: string | null;
  subscription_type: string;
  payment_method: string | null;
  status: string;
  is_lifetime: boolean;
  current_period_end: string | null;
  created_at: string;
  current_tokens: number;
  test_count: number;
  report_count: number;
}

const VERIFIED_PARTNER_INSTITUTION_COUNT = 47;

export function AdminOverviewPanel() {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [paidUsers, setPaidUsers] = useState<PaidUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([loadStats(), loadRecentActivities(), loadPaidUsers()]);
    setLoading(false);
  };

  const loadStats = async () => {
    try {
      const now = new Date();
      const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
      const weekStart = new Date(now); weekStart.setDate(now.getDate() - 7);
      const monthStart = new Date(now); monthStart.setDate(now.getDate() - 30);

      const [
        { count: totalUsers },
        { count: todayUsers },
        { count: weekUsers },
        { count: monthUsers },
        { count: totalTests },
        { count: weekTests },
        { count: totalReports },
        { count: weekReports },
        { count: totalObservations },
        { count: totalAiObs },
        { count: totalCoaching },
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', todayStart.toISOString()),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', weekStart.toISOString()),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', monthStart.toISOString()),
        supabase.from('test_results').select('*', { count: 'exact', head: true }),
        supabase.from('test_results').select('*', { count: 'exact', head: true }).gte('created_at', weekStart.toISOString()),
        supabase.from('assessment_enhanced_analysis').select('*', { count: 'exact', head: true }),
        supabase.from('assessment_enhanced_analysis').select('*', { count: 'exact', head: true }).gte('created_at', weekStart.toISOString()),
        supabase.from('observation_logs').select('*', { count: 'exact', head: true }),
        supabase.from('ai_observation_results').select('*', { count: 'exact', head: true }),
        supabase.from('ai_coaching_sessions').select('*', { count: 'exact', head: true }),
      ]);

      // Subscription stats
      const { data: subData } = await supabase
        .from('user_subscriptions')
        .select('subscription_type, status, is_lifetime');
      
      const paid = (subData || []).filter(s => s.subscription_type !== 'free');
      const active = paid.filter(s => s.status === 'active');
      const cancelled = paid.filter(s => s.status === 'cancelled');
      const lifetime = paid.filter(s => s.is_lifetime);

      setStats({
        totalUsers: totalUsers || 0,
        todayUsers: todayUsers || 0,
        weekUsers: weekUsers || 0,
        monthUsers: monthUsers || 0,
        totalTests: totalTests || 0,
        weekTests: weekTests || 0,
        totalReports: totalReports || 0,
        weekReports: weekReports || 0,
        totalObservations: totalObservations || 0,
        totalAiObs: totalAiObs || 0,
        totalCoaching: totalCoaching || 0,
        paidSubscribers: paid.length,
        activeSubscribers: active.length,
        cancelledSubscribers: cancelled.length,
        lifetimeSubscribers: lifetime.length,
        totalRevenue: 0,
      });
    } catch (e) {
      console.error('Stats error:', e);
    }
  };

  const loadRecentActivities = async () => {
    try {
      // Recent signups
      const { data: signups } = await supabase
        .from('profiles')
        .select('user_id, display_name, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      // Recent tests
      const { data: tests } = await supabase
        .from('test_results')
        .select('user_id, test_type_id, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      // Recent reports
      const { data: reports } = await supabase
        .from('assessment_enhanced_analysis')
        .select('user_id, assessment_type, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      // Get profile names for test/report users
      const allUserIds = [
        ...(tests || []).map(t => t.user_id),
        ...(reports || []).map(r => r.user_id),
      ].filter(Boolean);
      
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name')
        .in('user_id', [...new Set(allUserIds)]);

      const nameMap = new Map((profiles || []).map(p => [p.user_id, p.display_name]));

      const activities: RecentActivity[] = [
        ...(signups || []).map(s => ({
          type: 'signup' as const,
          user_name: s.display_name || '미설정',
          user_id: s.user_id,
          detail: '신규 가입',
          created_at: s.created_at,
        })),
        ...(tests || []).map(t => ({
          type: 'test' as const,
          user_name: nameMap.get(t.user_id) || '미설정',
          user_id: t.user_id,
          detail: `검사 완료: ${t.test_type_id || '심리검사'}`,
          created_at: t.created_at,
        })),
        ...(reports || []).map(r => ({
          type: 'report' as const,
          user_name: nameMap.get(r.user_id) || '미설정',
          user_id: r.user_id || '',
          detail: `리포트 생성: ${r.assessment_type || '종합분석'}`,
          created_at: r.created_at,
        })),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
       .slice(0, 15);

      setRecentActivities(activities);
    } catch (e) {
      console.error('Activities error:', e);
    }
  };

  const loadPaidUsers = async () => {
    try {
      const { data: subs } = await supabase
        .from('user_subscriptions')
        .select('user_id, subscription_type, payment_method, status, is_lifetime, current_period_end, created_at')
        .neq('subscription_type', 'free')
        .order('created_at', { ascending: false });

      if (!subs || subs.length === 0) { setPaidUsers([]); return; }

      const userIds = [...new Set(subs.map(s => s.user_id))];
      const [{ data: profiles }, { data: tokens }] = await Promise.all([
        supabase.from('profiles').select('user_id, display_name, email, phone').in('user_id', userIds),
        supabase.from('user_tokens').select('user_id, current_tokens').in('user_id', userIds),
      ]);

      // Get test & report counts per user
      const testCounts: Record<string, number> = {};
      const reportCounts: Record<string, number> = {};
      
      for (const uid of userIds) {
        const { count: tc } = await supabase.from('test_results').select('*', { count: 'exact', head: true }).eq('user_id', uid);
        const { count: rc } = await supabase.from('assessment_enhanced_analysis').select('*', { count: 'exact', head: true }).eq('user_id', uid);
        testCounts[uid] = tc || 0;
        reportCounts[uid] = rc || 0;
      }

      const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));
      const tokenMap = new Map((tokens || []).map(t => [t.user_id, t.current_tokens]));

      setPaidUsers(subs.map(s => ({
        ...s,
        display_name: profileMap.get(s.user_id)?.display_name || null,
        email: profileMap.get(s.user_id)?.email || null,
        phone: profileMap.get(s.user_id)?.phone || null,
        current_tokens: tokenMap.get(s.user_id) || 0,
        test_count: testCounts[s.user_id] || 0,
        report_count: reportCounts[s.user_id] || 0,
      })));
    } catch (e) {
      console.error('Paid users error:', e);
    }
  };

  const formatRelative = (d: string) => {
    const diff = Date.now() - new Date(d).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return '방금';
    if (min < 60) return `${min}분 전`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}시간 전`;
    const day = Math.floor(hr / 24);
    if (day < 7) return `${day}일 전`;
    return format(new Date(d), 'MM.dd');
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'signup': return <div className="h-7 w-7 rounded-full bg-blue-50 flex items-center justify-center"><Users className="h-3.5 w-3.5 text-blue-600" /></div>;
      case 'test': return <div className="h-7 w-7 rounded-full bg-violet-50 flex items-center justify-center"><Brain className="h-3.5 w-3.5 text-violet-600" /></div>;
      case 'report': return <div className="h-7 w-7 rounded-full bg-emerald-50 flex items-center justify-center"><FileText className="h-3.5 w-3.5 text-emerald-600" /></div>;
      case 'subscription': return <div className="h-7 w-7 rounded-full bg-amber-50 flex items-center justify-center"><CreditCard className="h-3.5 w-3.5 text-amber-600" /></div>;
      default: return <div className="h-7 w-7 rounded-full bg-gray-50 flex items-center justify-center"><Activity className="h-3.5 w-3.5 text-gray-400" /></div>;
    }
  };

  const isExpired = (d: string | null) => d ? new Date(d) < new Date() : false;

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-xl" />)}
        </div>
        <div className="h-96 bg-gray-100 rounded-xl" />
      </div>
    );
  }

  const s = stats!;

  return (
    <div className="space-y-6">
      {/* KPI Grid - 2 rows */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Row 1: Users & Growth */}
        <StatCard 
          label="전체 사용자" 
          value={s.totalUsers} 
          sub={`오늘 +${s.todayUsers} · 주간 +${s.weekUsers} · 월간 +${s.monthUsers}`} 
          icon={Users} 
          color="blue" 
        />
        <StatCard 
          label="유료 구독자" 
          value={s.paidSubscribers}
          sub={`활성 ${s.activeSubscribers} · 취소 ${s.cancelledSubscribers} · 평생 ${s.lifetimeSubscribers}`}
          icon={CreditCard}
          color="amber"
        />
        <StatCard 
          label="총 검사 수" 
          value={s.totalTests}
          sub={`최근 7일 +${s.weekTests}`}
          icon={Brain}
          color="violet"
        />
        <StatCard 
          label="리포트 생성" 
          value={s.totalReports}
          sub={`최근 7일 +${s.weekReports}`}
          icon={FileText}
          color="emerald"
        />

        {/* Row 2: Feature Usage */}
        <StatCard 
          label="관찰일지" 
          value={s.totalObservations}
          sub="사용자 기록 총합"
          icon={BarChart3}
          color="pink"
        />
        <StatCard 
          label="AI 관찰 분석" 
          value={s.totalAiObs}
          sub="AI 분석 건수"
          icon={Activity}
          color="cyan"
        />
        <StatCard 
          label="AI 코칭" 
          value={s.totalCoaching}
          sub="코칭 세션 수"
          icon={TrendingUp}
          color="orange"
        />
        <StatCard 
          label="전환율" 
          value={s.totalUsers > 0 ? `${((s.paidSubscribers / s.totalUsers) * 100).toFixed(1)}%` : '0%'}
          sub={`${s.totalUsers}명 중 ${s.paidSubscribers}명 유료`}
          icon={ArrowUpRight}
          color="indigo"
          isText
        />
      </div>

      {/* Two column layout: Activity Feed + Paid Users */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Recent Activity Feed */}
        <div className="lg:col-span-2 border border-gray-100 rounded-xl">
          <div className="px-4 py-3 border-b border-gray-50">
            <h3 className="text-sm font-semibold text-gray-900">실시간 활동</h3>
            <p className="text-[11px] text-gray-400 mt-0.5">최근 가입 · 검사 · 리포트</p>
          </div>
          <div className="divide-y divide-gray-50 max-h-[480px] overflow-y-auto">
            {recentActivities.map((act, i) => (
              <div key={i} className="px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50/50 transition-colors">
                {getActivityIcon(act.type)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-gray-900 truncate">{act.user_name}</span>
                    <span className="text-[10px] text-gray-300 font-mono">{act.user_id.slice(0, 6)}</span>
                  </div>
                  <p className="text-[11px] text-gray-500 truncate">{act.detail}</p>
                </div>
                <span className="text-[10px] text-gray-400 whitespace-nowrap">{formatRelative(act.created_at)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Paid Users Table */}
        <div className="lg:col-span-3 border border-gray-100 rounded-xl">
          <div className="px-4 py-3 border-b border-gray-50 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">유료 결제자 현황</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">구독 · 결제 · 활동량 한눈에</p>
            </div>
            <Badge variant="outline" className="text-[10px]">{paidUsers.length}명</Badge>
          </div>
          <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50 border-gray-100">
                  <TableHead className="text-[10px] font-medium text-gray-500 whitespace-nowrap">사용자</TableHead>
                  <TableHead className="text-[10px] font-medium text-gray-500 whitespace-nowrap">이메일/연락처</TableHead>
                  <TableHead className="text-[10px] font-medium text-gray-500 whitespace-nowrap">구독</TableHead>
                  <TableHead className="text-[10px] font-medium text-gray-500 whitespace-nowrap">결제</TableHead>
                  <TableHead className="text-[10px] font-medium text-gray-500 whitespace-nowrap">상태</TableHead>
                  <TableHead className="text-[10px] font-medium text-gray-500 whitespace-nowrap">검사</TableHead>
                  <TableHead className="text-[10px] font-medium text-gray-500 whitespace-nowrap">리포트</TableHead>
                  <TableHead className="text-[10px] font-medium text-gray-500 whitespace-nowrap">캐시</TableHead>
                  <TableHead className="text-[10px] font-medium text-gray-500 whitespace-nowrap">만료일</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paidUsers.map((u, i) => (
                  <TableRow key={`${u.user_id}-${i}`} className="border-gray-50 hover:bg-gray-50/30">
                    <TableCell className="py-2">
                      <div>
                        <div className="text-xs font-medium text-gray-900">{u.display_name || '미설정'}</div>
                        <div className="text-[9px] text-gray-400 font-mono">{u.user_id.slice(0, 10)}...</div>
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="text-[11px] text-gray-600">
                        {u.email && <div>{u.email}</div>}
                        {u.phone && <div className="text-gray-400">{u.phone}</div>}
                        {!u.email && !u.phone && <span className="text-gray-300">-</span>}
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      <SubscriptionBadge type={u.subscription_type} />
                    </TableCell>
                    <TableCell className="py-2">
                      <span className="text-[11px] text-gray-600">
                        {u.payment_method === 'toss' ? '💳 토스' : 
                         u.payment_method === 'free_trial' ? '🎁 체험' :
                         u.payment_method || '-'}
                      </span>
                    </TableCell>
                    <TableCell className="py-2">
                      <StatusDot status={u.status} expired={isExpired(u.current_period_end)} />
                    </TableCell>
                    <TableCell className="py-2">
                      <span className="text-xs font-mono text-gray-700">{u.test_count}</span>
                    </TableCell>
                    <TableCell className="py-2">
                      <span className="text-xs font-mono text-gray-700">{u.report_count}</span>
                    </TableCell>
                    <TableCell className="py-2">
                      <span className="text-xs font-mono text-gray-700">{(u.current_tokens * 100).toLocaleString()}</span>
                    </TableCell>
                    <TableCell className="py-2">
                      {u.current_period_end ? (
                        <div className={`text-[10px] ${isExpired(u.current_period_end) ? 'text-red-500' : 'text-gray-500'}`}>
                          {format(new Date(u.current_period_end), 'yy.MM.dd')}
                          {isExpired(u.current_period_end) && ' ⚠'}
                        </div>
                      ) : <span className="text-[10px] text-gray-300">-</span>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-components
function StatCard({ label, value, sub, icon: Icon, color, isText }: {
  label: string; value: number | string; sub: string; icon: any; color: string; isText?: boolean;
}) {
  const colorMap: Record<string, { bg: string; text: string }> = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
    violet: { bg: 'bg-violet-50', text: 'text-violet-600' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600' },
    pink: { bg: 'bg-pink-50', text: 'text-pink-600' },
    cyan: { bg: 'bg-cyan-50', text: 'text-cyan-600' },
    orange: { bg: 'bg-orange-50', text: 'text-orange-600' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600' },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-3.5 hover:border-gray-200 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">{label}</span>
        <div className={`${c.bg} ${c.text} p-1 rounded-md`}>
          <Icon className="h-3 w-3" />
        </div>
      </div>
      <div className="text-xl font-bold text-gray-900">
        {isText ? value : (typeof value === 'number' ? value.toLocaleString() : value)}
      </div>
      <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{sub}</p>
    </div>
  );
}

function SubscriptionBadge({ type }: { type: string }) {
  switch (type) {
    case 'lifetime': return <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[10px] px-1.5 py-0">평생</Badge>;
    case 'premium': return <Badge className="bg-violet-100 text-violet-800 border-violet-200 text-[10px] px-1.5 py-0">프리미엄</Badge>;
    case 'monthly': return <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-[10px] px-1.5 py-0">월간</Badge>;
    case 'yearly': return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px] px-1.5 py-0">연간</Badge>;
    default: return <Badge variant="outline" className="text-[10px] px-1.5 py-0">{type}</Badge>;
  }
}

function StatusDot({ status, expired }: { status: string; expired: boolean }) {
  if (expired && status === 'active') {
    return <span className="flex items-center gap-1 text-[10px] text-orange-600"><span className="h-1.5 w-1.5 rounded-full bg-orange-400" />만료</span>;
  }
  switch (status) {
    case 'active': return <span className="flex items-center gap-1 text-[10px] text-green-600"><span className="h-1.5 w-1.5 rounded-full bg-green-400" />활성</span>;
    case 'cancelled': return <span className="flex items-center gap-1 text-[10px] text-red-500"><span className="h-1.5 w-1.5 rounded-full bg-red-400" />취소</span>;
    default: return <span className="flex items-center gap-1 text-[10px] text-gray-400"><span className="h-1.5 w-1.5 rounded-full bg-gray-300" />{status}</span>;
  }
}
