import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Loader2, Award, Sparkles, BookOpen, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { WORKBOOK_CHAPTERS } from "@/lib/mindTrackChapters";
import LoadingSpinner from "@/components/LoadingSpinner";

interface FinalWorkbook {
  id: string;
  ai_insights: string | null;
  chart_data: any;
  completion_certificate: any;
  compiled_data: any;
}

/**
 * /mind-track/workbook-preview?enrollmentId=...
 * 30일 완성된 워크북을 "한 권의 책"처럼 풀스크린으로 미리보기.
 * - 표지 / 4개 챕터 / 닫는 글
 * - PDF 다운로드 버튼
 */
export default function MindTrackWorkbookPreview() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const enrollmentId = params.get("enrollmentId");
  const [loading, setLoading] = useState(true);
  const [workbook, setWorkbook] = useState<FinalWorkbook | null>(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!enrollmentId) {
      toast.error("워크북 정보를 찾을 수 없어요");
      navigate("/mind-track/dashboard");
      return;
    }
    void loadWorkbook();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enrollmentId]);

  const loadWorkbook = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("mind-track-final-workbook", {
        body: { enrollmentId },
      });
      if (error) throw error;
      setWorkbook(data?.workbook ?? null);
    } catch (e: any) {
      console.error(e);
      toast.error("워크북을 불러오지 못했어요");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!workbook) return;
    setDownloading(true);
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const el = document.getElementById("workbook-print-area");
      if (!el) throw new Error("출력 영역을 찾을 수 없어요");
      await html2pdf()
        .set({
          margin: [10, 10, 10, 10],
          filename: `30일_마음_트랙_워크북.pdf`,
          image: { type: "jpeg", quality: 0.96 },
          html2canvas: { scale: 2, useCORS: true, backgroundColor: "#ffffff" },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          pagebreak: { mode: ["css", "legacy"] },
        })
        .from(el)
        .save();
      toast.success("워크북 PDF를 저장했어요");
    } catch (e) {
      console.error(e);
      toast.error("PDF 생성에 실패했어요");
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!workbook) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-slate-500 text-sm">워크북을 찾을 수 없어요</p>
      </div>
    );
  }

  const cert = workbook.completion_certificate ?? {};
  const moodTrend: Array<{ day: number; mood?: number; energy?: number; clarity?: number }> =
    workbook.chart_data?.moodTrend ?? [];
  const enrollment = workbook.compiled_data?.enrollment ?? {};
  const nickname = enrollment?.baseline_data?.nickname ?? "당신";
  const checkins = workbook.compiled_data?.checkins ?? [];

  return (
    <div className="min-h-screen bg-[#fbf9f3] pb-24">
      {/* 헤더 */}
      <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b border-slate-200/70">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-slate-700 text-sm font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            뒤로
          </button>
          <div className="text-[10px] font-bold tracking-[0.2em] text-[#8a7a4d]">
            FINAL WORKBOOK
          </div>
          <Button
            size="sm"
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="h-8 rounded-full bg-[#8a7a4d] hover:bg-[#6f6240] text-white text-[11px] font-bold px-3"
          >
            {downloading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <>
                <Download className="w-3 h-3 mr-1" /> PDF
              </>
            )}
          </Button>
        </div>
      </header>

      {/* 출력 영역 */}
      <div id="workbook-print-area" className="max-w-3xl mx-auto px-4 py-6 space-y-5">
        {/* 표지 */}
        <Card
          className="bg-white rounded-3xl border border-[#C8B88A]/40 px-6 py-10 text-center relative overflow-hidden"
          style={{ pageBreakAfter: "always" }}
        >
          <div className="absolute top-5 left-6 right-6 h-px bg-[#C8B88A]/40" />
          <div className="absolute bottom-5 left-6 right-6 h-px bg-[#C8B88A]/40" />
          <div className="text-[10px] font-bold tracking-[0.3em] text-[#8a7a4d] uppercase mb-6">
            AIHPRO Mind Track · Vol. 01
          </div>
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-5"
            style={{
              background: "radial-gradient(circle, #f5efdc 0%, #C8B88A 60%, #8a7a4d 100%)",
            }}
          >
            <BookOpen className="w-9 h-9 text-white" strokeWidth={1.6} />
          </motion.div>
          <h1
            className="text-[28px] font-bold text-slate-900 leading-tight break-keep"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            나의 30일
            <br />
            마음 트랙 워크북
          </h1>
          <div className="w-12 h-px bg-[#8a7a4d] mx-auto my-4" />
          <p className="text-[14px] text-slate-700 font-bold break-keep">{nickname}</p>
          <p className="text-[12px] text-slate-500 mt-1 break-keep">
            {cert.trackTheme ?? "30일 마음 트랙"}
          </p>
          <p className="text-[10px] text-slate-400 mt-6 font-mono">
            {cert.certificateNo} · {new Date(cert.issuedAt ?? Date.now()).toLocaleDateString("ko-KR")}
          </p>
        </Card>

        {/* 목차 */}
        <Card className="bg-white rounded-3xl border border-slate-200/70 p-6">
          <div className="text-[10px] font-bold tracking-[0.2em] text-[#8a7a4d] uppercase mb-3">
            Table of Contents
          </div>
          <div className="space-y-2">
            {WORKBOOK_CHAPTERS.map((c) => (
              <div key={c.id} className="flex items-baseline gap-3 text-[13px]">
                <span className="font-mono text-slate-400 text-[11px] w-6">{c.chapterNo}</span>
                <span className="font-bold text-slate-900 break-keep flex-1">{c.title}</span>
                <span className="text-[10px] text-slate-400 font-mono">Day {c.day}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* 챕터 1 — 1주차 자가진단 */}
        <ChapterPage chapterIdx={1} title="첫 1주, 마음의 출발점">
          <p className="text-[13px] text-slate-700 leading-relaxed break-keep mb-3">
            첫 7일은 베이스라인을 측정한 시간이었어요. 가장 자주 떠오른 신호와 첫 무드 점수가
            워크북의 시작점이 됩니다.
          </p>
          <div className="grid grid-cols-3 gap-2 mt-3">
            <Stat label="첫 무드" value={`${moodTrend[0]?.mood ?? "-"}/10`} />
            <Stat label="첫 에너지" value={`${moodTrend[0]?.energy ?? "-"}/10`} />
            <Stat label="첫 명료도" value={`${moodTrend[0]?.clarity ?? "-"}/10`} />
          </div>
        </ChapterPage>

        {/* 챕터 2 — 변화 곡선 */}
        <ChapterPage chapterIdx={2} title="2주차, 변화의 첫 신호">
          <p className="text-[13px] text-slate-700 leading-relaxed break-keep mb-4">
            14일까지의 무드 변화를 그래프로 그렸어요. 작은 진폭이 곧 회복의 시작입니다.
          </p>
          <MoodMiniChart data={moodTrend} />
        </ChapterPage>

        {/* 챕터 3 — 패턴 */}
        <ChapterPage chapterIdx={3} title="3주차, 패턴의 발견">
          <p className="text-[13px] text-slate-700 leading-relaxed break-keep">
            21일간 쌓인 데이터에서 회복을 돕는 시간대와 무너지기 쉬운 순간이 보입니다. 총
            {` ${checkins.length}회`}의 체크인 메모가 이 챕터의 근거예요.
          </p>
        </ChapterPage>

        {/* 챕터 4 — AI 통찰 */}
        <ChapterPage chapterIdx={4} title="30일이 알려준 통찰">
          {workbook.ai_insights ? (
            <div className="text-[13px] text-slate-800 leading-relaxed break-keep whitespace-pre-wrap">
              {workbook.ai_insights}
            </div>
          ) : (
            <p className="text-[12px] text-slate-500 italic">
              통찰 데이터가 아직 준비되지 않았어요. PDF 생성 시 자동으로 채워집니다.
            </p>
          )}
        </ChapterPage>

        {/* 닫는 글 / 인증 */}
        <Card className="bg-white rounded-3xl border border-[#C8B88A]/40 p-6 text-center">
          <Award className="w-10 h-10 text-[#8a7a4d] mx-auto mb-3" strokeWidth={1.6} />
          <Badge className="bg-[#C8B88A]/20 text-[#8a7a4d] border-0 mb-3">
            COMPLETION CERTIFICATE
          </Badge>
          <h3
            className="text-xl font-bold text-slate-900 break-keep"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            30일 마음 트랙 완주
          </h3>
          <p className="text-[12px] text-slate-600 mt-2 break-keep">
            {nickname}님은 30일간 자신의 마음을 꾸준히 들여다봤어요.
            <br />
            이 워크북은 그 시간의 증거입니다.
          </p>
          <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-slate-100">
            <Stat label="총 체크인" value={`${cert.completedCheckins ?? checkins.length}일`} />
            <Stat label="기간" value="30일" />
            <Stat label="배지" value="GOLD" tone="gold" />
          </div>
          <p className="text-[10px] text-slate-400 font-mono mt-5">
            {cert.certificateNo} · aihpro.app
          </p>
        </Card>

        {/* CTA */}
        <Card className="bg-gradient-to-br from-[#fbf7eb] to-white rounded-3xl border border-[#C8B88A]/30 p-5">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#C8B88A]/25 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-[#8a7a4d]" />
            </div>
            <div>
              <h4 className="text-[14px] font-bold text-slate-900 break-keep">
                다음 30일은 전문가와 함께
              </h4>
              <p className="text-[12px] text-slate-600 mt-1 break-keep leading-relaxed">
                30일 데이터를 가지고 코칭을 받으면 회복 속도가 더 빨라져요.
              </p>
              <Button
                onClick={() => navigate("/expert-hiring")}
                className="mt-3 h-9 rounded-full bg-[#8a7a4d] hover:bg-[#6f6240] text-white text-[12px] font-bold px-4"
              >
                전문가 매칭 보기
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* 하단 고정 다운로드 */}
      <div className="fixed bottom-4 left-0 right-0 z-30 px-4 sm:hidden">
        <Button
          onClick={handleDownloadPdf}
          disabled={downloading}
          className="w-full h-12 rounded-2xl bg-[#8a7a4d] hover:bg-[#6f6240] text-white font-bold shadow-lg"
        >
          {downloading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-1" />
          ) : (
            <FileText className="w-4 h-4 mr-1.5" />
          )}
          워크북 PDF 다운로드
        </Button>
      </div>
    </div>
  );
}

