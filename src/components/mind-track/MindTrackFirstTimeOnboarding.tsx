import { useMemo, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Flame,
  Target,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Audience = "child" | "adult" | "parent" | "teen";

interface Props {
  open: boolean;
  onClose: () => void;
  onStart: () => void;
  onSnoozeToday?: () => void;
  /** 트랙 총 일수 — 기본 7일. 30일 트랙도 지원. */
  totalDays?: number;
  /** 사용자 컨텍스트 — 슬라이드 카피·미션 개인화에 사용 */
  audience?: Audience;
  /** 가입 시 선택한 트랙 포커스 (예: child_development, family_communication) */
  goalFocus?: string | null;
  /** /check 등에서 넘어왔다면 핵심 영역 — 더 뾰족한 카피용 */
  checkArea?: "language" | "emotion" | "social" | "focus" | null;
}

const AUDIENCE_LABEL: Record<Audience, string> = {
  child: "자녀 발달이 걱정인 부모",
  parent: "양육 갈등을 줄이고 싶은 부모",
  adult: "지친 마음을 회복하려는 어른",
  teen: "스스로 마음을 살피고 싶은 청소년",
};

/** 7일 트랙 — audience별 Day 1·2·3 개인화 미션. 강한 후킹용. */
const SEVEN_DAY_MISSIONS: Record<
  Audience,
  { d1: string; d2: string; d3: string }
> = {
  child: {
    d1: "Day 1 · 오늘 자녀의 ‘잘한 순간’ 1개를 30초만 적어요.",
    d2: "Day 2 · 잠자기 전 5분, 아이가 먼저 말하게 두는 ‘침묵의 5분’.",
    d3: "Day 3 · 짜증 신호가 올라올 때, 야단 대신 ‘감정 이름’ 1번 짚어주기.",
  },
  parent: {
    d1: "Day 1 · 오늘 아이와 부딪힌 1장면을 3줄로 적어요.",
    d2: "Day 2 · 훈육 전, 숨 3번 → 한 문장으로 말하기 연습.",
    d3: "Day 3 · 잠자기 전, 오늘 ‘안 싸운 5분’을 의도적으로 만들기.",
  },
  adult: {
    d1: "Day 1 · 지금 내 마음 상태를 3개 단어로만 적어보기.",
    d2: "Day 2 · 오늘 가장 ‘에너지를 뺏은 1가지’를 적고 거리두기.",
    d3: "Day 3 · 자기 전 3분, 오늘 ‘잘 버틴 나’에게 한 문장 인사.",
  },
  teen: {
    d1: "Day 1 · 오늘 내 기분을 점수(0~10)로 표시하기.",
    d2: "Day 2 · 마음이 답답할 때 쓸 ‘나만의 진정 문장’ 1개 정하기.",
    d3: "Day 3 · 하루 1번 ‘고마운 한 줄’ 기록하기.",
  },
};

const FOCUS_HOOK: Record<NonNullable<Props["checkArea"]>, string> = {
  language: "아이의 말문이 트이는 결정적 7일",
  emotion: "감정 폭발 → 안정까지 단 7일",
  social: "또래 갈등이 줄어드는 7일 루틴",
  focus: "‘끝까지 못 한다’를 깨는 7일 훈련",
};

export default function MindTrackFirstTimeOnboarding({
  open,
  onClose,
  onStart,
  onSnoozeToday,
  totalDays = 7,
  audience = "child",
  goalFocus,
  checkArea = null,
}: Props) {
  const [idx, setIdx] = useState(0);
  const isSeven = totalDays <= 7;

  const slides = useMemo(() => {
    if (!isSeven) {
      // 30일 트랙 — 기존 안내 유지
      return [
        {
          icon: Calendar,
          badge: "30일, 이렇게 흘러가요",
          title: "1주차 적응 → 2~3주차 실천 → 4주차 변화 리포트",
          body:
            "처음 7일은 짧은 셀프 체크로 출발점을 잡고, 8~21일은 매일 3분 미션으로 루틴을 만듭니다. 22~30일에는 변화 그래프와 한 달 회고 리포트를 받아보세요.",
          bullets: [
            "Day 1~7 — 마음 출발점 기록 + 짧은 적응 미션",
            "Day 8~21 — 매일 3분 맞춤 미션과 체크인",
            "Day 22~30 — 깊이 있는 코칭 + 30일 변화 리포트",
          ],
        },
        {
          icon: Target,
          badge: "하루 흐름은 이렇게",
          title: "오늘 미션 → 3분 실천 → 한 줄 기록",
          body: "복잡하지 않습니다. 매일 카드 하나만 열면 돼요.",
          bullets: [
            "1. 오늘의 미션 카드 열기 (홈 상단에 항상 노출)",
            "2. 안내 따라 3~5분 실천",
            "3. 한 줄 기록으로 체크인 완료 — 끝",
          ],
        },
        {
          icon: ShieldCheck,
          badge: "막힐 때는 여기로",
          title: "혼자 풀기 어려우면 사람이 옆에 있어요",
          body: "AI 코파일럿이 24시간 옆에 있고, 일정 시점에는 전문가 1:1 매칭도 추천해드려요.",
          bullets: [
            "미션 카드 ‘막혔어요’ 버튼 → 1탭 전문가 매칭",
            "Day 7·14·21 — 적응/중간점검/심화 케어 추천",
            "긴급 상황은 언제든 우선 매칭",
          ],
        },
      ];
    }

    // ─── 7일 트랙 — 강한 후킹 + 개인화 ──────────────────────────
    const aud = AUDIENCE_LABEL[audience];
    const hookTitle = checkArea ? FOCUS_HOOK[checkArea] : "당신의 다음 7일이 바뀝니다";
    const personalMissions = SEVEN_DAY_MISSIONS[audience];

    return [
      {
        icon: Flame,
        badge: "왜 ‘지금’ 7일인가요",
        title: hookTitle,
        body:
          "‘다음 주에 시작할게’가 쌓이면 6개월이 지나도 그대로예요. 작은 변화를 가장 빨리 ‘느끼게’ 해주는 길이가 7일입니다. 짧으니까, 시작도 완주도 가능해요.",
        bullets: [
          `${aud}을 위해 설계된 7일 트랙`,
          "하루 3분 · 카드 한 장만 열면 끝",
          "Day 7에는 ‘변화의 신호’ 리포트가 도착해요",
        ],
      },
      {
        icon: Calendar,
        badge: "7일은 이렇게 흘러가요",
        title: "Day 1–3 적응 → Day 4 전문가 → Day 5–7 루틴화",
        body:
          "발달 14년 전문가가 설계한 흐름. 무겁지 않게 시작해서, 4일차에 한 번 점검하고, 마지막 3일은 우리 집 루틴으로 굳혀요.",
        bullets: [
          "Day 1·4·7 — 변화 체크 (조금 더 깊게)",
          "Day 2·3·5·6 — 매일 3분 가벼운 미션",
          "Day 4 — 전문가 1:1 코칭 추천 (선택)",
        ],
      },
      {
        icon: Target,
        badge: "당신을 위한 ‘첫 7일’",
        title: "내 상황에 맞춰 짜둔 1·2·3일차 미션이에요",
        body:
          "일반론이 아니라, 방금 입력한 컨텍스트에 맞춘 미션입니다. PMF 베타 기간이라 7일 전체가 무료예요. 오늘 첫 카드부터 열어보세요.",
        bullets: [personalMissions.d1, personalMissions.d2, personalMissions.d3],
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSeven, audience, checkArea, goalFocus]);

  const slide = slides[idx];
  const Icon = slide.icon;
  const isLast = idx === slides.length - 1;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg p-0 overflow-hidden bg-white border-0">
        {/* 진행 인디케이터 */}
        <div className="px-6 pt-6 pb-2 flex items-center gap-1.5">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full flex-1 transition-all ${
                i <= idx ? "bg-[#1a1a1a]" : "bg-slate-200"
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="px-6 pb-2 pt-3 space-y-4"
          >
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-[#C8B88A]/15 flex items-center justify-center">
                <Icon className="w-5 h-5 text-[#8a7a4d]" />
              </div>
              <span className="text-[11px] font-semibold tracking-wider text-[#8a7a4d] uppercase">
                {slide.badge}
              </span>
            </div>

            <h2 className="text-xl md:text-2xl font-bold text-slate-900 break-keep leading-snug">
              {slide.title}
            </h2>

            <p className="text-sm text-slate-600 leading-relaxed break-keep">
              {slide.body}
            </p>

            <ul className="space-y-2 bg-slate-50 rounded-2xl p-4 border border-slate-100">
              {slide.bullets.map((b, i) => (
                <li
                  key={i}
                  className="flex gap-2 text-sm text-slate-700 leading-relaxed break-keep"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#C8B88A] shrink-0 mt-1" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </AnimatePresence>

        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => (idx === 0 ? onClose() : setIdx((i) => i - 1))}
              className="text-slate-500"
            >
              {idx === 0 ? "건너뛰기" : (
                <>
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  이전
                </>
              )}
            </Button>
            {onSnoozeToday && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onSnoozeToday}
                className="text-slate-400 hover:text-slate-700 text-xs"
              >
                오늘 다시 보지 않기
              </Button>
            )}
          </div>

          {isLast ? (
            <Button
              onClick={onStart}
              className="bg-[#1a1a1a] text-white hover:bg-black rounded-xl px-5"
            >
              {isSeven ? "Day 1 미션 열기" : "오늘의 미션 시작"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={() => setIdx((i) => i + 1)}
              className="bg-[#1a1a1a] text-white hover:bg-black rounded-xl px-5"
            >
              다음
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
