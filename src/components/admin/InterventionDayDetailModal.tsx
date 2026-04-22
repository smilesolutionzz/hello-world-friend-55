import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Loader2, Eye, MousePointerClick, CreditCard, Sparkles, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const STATUS_META: Record<string, { label: string; color: string; icon: any }> = {
  suggested: { label: "노출", color: "bg-slate-100 text-slate-700", icon: Sparkles },
  viewed: { label: "조회", color: "bg-blue-100 text-blue-700", icon: Eye },
  clicked: { label: "클릭", color: "bg-amber-100 text-amber-700", icon: MousePointerClick },
  purchased: { label: "결제 완료", color: "bg-emerald-100 text-emerald-700", icon: CreditCard },
  completed: { label: "상담 완료", color: "bg-emerald-200 text-emerald-800", icon: CreditCard },
  dismissed: { label: "닫음", color: "bg-rose-100 text-rose-700", icon: X },
};

interface InterventionRow {
  id: string;
  user_id: string;
  status: string;
  created_at: string;
  acted_at: string | null;
  offering_price: number;
  user_email?: string;
  user_name?: string;
}

export default function InterventionDayDetailModal({
  day,
  open,
  onClose,
  fromDate,
  toDate,
}: {
  day: number | null;
  open: boolean;
  onClose: () => void;
  fromDate?: string;
  toDate?: string;
}) {
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<InterventionRow[]>([]);

  useEffect(() => {
    if (!open || day == null) return;
    (async () => {
      setLoading(true);
      let query = supabase
        .from("mind_track_interventions")
        .select("id, user_id, status, created_at, acted_at, offering_price")
        .eq("trigger_day", day)
        .order("created_at", { ascending: false });
      if (fromDate) query = query.gte("created_at", fromDate);
      if (toDate) query = query.lte("created_at", toDate);

      const { data } = await query;
      const list = (data ?? []) as InterventionRow[];

      // 사용자 정보 보강
      if (list.length > 0) {
        const userIds = [...new Set(list.map((r) => r.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, display_name")
          .in("user_id", userIds);
        const profileMap = new Map((profiles ?? []).map((p: any) => [p.user_id, p.display_name]));
        list.forEach((r) => {
          r.user_name = profileMap.get(r.user_id) || r.user_id.slice(0, 8);
        });
      }

      setRows(list);
      setLoading(false);
    })();
  }, [open, day, fromDate, toDate]);

  if (day == null) return null;

  const total = rows.length;
  const purchased = rows.filter((r) => ["purchased", "completed"].includes(r.status)).length;
  const clicked = rows.filter((r) => ["clicked", "purchased", "completed"].includes(r.status)).length;
  const viewed = rows.filter((r) => ["viewed", "clicked", "purchased", "completed"].includes(r.status)).length;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Badge>Day {day}</Badge>
            <span>전환 퍼널 상세</span>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-4 gap-2 my-3">
          {[
            { label: "노출", value: total, color: "text-slate-700" },
            { label: "조회", value: viewed, color: "text-blue-600" },
            { label: "클릭", value: clicked, color: "text-amber-600" },
            { label: "결제", value: purchased, color: "text-emerald-600" },
          ].map((s) => (
            <div key={s.label} className="p-2.5 rounded-lg bg-muted/30 text-center">
              <div className="text-[10px] text-muted-foreground">{s.label}</div>
              <div className={`text-xl font-bold ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12"><Loader2 className="w-5 h-5 animate-spin mx-auto" /></div>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">데이터가 없습니다.</p>
        ) : (
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-muted-foreground mt-2">사용자 목록 + 전환 타임라인</h4>
            {rows.map((r) => {
              const meta = STATUS_META[r.status] ?? STATUS_META.suggested;
              const Icon = meta.icon;
              const created = new Date(r.created_at);
              const acted = r.acted_at ? new Date(r.acted_at) : null;
              const elapsedMin = acted
                ? Math.round((acted.getTime() - created.getTime()) / 60000)
                : null;
              return (
                <div key={r.id} className="p-3 rounded-lg border flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-xs font-bold text-primary">
                    {(r.user_name ?? "U")[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium">{r.user_name}</span>
                      <Badge className={`${meta.color} border-0 text-[10px]`}>
                        <Icon className="w-2.5 h-2.5 mr-0.5" />{meta.label}
                      </Badge>
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-2 flex-wrap">
                      <span>노출: {created.toLocaleString("ko-KR", { dateStyle: "short", timeStyle: "short" })}</span>
                      {acted && (
                        <>
                          <span>·</span>
                          <span>전환: {acted.toLocaleString("ko-KR", { dateStyle: "short", timeStyle: "short" })}</span>
                          <span>·</span>
                          <span>경과 {elapsedMin}분</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[10px] text-muted-foreground">금액</div>
                    <div className="text-sm font-bold">₩{r.offering_price.toLocaleString()}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
