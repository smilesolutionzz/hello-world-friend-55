import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, MousePointerClick, ShoppingBag, Coins } from 'lucide-react';

interface PartnerRow {
  org_id: string | null;
  org_name: string;
  slug: string;
  is_referral_active: boolean;
  commission_rate: number;
  clicks_30d: number;
  enrollments_30d: number;
  paid_enrollments_30d: number;
  estimated_commission_30d: number;
}

const MIND_TRACK_PRICE = 19900;

export default function PartnerReferralStats() {
  const [rows, setRows] = useState<PartnerRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

      // 1) 활성 파트너 센터 조회
      const { data: orgs } = await supabase
        .from('organizations')
        .select('id, name, slug, is_referral_active, commission_rate')
        .not('slug', 'is', null)
        .order('name');

      if (!orgs || orgs.length === 0) {
        if (!cancelled) {
          setRows([]);
          setLoading(false);
        }
        return;
      }

      // 2) 클릭 집계 (30일)
      const { data: clicks } = await supabase
        .from('partner_referral_clicks')
        .select('org_id, slug')
        .gte('created_at', since);

      // 3) 가입(enrollment) 집계 (30일)
      const { data: enrollments } = await supabase
        .from('mind_track_enrollments')
        .select('referrer_org_id, payment_status, payment_amount, created_at')
        .not('referrer_org_id', 'is', null)
        .gte('created_at', since);

      const clickMap = new Map<string, number>();
      clicks?.forEach((c: any) => {
        const key = c.org_id ?? c.slug ?? 'unknown';
        clickMap.set(key, (clickMap.get(key) ?? 0) + 1);
      });

      const enrollMap = new Map<string, { total: number; paid: number; revenue: number }>();
      enrollments?.forEach((e: any) => {
        const key = e.referrer_org_id;
        const cur = enrollMap.get(key) ?? { total: 0, paid: 0, revenue: 0 };
        cur.total += 1;
        if (e.payment_status === 'completed' || e.payment_status === 'paid') {
          cur.paid += 1;
          cur.revenue += Number(e.payment_amount) || MIND_TRACK_PRICE;
        }
        enrollMap.set(key, cur);
      });

      const result: PartnerRow[] = orgs.map((o: any) => {
        const clicks30 = clickMap.get(o.id) ?? clickMap.get(o.slug) ?? 0;
        const e = enrollMap.get(o.id) ?? { total: 0, paid: 0, revenue: 0 };
        return {
          org_id: o.id,
          org_name: o.name,
          slug: o.slug,
          is_referral_active: o.is_referral_active,
          commission_rate: Number(o.commission_rate) || 0,
          clicks_30d: clicks30,
          enrollments_30d: e.total,
          paid_enrollments_30d: e.paid,
          estimated_commission_30d: Math.round(e.revenue * (Number(o.commission_rate) || 0)),
        };
      });

      result.sort((a, b) => b.estimated_commission_30d - a.estimated_commission_30d);

      if (!cancelled) {
        setRows(result);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <Skeleton className="h-64 w-full rounded-3xl" />;
  }

  const totals = rows.reduce(
    (acc, r) => ({
      clicks: acc.clicks + r.clicks_30d,
      paid: acc.paid + r.paid_enrollments_30d,
      commission: acc.commission + r.estimated_commission_30d,
    }),
    { clicks: 0, paid: 0, commission: 0 },
  );

  return (
    <div className="space-y-4">
      {/* 합산 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className="rounded-3xl p-5 border-border bg-white">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MousePointerClick className="w-3.5 h-3.5" />
            30일 추천 클릭
          </div>
          <div className="text-2xl font-semibold mt-2">{totals.clicks.toLocaleString()}</div>
        </Card>
        <Card className="rounded-3xl p-5 border-border bg-white">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShoppingBag className="w-3.5 h-3.5" />
            30일 결제 전환
          </div>
          <div className="text-2xl font-semibold mt-2">{totals.paid.toLocaleString()}건</div>
        </Card>
        <Card className="rounded-3xl p-5 border-border bg-white">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Coins className="w-3.5 h-3.5" />
            예상 정산 금액
          </div>
          <div className="text-2xl font-semibold mt-2">
            ₩{totals.commission.toLocaleString()}
          </div>
        </Card>
      </div>

      {/* 센터별 표 */}
      <Card className="rounded-3xl border-border bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          <h3 className="text-sm font-semibold">파트너 센터별 (최근 30일)</h3>
        </div>

        {rows.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            아직 슬러그가 등록된 파트너 센터가 없습니다.
            <br />
            <span className="text-xs">organizations 테이블에 slug · is_referral_active 설정 필요</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-foreground/[0.02] text-xs text-muted-foreground">
                <tr>
                  <th className="text-left px-5 py-3 font-medium">센터</th>
                  <th className="text-left px-3 py-3 font-medium">슬러그</th>
                  <th className="text-right px-3 py-3 font-medium">클릭</th>
                  <th className="text-right px-3 py-3 font-medium">가입</th>
                  <th className="text-right px-3 py-3 font-medium">결제</th>
                  <th className="text-right px-3 py-3 font-medium">전환율</th>
                  <th className="text-right px-3 py-3 font-medium">수수료율</th>
                  <th className="text-right px-5 py-3 font-medium">예상 정산</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const conversion =
                    r.clicks_30d > 0 ? ((r.paid_enrollments_30d / r.clicks_30d) * 100).toFixed(1) : '—';
                  return (
                    <tr key={r.org_id ?? r.slug} className="border-t border-border">
                      <td className="px-5 py-3">
                        <div className="font-medium">{r.org_name}</div>
                        {!r.is_referral_active && (
                          <div className="text-[10px] text-muted-foreground mt-0.5">비활성</div>
                        )}
                      </td>
                      <td className="px-3 py-3 font-mono text-xs text-muted-foreground">/{r.slug}</td>
                      <td className="px-3 py-3 text-right">{r.clicks_30d.toLocaleString()}</td>
                      <td className="px-3 py-3 text-right">{r.enrollments_30d}</td>
                      <td className="px-3 py-3 text-right">{r.paid_enrollments_30d}</td>
                      <td className="px-3 py-3 text-right text-muted-foreground">{conversion}%</td>
                      <td className="px-3 py-3 text-right text-muted-foreground">
                        {(r.commission_rate * 100).toFixed(0)}%
                      </td>
                      <td className="px-5 py-3 text-right font-semibold">
                        ₩{r.estimated_commission_30d.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <p className="text-xs text-muted-foreground/70 px-1">
        예상 정산 = 결제 완료 enrollment × payment_amount × 센터별 수수료율. 실제 정산은 환불·검증 후 확정.
      </p>
    </div>
  );
}
