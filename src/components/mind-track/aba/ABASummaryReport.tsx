/**
 * ABASummaryReport — 7일 완주 시 표시되는 부모용 ABA 요약 리포트.
 * 트랙 페이지에서 바로 확인 + PDF/PNG 다운로드.
 */
import { useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Image as ImageIcon, ArrowRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { summarizeObservations, type ABAObservation } from "@/lib/abaObservations";
import { ABA_CHILD_CURRICULUM_7D } from "@/lib/abaChildCurriculum";
import { downloadResultAsPDF } from "@/utils/pdfDownload";
import { useToast } from "@/hooks/use-toast";

interface Props {
  observations: ABAObservation[];
  childNickname?: string;
}

export default function ABASummaryReport({ observations, childNickname }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [busy, setBusy] = useState<"pdf" | "png" | null>(null);
  const summary = summarizeObservations(observations);

  const downloadPDF = async () => {
    if (!ref.current) return;
    setBusy("pdf");
    ref.current.id = "aba-summary-pdf-target";
    await downloadResultAsPDF(
      "aba-summary-pdf-target",
      `ABA_7일_요약리포트_${childNickname ?? "우리아이"}`,
      () => toast({ title: "PDF 다운로드 완료" }),
      () => toast({ title: "PDF 생성 실패", variant: "destructive" }),
    );
    setBusy(null);
  };

  const downloadPNG = async () => {
    if (!ref.current) return;
    setBusy("png");
    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(ref.current, { backgroundColor: "#ffffff", scale: 2, useCORS: true });
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `ABA_7일_요약리포트_${childNickname ?? "우리아이"}.png`;
      a.click();
      toast({ title: "이미지 다운로드 완료" });
    } catch (e) {
      console.warn("[aba-summary] png failed", e);
      toast({ title: "이미지 생성 실패", variant: "destructive" });
    }
    setBusy(null);
  };

  const deltaLabel = (() => {
    if (summary.frequencyDeltaPct == null) return "—";
    const sign = summary.frequencyDeltaPct >= 0 ? "+" : "";
    return `${sign}${summary.frequencyDeltaPct}%`;
  })();

  const triggers = summary.abcTriggers.slice(0, 3);

  return (
    <div>
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h3 className="text-lg font-bold">ABA 7일 요약 리포트</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={downloadPNG} disabled={busy !== null}>
            {busy === "png" ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <ImageIcon className="w-4 h-4 mr-1" />}
            PNG
          </Button>
          <Button variant="outline" size="sm" onClick={downloadPDF} disabled={busy !== null}>
            {busy === "pdf" ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Download className="w-4 h-4 mr-1" />}
            PDF
          </Button>
        </div>
      </div>

      <div ref={ref} className="bg-white p-6 rounded-2xl border" style={{ borderColor: "#E7DEC4" }}>
        <div className="mb-5">
          <p className="text-[11px] tracking-[0.2em] uppercase" style={{ color: "#C8B88A" }}>
            AIHPRO · ABA Parent Coaching Report
          </p>
          <h2 className="text-2xl font-bold mt-1 break-keep">
            {childNickname ? `${childNickname}의 ` : ""}7일 표적 행동 변화
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            ABA(응용행동분석) 원리에 기반한 부모 코칭 데이터 요약 · 의료 진단이 아닙니다
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
          <SummaryStat label="기록한 날" value={`${summary.totalDaysLogged} / 7`} />
          <SummaryStat label="베이스라인 빈도" value={summary.baselineFrequency != null ? `${summary.baselineFrequency}회` : "—"} />
          <SummaryStat label="최종 빈도" value={summary.finalFrequency != null ? `${summary.finalFrequency}회` : "—"} />
          <SummaryStat label="변화율" value={deltaLabel} accent />
        </div>

        <div className="grid md:grid-cols-2 gap-3 mb-5">
          <Card className="p-4 rounded-xl bg-white border">
            <p className="text-[11px] font-medium tracking-wider text-muted-foreground">강화 일관성</p>
            <p className="text-2xl font-bold mt-1">{summary.scriptConsistencyPct}%</p>
            <p className="text-[11px] text-muted-foreground mt-1">7일 중 부모 스크립트 사용 비율</p>
          </Card>
          <Card className="p-4 rounded-xl bg-white border">
            <p className="text-[11px] font-medium tracking-wider text-muted-foreground">강화제 활용</p>
            <p className="text-2xl font-bold mt-1">{summary.reinforcerCoveragePct}%</p>
            <p className="text-[11px] text-muted-foreground mt-1">강화제를 기록한 날 비율</p>
          </Card>
        </div>

        <div className="mb-5">
          <p className="text-[11px] font-medium tracking-wider mb-2" style={{ color: "#8A7A4F" }}>가장 자주 본 트리거(ABC · A)</p>
          {triggers.length > 0 ? (
            <ul className="space-y-1">
              {triggers.map((t, i) => (
                <li key={i} className="text-sm flex gap-2">
                  <span className="text-muted-foreground tabular-nums">0{i + 1}</span>
                  <span className="break-keep">{t}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground">ABC 내러티브가 기록되지 않았습니다. Day 2 카드를 다시 확인하세요.</p>
          )}
        </div>

        <div className="mb-5">
          <p className="text-[11px] font-medium tracking-wider mb-2" style={{ color: "#8A7A4F" }}>일자별 기록 요약</p>
          <div className="grid gap-1.5">
            {ABA_CHILD_CURRICULUM_7D.map((c) => {
              const r = summary.byDay[c.day];
              const detail = r
                ? c.dataMethod === "frequency" ? `빈도 ${r.frequency_count ?? 0}회`
                  : c.dataMethod === "duration" ? `지속 ${r.duration_seconds ?? 0}초`
                  : c.dataMethod === "interval" ? `${r.interval_hits ?? 0}/${r.interval_total ?? 0} 인터벌`
                  : (r.abc_antecedent || r.abc_behavior) ? "ABC 기록됨" : "—"
                : "미기록";
              return (
                <div key={c.day} className="flex items-center justify-between text-xs py-1.5 border-b border-border/40">
                  <span><span className="font-semibold tabular-nums">Day {c.day}</span> · {c.phase}</span>
                  <span className={r ? "text-foreground" : "text-muted-foreground"}>{detail}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-4 rounded-xl border" style={{ background: "#FBF8EE", borderColor: "#E7DEC4" }}>
          <p className="text-[11px] font-medium tracking-wider" style={{ color: "#8A7A4F" }}>다음 23일 처방</p>
          <p className="text-sm mt-1 break-keep">
            Day 5에서 익힌 대체 행동을 연속 강화 → 간헐 강화(예: 3회당 1회)로 전환하여 일반화·유지 단계를 강화하세요.
            진전이 정체되거나 자해·공격 행동이 있다면 자격을 갖춘 전문가와 1:1 상담을 권장합니다.
          </p>
        </div>

        <div className="mt-5 pt-4 border-t flex items-center justify-between flex-wrap gap-2">
          <p className="text-[10px] text-muted-foreground">AIHPRO · 부모 코칭 도구 · aihpro.app</p>
          <Badge variant="outline" className="text-[10px]">의료 진단 아님 · 비임상 코칭</Badge>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button asChild className="flex-1 min-w-[200px]">
          <Link to="/mind-track?focus=child_development&plan=extend_23">
            다음 23일 유지 처방 시작하기 <ArrowRight className="w-4 h-4 ml-1" />
          </Link>
        </Button>
        <Button asChild variant="outline" className="flex-1 min-w-[200px]">
          <Link to="/expert-hiring">
            <FileText className="w-4 h-4 mr-1" /> 발달 전문가와 1:1 상담
          </Link>
        </Button>
      </div>
    </div>
  );
}

function SummaryStat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <Card className="p-3 rounded-xl bg-white border">
      <p className="text-[10px] font-medium tracking-wider text-muted-foreground">{label}</p>
      <p className={`text-xl font-bold mt-1 ${accent ? "" : ""}`} style={accent ? { color: "#C8B88A" } : undefined}>
        {value}
      </p>
    </Card>
  );
}
