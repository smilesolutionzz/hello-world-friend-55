import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { ClipboardCheck, Eye, Gamepad2, MessageCircle, Database } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";

interface Counts {
  tests: number;
  observations: number;
  geumjjok: number;
  coaching: number;
}

const DataAccumulationCounter = () => {
  const [counts, setCounts] = useState<Counts | null>(null);

  useEffect(() => {
    void load();
  }, []);

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const [tests, obs, voice, coach] = await Promise.all([
      supabase.from("test_results").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("ai_observation_results").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      supabase.from("ai_coaching_sessions").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("session_type", "geumjjok"),
      supabase.from("ai_coaching_sessions").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    ]);
    setCounts({
      tests: tests.count ?? 0,
      observations: obs.count ?? 0,
      geumjjok: voice.count ?? 0,
      coaching: coach.count ?? 0,
    });
  };

  if (!counts) return null;

  const total = counts.tests + counts.observations + counts.geumjjok + counts.coaching;

  const items = [
    { label: "심리 검사", value: counts.tests, icon: ClipboardCheck, color: "text-blue-600 bg-blue-50" },
    { label: "관찰 기록", value: counts.observations, icon: Eye, color: "text-emerald-600 bg-emerald-50" },
    { label: "금쪽 상담", value: counts.geumjjok, icon: Gamepad2, color: "text-rose-600 bg-rose-50" },
    { label: "AI 코칭", value: counts.coaching, icon: MessageCircle, color: "text-purple-600 bg-purple-50" },
  ];

  return (
    <Card className="p-5 bg-white border-slate-200">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-primary" />
          <h3 className="font-bold text-slate-900 text-sm">누적된 나의 데이터</h3>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-slate-500">총합</div>
          <div className="text-xl font-bold text-primary">{total}건</div>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {items.map((it, i) => (
          <motion.div
            key={it.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="text-center p-2 rounded-xl bg-slate-50/50 border border-slate-100"
          >
            <div className={`w-7 h-7 mx-auto rounded-lg ${it.color} flex items-center justify-center mb-1.5`}>
              <it.icon className="w-3.5 h-3.5" />
            </div>
            <div className="text-base font-bold text-slate-900">{it.value}</div>
            <div className="text-[10px] text-slate-500 break-keep leading-tight">{it.label}</div>
          </motion.div>
        ))}
      </div>
      {total < 3 && (
        <p className="text-[11px] text-slate-500 mt-3 text-center break-keep">
          데이터 <span className="font-bold text-primary">3건</span>이 쌓이면 종합 리포트를 자동 추천해드려요
        </p>
      )}
    </Card>
  );
};

export default DataAccumulationCounter;
