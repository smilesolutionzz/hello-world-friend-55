import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, ArrowRight, Sparkles, Share2, Copy, Check, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { trackEvent } from "@/components/common/Analytics";
import { saveSelfCheck, type SelfCheckLevel } from "@/lib/mindTrackSelfCheck";
import { toast } from "sonner";

// 선택한 목표에 맞춰 표시되는 5문항 셀프체크 위젯.
// 점수 0~10 → 안정 / 주의 / 도움 권장 3단계.
// 결과는 onComplete(level)로 상위에 전달 → 자동 전문가 제안 배너 트리거.

export type GoalCheckLevel = SelfCheckLevel;

interface GoalCheckDef {
  goalId: string;
  title: string;
  questions: string[];
  copy: {
    calm: string;
    watch: string;
    support: string;
  };
}

const GOAL_CHECKS: Record<string, GoalCheckDef> = {
  sleep: {
    goalId: "sleep",
    title: "수면 회복 셀프 체크",
    questions: [
      "잠들기까지 30분 이상 걸리는 날이 잦다",
      "한밤중에 자주 깨고 다시 잠들기 어렵다",
      "아침에 일어나도 개운하지 않다",
      "낮 동안 졸리거나 집중이 흐트러진다",
      "잠자리에서 걱정·생각이 멈추지 않는다",
    ],
    copy: {
      calm: "수면 리듬이 비교적 안정적이에요. 30일 트랙으로 더 깊은 회복 루틴을 만들어 보세요.",
      watch: "수면의 질이 흔들리는 신호가 보여요. 트랙의 ‘수면 회복 루틴’으로 30일 안에 패턴을 다듬을 수 있어요.",
      support: "수면 곤란이 일상에 영향을 주는 수준이에요. 30일 트랙과 함께 전문가 1:1 점검도 권해드려요.",
    },
  },
  stress: {
    goalId: "stress",
    title: "스트레스 셀프 체크",
    questions: [
      "사소한 일에도 쉽게 짜증이 난다",
      "최근 한 달 가슴이 답답하거나 두근거린 적이 있다",
      "쉬어도 피로가 풀리지 않는다",
      "할 일이 많아 머릿속이 정리되지 않는다",
      "혼자만의 회복 시간이 거의 없다",
    ],
    copy: {
      calm: "스트레스 관리 능력이 양호해요. 30일 트랙으로 회복 루틴을 더 단단하게 만들 수 있어요.",
      watch: "긴장 신호가 누적되는 단계예요. 매일 3분 마음 루틴으로 하강 곡선을 만들어 보세요.",
      support: "스트레스가 신체·감정에 영향을 주는 수준이에요. 트랙 + 전문가 1회 점검을 권해드려요.",
    },
  },
  mood: {
    goalId: "mood",
    title: "감정 안정 셀프 체크",
    questions: [
      "기분이 하루 안에서도 크게 오르내린다",
      "이유 없이 가라앉거나 허무한 순간이 있다",
      "예전엔 즐거웠던 일에 흥미가 줄었다",
      "감정이 격해진 뒤 후회하는 일이 잦다",
      "내 감정을 말로 표현하기 어렵다",
    ],
    copy: {
      calm: "감정의 폭이 비교적 안정적이에요. 트랙으로 자기이해 깊이를 더해 보세요.",
      watch: "감정의 진폭이 커지는 시기예요. 30일 동안 감정 패턴을 가볍게 기록해 보세요.",
      support: "감정 기복이 일상 기능에 영향을 주는 단계예요. 트랙과 함께 전문가 코칭이 도움이 됩니다.",
    },
  },
  focus: {
    goalId: "focus",
    title: "집중력 셀프 체크",
    questions: [
      "한 가지 일에 10분 이상 몰입하기 어렵다",
      "스마트폰을 자주 확인하게 된다",
      "할 일을 자꾸 미루고 마감에 쫓긴다",
      "회의·대화 도중 다른 생각이 끼어든다",
      "끝낸 일이 기억나지 않을 때가 있다",
    ],
    copy: {
      calm: "집중력의 기본 체력이 잘 유지되고 있어요. 트랙으로 루틴을 정교하게 다듬어 보세요.",
      watch: "주의 분산 신호가 보여요. 30일 트랙의 마이크로 액션이 도움이 될 거예요.",
      support: "집중 곤란이 업무·학업에 영향을 주는 수준이에요. 전문가 1:1 점검도 함께 권해드려요.",
    },
  },
  relationship: {
    goalId: "relationship",
    title: "관계 셀프 체크",
    questions: [
      "가족·동료와 사소한 말다툼이 잦다",
      "내 말이 잘 전달되지 않는다고 느낀다",
      "거절·요청을 표현하기 어렵다",
      "관계 후 혼자 곱씹는 시간이 길다",
      "갈등을 피하려 자주 참는다",
    ],
    copy: {
      calm: "관계 자원이 안정적이에요. 트랙으로 소통 결을 한 단계 더 다듬어 보세요.",
      watch: "관계 피로가 누적되고 있어요. 매일 3분 트랙으로 자기 표현 패턴을 정리해 보세요.",
      support: "관계 갈등이 감정 회복을 방해하는 수준이에요. 전문가와 함께 점검해 보시는 걸 권합니다.",
    },
  },
  self: {
    goalId: "self",
    title: "자기 이해 셀프 체크",
    questions: [
      "내가 무엇을 원하는지 잘 모르겠다",
      "선택을 자주 후회한다",
      "내 감정의 원인을 설명하기 어렵다",
      "타인의 평가에 쉽게 흔들린다",
      "‘진짜 나’가 무엇인지 헷갈린다",
    ],
    copy: {
      calm: "자기이해가 어느 정도 자리 잡혀 있어요. 트랙으로 패턴을 더 깊이 들여다 보세요.",
      watch: "자기상의 윤곽이 흔들리는 시기예요. 30일 동안 가볍게 기록하며 정리해 보세요.",
      support: "자기 인식의 부담이 큰 단계예요. 트랙 + 전문가 1회 코칭을 권해드려요.",
    },
  },
  parenting: {
    goalId: "parenting",
    title: "육아 번아웃 셀프 체크",
    questions: [
      "아이에게 욱하는 일이 늘었다",
      "혼자만의 시간이 거의 없다",
      "잠을 자도 회복이 안 된다",
      "‘좋은 부모’가 아닌 것 같아 자책한다",
      "육아의 즐거움이 잘 느껴지지 않는다",
    ],
    copy: {
      calm: "지금의 균형을 잘 지키고 있어요. 30일 트랙으로 회복 루틴을 더 견고하게 만들어 보세요.",
      watch: "육아 피로가 누적되는 단계예요. 매일 3분 회복 루틴이 필요해요.",
      support: "육아 번아웃이 깊어진 상태예요. 트랙과 함께 전문가 1:1 코칭을 권해드려요.",
    },
  },
  family_communication: {
    goalId: "family_communication",
    title: "아이와의 소통 셀프 체크",
    questions: [
      "아이와 대화가 명령·지시로 끝나는 일이 많다",
      "훈육 후 후회되는 순간이 잦다",
      "아이의 감정을 읽어주기 어렵다",
      "남편/아내와 훈육 방식이 다르다",
      "아이가 감정을 잘 표현하지 않는다",
    ],
    copy: {
      calm: "관계의 안정선이 잘 유지되고 있어요. 트랙으로 소통의 결을 한 단계 더 다듬어 보세요.",
      watch: "소통이 어긋나는 신호가 보여요. 30일 트랙이 안정 애착 루틴 만들기에 도움이 됩니다.",
      support: "갈등 패턴이 굳어지는 단계예요. 전문가 코칭과 함께 점검해 보시는 걸 권합니다.",
    },
  },
};

