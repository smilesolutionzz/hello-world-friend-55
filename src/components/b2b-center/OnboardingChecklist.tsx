import { useEffect, useState } from "react";
import { Check, ChevronRight, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

interface Props { centerId: string; demo?: boolean }

const STEPS: Array<{ key: string; label: string; href: string; description: string }> = [
  { key: "first_client_added", label: "첫 이용자 등록", href: "../clients", description: "엑셀 일괄 또는 수동 등록" },
  { key: "first_invite_sent", label: "첫 초대 발송", href: "../clients", description: "이용자에게 AIHPRO 무료권 보내기" },
  { key: "first_parent_signup", label: "보호자 가입 확인", href: "../intelligence/parent-reports", description: "초대 수락 시 자동 체크" },
  { key: "first_intelligence_data", label: "첫 검사 결과 수신", href: "../intelligence/parent-reports", description: "보호자가 첫 자가검사 완료" },
  { key: "alerts_configured", label: "위기 알림 확인", href: "../intelligence/ops-dashboard", description: "고위험 점수 발생 시 푸시" },
];

export default function OnboardingChecklist({ centerId, demo }: Props) {
  const [done, setDone] = useState<Set<string>>(new Set());
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (demo) { setDone(new Set(["first_client_added"])); return; }
    supabase.from("center_onboarding_progress").select("step_key").eq("center_id", centerId)
      .then(({ data }) => setDone(new Set((data ?? []).map((r: any) => r.step_key))));
  }, [centerId, demo]);

  const completed = STEPS.filter((s) => done.has(s.key)).length;
  const total = STEPS.length;
  const pct = Math.round((completed / total) * 100);

  if (hidden || completed === total) return null;

  return (
    <div className="bg-white rounded-3xl border border-neutral-200 p-6 mb-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[10px] tracking-widest text-[#C8B88A] mb-1">START · {completed}/{total}</p>
          <h2 className="text-lg font-semibold">센터 운영 시작 가이드</h2>
          <p className="text-xs text-neutral-500 mt-1">5단계만 따라하면 인텔리전스 데이터가 자동으로 쌓입니다.</p>
        </div>
        <button onClick={() => setHidden(true)} className="text-xs text-neutral-400 hover:text-neutral-700">닫기</button>
      </div>

      <div className="h-1.5 rounded-full bg-neutral-100 mb-5 overflow-hidden">
        <div className="h-full bg-[#C8B88A] transition-all" style={{ width: `${pct}%` }} />
      </div>

      <ul className="space-y-2">
        {STEPS.map((s, i) => {
          const isDone = done.has(s.key);
          return (
            <li key={s.key}>
              <Link to={s.href}
                className="flex items-center gap-4 p-3 rounded-2xl hover:bg-neutral-50 transition group">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium shrink-0 ${
                  isDone ? "bg-emerald-500 text-white" : "bg-neutral-100 text-neutral-500"
                }`}>
                  {isDone ? <Check className="w-3.5 h-3.5" /> : String(i + 1).padStart(2, "0")}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${isDone ? "text-neutral-400 line-through" : "text-neutral-900"}`}>
                    {s.label}
                  </p>
                  <p className="text-xs text-neutral-500">{s.description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-700" />
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-4 pt-4 border-t border-neutral-100 flex items-center justify-between">
        <Link to="../guide" className="text-xs text-neutral-600 hover:text-neutral-900 inline-flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5" /> 전체 가이드 보기
        </Link>
        <span className="text-xs text-neutral-400">완료 시 자동으로 사라집니다</span>
      </div>
    </div>
  );
}
