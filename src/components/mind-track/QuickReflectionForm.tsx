import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, Sparkles, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  enrollmentId: string;
  day: number;
  /** Optional: source label for analytics (e.g. "after_video", "dashboard") */
  source?: string;
  /** Called once a check-in is successfully saved/updated */
  onSaved?: () => void;
}

const PROMPTS = [
  "오늘 영상/미션을 마치고 가장 먼저 든 느낌은?",
  "5분 전과 지금, 어디가 살짝 달라졌나요?",
  "내일도 이어가고 싶은 한 가지를 적어보세요.",
];

const MAX_LEN = 200;

/**
 * 한 줄 기록(체크인) 빠른 입력 폼.
 * - 이메일에서 영상 보고 돌아왔거나, 대시보드에서 바로 한 줄만 남기고 싶을 때 사용
 * - 기존 체크인이 있으면 reflection_note만 업데이트, 없으면 신규 insert
 */
export default function QuickReflectionForm({ enrollmentId, day, source = "dashboard", onSaved }: Props) {
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [existing, setExisting] = useState<{ id: string; reflection_note: string | null } | null>(null);

  // 오늘자 체크인 조회 (있으면 placeholder/초기값 채움)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("mind_track_checkins")
        .select("id, reflection_note")
        .eq("enrollment_id", enrollmentId)
        .eq("day_number", day)
        .maybeSingle();
      if (cancelled || !data) return;
      setExisting({ id: data.id, reflection_note: data.reflection_note ?? null });
      if (data.reflection_note) {
        setNote(String(data.reflection_note).slice(0, MAX_LEN));
        setSaved(true);
      }
    })();
    return () => { cancelled = true; };
  }, [enrollmentId, day]);

  const prompt = PROMPTS[(day - 1) % PROMPTS.length];

  const handleSubmit = async () => {
    const trimmed = note.trim();
    if (trimmed.length < 2) {
      toast.error("최소 2자 이상 적어주세요");
      return;
    }
    if (trimmed.length > MAX_LEN) {
      toast.error(`${MAX_LEN}자 이내로 적어주세요`);
      return;
    }
    setSaving(true);
    try {
      if (existing) {
        const { error } = await supabase
          .from("mind_track_checkins")
          .update({
            reflection_note: trimmed,
            completed: true,
            checked_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
        if (error) throw error;
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("로그인이 필요합니다");
        const { error } = await supabase
          .from("mind_track_checkins")
          .insert({
            user_id: user.id,
            enrollment_id: enrollmentId,
            day_number: day,
            reflection_note: trimmed,
            completed: true,
            checked_at: new Date().toISOString(),
          });
        if (error) throw error;
      }
      setSaved(true);
      toast.success("오늘의 한 줄 기록을 저장했어요 ✨");
      onSaved?.();
    } catch (e: any) {
      console.error("[QuickReflectionForm] save failed", e);
      toast.error(e?.message ? `저장 실패: ${e.message}` : "저장에 실패했어요. 잠시 후 다시 시도해 주세요");
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="bg-white rounded-3xl border border-[#C8B88A]/40 ring-1 ring-[#C8B88A]/15 shadow-sm p-5 md:p-6 space-y-3"
      data-testid="quick-reflection-form"
    >
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-2xl bg-[#1a1a1a] text-white flex items-center justify-center">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold tracking-wider text-[#8a7a4d] uppercase">
            Day {String(day).padStart(2, "0")} · 오늘의 한 줄
          </p>
          <p className="text-sm font-bold text-slate-900 break-keep leading-snug">
            {prompt}
          </p>
        </div>
        {saved && (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" /> 저장됨
          </span>
        )}
      </div>

      <Textarea
        value={note}
        onChange={(e) => setNote(e.target.value.slice(0, MAX_LEN))}
        placeholder="예) 호흡 5분 뒤 어깨가 한결 가벼워졌어요."
        rows={2}
        maxLength={MAX_LEN}
        className="resize-none text-base leading-relaxed bg-slate-50 border-slate-200 focus-visible:ring-[#C8B88A]/40 break-keep"
      />

      <div className="flex items-center justify-between text-[11px] text-slate-400">
        <span>완벽하지 않아도 괜찮아요. 한 문장이면 충분해요.</span>
        <span className={note.length > MAX_LEN - 20 ? "text-amber-600 font-semibold" : ""}>
          {note.length}/{MAX_LEN}
        </span>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={saving || note.trim().length < 2}
        className="w-full h-11 text-sm font-bold bg-[#1a1a1a] text-white hover:bg-black rounded-xl"
      >
        {saving ? (
          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> 저장 중...</>
        ) : saved ? (
          <><CheckCircle2 className="w-4 h-4 mr-2" /> 한 줄 기록 업데이트</>
        ) : (
          <><Send className="w-4 h-4 mr-2" /> 한 줄로 저장하기</>
        )}
      </Button>
    </motion.div>
  );
}