interface Props {
  goalId: string | null;
  onComplete?: (
    level: GoalCheckLevel,
    goalId: string,
    extra?: { shareId?: string; score: number; max: number; goalTitle: string },
  ) => void;
}

export default function GoalSelfCheckSection({ goalId, onComplete }: Props) {
  const navigate = useNavigate();
  const def = goalId ? GOAL_CHECKS[goalId] : null;
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [shareId, setShareId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  // 목표가 바뀌면 상태 초기화
  useEffect(() => {
    setAnswers({});
    setSubmitted(false);
    setShareId(null);
    setCopied(false);
  }, [goalId]);

  if (!def) return null;

  const total = Object.values(answers).reduce((a, b) => a + b, 0);
  const max = def.questions.length * 2;
  const allAnswered = Object.keys(answers).length === def.questions.length;

  const level: GoalCheckLevel =
    total <= max * 0.3 ? "calm" : total <= max * 0.6 ? "watch" : "support";

  const meta = {
    calm: { label: "안정권", className: "border-emerald-200 bg-emerald-50 text-emerald-700" },
    watch: { label: "주의권", className: "border-amber-200 bg-amber-50 text-amber-700" },
    support: { label: "도움 권장", className: "border-rose-200 bg-rose-50 text-rose-700" },
  }[level];

  const handleSubmit = async () => {
    if (!allAnswered) return;
    setSubmitted(true);
    setSaving(true);
    trackEvent("mt_goal_check_complete", {
      goal_id: def.goalId,
      level,
      score: total,
      max,
    });
    // DB 저장 (실패해도 결과 화면은 보여줌)
    const saved = await saveSelfCheck({
      goalId: def.goalId,
      goalTitle: def.title,
      level,
      score: total,
      maxScore: max,
      questions: def.questions,
      answers: def.questions.map((_, i) => answers[i] ?? 0),
      summary: def.copy[level],
    });
    setSaving(false);
    if (saved?.share_id) setShareId(saved.share_id);
    onComplete?.(level, def.goalId, {
      shareId: saved?.share_id,
      score: total,
      max,
      goalTitle: def.title,
    });
  };

  const shareUrl = shareId ? `${window.location.origin}/mind-track/check/${shareId}` : "";

  const handleShare = async () => {
    if (!shareUrl) return;
    trackEvent("mt_goal_check_share", { goal_id: def.goalId, level });
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${def.title} 결과 (${meta.label})`,
          text: `30일 마음 트랙 ${def.title}: ${meta.label} · ${total}/${max}`,
          url: shareUrl,
        });
        return;
      } catch { /* fallthrough */ }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("공유 링크가 복사되었어요");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("복사에 실패했어요. 직접 주소를 복사해주세요.");
    }
  };

  const goExpertWithPrefill = (urgent: boolean) => {
    trackEvent("mt_goal_check_cta_expert", { goal_id: def.goalId, level });
    const params = new URLSearchParams({
      from: "self_check",
      goal: def.goalId,
      level,
      score: String(total),
      max: String(max),
    });
    if (shareId) params.set("check", shareId);
    if (urgent) params.set("urgent", "true");
    navigate(`/expert-hiring?${params.toString()}`);
  };

  return (
    <Card className="border-slate-200 rounded-3xl bg-white">
      <CardContent className="p-6 md:p-8 space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <Badge variant="outline" className="mb-2 text-[11px]">선택한 목표 자가체크</Badge>
            <h3 className="text-lg md:text-xl font-bold text-slate-900 break-keep">{def.title}</h3>
            <p className="text-sm text-slate-500 mt-1 break-keep">
              5문항 · 1분이면 끝나요. 결과에 따라 다음 단계를 자동으로 안내해 드려요.
            </p>
          </div>
          {submitted && (
            <Badge variant="outline" className={`text-[11px] ${meta.className}`}>
              {meta.label} · {total}/{max}
            </Badge>
          )}
        </div>

        <div className="space-y-3">
          {def.questions.map((q, idx) => (
            <div key={idx} className="border border-slate-100 rounded-2xl p-3 md:p-4">
              <p className="text-sm text-slate-700 mb-2 break-keep">
                <span className="font-mono text-slate-400 mr-1">{String(idx + 1).padStart(2, "0")}</span>
                {q}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { v: 0, l: "아니다" },
                  { v: 1, l: "가끔" },
                  { v: 2, l: "자주" },
                ].map((opt) => (
                  <button
                    key={opt.v}
                    onClick={() => setAnswers((a) => ({ ...a, [idx]: opt.v }))}
                    className={`text-xs py-2 rounded-full border transition ${
                      answers[idx] === opt.v
                        ? "bg-slate-900 text-white border-slate-900"
                        : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
                    }`}
                  >
                    {opt.l}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {!submitted ? (
          <Button
            onClick={handleSubmit}
            disabled={!allAnswered}
            className="w-full rounded-2xl bg-slate-900 hover:bg-black text-white"
          >
            결과 확인하기
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        ) : (
          <div className="space-y-3">
            <div className={`rounded-2xl border p-4 ${meta.className}`}>
              <p className="text-sm font-medium break-keep">{def.copy[level]}</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={() => {
                  trackEvent("mt_goal_check_cta_track", { goal_id: def.goalId, level });
                  document.getElementById("goal-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className="flex-1 rounded-2xl bg-slate-900 hover:bg-black text-white"
              >
                <Sparkles className="w-4 h-4 mr-1.5" />
                30일 트랙으로 시작하기
              </Button>
              {level !== "calm" && (
                <Button
                  variant="outline"
                  onClick={() => {
                    trackEvent("mt_goal_check_cta_expert", { goal_id: def.goalId, level });
                    navigate(level === "support" ? "/expert-hiring?urgent=true" : "/expert-hiring");
                  }}
                  className="rounded-2xl"
                >
                  <AlertTriangle className="w-4 h-4 mr-1.5" />
                  전문가 연결
                </Button>
              )}
            </div>
            <p className="text-[11px] text-slate-400 text-center break-keep">
              본 셀프체크는 코칭/자기이해를 돕기 위한 도구이며 의료 진단을 대체하지 않습니다.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
