import { useEffect, useMemo, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Loader2, ArrowLeft, Download } from "lucide-react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { MIND_TRACK_PRICE } from "@/constants/tokenCosts";
import { toast } from "sonner";

type Org = { id: string; name: string; commission_rate: number };
type Enrollment = {
  id: string;
  user_id: string;
  status: string | null;
  payment_status: string | null;
  payment_amount: number | null;
  current_day: number | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
};

const PRESETS = [
  { value: "7", label: "최근 7일" },
  { value: "30", label: "최근 30일" },
  { value: "90", label: "최근 90일" },
  { value: "all", label: "전체" },
] as const;

const STATUS_OPTIONS = [
  { value: "all", label: "전체 상태" },
  { value: "paid", label: "결제 완료" },
  { value: "pending", label: "결제 대기" },
  { value: "free", label: "무료/체험" },
  { value: "refunded", label: "환불" },
] as const;

function statusBadge(payment_status: string | null) {
  const v = payment_status || "pending";
  const map: Record<string, { label: string; cls: string }> = {
    paid: { label: "결제 완료", cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    pending: { label: "결제 대기", cls: "bg-amber-100 text-amber-700 border-amber-200" },
    free: { label: "무료", cls: "bg-slate-100 text-slate-700 border-slate-200" },
    refunded: { label: "환불", cls: "bg-rose-100 text-rose-700 border-rose-200" },
  };
  const m = map[v] ?? { label: v, cls: "bg-slate-100 text-slate-700 border-slate-200" };
  return <Badge variant="outline" className={m.cls}>{m.label}</Badge>;
}

export default function PartnerCenterReferrals() {
  const { user, loading: authLoading } = useAuthGuard();
  const [loading, setLoading] = useState(true);
  const [org, setOrg] = useState<Org | null>(null);
  const [rows, setRows] = useState<Enrollment[]>([]);
  const [period, setPeriod] = useState<string>("30");
  const [status, setStatus] = useState<string>("all");
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("organizations")
        .select("id,name,commission_rate")
        .eq("admin_user_id", user.id)
        .maybeSingle();
      if (data) setOrg(data as Org);
      setLoading(false);
    })();
  }, [user]);

  useEffect(() => {
    if (!org) return;
    (async () => {
      let q = supabase
        .from("mind_track_enrollments")
        .select("id,user_id,status,payment_status,payment_amount,current_day,created_at,started_at,completed_at")
        .eq("referrer_org_id", org.id)
        .order("created_at", { ascending: false })
        .limit(500);

      if (period !== "all") {
        const days = parseInt(period, 10);
        q = q.gte("created_at", new Date(Date.now() - days * 86400_000).toISOString());
      } else if (from) {
        q = q.gte("created_at", new Date(from).toISOString());
      }
      if (period === "all" && to) {
        q = q.lte("created_at", new Date(new Date(to).getTime() + 86400_000).toISOString());
      }
      if (status !== "all") q = q.eq("payment_status", status);

      const { data, error } = await q;
      if (error) { toast.error("불러오기 실패: " + error.message); return; }
      setRows((data ?? []) as Enrollment[]);
    })();
  }, [org, period, status, from, to]);

  const totals = useMemo(() => {
    const paid = rows.filter(r => r.payment_status === "paid").length;
    const commission = Math.round(paid * MIND_TRACK_PRICE * (org?.commission_rate ?? 0.15));
    return { total: rows.length, paid, commission };
  }, [rows, org]);

  const exportCsv = () => {
    const header = ["created_at", "user_id_masked", "payment_status", "payment_amount", "current_day", "status"];
    const lines = rows.map(r => [
      new Date(r.created_at).toISOString(),
      r.user_id.slice(0, 8) + "…",
      r.payment_status ?? "",
      r.payment_amount ?? "",
      r.current_day ?? "",
      r.status ?? "",
    ].join(","));
    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `referrals-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (authLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  }
  if (!user) return <Navigate to="/auth?redirect=/app/center/referrals" replace />;
  if (!org) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <Card className="max-w-lg p-10 text-center rounded-3xl">
          <h1 className="text-2xl font-medium mb-3">파트너 센터 등록이 필요합니다</h1>
          <Button asChild><Link to="/app/center">대시보드로</Link></Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-8">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
            <Link to="/app/center"><ArrowLeft className="w-4 h-4 mr-1" />대시보드</Link>
          </Button>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">Referral Clients</p>
          <h1 className="text-3xl md:text-4xl font-medium">{org.name} 추천 신청자</h1>
          <p className="text-sm text-muted-foreground mt-2">개인정보 보호를 위해 닉네임 대신 마스킹된 식별자만 표시됩니다.</p>
        </div>

        {/* Summary */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5 rounded-2xl">
            <p className="text-xs text-muted-foreground">조회된 신청</p>
            <p className="text-2xl font-medium mt-1">{totals.total.toLocaleString()}</p>
          </Card>
          <Card className="p-5 rounded-2xl">
            <p className="text-xs text-muted-foreground">결제 완료</p>
            <p className="text-2xl font-medium mt-1">{totals.paid.toLocaleString()}</p>
          </Card>
          <Card className="p-5 rounded-2xl">
            <p className="text-xs text-muted-foreground">예상 정산금</p>
            <p className="text-2xl font-medium mt-1">₩{totals.commission.toLocaleString()}</p>
          </Card>
        </section>

        {/* Filters */}
        <Card className="p-5 rounded-2xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs">기간</Label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PRESETS.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">상태</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {period === "all" && (
              <>
                <div className="space-y-1.5">
                  <Label className="text-xs">시작일</Label>
                  <Input type="date" value={from} onChange={e => setFrom(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">종료일</Label>
                  <Input type="date" value={to} onChange={e => setTo(e.target.value)} />
                </div>
              </>
            )}
            <div className="md:col-start-4 flex items-end">
              <Button variant="outline" className="w-full" onClick={exportCsv} disabled={rows.length === 0}>
                <Download className="w-4 h-4 mr-1" /> CSV 내보내기
              </Button>
            </div>
          </div>
        </Card>

        {/* Table */}
        <Card className="rounded-2xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>신청일</TableHead>
                <TableHead>식별자</TableHead>
                <TableHead>상태</TableHead>
                <TableHead className="text-right">금액</TableHead>
                <TableHead className="text-right">진행 일차</TableHead>
                <TableHead>트랙 상태</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-sm text-muted-foreground py-12">
                    조건에 맞는 신청 내역이 없습니다.
                  </TableCell>
                </TableRow>
              )}
              {rows.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="text-sm">{new Date(r.created_at).toLocaleDateString("ko-KR")}</TableCell>
                  <TableCell className="text-xs font-mono text-muted-foreground">{r.user_id.slice(0, 8)}…</TableCell>
                  <TableCell>{statusBadge(r.payment_status)}</TableCell>
                  <TableCell className="text-right text-sm">{r.payment_amount ? `₩${r.payment_amount.toLocaleString()}` : "—"}</TableCell>
                  <TableCell className="text-right text-sm">{r.current_day ? `Day ${r.current_day}` : "—"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{r.status ?? "—"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}
