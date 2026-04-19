import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, ShieldCheck, Calendar, Heart, ArrowDown, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import usePayment from "@/hooks/usePayment";
import { toast } from "sonner";

const TRACK_PRICE = 19900;
const ORIGINAL_PRICE = 39800;

const goalLabels: Record<string, string> = {
  stress: "스트레스 회복",
  anxiety: "불안 다스리기",
  sleep: "수면의 질 회복",
  selfworth: "자존감 단단히",
  relationship: "관계 스트레스",
  parenting: "육아 번아웃 회복",
  child_development: "아이 발달 코칭",
  family_communication: "아이와의 소통",
};

export default function MindTrackCheckoutHero() {
  const navigate = useNavigate();
  const { pay, isReady, loading } = usePayment();
  const [enrollment, setEnrollment] = useState<any>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setChecking(false); return; }
      const { data } = await supabase
        .from("mind_track_enrollments")
        .select("*")
        .eq("user_id", user.id)
        .eq("payment_status", "pending")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      setEnrollment(data);
      setChecking(false);
    })();
  }, []);

  const handlePay = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth?redirect=/pricing?product=mind_track_30");
      return;
    }
    const ok = await pay("mind_track_30" as any, TRACK_PRICE);
    if (!ok) {
      toast.error("결제를 시작하지 못했어요. 잠시 후 다시 시도해주세요.");
    }
  };

  const goalLabel = enrollment?.goal_focus ? goalLabels[enrollment.goal_focus] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto mb-12"
    >
      <Card className="relative overflow-hidden border-2 border-primary/40 shadow-xl bg-gradient-to-br from-white via-blue-50/40 to-purple-50/40">
        {/* Discount ribbon - mobile: top full bar, desktop: corner */}
        <div className="bg-gradient-to-r from-rose-500 to-pink-500 text-white text-[11px] sm:text-xs font-bold px-4 py-1.5 text-center sm:absolute sm:top-0 sm:right-0 sm:rounded-bl-2xl sm:text-right">
          ⏰ 한정가 50% 할인 적용 중
        </div>

        <div className="p-5 sm:p-6 md:p-8">
          {/* Step indicator - wraps cleanly on mobile */}
          <div className="flex items-center justify-center sm:justify-start gap-1.5 mb-4 text-[11px] sm:text-xs flex-wrap">
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium whitespace-nowrap">✓ 진단</span>
            <span className="text-muted-foreground">→</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium whitespace-nowrap">✓ 목표 선택</span>
            <span className="text-muted-foreground">→</span>
            <span className="px-2 py-0.5 rounded-full bg-primary text-primary-foreground font-bold whitespace-nowrap">3. 결제</span>
          </div>

          <div className="flex justify-center sm:justify-start">
            <Badge className="mb-3 bg-amber-100 text-amber-800 border-amber-200">
              <Sparkles className="w-3 h-3 mr-1" />
              30일 마음 변화 트랙
            </Badge>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 mb-2 break-keep text-center sm:text-left leading-snug">
            {goalLabel ? (
              <>
                <span className="text-primary">"{goalLabel}"</span>
                <br className="sm:hidden" />
                <span className="sm:ml-1">30일 트랙 시작 준비 완료</span>
              </>
            ) : (
              <>30일 마음 변화 트랙 결제</>
            )}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mb-6 break-keep text-center sm:text-left">
            결제하면 <strong>오늘부터 30일간</strong> 매일 맞춤 코칭 미션, 주간 변화 리포트, 전문가 상담 1회권이 모두 열립니다.
          </p>

          {/* What you get */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-5">
            {[
              { icon: Calendar, text: "매일 5분 맞춤 코칭 미션 (30일)" },
              { icon: Heart, text: "주간 마음 상태 변화 리포트" },
              { icon: Sparkles, text: "전문가 1:1 채팅 상담 1회권" },
              { icon: ShieldCheck, text: "7일 이내 100% 환불 보장" },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/80 border border-slate-200">
                <item.icon className="w-4 h-4 text-primary shrink-0" />
                <span className="text-[13px] sm:text-sm text-slate-700 break-keep leading-tight">{item.text}</span>
              </div>
            ))}
          </div>

          {/* Price - centered on mobile, side-by-side on desktop */}
          <div className="mb-5 p-4 rounded-2xl bg-gradient-to-r from-primary/5 to-purple-500/5 border border-primary/20">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 text-center sm:text-left">
              <div>
                <div className="text-xs text-slate-500 line-through">정가 ₩{ORIGINAL_PRICE.toLocaleString()}</div>
                <div className="flex items-baseline justify-center sm:justify-start gap-1.5 flex-wrap">
                  <span className="text-3xl sm:text-4xl font-bold text-slate-900">₩{TRACK_PRICE.toLocaleString()}</span>
                  <span className="text-xs sm:text-sm text-slate-600">/ 30일 전체</span>
                </div>
                <div className="text-[11px] sm:text-xs text-emerald-700 font-semibold mt-1">하루 약 ₩663 · 커피 한 잔보다 저렴</div>
              </div>
              <div className="hidden sm:block text-right shrink-0">
                <div className="text-xs text-slate-500">총 결제 금액</div>
                <div className="text-2xl font-bold text-primary">₩{TRACK_PRICE.toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* CTA - shorter, no overflow */}
          <Button
            size="lg"
            className="w-full h-14 text-sm sm:text-base font-bold bg-gradient-to-r from-primary to-purple-600 hover:opacity-95 shadow-lg whitespace-normal px-3"
            onClick={handlePay}
            disabled={loading || checking}
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin shrink-0" /> 결제창을 여는 중…</>
            ) : (
              <span className="break-keep leading-tight">
                ₩{TRACK_PRICE.toLocaleString()} 결제하고 30일 시작하기 →
              </span>
            )}
          </Button>

          <div className="flex items-center justify-center gap-2 mt-3 text-[11px] sm:text-xs text-slate-500 flex-wrap">
            <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> 토스페이먼츠 안전결제</span>
            <span className="hidden sm:inline">·</span>
            <span>카드 / 계좌이체 / 휴대폰</span>
          </div>

          <button
            onClick={() => document.getElementById("other-plans")?.scrollIntoView({ behavior: "smooth" })}
            className="mt-4 w-full text-xs text-slate-500 hover:text-slate-700 flex items-center justify-center gap-1"
          >
            다른 구독 플랜 비교 <ArrowDown className="w-3 h-3" />
          </button>
        </div>
      </Card>
    </motion.div>
  );
}
