/**
 * 7일 트랙 — Day 1 출발점 진단 화면
 *
 * 마음/에너지/명료도 0~10 슬라이더 3개로 baseline 캡처.
 * 저장 시 enrollment.baseline_data 갱신 + Day1 checkin 생성.
 * 이후 Day7 비교에 사용.
 */
import { useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, Compass, Microscope, ArrowUpRight, ChevronDown, Pencil } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  enrollmentId: string;
  userId: string;
  phaseLabel: string;
  baselineData: Record<string, any> | null;
  initialNote?: string | null;
  alreadyCompleted: boolean;
  onCompleted: () => void;
}

export default function Day1DiagnosisScreen({
  enrollmentId,
  userId,
  phaseLabel,
  baselineData,
  initialNote,
  alreadyCompleted,
  onCompleted,
}: Props) {
  const init = baselineData ?? {};
  const [mood, setMood] = useState<number>(Number(init.mood_score ?? 5));
  const [energy, setEnergy] = useState<number>(Number(init.energy_score ?? 5));
  const [clarity, setClarity] = useState<number>(Number(init.clarity_score ?? 5));
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState(!alreadyCompleted);

  const handleSave = async () => {
    setSaving(true);
    try {
      const nextBaseline = {
        ...(baselineData ?? {}),
        mood_score: mood,
        energy_score: energy,
        clarity_score: clarity,
        captured_at: new Date().toISOString(),
        source: "mind_track_7d_day1",
      };
      const { error: upErr } = await supabase
        .from("mind_track_enrollments")
        .update({ baseline_data: nextBaseline })
        .eq("id", enrollmentId);
      if (upErr) throw upErr;

      const { error: ciErr } = await supabase.from("mind_track_checkins").upsert(
        {
          enrollment_id: enrollmentId,
          user_id: userId,
          day_number: 1,
          completed: true,
          mood_score: mood,
          energy_score: energy,
          clarity_score: clarity,
          reflection_note: initialNote ?? null,
        },
        { onConflict: "enrollment_id,day_number" },
      );
      if (ciErr) throw ciErr;

      toast.success("출발점을 기록했어요");
      setExpanded(false);
      onCompleted();
    } catch (e: any) {
      toast.error(e?.message ?? "저장 실패");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Badge variant="outline" className="border-slate-200 text-slate-600 bg-white">
          {phaseLabel}
        </Badge>
        <h1 className="text-2xl font-bold text-slate-900 break-keep leading-snug">
          오늘의 마음을 7일 후와 비교할 출발선으로 남겨요
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          숫자는 완벽하지 않아도 괜찮아요. 7일 뒤 같은 척도로 다시 측정해 변화를 보여드려요.
        </p>
      </div>

      {alreadyCompleted && !expanded ? (
        <Card className="bg-white rounded-3xl border-slate-200 p-4 shadow-sm">
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="w-full flex items-center justify-between gap-3 text-left"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">출발점이 기록됐어요</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  안정 {mood} · 에너지 {energy} · 명료도 {clarity}
                </p>
              </div>
            </div>
            <span className="flex items-center gap-1 text-xs text-slate-400">
              수정 <Pencil className="w-3.5 h-3.5" />
            </span>
          </button>
        </Card>
      ) : (
        <Card className="bg-white rounded-3xl border-slate-200 p-6 space-y-7 shadow-sm">
          <SliderRow label="마음 안정감" value={mood} onChange={setMood} hint="낮음 0 — 안정 10" />
          <SliderRow label="에너지" value={energy} onChange={setEnergy} hint="고갈 0 — 충만 10" />
          <SliderRow label="머릿속 명료도" value={clarity} onChange={setClarity} hint="혼란 0 — 또렷 10" />

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full h-12 rounded-2xl text-base font-semibold mt-2"
            variant={alreadyCompleted ? "secondary" : "default"}
          >
            {saving ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : alreadyCompleted ? (
              <>
                <CheckCircle2 className="w-5 h-5 mr-2" />
                출발점 업데이트
              </>
            ) : (
              <>
                <Compass className="w-5 h-5 mr-2" />
                출발점 저장하기
              </>
            )}
          </Button>
          {alreadyCompleted && (
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="w-full text-xs text-slate-400 hover:text-slate-600 flex items-center justify-center gap-1"
            >
              접기 <ChevronDown className="w-3.5 h-3.5 rotate-180" />
            </button>
          )}
        </Card>
      )}

      {/* 보조: 더 깊이 보고 싶으면 심층검사 */}
      <Link
        to="/assessment?from=mind_track_7d_d1"
        className="flex items-center justify-between gap-3 rounded-2xl bg-white border border-slate-200 px-4 py-3 hover:border-slate-300 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0">
            <Microscope className="w-4 h-4 text-slate-700" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">더 깊이 보고 싶다면 심층검사</p>
            <p className="text-xs text-slate-400">10~20분 · Day1 이후 언제든</p>
          </div>
        </div>
        <ArrowUpRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
      </Link>
    </div>
  );
}

function SliderRow({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  hint: string;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <span className="text-base font-semibold text-slate-900">{label}</span>
        <span className="text-2xl font-bold text-slate-900 tabular-nums">{value}</span>
      </div>
      <Slider
        value={[value]}
        min={0}
        max={10}
        step={1}
        onValueChange={(v) => onChange(v[0] ?? 0)}
      />
      <p className="text-xs text-slate-400">{hint}</p>
    </div>
  );
}
