/**
 * ABAMissionCard — child_development 트랙 전용 일일 ABA 미션 + 데이터 입력 폼.
 * 부모가 표적행동 빈도/지속/인터벌 또는 ABC 내러티브를 기록하고 즉시 저장(upsert).
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeft, ChevronRight, Plus, Minus, Play, Pause, Save, Loader2 } from "lucide-react";
import { ABA_CHILD_CURRICULUM_7D } from "@/lib/abaChildCurriculum";
import {
  defaultObservationForDay,
  upsertObservation,
  type ABAObservation,
} from "@/lib/abaObservations";
import { useToast } from "@/hooks/use-toast";

interface Props {
  day: number;
  onDayChange: (next: number) => void;
  childProfileId?: string | null;
  enrollmentId?: string | null;
  initial?: ABAObservation;
  onSaved?: (obs: ABAObservation) => void;
}

export default function ABAMissionCard({ day, onDayChange, childProfileId, enrollmentId, initial, onSaved }: Props) {
  const { toast } = useToast();
  const curriculum = ABA_CHILD_CURRICULUM_7D.find((d) => d.day === day);
  const [obs, setObs] = useState<ABAObservation>(() =>
    initial ?? defaultObservationForDay(day, childProfileId, enrollmentId),
  );
  const [saving, setSaving] = useState(false);
  const [stopwatchStart, setStopwatchStart] = useState<number | null>(null);
  const [, setTick] = useState(0);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    setObs(initial ?? defaultObservationForDay(day, childProfileId, enrollmentId));
    setStopwatchStart(null);
  }, [day, initial, childProfileId, enrollmentId]);

  // Stopwatch tick
  useEffect(() => {
    if (stopwatchStart == null) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => window.clearInterval(id);
  }, [stopwatchStart]);

  const liveDuration = useMemo(() => {
    const base = obs.duration_seconds ?? 0;
    if (stopwatchStart == null) return base;
    return base + Math.floor((Date.now() - stopwatchStart) / 1000);
  }, [obs.duration_seconds, stopwatchStart]);

  const patch = (p: Partial<ABAObservation>, autoSave = true) => {
    setObs((prev) => {
      const next = { ...prev, ...p };
      if (autoSave) scheduleSave(next);
      return next;
    });
  };

  const scheduleSave = (next: ABAObservation) => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => doSave(next, true), 900);
  };

  const doSave = async (payload: ABAObservation = obs, silent = false) => {
    setSaving(true);
    const saved = await upsertObservation(payload);
    setSaving(false);
    if (saved) {
      setObs((prev) => ({ ...prev, id: saved.id }));
      onSaved?.(saved);
      if (!silent) toast({ title: "저장 완료", description: `Day ${day} 관측 데이터가 저장됐어요.` });
    } else if (!silent) {
      toast({ title: "저장 실패", description: "로그인이 필요하거나 네트워크 문제일 수 있어요.", variant: "destructive" });
    }
  };

  const stopStopwatch = () => {
    if (stopwatchStart == null) return;
    const base = obs.duration_seconds ?? 0;
    const add = Math.floor((Date.now() - stopwatchStart) / 1000);
    setStopwatchStart(null);
    patch({ duration_seconds: base + add });
  };

  if (!curriculum) return null;

  const fmtMMSS = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <Card className="p-5 md:p-6 rounded-2xl border-2 bg-white" style={{ borderColor: "#C8B88A" }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className="text-[10px] border-0" style={{ background: "#C8B88A", color: "white" }}>
            ABA · Day {day}
          </Badge>
          <Badge variant="outline" className="text-[10px]">{curriculum.phase}</Badge>
          <Badge variant="outline" className="text-[10px]">{curriculum.dataMethod}</Badge>
        </div>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" disabled={day <= 1} onClick={() => onDayChange(day - 1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-xs text-muted-foreground">{day} / 7</span>
          <Button size="sm" variant="ghost" disabled={day >= 7} onClick={() => onDayChange(day + 1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <h3 className="text-lg md:text-xl font-bold leading-snug break-keep">{curriculum.hook}</h3>
      <p className="mt-1 text-sm text-muted-foreground break-keep">{curriculum.parentObjective}</p>

      <div className="mt-4 grid gap-3">
        <div className="p-3 rounded-xl border" style={{ background: "#FBF8EE", borderColor: "#E7DEC4" }}>
          <p className="text-[11px] font-medium tracking-wider" style={{ color: "#8A7A4F" }}>표적 행동 정의</p>
          <p className="text-sm mt-1 break-keep">{curriculum.targetBehavior}</p>
        </div>
        <div className="p-3 rounded-xl border">
          <p className="text-[11px] font-medium tracking-wider text-muted-foreground">부모 스크립트 예시</p>
          <p className="text-sm mt-1 break-keep">{curriculum.parentScript}</p>
        </div>
        {curriculum.safetyNote && (
          <div className="p-3 rounded-xl border bg-amber-50/40 border-amber-200">
            <p className="text-[11px] font-medium tracking-wider text-amber-700">안전 메모</p>
            <p className="text-xs mt-1 text-amber-900 break-keep">{curriculum.safetyNote}</p>
          </div>
        )}
      </div>

      {/* 표적 행동 — 부모가 직접 정의 */}
      <div className="mt-5">
        <label className="text-xs font-medium text-muted-foreground">우리 아이의 표적 행동 (한 줄)</label>
        <Input
          value={obs.target_behavior ?? ""}
          onChange={(e) => patch({ target_behavior: e.target.value })}
          placeholder={curriculum.targetBehavior.split(" — ")[0]?.replace(/^예: /, "") ?? "예) 식탁에 30초 앉아 있기"}
          className="mt-1 rounded-xl"
        />
      </div>

      {/* 데이터 입력 — method별 분기 */}
      <div className="mt-5 p-4 rounded-2xl border-2 border-dashed" style={{ borderColor: "#E7DEC4" }}>
        <p className="text-xs font-medium tracking-wider mb-3" style={{ color: "#C8B88A" }}>오늘 데이터 입력</p>

        {obs.data_method === "frequency" && (
          <div className="flex items-center gap-3">
            <Button size="icon" variant="outline" onClick={() => patch({ frequency_count: Math.max(0, (obs.frequency_count ?? 0) - 1) })}>
              <Minus className="w-4 h-4" />
            </Button>
            <div className="flex-1 text-center">
              <p className="text-4xl font-bold tabular-nums">{obs.frequency_count ?? 0}</p>
              <p className="text-[11px] text-muted-foreground mt-1">표적 행동 발생 횟수</p>
            </div>
            <Button size="icon" variant="outline" onClick={() => patch({ frequency_count: (obs.frequency_count ?? 0) + 1 })}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        )}

        {obs.data_method === "duration" && (
          <div className="text-center">
            <p className="text-4xl font-bold tabular-nums">{fmtMMSS(liveDuration)}</p>
            <p className="text-[11px] text-muted-foreground mt-1">누적 지속 시간 (mm:ss)</p>
            <div className="mt-3 flex justify-center gap-2">
              {stopwatchStart == null ? (
                <Button size="sm" onClick={() => setStopwatchStart(Date.now())}>
                  <Play className="w-4 h-4 mr-1" /> 시작
                </Button>
              ) : (
                <Button size="sm" variant="secondary" onClick={stopStopwatch}>
                  <Pause className="w-4 h-4 mr-1" /> 정지·저장
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={() => patch({ duration_seconds: 0 })}>
                초기화
              </Button>
            </div>
          </div>
        )}

        {obs.data_method === "interval" && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">발생한 인터벌</label>
              <Input
                type="number"
                inputMode="numeric"
                min={0}
                value={obs.interval_hits ?? ""}
                onChange={(e) => patch({ interval_hits: e.target.value === "" ? null : Number(e.target.value) })}
                className="mt-1 rounded-xl"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">총 인터벌 수</label>
              <Input
                type="number"
                inputMode="numeric"
                min={0}
                value={obs.interval_total ?? ""}
                onChange={(e) => patch({ interval_total: e.target.value === "" ? null : Number(e.target.value) })}
                className="mt-1 rounded-xl"
              />
            </div>
            {obs.interval_total ? (
              <p className="col-span-2 text-xs text-muted-foreground">
                발생률 {Math.round(((obs.interval_hits ?? 0) / obs.interval_total) * 100)}%
              </p>
            ) : null}
          </div>
        )}

        {obs.data_method === "abc_narrative" && (
          <div className="grid gap-3">
            <div>
              <label className="text-xs text-muted-foreground">A · 직전 1분 (선행자극)</label>
              <Textarea
                value={obs.abc_antecedent ?? ""}
                onChange={(e) => patch({ abc_antecedent: e.target.value })}
                placeholder="예) 동생이 장난감을 가져갔다"
                rows={2}
                className="mt-1 rounded-xl"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">B · 행동</label>
              <Textarea
                value={obs.abc_behavior ?? ""}
                onChange={(e) => patch({ abc_behavior: e.target.value })}
                placeholder="예) 소리지르며 바닥에 누웠다"
                rows={2}
                className="mt-1 rounded-xl"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">C · 직후 1분 (결과)</label>
              <Textarea
                value={obs.abc_consequence ?? ""}
                onChange={(e) => patch({ abc_consequence: e.target.value })}
                placeholder="예) 엄마가 와서 장난감을 돌려줬다 (관심·물건 강화 가설)"
                rows={2}
                className="mt-1 rounded-xl"
              />
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 grid gap-3">
        <div>
          <label className="text-xs text-muted-foreground">사용한 강화제 (선택)</label>
          <Input
            value={obs.reinforcer_used ?? ""}
            onChange={(e) => patch({ reinforcer_used: e.target.value })}
            placeholder="예) 하이파이브 / 좋아하는 책 1권 / 스티커"
            className="mt-1 rounded-xl"
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={!!obs.parent_script_used}
            onCheckedChange={(v) => patch({ parent_script_used: !!v })}
          />
          오늘 부모 스크립트를 그대로 사용했어요
        </label>
        <div>
          <label className="text-xs text-muted-foreground">자유 메모</label>
          <Textarea
            value={obs.notes ?? ""}
            onChange={(e) => patch({ notes: e.target.value })}
            placeholder="오늘의 맥락·아이 컨디션·예외 상황 등"
            rows={2}
            className="mt-1 rounded-xl"
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-[11px] text-muted-foreground">자동 저장 활성 (입력 후 잠시 대기)</p>
        <Button size="sm" onClick={() => doSave()} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
          지금 저장
        </Button>
      </div>
    </Card>
  );
}
