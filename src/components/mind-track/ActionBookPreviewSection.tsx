import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles, BookOpen, Eye, FileText, Lock, Wand2, Loader2,
  Calendar, ArrowRight, ShieldCheck, GraduationCap, BadgeCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { trackWorkbookFunnel } from "@/lib/workbookFunnelTracking";
import { WORKBOOK_CHAPTERS } from "@/lib/mindTrackChapters";
import { toast } from "sonner";

interface DayLine { title: string; body: string }

const DEFAULT_LINES: DayLine[] = [
  { title: "수면 리셋", body: "잠들기 30분 전 핸드폰 거실에 두기" },
  { title: "감정 신호", body: "오늘 짜증 1번을 한 줄로 적기" },
  { title: "회복 루틴", body: "퇴근 후 5분 산책 1바퀴" },
];

const TIMELINE = [
  { day: 1, label: "출발점 기록", phase: "Day 01" },
  { day: 7, label: "초기 회복 루틴", phase: "Week 01" },
  { day: 14, label: "정체기 돌파", phase: "Week 02" },
  { day: 21, label: "심화 코칭", phase: "Week 03" },
  { day: 30, label: "변화 리포트", phase: "Day 30" },
];

interface Props {
  nickname?: string;
  concern?: string;
  goalId?: string | null;
  goalLabel?: string | null;
  ageGroup?: string;
  trackPrice: number;
  loggedIn: boolean;
  onOpenSampleModal: () => void;
  onUnlockClick: (location: string) => void;
}

