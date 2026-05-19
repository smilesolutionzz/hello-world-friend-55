/**
 * Admin NSM (North Star Metric) Hero Panel
 *
 * NSM = 7일 마음 트랙 주간 완주자 수 (Weekly Completers)
 * 보조 = Weekly Active Paid Users (지난 7일 active한 paid enrollment 수)
 * 코호트 = 최근 8주 시작 코호트별 완주율
 *
 * 데이터 소스: public.mind_track_enrollments
 *  - payment_status = 'paid' → paid 유저
 *  - status = 'completed' / completed_at NOT NULL → 완주
 *  - started_at = 시작일 (코호트 기준)
 *  - current_day → 진행 일수 (0~7)
 */
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Target, Flame, Layers } from "lucide-react";
import {
  computeNSMMetrics,
  computeAudienceBreakdown,
  type CohortRow,
  type AudienceBreakdownRow,
  type NSMEnrollment as Enrollment,
} from "@/lib/adminNSMMetrics";

export function AdminNSMHero() {
  const [loading, setLoading] = useState(true);
  const [weeklyCompleters, setWeeklyCompleters] = useState(0);
  const [weeklyActivePaid, setWeeklyActivePaid] = useState(0);
  const [last4Completers, setLast4Completers] = useState<number[]>([]);
  const [cohorts, setCohorts] = useState<CohortRow[]>([]);
  const [breakdown, setBreakdown] = useState<AudienceBreakdownRow[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const since = new Date();
        since.setDate(since.getDate() - 70); // ~10주
        const { data, error } = await supabase
          .from("mind_track_enrollments")
          .select(
            "id, user_id, payment_status, status, current_day, started_at, completed_at, updated_at, track_type, audience"
          )
          .gte("created_at", since.toISOString())
          .limit(5000);

        if (error) throw error;
        const rows = (data || []) as Enrollment[];

        const m = computeNSMMetrics(rows, new Date());
        setWeeklyCompleters(m.weeklyCompleters);
        setWeeklyActivePaid(m.weeklyActivePaid);
        setLast4Completers(m.sparkline);
        setCohorts(m.cohorts);
        setBreakdown(computeAudienceBreakdown(rows));
      } catch (e) {
        console.error("[AdminNSMHero] load failed", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-44 rounded-2xl" />
        <Skeleton className="h-56 rounded-2xl" />
      </div>
    );
  }

  const prev = last4Completers[2] ?? 0;
  const delta = weeklyCompleters - prev;
  const trendUp = delta >= 0;

  return (
    <div className="space-y-4">
      {/* NSM Hero */}
      <Card className="border-2 border-primary/30 bg-gradient-to-br from-white via-amber-50/40 to-rose-50/40 rounded-2xl">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              North Star Metric
            </span>
            <Badge variant="outline" className="ml-auto text-[10px]">
              주간
            </Badge>
          </div>
          <CardTitle className="text-sm text-slate-600 font-medium mt-1">
            7일 마음 트랙 주간 완주자 수
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4 flex-wrap">
            <div className="flex items-baseline gap-2">
              <span className="text-6xl md:text-7xl font-black text-slate-900 tabular-nums leading-none">
                {weeklyCompleters}
              </span>
              <span className="text-sm text-slate-500">명</span>
            </div>
            <div
              className={`flex items-center gap-1 text-sm font-semibold ${
                trendUp ? "text-emerald-600" : "text-rose-600"
              }`}
            >
              <TrendingUp
                className={`w-4 h-4 ${trendUp ? "" : "rotate-180"}`}
              />
              {delta >= 0 ? "+" : ""}
              {delta} vs 전주
            </div>
            <div className="ml-auto flex items-end gap-1 h-12">
              {last4Completers.map((c, i) => {
                const max = Math.max(1, ...last4Completers);
                const h = Math.max(4, Math.round((c / max) * 48));
                return (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div
                      className={`w-6 rounded-t ${
                        i === last4Completers.length - 1
                          ? "bg-primary"
                          : "bg-slate-300"
                      }`}
                      style={{ height: `${h}px` }}
                      title={`${c}명`}
                    />
                    <span className="text-[9px] text-slate-400">
                      {i === last4Completers.length - 1
                        ? "이번"
                        : `${last4Completers.length - 1 - i}주전`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 보조 지표 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="rounded-2xl">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Users className="w-3.5 h-3.5" />
              Weekly Active Paid Users
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-slate-900 tabular-nums">
              {weeklyActivePaid}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              지난 7일 동안 트랙 진행 활동이 있는 결제 사용자
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl md:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <Flame className="w-3.5 h-3.5" />
              주간 코호트 완주율 (최근 8주)
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              {cohorts.map((c) => (
                <div
                  key={c.weekStart}
                  className="flex items-center gap-3 text-xs"
                >
                  <span className="w-20 text-slate-500 tabular-nums">
                    {c.weekStart.slice(5)}
                  </span>
                  <div className="flex-1 h-3 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-amber-500"
                      style={{ width: `${c.rate}%` }}
                    />
                  </div>
                  <span className="w-12 text-right font-semibold text-slate-700 tabular-nums">
                    {c.rate}%
                  </span>
                  <span className="w-16 text-right text-slate-400 tabular-nums">
                    {c.completers}/{c.cohortSize}
                  </span>
                </div>
              ))}
              {cohorts.every((c) => c.cohortSize === 0) && (
                <p className="text-xs text-slate-400 py-4 text-center">
                  아직 시작된 코호트가 없습니다.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Audience 분리 집계 */}
      <Card className="rounded-2xl">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Layers className="w-3.5 h-3.5" />
            Audience별 결제전환 · 완주 · 재구매
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-slate-500 border-b border-slate-100">
                  <th className="text-left py-2 font-medium">Audience</th>
                  <th className="text-right py-2 font-medium">시작</th>
                  <th className="text-right py-2 font-medium">결제</th>
                  <th className="text-right py-2 font-medium">결제전환율</th>
                  <th className="text-right py-2 font-medium">완주자</th>
                  <th className="text-right py-2 font-medium">완주율</th>
                  <th className="text-right py-2 font-medium">재구매</th>
                  <th className="text-right py-2 font-medium">재구매율</th>
                </tr>
              </thead>
              <tbody>
                {breakdown.map((b) => (
                  <tr key={b.audience} className="border-b border-slate-50 last:border-0">
                    <td className="py-2 font-semibold text-slate-700 capitalize">{b.audience}</td>
                    <td className="text-right tabular-nums">{b.totalEnrollments}</td>
                    <td className="text-right tabular-nums">{b.paidEnrollments}</td>
                    <td className="text-right tabular-nums font-semibold text-primary">
                      {b.conversionRate}%
                    </td>
                    <td className="text-right tabular-nums">{b.completers}</td>
                    <td className="text-right tabular-nums font-semibold text-emerald-600">
                      {b.completionRate}%
                    </td>
                    <td className="text-right tabular-nums">{b.repeatPaidUsers}</td>
                    <td className="text-right tabular-nums font-semibold text-amber-600">
                      {b.repeatRate}%
                    </td>
                  </tr>
                ))}
                {breakdown.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center text-slate-400 py-6">
                      집계할 데이터가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <p className="text-[10px] text-slate-400 mt-3">
            결제전환율 = 결제완료 / 시작 · 완주율 = 완주 / 결제완료 · 재구매율 = 2회 이상 결제 사용자 / 결제 사용자
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default AdminNSMHero;
