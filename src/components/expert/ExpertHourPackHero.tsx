import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Clock, Home, Video, Sparkles, Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { usePayment } from "@/hooks/usePayment";

const HOUR_RATE = 39000;
const PACKS: { size: number; label: string; tagline: string; popular?: boolean }[] = [
  { size: 5,  label: "라이트",     tagline: "처음 시작하기 좋아요" },
  { size: 10, label: "스탠다드",   tagline: "월 1~2회 정기 상담" },
  { size: 20, label: "프리미엄",   tagline: "주 1회 꾸준한 케어", popular: true },
  { size: 30, label: "올케어",     tagline: "장기 동행 · 가족 단위" },
];

const formatKRW = (n: number) => `₩${n.toLocaleString("ko-KR")}`;

type Pack = {
  id: string;
  pack_size: number;
  hours_total: number;
  hours_remaining: number;
  status: string;
  created_at: string;
};

type Usage = {
  id: string;
  hours_used: number;
  delivery_mode: string;
  expert_name: string | null;
  session_date: string | null;
  note: string | null;
  created_at: string;
};

export default function ExpertHourPackHero() {
  const navigate = useNavigate();
  const { pay, isReady } = usePayment();
  const [userId, setUserId] = useState<string | null>(null);
  const [packs, setPacks] = useState<Pack[]>([]);
  const [usages, setUsages] = useState<Usage[]>([]);
  const [loading, setLoading] = useState(true);
  const [logOpen, setLogOpen] = useState(false);
  const [logForm, setLogForm] = useState({
    pack_id: "",
    hours: "1",
    delivery: "online" as "online" | "home_visit",
    expert_name: "",
    session_date: new Date().toISOString().slice(0, 10),
    note: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    setUserId(user?.id ?? null);
    if (!user) {
      setPacks([]);
      setUsages([]);
      setLoading(false);
      return;
    }
    const [{ data: pks }, { data: us }] = await Promise.all([
      supabase.from("expert_hour_packs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false }),
      supabase.from("expert_hour_usages")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(8),
    ]);
    setPacks((pks ?? []) as Pack[]);
    setUsages((us ?? []) as Usage[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const activePacks = packs.filter(p => p.status === "active" && p.hours_remaining > 0);
  const totalRemaining = activePacks.reduce((s, p) => s + Number(p.hours_remaining), 0);
  const totalBought = packs.reduce((s, p) => s + Number(p.hours_total), 0);
  const hasAny = packs.length > 0;

  const onPurchase = async (size: number) => {
    if (!userId) {
      toast.info("로그인 후 구매할 수 있어요");
      navigate("/auth?redirect=/expert-hiring");
      return;
    }
    if (!isReady) {
      toast.info("결제 준비 중입니다. 잠시 후 다시 시도해주세요.");
      return;
    }
    await pay(`expert_hours_${size}` as any);
  };

  const openLog = () => {
    if (activePacks.length === 0) {
      toast.error("사용 가능한 시간권이 없습니다");
      return;
    }
    setLogForm(f => ({ ...f, pack_id: activePacks[0].id }));
    setLogOpen(true);
  };

  const submitLog = async () => {
    const hours = parseFloat(logForm.hours);
    if (!logForm.pack_id || !Number.isFinite(hours) || hours <= 0) {
      toast.error("시간을 올바르게 입력해주세요");
      return;
    }
    setSubmitting(true);
    const { data, error } = await supabase.rpc("consume_expert_hours", {
      _pack_id: logForm.pack_id,
      _hours: hours,
      _delivery: logForm.delivery,
      _expert_name: logForm.expert_name || null,
      _session_date: logForm.session_date || null,
      _note: logForm.note || null,
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message || "사용 등록에 실패했습니다");
      return;
    }
    const charged = (data as any)?.charged ?? hours;
    const remaining = (data as any)?.remaining ?? 0;
    toast.success(`${charged}시간 차감 완료 · 잔여 ${remaining}시간`);
    setLogOpen(false);
    setLogForm(f => ({ ...f, hours: "1", note: "", expert_name: "" }));
    load();
  };

  return (
    <section className="mb-8 overflow-hidden">
      {/* Header */}
      <div className="mb-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div className="min-w-0">
          <Badge className="mb-2 bg-foreground text-background hover:bg-foreground/90">
            <Sparkles className="w-3 h-3 mr-1" /> 신규 · 시간 구독형
          </Badge>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight text-foreground break-keep">
            전문가 시간권 · 필요할 때마다 차감
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 break-keep">
            시간당 <span className="font-semibold text-foreground">{formatKRW(HOUR_RATE)}</span> · 화상/대면 자유 · 홈티(방문) 가능
          </p>
        </div>
        {hasAny && (
          <div className="rounded-2xl border border-border bg-white px-4 py-3 sm:text-right shrink-0">
            <p className="text-[11px] uppercase tracking-wider text-muted-foreground">내 잔여 시간</p>
            <p className="text-2xl font-bold tabular-nums text-foreground">
              {totalRemaining}<span className="text-sm text-muted-foreground ml-1">/ {totalBought}h</span>
            </p>
          </div>
        )}
      </div>

      {/* Pack cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {PACKS.map(p => {
          const total = p.size * HOUR_RATE;
          return (
            <Card
              key={p.size}
              className={cn(
                "relative rounded-2xl border bg-white transition-all hover:border-foreground/40 hover:shadow-md",
                p.popular ? "border-foreground" : "border-border"
              )}
            >
              {p.popular && (
                <div className="absolute -top-2.5 left-4 px-2 py-0.5 rounded-full text-[10px] font-bold bg-foreground text-background">
                  인기
                </div>
              )}
              <CardContent className="p-4 md:p-5 flex flex-col gap-3">
                <div>
                  <p className="text-xs text-muted-foreground font-medium">{p.label}</p>
                  <p className="text-2xl md:text-3xl font-bold mt-1 tracking-tight">
                    {p.size}<span className="text-base font-medium text-muted-foreground ml-1">시간</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1 break-keep">{p.tagline}</p>
                </div>
                <div className="border-t border-border pt-3">
                  <p className="text-lg font-bold text-foreground tabular-nums">{formatKRW(total)}</p>
                  <p className="text-[11px] text-muted-foreground">시간당 {formatKRW(HOUR_RATE)}</p>
                </div>
                <Button
                  size="sm"
                  className="w-full rounded-xl"
                  variant={p.popular ? "default" : "outline"}
                  onClick={() => onPurchase(p.size)}
                >
                  구매하기 <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Info row */}
      <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2 rounded-xl bg-muted/40 px-3 py-2">
          <Video className="w-3.5 h-3.5" /> 화상 상담 · 1시간 차감
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-muted/40 px-3 py-2">
          <Home className="w-3.5 h-3.5" /> 홈티(방문) · 1.5시간 차감
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-muted/40 px-3 py-2">
          <Check className="w-3.5 h-3.5" /> 시간 단위 자유 사용 · 만료 없음
        </div>
      </div>

      {/* My packs panel */}
      {hasAny && (
        <Card className="mt-5 rounded-2xl border-border bg-white">
          <CardContent className="p-4 md:p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" /> 내 시간권
              </p>
              <Button size="sm" variant="outline" className="rounded-full" onClick={openLog}>
                사용 시간 등록
              </Button>
            </div>
            <div className="space-y-2">
              {packs.slice(0, 4).map(p => {
                const pct = p.hours_total > 0
                  ? Math.round((Number(p.hours_remaining) / Number(p.hours_total)) * 100)
                  : 0;
                return (
                  <div key={p.id} className="rounded-xl border border-border p-3">
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium">{p.pack_size}시간권</span>
                      <span className="tabular-nums text-muted-foreground">
                        잔여 <span className="text-foreground font-semibold">{Number(p.hours_remaining)}h</span> / {Number(p.hours_total)}h
                      </span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-foreground rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
            {usages.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-medium text-muted-foreground mb-2">최근 사용 내역</p>
                <div className="space-y-1.5 text-xs">
                  {usages.slice(0, 4).map(u => (
                    <div key={u.id} className="flex justify-between items-center px-1">
                      <span className="text-muted-foreground">
                        {u.session_date || u.created_at.slice(0, 10)} · {u.expert_name || "전문가"} ·{" "}
                        {u.delivery_mode === "home_visit" ? "홈티" : "화상"}
                      </span>
                      <span className="tabular-nums font-medium">-{Number(u.hours_used)}h</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Usage log dialog */}
      <Dialog open={logOpen} onOpenChange={setLogOpen}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle>사용 시간 등록</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label className="text-xs">시간권 선택</Label>
              <select
                className="w-full mt-1 rounded-lg border border-border bg-background px-3 py-2 text-sm"
                value={logForm.pack_id}
                onChange={e => setLogForm(f => ({ ...f, pack_id: e.target.value }))}
              >
                {activePacks.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.pack_size}시간권 · 잔여 {Number(p.hours_remaining)}h
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">사용 시간</Label>
                <Input
                  type="number" step="0.5" min="0.5"
                  value={logForm.hours}
                  onChange={e => setLogForm(f => ({ ...f, hours: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">날짜</Label>
                <Input
                  type="date"
                  value={logForm.session_date}
                  onChange={e => setLogForm(f => ({ ...f, session_date: e.target.value }))}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs">진행 방식</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                <button
                  type="button"
                  onClick={() => setLogForm(f => ({ ...f, delivery: "online" }))}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition-all",
                    logForm.delivery === "online" ? "border-foreground bg-foreground text-background" : "border-border bg-background"
                  )}
                >
                  <Video className="w-4 h-4" /> 화상 (1배)
                </button>
                <button
                  type="button"
                  onClick={() => setLogForm(f => ({ ...f, delivery: "home_visit" }))}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition-all",
                    logForm.delivery === "home_visit" ? "border-foreground bg-foreground text-background" : "border-border bg-background"
                  )}
                >
                  <Home className="w-4 h-4" /> 홈티 (1.5배)
                </button>
              </div>
            </div>
            <div>
              <Label className="text-xs">전문가 이름 (선택)</Label>
              <Input
                value={logForm.expert_name}
                onChange={e => setLogForm(f => ({ ...f, expert_name: e.target.value }))}
                placeholder="예: 김선길 선생님"
                className="mt-1"
              />
            </div>
            <div>
              <Label className="text-xs">메모 (선택)</Label>
              <Textarea
                value={logForm.note}
                onChange={e => setLogForm(f => ({ ...f, note: e.target.value }))}
                rows={2}
                className="mt-1"
              />
            </div>
            {logForm.delivery === "home_visit" && (
              <p className="text-xs text-muted-foreground rounded-lg bg-muted/50 px-3 py-2">
                홈티는 이동·환경 셋업이 포함되어 입력 시간의 1.5배가 차감됩니다.
                예) 1시간 입력 → 1.5시간 차감
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLogOpen(false)}>취소</Button>
            <Button onClick={submitLog} disabled={submitting}>
              {submitting ? "등록 중…" : "등록 · 차감"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