function ChapterPage({
  chapterIdx,
  title,
  children,
}: {
  chapterIdx: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card
      className="bg-white rounded-3xl border border-slate-200/70 p-6"
      style={{ pageBreakBefore: "always" }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="font-mono text-[11px] text-slate-400">CHAPTER 0{chapterIdx}</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>
      <h2
        className="text-[20px] font-bold text-slate-900 break-keep mb-4"
        style={{ fontFamily: "'Instrument Serif', serif" }}
      >
        {title}
      </h2>
      {children}
    </Card>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return (
    <div className="text-center">
      <div
        className={`text-sm font-bold ${
          tone === "gold" ? "text-[#8a7a4d]" : "text-slate-900"
        }`}
      >
        {value}
      </div>
      <div className="text-[9px] text-slate-500 uppercase tracking-wider mt-0.5">{label}</div>
    </div>
  );
}

function MoodMiniChart({
  data,
}: {
  data: Array<{ day: number; mood?: number }>;
}) {
  if (!data.length) {
    return (
      <p className="text-[11px] text-slate-400 italic">아직 충분한 데이터가 없어요.</p>
    );
  }
  const W = 320;
  const H = 80;
  const max = 10;
  const points = data
    .map((d, i) => {
      const x = (i / Math.max(1, data.length - 1)) * W;
      const y = H - ((d.mood ?? 0) / max) * H;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-20">
      <polyline
        fill="none"
        stroke="#8a7a4d"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}
