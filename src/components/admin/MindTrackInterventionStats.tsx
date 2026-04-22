import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, AlertCircle, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const DAYS = [7, 14, 21, 30] as const;
const PRICES: Record<number, number> = { 7: 9900, 14: 29000, 21: 49000, 30: 99000 };
const LABELS: Record<number, string> = {
  7: "Day 7 텍스트 점검",
  14: "Day 14 미드체크",
  21: "Day 21 심화 케어",
  30: "Day 30 프리미엄 트랙",
};

interface DayStat {
  day: number;
  suggested: number;
  viewed: number;
  clicked: number;
  purchased: number;
  revenue: number;
  ctr: number;
  conversion: number;
}

export default function MindTrackInterventionStats() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DayStat[]>([]);
  const [riskCount, setRiskCount] = useState(0);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("mind_track_interventions")
      .select("trigger_day, status");
    const { count: alertCount } = await supabase
      .from("mind_track_risk_alerts")
      .select("id", { count: "exact", head: true })
      .is("resolved_at", null);

    const result: DayStat[] = DAYS.map((day) => {
      const rows = (data ?? []).filter((r: any) => r.trigger_day === day);
      const suggested = rows.length;
      const viewed = rows.filter((r: any) => ["viewed", "clicked", "purchased", "completed"].includes(r.status)).length;
      const clicked = rows.filter((r: any) => ["clicked", "purchased", "completed"].includes(r.status)).length;
      const purchased = rows.filter((r: any) => ["purchased", "completed"].includes(r.status)).length;
      return {
        day,
        suggested,
        viewed,
        clicked,
        purchased,
        revenue: purchased * PRICES[day],
        ctr: viewed > 0 ? Math.round((clicked / viewed) * 1000) / 10 : 0,
        conversion: clicked > 0 ? Math.round((purchased / clicked) * 1000) / 10 : 0,
      };
    });

    setStats(result);
    setRiskCount(alertCount ?? 0);
    setLoading(false);
  };

  if (loading) return <div className="p-8 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></div>;

  const totalRevenue = stats.reduce((s, x) => s + x.revenue, 0);
  const totalPurchased = stats.reduce((s, x) => s + x.purchased, 0);
  const totalSuggested = stats.reduce((s, x) => s + x.suggested, 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4">
          <div className="text-[11px] text-muted-foreground">총 노출</div>
          <div className="text-2xl font-bold">{totalSuggested}</div>
        </Card>
        <Card className="p-4">
          <div className="text-[11px] text-muted-foreground">총 결제 완료</div>
          <div className="text-2xl font-bold text-emerald-600">{totalPurchased}</div>
        </Card>
        <Card className="p-4">
          <div className="text-[11px] text-muted-foreground flex items-center gap-1"><DollarSign className="w-3 h-3" />누적 매출</div>
          <div className="text-2xl font-bold text-primary">₩{totalRevenue.toLocaleString()}</div>
        </Card>
        <Card className="p-4">
          <div className="text-[11px] text-muted-foreground flex items-center gap-1"><AlertCircle className="w-3 h-3" />미해결 위험알림</div>
          <div className="text-2xl font-bold text-amber-600">{riskCount}</div>
        </Card>
      </div>

      <Card className="p-4">
        <h3 className="font-bold mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" /> Day별 전환 퍼널</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="text-muted-foreground border-b">
              <tr>
                <th className="text-left py-2 px-2">상품</th>
                <th className="text-right py-2 px-2">노출</th>
                <th className="text-right py-2 px-2">조회</th>
                <th className="text-right py-2 px-2">클릭</th>
                <th className="text-right py-2 px-2">결제</th>
                <th className="text-right py-2 px-2">CTR</th>
                <th className="text-right py-2 px-2">결제 전환율</th>
                <th className="text-right py-2 px-2">매출</th>
              </tr>
            </thead>
            <tbody>
              {stats.map((s) => (
                <tr key={s.day} className="border-b last:border-0">
                  <td className="py-2 px-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px]">Day {s.day}</Badge>
                      <span className="font-medium">{LABELS[s.day]}</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground">₩{PRICES[s.day].toLocaleString()}</div>
                  </td>
                  <td className="text-right py-2 px-2">{s.suggested}</td>
                  <td className="text-right py-2 px-2">{s.viewed}</td>
                  <td className="text-right py-2 px-2">{s.clicked}</td>
                  <td className="text-right py-2 px-2 font-bold text-emerald-600">{s.purchased}</td>
                  <td className="text-right py-2 px-2">{s.ctr}%</td>
                  <td className="text-right py-2 px-2 font-bold">{s.conversion}%</td>
                  <td className="text-right py-2 px-2 font-bold text-primary">₩{s.revenue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-muted-foreground mt-3">
          * CTR = 클릭 / 조회 · 결제 전환율 = 결제 / 클릭. 결제는 `purchased` 또는 `completed` 상태 기준.
        </p>
      </Card>
    </div>
  );
}