export default function ActionBookPreviewSection({
  nickname,
  concern,
  goalId,
  goalLabel,
  ageGroup,
  trackPrice,
  loggedIn,
  onOpenSampleModal,
  onUnlockClick,
}: Props) {
  const [days, setDays] = useState<DayLine[]>(DEFAULT_LINES);
  const [generating, setGenerating] = useState(false);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [localNickname, setLocalNickname] = useState(nickname || "");
  const [localConcern, setLocalConcern] = useState(concern || "");

  useEffect(() => { if (nickname) setLocalNickname((v) => v || nickname); }, [nickname]);
  useEffect(() => { if (concern) setLocalConcern((v) => v || concern); }, [concern]);


  const sectionRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const viewedRef = useRef(false);

  // View tracking via IntersectionObserver — fires once per page load
  useEffect(() => {
    if (!sectionRef.current || viewedRef.current) return;
    const el = sectionRef.current;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !viewedRef.current) {
            viewedRef.current = true;
            trackWorkbookFunnel("mt_action_book_preview_view", {
              has_concern: !!(concern && concern.trim().length > 5),
              has_goal: !!goalId,
              logged_in: loggedIn,
              source: "mind_track_lock_card",
            });
            io.disconnect();
            break;
          }
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canGenerate = (localConcern.trim().length >= 5) || !!goalId;

  const handleGenerate = async () => {
    if (!canGenerate) {
      toast.error("고민을 5자 이상 적거나, 집중 목표를 먼저 골라주세요");
      return;
    }
    setGenerating(true);
    trackWorkbookFunnel("mt_action_book_live_generate", {
      has_nickname: !!localNickname,
      has_concern: localConcern.trim().length > 5,
      has_goal: !!goalId,
      logged_in: loggedIn,
    });
    try {
      const { data, error } = await supabase.functions.invoke(
        "personalize-action-book-preview",
        {
          body: {
            nickname: localNickname.trim() || "당신",
            goalId,
            goalLabel,
            concern: localConcern.trim(),
            ageGroup: ageGroup || "",
          },
        },
      );
      if (error) throw error;
      const next = Array.isArray(data?.days) && data.days.length === 3 ? data.days : DEFAULT_LINES;
      setDays(next);
      setIsPersonalized(!data?.fallback);
      toast.success(data?.fallback ? "샘플로 표시했어요" : "Day 1~3 초맞춤 미션이 생성됐어요");
    } catch (e: any) {
      console.warn("[preview] generate failed", e);
      toast.error("생성에 실패했어요. 잠시 후 다시 시도해 주세요");
    } finally {
      setGenerating(false);
    }
  };



  return (
    <div
      ref={sectionRef}
      className="mt-5 rounded-2xl border border-[#C8B88A]/30 bg-gradient-to-br from-[#FBF9F2] to-white p-4 md:p-5"
    >
      {/* 미니 30일 타임라인 */}
      <div className="mb-5">
        <p className="text-[10px] font-semibold tracking-wider text-[#8a7a4d] uppercase mb-2 flex items-center gap-1.5">
          <Calendar className="w-3 h-3" /> 30일이 완성되는 흐름
        </p>
        <div className="relative pt-1">
          <div className="absolute left-2 right-2 top-[14px] h-px bg-gradient-to-r from-[#C8B88A]/20 via-[#C8B88A]/60 to-[#C8B88A]/20" />
          <div className="grid grid-cols-5 gap-1 relative">
            {TIMELINE.map((t, idx) => (
              <div key={t.day} className="flex flex-col items-center text-center">
                <div className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center border ${
                  idx === 0
                    ? "bg-[#1a1a1a] text-white border-[#1a1a1a]"
                    : "bg-white text-[#8a7a4d] border-[#C8B88A]/50"
                }`}>
                  <span className="text-[9px] font-bold font-mono">{String(t.day).padStart(2, "0")}</span>
                </div>
                <p className="text-[9px] font-semibold text-foreground/80 mt-1 break-keep leading-tight">
                  {t.label}
                </p>
                <p className="text-[8px] font-mono text-[#C8B88A] mt-0.5">{t.phase}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 헤더 */}
      <div className="flex items-start gap-2.5 mb-3">
        <div className="w-9 h-9 rounded-xl bg-[#C8B88A]/20 flex items-center justify-center shrink-0">
          <BookOpen className="w-4 h-4 text-[#8a7a4d]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold tracking-wider text-[#8a7a4d] uppercase">
            Action Book · 전문가 설계 30일 트랙
          </p>
          <h3 className="text-base md:text-lg font-bold text-foreground break-keep leading-snug">
            14년 경력 현장 전문가가 설계한 30일 액션북
          </h3>
          <p className="text-xs text-foreground/60 mt-0.5 break-keep">
            CBT·행동활성화 등 검증된 이론 위에, 내 닉네임·고민·목표에 맞춘 한 줄만 AI가 다듬어요.
          </p>
        </div>
      </div>

      {/* 신뢰성 강조 칩 — 전문가 이론 기반 */}
      <div className="flex flex-wrap gap-1.5 mb-3">
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#1a1a1a] text-white text-[10px] font-semibold">
          <GraduationCap className="w-3 h-3" /> 전문가 설계 · 이론 기반 트랙
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#FBF8EE] border border-[#C8B88A]/40 text-[#8a7a4d] text-[10px] font-semibold">
          <BadgeCheck className="w-3 h-3" /> CBT · 행동활성화 근거
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#FBF8EE] border border-[#C8B88A]/40 text-[#8a7a4d] text-[10px] font-semibold">
          14년 현장 전문가 검수
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#FBF8EE] border border-[#C8B88A]/40 text-[#8a7a4d] text-[10px] font-semibold">
          내 정보로 한 줄만 맞춤
        </span>
      </div>

      <p className="text-[11px] text-foreground/65 break-keep leading-relaxed mb-3">
        30일 트랙은 14년 경력 현장 전문가가 설계한 <strong className="text-foreground">근거 기반 미션 구조</strong>예요.
        AI는 그 위에 닉네임·연령·고민에 맞춰 표현만 다듬어 드려요.
      </p>

      {/* 실시간 생성 버튼 — 단일 CTA */}
      <div className="flex items-center gap-2 flex-wrap mb-3">
        <Button
          size="sm"
          onClick={handleGenerate}
          disabled={generating}
          className="rounded-full bg-[#1a1a1a] text-white hover:bg-black h-9 text-xs px-4"
        >
          {generating ? (
            <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> 생성 중…</>
          ) : (
            <><Wand2 className="w-3.5 h-3.5 mr-1.5" /> 내 정보로 Day 1~3 실시간 생성</>
          )}
        </Button>
        {isPersonalized && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-semibold">
            <Sparkles className="w-3 h-3" /> 초맞춤 적용됨
          </span>
        )}
      </div>

      {/* PDF 캡처 대상 영역 */}
      <div ref={previewRef} className="bg-white rounded-xl p-3">
        <div className="flex items-center justify-between mb-2 px-1">
          <p className="text-[10px] font-mono text-[#8a7a4d] tracking-wider">
            AIHPRO · ACTION BOOK · DAY 01—03 PREVIEW
          </p>
          <p className="text-[10px] text-foreground/40 font-mono">
            {nickname ? `for ${nickname}` : ""}
          </p>
        </div>
        <div className="grid grid-cols-3 gap-1.5 mb-3">
          {days.map((d, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-lg bg-white border border-[#C8B88A]/40 p-2 flex flex-col justify-between min-h-[78px] shadow-[0_1px_3px_rgba(138,122,77,0.08)]"
            >
              <div>
                <p className="text-[8px] font-mono text-[#C8B88A] tracking-wider">
                  DAY {String(i + 1).padStart(2, "0")}
                </p>
                <p className="text-[10px] font-bold text-foreground break-keep leading-tight mt-0.5">
                  {d.title}
                </p>
              </div>
              <p className="text-[9px] text-foreground/70 break-keep leading-snug">{d.body}</p>
            </motion.div>
          ))}
        </div>

        {/* Day 4-30 잠금 — 그리드 대신 한 줄 진행 바로 압축 */}
        <div className="rounded-xl border border-[#C8B88A]/25 bg-[#FAF8F2] px-3 py-2.5 flex items-center gap-3">
          <div className="flex items-center gap-1.5 shrink-0">
            <Lock className="w-3.5 h-3.5 text-[#C8B88A]" />
            <span className="text-[10px] font-mono font-semibold text-[#8a7a4d] tracking-wider">
              DAY 04—30
            </span>
          </div>
          <div className="flex-1 h-1.5 rounded-full bg-white border border-[#C8B88A]/20 overflow-hidden">
            <div className="h-full w-[10%] bg-gradient-to-r from-[#C8B88A] to-[#1a1a1a] rounded-full" />
          </div>
          <span className="text-[10px] text-foreground/55 shrink-0">결제 후 매일 자동 열림</span>
        </div>
      </div>

      {/* 챕터 자동 정리 안내 */}
      <div className="rounded-xl bg-[#FAF8F2] border border-[#C8B88A]/20 px-3 py-2 mt-3 mb-3">
        <p className="text-[10px] font-semibold tracking-wider text-[#8a7a4d] uppercase mb-1">
          30장이 자동 정리되는 7개 챕터
        </p>
        <p className="text-[11px] text-foreground/70 break-keep leading-relaxed">
          {WORKBOOK_CHAPTERS.slice(0, 7).map((c) => `CH${c.chapterNo} ${c.shortTitle}`).join(" · ")}
        </p>
      </div>

      <div className="flex items-center justify-between gap-2 flex-wrap pt-2 border-t border-[#C8B88A]/15">
        <div className="flex items-center gap-1.5 text-[11px] text-foreground/55">
          <FileText className="w-3 h-3" />
          <span>샘플 PDF는 입력한 닉네임·목표로 자동 채워서 보여드려요</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenSampleModal}
          className="rounded-full border-[#C8B88A]/50 text-[#8a7a4d] hover:bg-[#C8B88A]/10 h-8 text-xs"
        >
          <Eye className="w-3.5 h-3.5 mr-1.5" />
          완성본 6장 미리보기
        </Button>
      </div>

      {/* 결제 CTA — 미리보기 안에서 바로 결제로 이동 */}
      <div className="mt-4 rounded-2xl bg-[#1a1a1a] text-white p-4 flex items-center gap-3 flex-wrap">
        <ShieldCheck className="w-5 h-5 shrink-0 text-[#C8B88A]" />
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold tracking-wider text-[#C8B88A] uppercase">
            30일 전체 잠금 해제
          </p>
          <p className="text-sm font-bold break-keep">
            결제하면 Day 04~30이 매일 자정에 한 장씩 열려요.
          </p>
        </div>
        <Button
          onClick={() => {
            trackWorkbookFunnel("mt_action_book_unlock_cta_click", {
              cta_location: "preview_inline",
              personalized: isPersonalized,
              logged_in: loggedIn,
              price: trackPrice,
            });
            onUnlockClick("preview_inline_cta");
          }}
          className="rounded-full bg-white text-[#1a1a1a] hover:bg-[#FBF8EE] h-9 text-xs font-bold"
        >
          <Sparkles className="w-3.5 h-3.5 mr-1" />
          ₩{trackPrice.toLocaleString()} 결제하고 30일 열기
          <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </Button>
      </div>
    </div>
  );
}
