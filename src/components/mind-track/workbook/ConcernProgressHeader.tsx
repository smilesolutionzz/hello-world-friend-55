import React from "react";
import { Card } from "@/components/ui/card";
import { Target, TrendingDown, TrendingUp, Minus } from "lucide-react";
import type { ConcernThread } from "@/lib/mindTrackConcernThread";

interface Props { thread: ConcernThread; }

export default function ConcernProgressHeader({ thread }: Props) {
  const delta = thread.current_score - thread.baseline_score;
  // 낮은 점수 = 고민이 가벼워짐 (개선). 즉 음수일수록 좋아짐.
  const improvement = -delta;
  const Icon = improvement > 0 ? TrendingDown : improvement < 0 ? TrendingUp : Minus;
  const tone =
    improvement > 0 ? "text-emerald-600 bg-emerald-50" :
    improvement < 0 ? "text-rose-600 bg-rose-50" :
    "text-slate-500 bg-slate-50";
  const label =
    improvement > 0 ? `${improvement}점 가벼워졌어요` :
    improvement < 0 ? `${-improvement}점 무거워졌어요` :
    "변화 없음";

  return (
    <Card className="p-5 sm:p-6 bg-white border border-[#C8B88A]/40 rounded-3xl">
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-full bg-[#C8B88A]/15">
          <Target className="w-5 h-5 text-[#8a7a4d]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs tracking-wider text-[#8a7a4d] font-semibold mb-1">내 고민 트래킹</p>
          <p className="text-base font-semibold text-slate-900 break-keep">{thread.concern_title}</p>
          {thread.goal_statement && (
            <p className="text-sm text-slate-500 mt-1 break-keep">목표 · {thread.goal_statement}</p>
          )}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <div className="text-sm text-slate-600">
              시작 <span className="font-semibold">{thread.baseline_score}</span>
              <span className="mx-2 text-slate-300">→</span>
              지금 <span className="font-semibold text-slate-900">{thread.current_score}</span>
              <span className="mx-2 text-slate-300">·</span>
              목표 <span className="font-semibold text-[#8a7a4d]">{thread.target_score}</span>
            </div>
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${tone}`}>
              <Icon className="w-3 h-3" /> {label}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
