import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Loader2, RefreshCw, Star } from "lucide-react";
import { useAdminCheck } from "@/hooks/useAdminCheck";
import { useBetaMetrics, fmtDate, startOfWeek } from "@/hooks/useBetaMetrics";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

function pctColor(p: number | null): string {
  if (p === null) return "text-neutral-400";
  if (p >= 50) return "text-emerald-600";
  if (p >= 30) return "text-amber-600";
  return "text-rose-600";
}

function KpiCard({ label, value, hint, accent }: { label: string; value: string; hint?: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border p-5 bg-white ${accent ? "border-[#C8B88A]/50 bg-gradient-to-b from-[#FAF6E8] to-white" : "border-neutral-200"}`}>
      <div className="flex items-center gap-1.5 mb-2">
        {accent && <Star className="w-3.5 h-3.5 text-[#C8B88A] fill-[#C8B88A]" />}
        <p className="text-xs text-neutral-500">{label}</p>
      </div>
      <p className="text-3xl font-semibold tracking-tight">{value}</p>
      {hint && <p className="text-xs text-neutral-500 mt-1">{hint}</p>}
    </div>
  );
}

export default function BetaTrackerPage() {
  const { isAdmin, loading: adminLoading } = useAdminCheck();
  const { loading, error, centers, global, perCenter, reload } = useBetaMetrics();
  const { toast } = useToast();
  const [retroBody, setRetroBody] = useState("");
  const [retroLoading, setRetroLoading] = useState(false);
  const [retroSaving, setRetroSaving] = useState(false);

  const weekStart = startOfWeek(new Date());
  const weekStartISO = weekStart.toISOString().slice(0, 10);

  useEffect(() => {
    if (!isAdmin) return;
    (async () => {
      setRetroLoading(true);
      const { data } = await supabase
        .from("beta_retros")
        .select("body")
        .eq("week_start", weekStartISO)
        .maybeSingle();
      setRetroBody((data as any)?.body ?? "");
      setRetroLoading(false);
    })();
  }, [isAdmin, weekStartISO]);

  async function saveRetro() {
    setRetroSaving(true);
    const { error } = await supabase
      .from("beta_retros")
      .upsert({ week_start: weekStartISO, body: retroBody }, { onConflict: "week_start" });
    setRetroSaving(false);
    if (error) {
      toast({ title: "회고 저장 실패", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "이번 주 회고를 저장했어요" });
    }
  }

  async function toggleBeta(centerId: string, next: boolean) {
    const patch: any = { is_beta_partner: next };
    if (next) patch.beta_started_at = new Date().toISOString().slice(0, 10);
    const { error } = await supabase.from("center_organizations").update(patch).eq("id", centerId);
    if (error) {
      toast({ title: "변경 실패", description: error.message, variant: "destructive" });
    } else {
      reload();
    }
  }

  async function updateNotes(centerId: string, notes: string) {
    const { error } = await supabase.from("center_organizations").update({ beta_notes: notes }).eq("id", centerId);
    if (error) toast({ title: "메모 저장 실패", description: error.message, variant: "destructive" });
  }

  // Admin gate (do not redirect — page is hidden from sidebar already)
  if (adminLoading) return <div className="p-10 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-neutral-400" /></div>;
  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center">
        <h1 className="text-xl font-semibold mb-2">접근 권한이 없습니다</h1>
        <p className="text-sm text-neutral-600">이 페이지는 AIHPRO 운영자만 볼 수 있어요.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 space-y-6">
      <Helmet><title>베타 트래커 — AIHPRO 센터 콘솔</title></Helmet>

      <header className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <p className="text-xs tracking-widest text-[#C8B88A] mb-1">AIHPRO INTERNAL</p>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">베타 5곳 트래커</h1>
          <p className="text-sm text-neutral-600 mt-1">
            이번 주 ({fmtDate(weekStart)} ~) · 부모가 매주 다시 들어오는지를 한 화면에서 본다.
          </p>
        </div>
        <button
          onClick={reload}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-neutral-200 text-sm hover:bg-neutral-50"
        >
          <RefreshCw className="w-4 h-4" /> 새로고침
        </button>
      </header>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">{error}</div>
      )}

      {/* KPIs */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          accent
          label="부모 활성률 (이번 주)"
          value={global?.parentActivationPct === null || global == null ? "—" : `${global.parentActivationPct}%`}
          hint={global ? `${global.parentsOpened} / ${global.parentsReceived} 부모 열람` : undefined}
        />
        <KpiCard
          label="센터 발행 수"
          value={global ? String(global.reportsPublished) : "—"}
          hint="이번 주 부모 리포트"
        />
        <KpiCard
          label="회기 사진 업로드"
          value={global ? String(global.uploadsThisWeek) : "—"}
          hint="이번 주"
        />
        <KpiCard
          label="부모 재방문률"
          value={global?.parentReturnPct === null || global == null ? "—" : `${global.parentReturnPct}%`}
          hint="지난주 열람 부모 중 이번 주 재열람"
        />
      </section>

      {/* Cohort table */}
      <section className="rounded-2xl border border-neutral-200 bg-white overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold">베타 센터 코호트</h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              표시된 센터만 KPI 집계에 포함됩니다. 토글로 베타 5곳을 선택하세요.
            </p>
          </div>
          <a href="/b2b-center/app/admin/organization" className="text-xs text-neutral-500 hover:text-neutral-900 underline">기관 설정</a>
        </div>

        {loading ? (
          <div className="p-10 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-neutral-400" /></div>
        ) : centers.length === 0 ? (
          <div className="p-10 text-center text-sm text-neutral-500">
            아직 베타 파트너로 지정된 센터가 없습니다.
            <br />
            <span className="text-xs">기관 정보 페이지에서 <code>is_beta_partner = true</code>로 표시하거나, 아래 입력에 센터 ID를 넣어 토글하세요.</span>
            <ManualToggle onToggle={toggleBeta} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 text-neutral-500 text-xs">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">센터</th>
                  <th className="text-left px-4 py-3 font-medium">코호트</th>
                  <th className="text-left px-4 py-3 font-medium">첫 업로드</th>
                  <th className="text-left px-4 py-3 font-medium">첫 발행</th>
                  <th className="text-left px-4 py-3 font-medium">첫 부모 열람</th>
                  <th className="text-left px-4 py-3 font-medium">이번 주 활성률</th>
                  <th className="text-left px-4 py-3 font-medium">비고</th>
                  <th className="text-right px-4 py-3 font-medium">베타</th>
                </tr>
              </thead>
              <tbody>
                {perCenter.map((m) => {
                  const orgRow = centers.find((c) => c.id === m.centerId);
                  return (
                    <tr key={m.centerId} className="border-t border-neutral-100">
                      <td className="px-4 py-3 font-medium">{m.centerName}</td>
                      <td className="px-4 py-3">{m.cohortWeek ? `${m.cohortWeek}주차` : "—"}</td>
                      <td className="px-4 py-3 text-neutral-600">{fmtDate(m.firstUploadAt)}</td>
                      <td className="px-4 py-3 text-neutral-600">{fmtDate(m.firstReportAt)}</td>
                      <td className="px-4 py-3 text-neutral-600">{fmtDate(m.firstParentViewAt)}</td>
                      <td className={`px-4 py-3 font-semibold ${pctColor(m.parentActivationPct)}`}>
                        {m.parentActivationPct === null ? "—" : `${m.parentActivationPct}%`}
                        <span className="ml-1 text-xs font-normal text-neutral-400">
                          ({m.parentsOpened}/{m.parentsReceived})
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          defaultValue={orgRow?.beta_notes ?? ""}
                          onBlur={(e) => updateNotes(m.centerId, e.target.value)}
                          placeholder="—"
                          className="w-40 text-xs border border-transparent hover:border-neutral-200 focus:border-neutral-300 rounded px-2 py-1 focus:outline-none"
                        />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => toggleBeta(m.centerId, false)}
                          className="text-xs text-neutral-500 hover:text-rose-600"
                        >
                          해제
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="border-t border-neutral-100 p-4">
              <ManualToggle onToggle={toggleBeta} />
            </div>
          </div>
        )}
      </section>

      {/* Retro */}
      <section className="rounded-2xl border border-neutral-200 bg-white p-5">
        <h2 className="font-semibold mb-1">이번 주 회고 ({fmtDate(weekStart)} ~)</h2>
        <p className="text-xs text-neutral-500 mb-3">
          금요일마다 막힌 지점·다음 주 액션을 한 문단으로 남겨두세요. 운영자만 볼 수 있어요.
        </p>
        <textarea
          value={retroBody}
          onChange={(e) => setRetroBody(e.target.value)}
          placeholder={"예) 한점미소: 부모 3/4 열람. 토닥맘 A: 사진 업로드 0건, 원장님 화면공유 잡기.\n다음 주 추가할 센터: …"}
          rows={6}
          disabled={retroLoading}
          className="w-full border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-neutral-400"
        />
        <div className="mt-3 flex justify-end">
          <button
            onClick={saveRetro}
            disabled={retroSaving || retroLoading}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-neutral-900 text-white text-sm disabled:opacity-50"
          >
            {retroSaving && <Loader2 className="w-4 h-4 animate-spin" />}
            저장
          </button>
        </div>
      </section>

      <p className="text-xs text-neutral-400 text-center pt-2">
        PMF 신호: 부모 활성률 50% 이상이 8주 지속 → 유료 전환 논의 시작 가능
      </p>
    </div>
  );
}

function ManualToggle({ onToggle }: { onToggle: (id: string, next: boolean) => void }) {
  const [id, setId] = useState("");
  return (
    <div className="flex items-center gap-2 justify-center mt-2">
      <input
        value={id}
        onChange={(e) => setId(e.target.value)}
        placeholder="센터 ID (UUID) 붙여넣기"
        className="text-xs border border-neutral-200 rounded px-2 py-1 w-72 focus:outline-none focus:border-neutral-400"
      />
      <button
        onClick={() => { if (id.trim()) { onToggle(id.trim(), true); setId(""); } }}
        className="text-xs px-3 py-1.5 rounded bg-neutral-900 text-white"
      >
        베타 5곳에 추가
      </button>
    </div>
  );
}
