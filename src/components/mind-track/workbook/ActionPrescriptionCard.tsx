import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Sparkles, Lightbulb, PlayCircle, Package, ClipboardList,
  Loader2, ChevronDown, ChevronUp, ExternalLink,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  fetchOrCreatePrescription,
  type ActionPrescription,
} from "@/lib/mindTrackActionPrescription";
import ActionFlipCard from "./ActionFlipCard";


interface Props {
  enrollmentId: string;
  dayNumber: number;
  audience?: string;
  focus?: string | null;
  compact?: boolean; // 비세션 Day는 축소 버전
}

const FrameworkBadge: React.FC<{ framework?: string | null }> = ({ framework }) => {
  if (!framework) return null;
  const labelMap: Record<string, string> = {
    ABA: "ABA 행동분석",
    PCIT: "PCIT 부모-자녀 상호작용",
    CBT: "CBT 인지행동",
    MI: "MI 동기면담",
    BehavioralSleep: "행동수면 코칭",
  };
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-[#C8B88A]/10 text-[#8a7a4d] border border-[#C8B88A]/30">
      {labelMap[framework] ?? framework}
    </span>
  );
};

const ActionPrescriptionCard: React.FC<Props> = ({
  enrollmentId, dayNumber, audience, focus, compact = false,
}) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ActionPrescription | null>(null);
  const [rationaleOpen, setRationaleOpen] = useState(false);
  const [doneIdx, setDoneIdx] = useState<number[]>([]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchOrCreatePrescription({ enrollmentId, dayNumber, audience, focus })
      .then((p) => { if (!cancelled) setData(p); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [enrollmentId, dayNumber, audience, focus]);

  if (loading) {
    return (
      <Card className="p-6 bg-white border border-slate-200 rounded-3xl">
        <div className="flex items-center gap-2 text-slate-500 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" /> 오늘의 전문가 처방을 준비하고 있어요…
        </div>
      </Card>
    );
  }

  if (!data) return null;

  const actions = compact ? data.actions.slice(0, 2) : data.actions;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* 진단 요약 */}
      <Card className="p-6 sm:p-7 bg-white border border-slate-200 rounded-3xl">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-[#C8B88A]" />
          <span className="text-xs tracking-wider text-[#8a7a4d] font-semibold">
            오늘의 전문가 처방
          </span>
          <FrameworkBadge framework={data.framework} />
        </div>
        <p className="text-lg font-semibold text-slate-900 break-keep leading-relaxed">
          {data.summary || "오늘은 어제의 관찰을 한 줄로 정리해 보세요."}
        </p>
      </Card>

      {/* 액션 카드 */}
      <div className="space-y-3">
        {actions.map((a, i) => {
          const done = doneIdx.includes(i);
          return (
            <Card
              key={i}
              className={`p-5 sm:p-6 bg-white border rounded-2xl transition ${
                done ? "border-emerald-200 bg-emerald-50/30" : "border-slate-200"
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-[#C8B88A] font-bold text-sm">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h4 className="font-semibold text-slate-900 break-keep">{a.title}</h4>
                </div>
                <button
                  onClick={() =>
                    setDoneIdx((cur) =>
                      cur.includes(i) ? cur.filter((x) => x !== i) : [...cur, i]
                    )
                  }
                  className={`text-xs px-2.5 py-1 rounded-full font-medium border transition ${
                    done
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-white text-slate-600 border-slate-300 hover:border-slate-400"
                  }`}
                >
                  {done ? "완료" : "체크"}
                </button>
              </div>
              <div className="space-y-2 text-sm text-slate-700 leading-relaxed break-keep">
                <p><span className="font-semibold text-slate-500">언제 · </span>{a.when}</p>
                <p><span className="font-semibold text-slate-500">어떻게 · </span>{a.how}</p>
                <p className="text-slate-500"><span className="font-semibold">왜 · </span>{a.why}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* 근거 패널 */}
      {data.rationale?.key_principles?.length ? (
        <Card className="p-5 bg-white border border-slate-200 rounded-2xl">
          <button
            onClick={() => setRationaleOpen((v) => !v)}
            className="w-full flex items-center justify-between text-sm font-semibold text-slate-700"
          >
            <span className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-[#C8B88A]" />
              이 처방이 작동하는 이유
            </span>
            {rationaleOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {rationaleOpen && (
            <ul className="mt-4 space-y-2 text-sm text-slate-600 leading-relaxed">
              {data.rationale.key_principles.map((p, i) => (
                <li key={i} className="flex gap-2 break-keep">
                  <span className="text-[#C8B88A]">•</span><span>{p}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      ) : null}

      {/* 추천 영상 */}
      {data.video_picks?.length ? (
        <Card className="p-5 sm:p-6 bg-white border border-slate-200 rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <PlayCircle className="w-4 h-4 text-[#C8B88A]" />
            <h4 className="text-sm font-semibold text-slate-900">오늘의 추천 영상</h4>
          </div>
          <div className="space-y-3">
            {data.video_picks.map((v, i) => (
              <a
                key={i}
                href={v.youtubeSearchUrl}
                target="_blank"
                rel="noreferrer"
                className="block p-3 rounded-xl border border-slate-200 hover:border-[#C8B88A] hover:bg-amber-50/30 transition"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-sm text-slate-900 break-keep">{v.title}</p>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </div>
                <p className="text-xs text-slate-500 mt-1 break-keep">{v.why}</p>
              </a>
            ))}
          </div>
        </Card>
      ) : null}

      {/* 발달 트랙: 관찰 체크리스트 */}
      {data.audience === "child_dev" && data.observation_points?.length ? (
        <Card className="p-5 sm:p-6 bg-white border border-slate-200 rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList className="w-4 h-4 text-[#C8B88A]" />
            <h4 className="text-sm font-semibold text-slate-900">
              ABC 관찰 포인트 (오늘)
            </h4>
          </div>
          <ul className="space-y-2 text-sm text-slate-700">
            {data.observation_points.map((p, i) => (
              <li key={i} className="flex gap-2 break-keep">
                <span className="text-[#C8B88A] font-mono text-xs mt-0.5">{i + 1}.</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-slate-500 mt-4 leading-relaxed">
            저녁에 관찰 일지에서 위 항목들을 한 줄씩 정리해 주세요.
          </p>
        </Card>
      ) : null}

      {/* 발달 트랙: 도구·도서 */}
      {data.audience === "child_dev" && data.product_picks?.length ? (
        <Card className="p-5 sm:p-6 bg-white border border-slate-200 rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <Package className="w-4 h-4 text-[#C8B88A]" />
            <h4 className="text-sm font-semibold text-slate-900">오늘 시도해볼 도구·도서</h4>
          </div>
          <div className="space-y-3">
            {data.product_picks.map((p, i) => (
              <div key={i} className="p-3 rounded-xl border border-slate-200">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="font-semibold text-sm text-slate-900 break-keep">{p.name}</p>
                  <span className="text-[11px] text-slate-500 shrink-0">{p.ageRange}</span>
                </div>
                <p className="text-xs text-slate-600 mt-1 break-keep">{p.why}</p>
                <p className="text-[11px] text-slate-400 mt-2">
                  검색 키워드: <span className="font-mono">{p.searchKeyword}</span>
                </p>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 mt-3">
            * 구매·제휴 링크가 아닌 큐레이션 정보입니다. 직접 비교 후 선택해 주세요.
          </p>
        </Card>
      ) : null}
    </motion.div>
  );
};

export default ActionPrescriptionCard;
