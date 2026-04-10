import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import {
  Brain, FileText, Activity, Search, RefreshCw, Eye, MessageSquare,
  Gamepad2, Users, Clock, CheckCircle, Calendar
} from 'lucide-react';
import { format } from 'date-fns';

interface ActivityRecord {
  id: string;
  user_id: string;
  display_name: string | null;
  email: string | null;
  phone: string | null;
  activity_type: string;
  detail: string;
  created_at: string;
  extra?: Record<string, any>;
}

export function AdminUserActivityTracker() {
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [counts, setCounts] = useState({
    tests: 0, reports: 0, observations: 0, coaching: 0,
    brain: 0, consultations: 0, personality: 0, total: 0
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch all activity types in parallel
      const [
        { data: tests },
        { data: reports },
        { data: aiObs },
        { data: coaching },
        { data: brainSessions },
        { data: consultations },
        { data: personality },
        { data: playAssess },
        { data: progressData },
      ] = await Promise.all([
        supabase.from('test_results').select('id, user_id, test_type_id, created_at').order('created_at', { ascending: false }).limit(200),
        supabase.from('assessment_enhanced_analysis').select('id, user_id, assessment_type, risk_level, created_at').order('created_at', { ascending: false }).limit(200),
        supabase.from('ai_observation_results').select('id, user_id, analysis_type, input_type, risk_level, title, created_at').order('created_at', { ascending: false }).limit(200),
        supabase.from('ai_coaching_sessions').select('id, user_id, session_type, session_duration_minutes, completed_at, created_at').order('created_at', { ascending: false }).limit(200),
        supabase.from('brain_training_sessions').select('id, user_id, game_name, game_type, score, max_score, difficulty_level, created_at').order('created_at', { ascending: false }).limit(200),
        supabase.from('consultation_bookings').select('id, user_id, booking_date, start_time, duration_minutes, status, booking_type, created_at').order('created_at', { ascending: false }).limit(200),
        supabase.from('personality_test_results').select('id, user_id, created_at').order('created_at', { ascending: false }).limit(200),
        supabase.from('play_assessment_results').select('id, user_id, created_at').order('created_at', { ascending: false }).limit(200),
        supabase.from('progress_tracking').select('id, user_id, source_type, source_label, created_at').order('created_at', { ascending: false }).limit(200),
      ]);

      // Collect all user IDs
      const allUserIds = new Set<string>();
      [tests, reports, aiObs, coaching, brainSessions, consultations, personality, playAssess, progressData].forEach(arr => {
        (arr || []).forEach((r: any) => r.user_id && allUserIds.add(r.user_id));
      });

      // Fetch profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, display_name, email, phone')
        .in('user_id', [...allUserIds]);
      const pMap = new Map((profiles || []).map(p => [p.user_id, p]));

      const enrich = (userId: string) => ({
        display_name: pMap.get(userId)?.display_name || null,
        email: pMap.get(userId)?.email || null,
        phone: pMap.get(userId)?.phone || null,
      });

      // Build unified activity list
      const allActivities: ActivityRecord[] = [
        ...(tests || []).map(t => ({
          id: t.id, user_id: t.user_id, ...enrich(t.user_id),
          activity_type: 'test',
          detail: `심리검사 완료: ${t.test_type_id || '일반'}`,
          created_at: t.created_at,
        })),
        ...(reports || []).map(r => ({
          id: r.id, user_id: r.user_id || '', ...enrich(r.user_id || ''),
          activity_type: 'report',
          detail: `리포트 생성: ${r.assessment_type || '종합분석'}`,
          created_at: r.created_at,
          extra: { risk_level: r.risk_level },
        })),
        ...(aiObs || []).map(o => ({
          id: o.id, user_id: o.user_id, ...enrich(o.user_id),
          activity_type: 'observation',
          detail: `AI 관찰분석: ${o.title || o.analysis_type} (${o.input_type})`,
          created_at: o.created_at,
          extra: { risk_level: o.risk_level },
        })),
        ...(coaching || []).map(c => ({
          id: c.id, user_id: c.user_id, ...enrich(c.user_id),
          activity_type: 'coaching',
          detail: `AI 코칭: ${c.session_type}${c.session_duration_minutes ? ` (${c.session_duration_minutes}분)` : ''}`,
          created_at: c.created_at,
          extra: { completed: !!c.completed_at },
        })),
        ...(brainSessions || []).map(b => ({
          id: b.id, user_id: b.user_id, ...enrich(b.user_id),
          activity_type: 'brain',
          detail: `두뇌훈련: ${b.game_name} (${b.score}/${b.max_score})`,
          created_at: b.created_at,
          extra: { game_type: b.game_type, difficulty: b.difficulty_level },
        })),
        ...(consultations || []).map(c => ({
          id: c.id, user_id: c.user_id, ...enrich(c.user_id),
          activity_type: 'consultation',
          detail: `상담예약: ${c.booking_type || '일반'} ${c.booking_date} ${c.start_time || ''}`,
          created_at: c.created_at,
          extra: { status: c.status, duration: c.duration_minutes },
        })),
        ...(personality || []).map(p => ({
          id: p.id, user_id: p.user_id, ...enrich(p.user_id),
          activity_type: 'test',
          detail: '성격검사 완료',
          created_at: p.created_at,
        })),
        ...(playAssess || []).map(p => ({
          id: p.id, user_id: p.user_id, ...enrich(p.user_id),
          activity_type: 'test',
          detail: '놀이평가 완료',
          created_at: p.created_at,
        })),
        ...(progressData || []).map(p => ({
          id: p.id, user_id: p.user_id, ...enrich(p.user_id),
          activity_type: 'progress',
          detail: `변화추적: ${(p as any).service_type || '종합'}`,
          created_at: p.created_at,
        })),
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      setActivities(allActivities);
      setCounts({
        tests: (tests?.length || 0) + (personality?.length || 0) + (playAssess?.length || 0),
        reports: reports?.length || 0,
        observations: aiObs?.length || 0,
        coaching: coaching?.length || 0,
        brain: brainSessions?.length || 0,
        consultations: consultations?.length || 0,
        personality: personality?.length || 0,
        total: allActivities.length,
      });
    } catch (e) {
      console.error('Activity load error:', e);
    }
    setLoading(false);
  };

  const filtered = activities.filter(a => {
    const matchesTab = activeTab === 'all' || a.activity_type === activeTab;
    const matchesSearch = !searchTerm ||
      a.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.phone?.includes(searchTerm) ||
      a.detail.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'test': return <Brain className="h-3.5 w-3.5 text-violet-600" />;
      case 'report': return <FileText className="h-3.5 w-3.5 text-emerald-600" />;
      case 'observation': return <Eye className="h-3.5 w-3.5 text-blue-600" />;
      case 'coaching': return <MessageSquare className="h-3.5 w-3.5 text-orange-600" />;
      case 'brain': return <Gamepad2 className="h-3.5 w-3.5 text-pink-600" />;
      case 'consultation': return <Calendar className="h-3.5 w-3.5 text-cyan-600" />;
      case 'progress': return <Activity className="h-3.5 w-3.5 text-indigo-600" />;
      default: return <Activity className="h-3.5 w-3.5 text-gray-400" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const map: Record<string, { label: string; className: string }> = {
      test: { label: '검사', className: 'bg-violet-100 text-violet-800 border-violet-200' },
      report: { label: '리포트', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
      observation: { label: '관찰분석', className: 'bg-blue-100 text-blue-800 border-blue-200' },
      coaching: { label: '코칭', className: 'bg-orange-100 text-orange-800 border-orange-200' },
      brain: { label: '두뇌훈련', className: 'bg-pink-100 text-pink-800 border-pink-200' },
      consultation: { label: '상담', className: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
      progress: { label: '변화추적', className: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    };
    const m = map[type] || { label: type, className: '' };
    return <Badge className={`${m.className} text-[10px] px-1.5 py-0`}>{m.label}</Badge>;
  };

  const getRiskBadge = (risk?: string) => {
    if (!risk) return null;
    switch (risk) {
      case 'high': return <Badge className="bg-red-100 text-red-700 border-red-200 text-[10px] px-1.5 py-0">고위험</Badge>;
      case 'medium': return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 text-[10px] px-1.5 py-0">중간</Badge>;
      case 'low': return <Badge className="bg-green-100 text-green-700 border-green-200 text-[10px] px-1.5 py-0">저위험</Badge>;
      default: return <Badge variant="outline" className="text-[10px] px-1.5 py-0">{risk}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 lg:grid-cols-7 gap-2">
        {[
          { label: '검사', count: counts.tests, icon: Brain, color: 'violet' },
          { label: '리포트', count: counts.reports, icon: FileText, color: 'emerald' },
          { label: '관찰분석', count: counts.observations, icon: Eye, color: 'blue' },
          { label: '코칭', count: counts.coaching, icon: MessageSquare, color: 'orange' },
          { label: '두뇌훈련', count: counts.brain, icon: Gamepad2, color: 'pink' },
          { label: '상담', count: counts.consultations, icon: Calendar, color: 'cyan' },
          { label: '전체', count: counts.total, icon: Activity, color: 'gray' },
        ].map(({ label, count, icon: Icon, color }) => (
          <Card key={label} className="border-gray-100">
            <CardContent className="p-3 text-center">
              <Icon className={`h-4 w-4 mx-auto mb-1 text-${color}-500`} />
              <p className="text-lg font-bold">{count}</p>
              <p className="text-[10px] text-gray-500">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input placeholder="이름, 이메일, 전화번호, 활동내용 검색..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-9 h-9 text-sm" />
        </div>
        <Button variant="ghost" size="sm" onClick={loadData} className="h-9"><RefreshCw className="h-3.5 w-3.5" /></Button>
      </div>

      {/* Tab filters */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-50 border border-gray-100 h-auto flex-wrap">
          <TabsTrigger value="all" className="text-[11px] px-2.5 py-1">전체 ({counts.total})</TabsTrigger>
          <TabsTrigger value="test" className="text-[11px] px-2.5 py-1">검사 ({counts.tests})</TabsTrigger>
          <TabsTrigger value="report" className="text-[11px] px-2.5 py-1">리포트 ({counts.reports})</TabsTrigger>
          <TabsTrigger value="observation" className="text-[11px] px-2.5 py-1">관찰 ({counts.observations})</TabsTrigger>
          <TabsTrigger value="coaching" className="text-[11px] px-2.5 py-1">코칭 ({counts.coaching})</TabsTrigger>
          <TabsTrigger value="brain" className="text-[11px] px-2.5 py-1">두뇌 ({counts.brain})</TabsTrigger>
          <TabsTrigger value="consultation" className="text-[11px] px-2.5 py-1">상담 ({counts.consultations})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-3">
          <div className="border border-gray-100 rounded-xl overflow-hidden">
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-white">
                  <TableRow className="bg-gray-50/80 border-gray-100">
                    <TableHead className="text-[10px] font-medium text-gray-500">유형</TableHead>
                    <TableHead className="text-[10px] font-medium text-gray-500">사용자</TableHead>
                    <TableHead className="text-[10px] font-medium text-gray-500">이메일</TableHead>
                    <TableHead className="text-[10px] font-medium text-gray-500">연락처</TableHead>
                    <TableHead className="text-[10px] font-medium text-gray-500">활동 내용</TableHead>
                    <TableHead className="text-[10px] font-medium text-gray-500">위험도</TableHead>
                    <TableHead className="text-[10px] font-medium text-gray-500">일시</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 10 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 7 }).map((_, j) => (
                          <TableCell key={j}><div className="h-4 bg-gray-100 rounded animate-pulse" /></TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : filtered.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12 text-gray-400 text-sm">
                        활동 기록이 없습니다
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((a) => (
                      <TableRow key={`${a.activity_type}-${a.id}`} className="border-gray-50 hover:bg-gray-50/50">
                        <TableCell className="py-2">
                          <div className="flex items-center gap-1.5">
                            {getTypeIcon(a.activity_type)}
                            {getTypeBadge(a.activity_type)}
                          </div>
                        </TableCell>
                        <TableCell className="py-2">
                          <div>
                            <div className="text-xs font-medium text-gray-900">{a.display_name || '미설정'}</div>
                            <div className="text-[9px] text-gray-400 font-mono">{a.user_id.slice(0, 10)}...</div>
                          </div>
                        </TableCell>
                        <TableCell className="py-2 text-[11px] text-gray-600">{a.email || '-'}</TableCell>
                        <TableCell className="py-2 text-[11px] text-gray-600">{a.phone || '-'}</TableCell>
                        <TableCell className="py-2">
                          <span className="text-xs text-gray-700">{a.detail}</span>
                          {a.extra?.status && (
                            <Badge variant="outline" className="ml-1 text-[9px] px-1 py-0">{a.extra.status}</Badge>
                          )}
                        </TableCell>
                        <TableCell className="py-2">{getRiskBadge(a.extra?.risk_level)}</TableCell>
                        <TableCell className="py-2 text-[11px] text-gray-500 whitespace-nowrap">
                          {format(new Date(a.created_at), 'yy.MM.dd HH:mm')}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            {!loading && (
              <div className="px-4 py-2 border-t border-gray-50 bg-gray-50/30 text-[11px] text-gray-400">
                총 {filtered.length}건 표시 중 (최근 200건씩 조회)
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
