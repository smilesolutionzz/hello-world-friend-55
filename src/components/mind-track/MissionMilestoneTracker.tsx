import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Lock, ClipboardCheck, Video, PenLine, Flag } from "lucide-react";
import { computeMilestones } from "@/lib/mindTrackMissionProgress";

interface Props {
  currentDay: number;
  checkins: any[];
  enrollmentId?: string;
}

/**
 * Day 1·2·14·21·30 등 핵심 마일스톤별로 검사·영상·회고 진행률을
 * 퍼센트 + 단계 바로 디테일하게 시각화. 워크북 미리보기/진행 화면 공통 사용.
 */
export default function MissionMilestoneTracker({
  currentDay,
  checkins,
  enrollmentId,
}: Props) {
  const milestones = computeMilestones(currentDay, checkins, enrollmentId);

  return (
    <Card className="p-5 sm:p-6 rounded-3xl bg-white border border-slate-200/70 shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        <Flag className="w-4 h-4 text-[#8a7a4d]" />
        <span className="text-[11px] font-bold tracking-[0.18em] text-[#8a7a4d] uppercase">
          Mission Milestones
        </span>
      </div>
      <h3 className="text-[16px] font-bold text-slate-900 mb-4 break-keep">
        Day별 미션 진행률 — 검사 · 영상 · 회고
      </h3>

      <div className="space-y-3">
        {milestones.map((m, idx) => {
          const tone = m.reached
            ? m.overallPercent >= 80
              ? "emerald"
              : m.overallPercent >= 40
              ? "amber"
              : "rose"
            : "slate";
          const barColor =
            tone === "emerald"
              ? "bg-emerald-500"
              : tone === "amber"
              ? "bg-amber-500"
              : tone === "rose"
              ? "bg-rose-400"
              : "bg-slate-300";

          return (
            <div
              key={m.day}
              className={`rounded-2xl border p-3.5 ${
                m.reached ? "border-slate-200 bg-white" : "border-slate-200/70 bg-slate-50/60"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      m.reached ? "bg-[#C8B88A]/20 text-[#8a7a4d]" : "bg-slate-200/70 text-slate-400"
                    }`}
                  >
                    {m.reached ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Lock className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] font-mono text-slate-400">{m.tag}</div>
                    <div
                      className={`text-[13px] font-bold break-keep ${
                        m.reached ? "text-slate-900" : "text-slate-500"
                      }`}
                    >
                      {m.label}
                    </div>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={`text-[11px] font-bold border-0 ${
                    tone === "emerald"
                      ? "bg-emerald-50 text-emerald-700"
                      : tone === "amber"
                      ? "bg-amber-50 text-amber-700"
                      : tone === "rose"
                      ? "bg-rose-50 text-rose-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {m.overallPercent}%
                </Badge>
              </div>

              {/* 메인 진행 바 */}
              <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden mb-2.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${m.overallPercent}%` }}
                  transition={{ duration: 0.6, delay: idx * 0.05 }}
                  className={`h-full ${barColor}`}
                />
              </div>

              {/* 3축 미니 바 — 검사 / 영상 / 회고 */}
              <div className="grid grid-cols-3 gap-2">
                <AxisChip
                  icon={ClipboardCheck}
                  label="검사"
                  percent={
                    m.assessmentDone === null
                      ? null
                      : m.assessmentDone
                      ? 100
                      : 0
                  }
                />
                <AxisChip icon={Video} label="영상" percent={m.videoPercent} />
                <AxisChip icon={PenLine} label="회고" percent={m.reflectionPercent} />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function AxisChip({
  icon: Icon,
  label,
  percent,
}: {
  icon: any;
  label: string;
  percent: number | null;
}) {
  const isNA = percent === null;
  const done = !isNA && percent >= 100;
  return (
    <div
      className={`rounded-lg border px-2 py-1.5 ${
        isNA
          ? "border-dashed border-slate-200 bg-slate-50/60"
          : done
          ? "border-emerald-200 bg-emerald-50/60"
          : "border-slate-200 bg-white"
      }`}
      title={isNA ? `${label}: 해당 없음 (이 마일스톤에는 적용되지 않아요)` : undefined}
    >
      <div className="flex items-center gap-1 mb-1">
        <Icon
          className={`w-3 h-3 ${
            isNA ? "text-slate-300" : done ? "text-emerald-600" : "text-slate-400"
          }`}
        />
        <span
          className={`text-[10px] font-bold ${
            isNA ? "text-slate-400" : done ? "text-emerald-700" : "text-slate-500"
          }`}
        >
          {label}
        </span>
        <span
          className={`ml-auto text-[10px] font-mono ${
            isNA ? "text-slate-400" : "text-slate-500"
          }`}
        >
          {isNA ? "해당 없음" : `${percent}%`}
        </span>
      </div>
      <div
        className={`h-1 rounded-full overflow-hidden ${
          isNA ? "bg-slate-100/70" : "bg-slate-100"
        }`}
      >
        {isNA ? (
          <div
            className="h-full w-full opacity-70"
            style={{
              background:
                "repeating-linear-gradient(45deg, #e2e8f0 0 4px, transparent 4px 8px)",
            }}
          />
        ) : (
          <div
            className={`h-full ${done ? "bg-emerald-500" : "bg-[#C8B88A]"}`}
            style={{ width: `${percent}%` }}
          />
        )}
      </div>
    </div>
  );
}
