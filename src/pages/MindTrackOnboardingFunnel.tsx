/**
 * 30일 마음 트랙 온보딩 퍼널 대시보드 — 본인 이벤트 한정 (RLS).
 * 관리자(admin)인 경우 추후 확장. 현재는 user 본인의 진행 + 단계별 카운트만 노출.
 */
import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface EventRow {
  stage: string;
  event: string;
  created_at: string;
}

const STAGE_ORDER = ["welcome", "audience", "child_basics", "pain_points", "goal", "personalize", "preview"] as const;
const STAGE_LABEL: Record<string, string> = {
  welcome: "환영",
  audience: "대상 선택",
  child_basics: "아이 기본정보",
  pain_points: "페인포인트",
  goal: "목표 한 줄",
  personalize: "개인화 생성",
  preview: "트랙 미리보기",
};

export default function MindTrackOnboardingFunnel() {
  const [rows, setRows] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data } = await supabase
        .from("mind_track_onboarding_events")
        .select("stage, event, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })
        .limit(500);
      setRows((data || []) as EventRow[]);
      setLoading(false);
    })();
  }, []);

  const stats = useMemo(() => {
    // 단계별 진입(stage_enter) 횟수, 가장 멀리 도달한 단계
    const enterCounts: Record<string, number> = {};
    let furthestIdx = -1;
    let lastEnterAt: Record<string, string> = {};
    for (const r of rows) {
      if (r.event === "stage_enter") {
        enterCounts[r.stage] = (enterCounts[r.stage] || 0) + 1;
        lastEnterAt[r.stage] = r.created_at;
        const idx = STAGE_ORDER.indexOf(r.stage as typeof STAGE_ORDER[number]);
        if (idx > furthestIdx) furthestIdx = idx;
      }
    }
    const totalSessions = enterCounts["welcome"] || 0;
    const completed = enterCounts["preview"] || 0;
    const goToDay1 = rows.filter((r) => r.event === "go_to_day1").length;
    const personalizeFails = rows.filter((r) => r.event === "personal_line_fail").length;
    const personalizeOk = rows.filter((r) => r.event === "personal_line_ready").length;
    return { enterCounts, furthestIdx, lastEnterAt, totalSessions, completed, goToDay1, personalizeFails, personalizeOk };
  }, [rows]);

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>온보딩 퍼널 · 30일 마음 트랙</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="max-w-3xl mx-auto px-5 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[11px] tracking-widest font-semibold text-[#8a7a4d]">ONBOARDING ANALYTICS</p>
            <h1 className="text-2xl font-bold text-slate-900">30일 트랙 — 내 온보딩 퍼널</h1>
            <p className="text-sm text-slate-500 mt-1">
              본인 계정의 단계별 진입·완료·실패 이벤트를 기반으로 집계된 통계입니다.
            </p>
          </div>
          <Link to="/onboarding/mind-track">
            <Button variant="outline" className="rounded-xl">
              위저드 열기 <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin" /> 불러오는 중…
          </div>
        ) : rows.length === 0 ? (
          <Card className="p-6 rounded-2xl border border-slate-100 text-sm text-slate-500">
            아직 기록된 이벤트가 없어요. 위저드를 한 번 진행하면 단계별 통계가 표시됩니다.
          </Card>
        ) : (
          <div className="space-y-6">
            {/* 핵심 지표 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <KPI label="총 세션" value={stats.totalSessions} hint="welcome 진입 수" />
              <KPI label="미리보기 도달" value={stats.completed} hint="preview 진입 수" />
              <KPI label="Day 1 진입" value={stats.goToDay1} hint="시작 버튼 클릭" />
              <KPI label="개인화 실패" value={stats.personalizeFails} hint={`성공 ${stats.personalizeOk}회 대비`} tone={stats.personalizeFails > 0 ? "warn" : "ok"} />
            </div>

            {/* 단계별 퍼널 막대 */}
            <Card className="p-5 rounded-2xl border border-slate-100">
              <p className="text-sm font-semibold mb-3">단계별 진입 횟수</p>
              <div className="space-y-2">
                {STAGE_ORDER.map((s, i) => {
                  const count = stats.enterCounts[s] || 0;
                  const max = Math.max(1, ...STAGE_ORDER.map((x) => stats.enterCounts[x] || 0));
                  const pct = Math.round((count / max) * 100);
                  const reached = i <= stats.furthestIdx;
                  return (
                    <div key={s}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className={reached ? "text-slate-800 font-medium" : "text-slate-400"}>
                          {String(i + 1).padStart(2, "0")} · {STAGE_LABEL[s]}
                        </span>
                        <span className="text-slate-500">{count}회</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${reached ? "bg-[#1a1a1a]" : "bg-slate-200"}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* 최근 이벤트 로그 */}
            <Card className="p-5 rounded-2xl border border-slate-100">
              <p className="text-sm font-semibold mb-3">최근 이벤트 (최신 30개)</p>
              <div className="space-y-1.5 max-h-[360px] overflow-y-auto">
                {rows.slice(-30).reverse().map((r, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400 w-32 shrink-0">
                      {new Date(r.created_at).toLocaleString("ko-KR", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <Badge variant="outline" className="text-[10px]">{STAGE_LABEL[r.stage] || r.stage}</Badge>
                    <span className="text-slate-700">{r.event}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

function KPI({ label, value, hint, tone }: { label: string; value: number; hint?: string; tone?: "ok" | "warn" }) {
  return (
    <Card className={`p-4 rounded-2xl border ${tone === "warn" ? "border-amber-200 bg-amber-50/50" : "border-slate-100"}`}>
      <p className="text-[10px] tracking-widest font-semibold text-slate-400 uppercase">{label}</p>
      <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
      {hint && <p className="text-[11px] text-slate-500 mt-1">{hint}</p>}
    </Card>
  );
}
