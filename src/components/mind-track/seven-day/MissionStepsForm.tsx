/**
 * 7일 트랙 — 미션 스텝별 입력 폼
 *
 * action_steps 배열을 받아 각 스텝의 한국어 텍스트를 분석해
 * 가장 자연스러운 입력 컴포넌트로 자동 변환합니다.
 *
 *  - "N 가지", "세 가지", "두 가지" → N개의 한 줄 입력 (kind: "list")
 *  - "감정 단어", "키워드", "단어" → 칩 입력 최대 5개 (kind: "chips")
 *  - "적기", "써보기", "기록", "묘사", "정리" → 멀티라인 (kind: "text")
 *  - 그 외 (준비/관찰/호흡 등 행동형) → 체크박스 (kind: "check")
 *
 * onChange로 정형화된 payload를 상위에 전달하면, 상위가
 * mind_track_checkins.reflection_payload 컬럼에 저장합니다.
 */
import { useEffect, useMemo, useState } from "react";
import { Check, Plus, X } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

export type StepKind = "check" | "list" | "chips" | "text";

export interface StepAnswer {
  idx: number;
  label: string;
  kind: StepKind;
  value: boolean | string | string[];
}

export interface MissionStepsPayload {
  version: 1;
  day: number;
  steps: StepAnswer[];
}

interface ParsedStep {
  idx: number;
  label: string;
  kind: StepKind;
  /** list/chips 최대 칸 수 */
  size?: number;
}

const NUM_WORDS: Record<string, number> = {
  한: 1, 두: 2, 세: 3, 네: 4, 다섯: 5,
};

function parseStep(raw: string, idx: number): ParsedStep {
  const label = raw.trim();
  // "세 가지", "3가지", "두 가지" → list
  const numMatch =
    label.match(/(\d+)\s*가지/) ??
    label.match(/(한|두|세|네|다섯)\s*가지/);
  if (numMatch) {
    const n = NUM_WORDS[numMatch[1]] ?? Number(numMatch[1]);
    if (Number.isFinite(n) && n >= 2 && n <= 5) {
      return { idx, label, kind: "list", size: n };
    }
  }
  // 감정 단어 / 키워드 → chips
  if (/(감정\s*단어|키워드|단어\s*적|단어로\s*적|단어\s*나열)/.test(label)) {
    return { idx, label, kind: "chips", size: 5 };
  }
  // 적기/기록/써보기/묘사/정리 → text
  if (/(적기|적어|써\s*보|기록|묘사|정리|메모)/.test(label)) {
    return { idx, label, kind: "text" };
  }
  return { idx, label, kind: "check" };
}

interface Props {
  day: number;
  steps: string[];
  initial?: MissionStepsPayload | null;
  disabled?: boolean;
  onChange: (payload: MissionStepsPayload) => void;
}

