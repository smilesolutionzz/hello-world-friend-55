/**
 * 7일 트랙 — Day 7 변화 리포트 화면
 *
 * Day1 baseline vs Day7 측정값 비교 + 30일 트랙/연장권 업셀.
 * PDF는 Phase 2 — 우선 화면 비교 + window.print() 폴백.
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, TrendingUp, Award, ArrowRight, Printer } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  enrollmentId: string;
  userId: string;
  phaseLabel: string;
  baselineData: Record<string, any> | null;
  day7Checkin?: { mood_score?: number | null; energy_score?: number | null; clarity_score?: number | null; reflection_note?: string | null } | null;
  alreadyCompleted: boolean;
  onCompleted: () => void;
}

export default function Day7ReportScreen({
  enrollmentId,
  userId,
  phaseLabel,
  baselineData,
  day7Checkin,
  alreadyCompleted,
  onCompleted,
}: Props) {
  const navigate = useNavigate();
  const base = baselineData ?? {};
  const baseMood = Number(base.mood_score ?? 5);
  const baseEnergy = Number(base.energy_score ?? 5);
  const baseClarity = Number(base.clarity_score ?? 5);

  const [mood, setMood] = useState<number>(Number(day7Checkin?.mood_score ?? baseMood));
  const [energy, setEnergy] = useState<number>(Number(day7Checkin?.energy_score ?? baseEnergy));
  const [clarity, setClarity] = useState<number>(Number(day7Checkin?.clarity_score ?? baseClarity));
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(alreadyCompleted);

  const handleFinish = async () => {
    setSaving(true);
    try {
      const { error: ciErr } = await supabase.from("mind_track_checkins").upsert(
        {
          enrollment_id: enrollmentId,
          user_id: userId,
          day_number: 7,
          completed: true,
          mood_score: mood,
          energy_score: energy,
          clarity_score: clarity,
        },
        { onConflict: "enrollment_id,day_number" },
      );
      if (ciErr) throw ciErr;

      await supabase
        .from("mind_track_enrollments")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("id", enrollmentId);

      toast.success("7일을 완주했어요");
      setSubmitted(true);
      onCompleted();
    } catch (e: any) {
      toast.error(e?.message ?? "저장 실패");
    } finally {
      setSaving(false);
    }
  };

  const deltas = [
    { label: "마음 안정감", base: baseMood, now: mood },
    { label: "에너지", base: baseEnergy, now: energy },
    { label: "머릿속 명료도", base: baseClarity, now: clarity },
  ];

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Badge variant="outline" className="border-slate-200 text-slate-600 bg-white">
          {phaseLabel}
        </Badge>
        <h1 className="text-2xl font-bold text-slate-900 break-keep leading-snug">
          7일간의 변화를 한눈에 봐요
        </h1>
        <p className="text-sm text-slate-500">
          Day 1과 같은 척도로 오늘을 측정해, 변화 폭을 또렷하게 비교해요.
        </p>
      </div>

      {/* 오늘 측정 */}
      <Card className="bg-white rounded-3xl border-slate-200 p-6 space-y-7 shadow-sm">
        <p className="text-sm font-semibold text-slate-900">오늘의 마음 (Day 7)</p>
        <SliderRow label="마음 안정감" value={mood} onChange={setMood} />
        <SliderRow label="에너지" value={energy} onChange={setEnergy} />
        <SliderRow label="머릿속 명료도" value={clarity} onChange={setClarity} />
      </Card>

      {/* 비교 차트 */}
      <Card className="bg-white rounded-3xl border-slate-200 p-6 space-y-4 shadow-sm">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-slate-900" />
          <p className="text-sm font-semibold text-slate-900">Day 1 → Day 7 변화</p>
        </div>
        <div className="space-y-4">
          {deltas.map((d) => {
            const diff = d.now - d.base;
            return (
              <div key={d.label} className="space-y-1.5">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-slate-700">{d.label}</span>
                  <span
                    className={`text-sm font-semibold tabular-nums ${
                      diff > 0 ? "text-emerald-600" : diff < 0 ? "text-rose-500" : "text-slate-500"
                    }`}
                  >
                    {diff > 0 ? "+" : ""}
                    {diff} ({d.base} → {d.now})
                  </span>
                </div>
                <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-slate-300"
                    style={{ width: `${(d.base / 10) * 100}%` }}
                  />
                  <div
                    className={`absolute top-0 left-0 h-full ${
                      diff >= 0 ? "bg-emerald-500" : "bg-rose-400"
                    } opacity-80`}
                    style={{ width: `${(d.now / 10) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Button
        onClick={handleFinish}
        disabled={saving}
        className="w-full h-12 rounded-2xl text-base font-semibold"
      >
        {saving ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : submitted ? (
          <>
            <CheckCircle2 className="w-5 h-5 mr-2" />
            리포트 업데이트
          </>
        ) : (
          <>
            <Award className="w-5 h-5 mr-2" />
            7일 완주 · 리포트 저장
          </>
        )}
      </Button>

      <Button
        onClick={() => window.print()}
        variant="outline"
        className="w-full h-11 rounded-2xl text-sm border-slate-200"
      >
        <Printer className="w-4 h-4 mr-2" />
        인쇄 / PDF로 저장
      </Button>

      {/* 업셀 */}
      <Card className="bg-white rounded-3xl border-slate-200 p-6 space-y-4 shadow-sm">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-slate-900">변화를 이어가시겠어요?</p>
          <p className="text-xs text-slate-500 leading-relaxed">
            7일은 시작점이에요. 30일 트랙으로 루틴을 고정하거나, 전문가와 1:1 상담으로 더 깊이 들어가 보세요.
          </p>
        </div>
        <div className="space-y-2">
          <Button
            onClick={() => navigate("/mind-track?plan=30d")}
            variant="default"
            className="w-full h-11 rounded-2xl text-sm font-semibold"
          >
            30일 트랙으로 이어가기
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button
            onClick={() => navigate("/expert-hiring?from=mind_track_d7")}
            variant="outline"
            className="w-full h-11 rounded-2xl text-sm border-slate-200"
          >
            전문가 1:1 상담 알아보기
          </Button>
        </div>
      </Card>
    </div>
  );
}

function SliderRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between">
        <span className="text-base font-medium text-slate-900">{label}</span>
        <span className="text-2xl font-bold text-slate-900 tabular-nums">{value}</span>
      </div>
      <Slider value={[value]} min={0} max={10} step={1} onValueChange={(v) => onChange(v[0] ?? 0)} />
    </div>
  );
}