export default function MissionStepsForm({ day, steps, initial, disabled, onChange }: Props) {
  const parsed = useMemo(() => steps.map((s, i) => parseStep(s, i)), [steps]);

  const [answers, setAnswers] = useState<StepAnswer[]>(() =>
    parsed.map((p) => {
      const prev = initial?.steps.find((s) => s.idx === p.idx && s.kind === p.kind);
      if (prev) return prev;
      return {
        idx: p.idx,
        label: p.label,
        kind: p.kind,
        value:
          p.kind === "check"
            ? false
            : p.kind === "list"
            ? Array.from({ length: p.size ?? 3 }, () => "")
            : p.kind === "chips"
            ? []
            : "",
      };
    }),
  );

  useEffect(() => {
    onChange({ version: 1, day, steps: answers });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answers]);

  const update = (idx: number, value: StepAnswer["value"]) => {
    setAnswers((prev) => prev.map((a) => (a.idx === idx ? { ...a, value } : a)));
  };

  if (parsed.length === 0) return null;

  return (
    <div className="space-y-3">
      {parsed.map((p) => {
        const a = answers.find((x) => x.idx === p.idx)!;
        return (
          <div
            key={p.idx}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 space-y-3"
          >
            <div className="flex items-start gap-3">
              <span className="shrink-0 w-6 h-6 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center">
                {String(p.idx + 1).padStart(2, "0")}
              </span>
              <span className="text-sm font-medium text-slate-800 leading-relaxed break-keep">
                {p.label}
              </span>
            </div>

            {p.kind === "check" && (
              <button
                type="button"
                disabled={disabled}
                onClick={() => update(p.idx, !(a.value as boolean))}
                className={[
                  "ml-9 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors",
                  a.value
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-slate-50 text-slate-500 border border-slate-200 hover:border-slate-300",
                ].join(" ")}
              >
                <Check className="w-3.5 h-3.5" />
                {a.value ? "했어요" : "체크"}
              </button>
            )}

            {p.kind === "list" && (
              <div className="ml-9 space-y-2">
                {(a.value as string[]).map((v, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 w-4">{i + 1}.</span>
                    <Input
                      value={v}
                      disabled={disabled}
                      onChange={(e) => {
                        const next = [...(a.value as string[])];
                        next[i] = e.target.value;
                        update(p.idx, next);
                      }}
                      placeholder={`예시 ${i + 1}`}
                      className="h-9 rounded-xl border-slate-200 text-sm"
                    />
                  </div>
                ))}
              </div>
            )}

            {p.kind === "chips" && (
              <ChipsInput
                values={a.value as string[]}
                max={p.size ?? 5}
                disabled={disabled}
                onChange={(next) => update(p.idx, next)}
              />
            )}

            {p.kind === "text" && (
              <div className="ml-9">
                <Textarea
                  value={a.value as string}
                  disabled={disabled}
                  onChange={(e) => update(p.idx, e.target.value)}
                  placeholder="자유롭게 적어주세요"
                  rows={3}
                  className="resize-none rounded-xl border-slate-200 text-sm"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function ChipsInput({
  values,
  max,
  disabled,
  onChange,
}: {
  values: string[];
  max: number;
  disabled?: boolean;
  onChange: (next: string[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim();
    if (!v || values.includes(v) || values.length >= max) return;
    onChange([...values, v]);
    setDraft("");
  };
  return (
    <div className="ml-9 space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {values.map((v, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#C8B88A]/15 text-[#7a6a3d] text-xs font-medium border border-[#C8B88A]/30"
          >
            {v}
            {!disabled && (
              <button type="button" onClick={() => onChange(values.filter((_, idx) => idx !== i))}>
                <X className="w-3 h-3" />
              </button>
            )}
          </span>
        ))}
      </div>
      {values.length < max && !disabled && (
        <div className="flex items-center gap-2">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
            placeholder={`단어 입력 후 Enter (최대 ${max}개)`}
            className="h-9 rounded-xl border-slate-200 text-sm"
          />
          <button
            type="button"
            onClick={add}
            className="h-9 px-3 rounded-xl bg-slate-900 text-white text-xs font-semibold inline-flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> 추가
          </button>
        </div>
      )}
    </div>
  );
}

/** 완료 가능 여부: check 100% + list/chips/text 중 하나라도 값 있음 */
export function isPayloadComplete(p: MissionStepsPayload | null | undefined): boolean {
  if (!p || p.steps.length === 0) return true;
  const checks = p.steps.filter((s) => s.kind === "check");
  const allChecked = checks.every((s) => s.value === true);
  const writable = p.steps.filter((s) => s.kind !== "check");
  const anyWritten = writable.some((s) => {
    if (s.kind === "list") return (s.value as string[]).some((v) => v.trim().length > 0);
    if (s.kind === "chips") return (s.value as string[]).length > 0;
    if (s.kind === "text") return (s.value as string).trim().length > 0;
    return false;
  });
  if (writable.length === 0) return allChecked;
  return allChecked && anyWritten;
}
