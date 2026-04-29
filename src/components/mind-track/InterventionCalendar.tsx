import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Lock, MessageCircle, Award, ShieldCheck, Crown, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const MILESTONES = [
  {
    day: 7,
    icon: MessageCircle,
    label: "1주차 적응 점검",
    price: "무료",
    originalPrice: "₩9,900",
    desc: "전문가 텍스트 점검 · 트랙 1회 무료",
    color: "from-blue-500 to-cyan-500",
    route: "/expert-hiring?intervention=day7&offering=text_review&free=mind_track",
    isFree: true,
  },
  { day: 14, icon: Award, label: "절반 미드체크", price: "₩29,000", desc: "1:1 화상 상담 40분", color: "from-primary to-purple-600", route: "/expert-hiring?intervention=day14&offering=midcheck" },
  { day: 21, icon: ShieldCheck, label: "심화 케어", price: "₩49,000", desc: "우선 매칭 60분 심화", color: "from-rose-500 to-orange-500", route: "/expert-hiring?intervention=day21&offering=urgent&urgent=true" },
  { day: 30, icon: Crown, label: "졸업 프리미엄", price: "₩99,000", desc: "다음 60일 트랙", color: "from-amber-500 to-yellow-500", route: "/pricing?product=premium_60&from=mind_track_grad" },
];

export default function InterventionCalendar({ currentDay }: { currentDay: number }) {
  const navigate = useNavigate();

  return (
    <Card className="p-5">
      <h3 className="font-bold text-slate-900 mb-1 flex items-center gap-2">
        <Award className="w-4 h-4 text-primary" /> 전문가 개입 일정
      </h3>
      <p className="text-xs text-slate-500 mb-4 break-keep">
        Day 7 / 14 / 21 / 30에 자동으로 전문가 개입 옵션이 열려요. 해당 날짜에 도달하면 결제 가능합니다.
      </p>
      <div className="space-y-2.5">
        {MILESTONES.map((m) => {
          const reached = currentDay >= m.day;
          const isCurrent = currentDay >= m.day && currentDay < m.day + 7;
          const Icon = m.icon;
          return (
            <div
              key={m.day}
              className={`p-3 rounded-xl border-2 flex items-center gap-3 transition-all ${
                isCurrent ? "border-primary bg-primary/5 shadow-sm" :
                reached ? "border-emerald-200 bg-emerald-50/40" :
                "border-slate-200 bg-slate-50/40"
              }`}
            >
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${m.color} flex items-center justify-center shrink-0 ${!reached && "opacity-40 grayscale"}`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Badge variant={isCurrent ? "default" : "outline"} className="text-[10px]">Day {m.day}</Badge>
                  <span className="text-sm font-bold text-slate-900 break-keep">{m.label}</span>
                  {reached && !isCurrent && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                </div>
                <div className="text-[11px] text-slate-600 mt-0.5 break-keep">
                  {m.desc} ·{" "}
                  {m.isFree ? (
                    <>
                      <span className="text-slate-400 line-through mr-1">{m.originalPrice}</span>
                      <span className="font-bold text-emerald-600">{m.price}</span>
                    </>
                  ) : (
                    <span className="font-bold text-primary">{m.price}</span>
                  )}
                </div>
              </div>
              {reached ? (
                <Button
                  size="sm"
                  variant={isCurrent ? "default" : "outline"}
                  onClick={() => navigate(m.route)}
                  className={`shrink-0 text-xs ${m.isFree ? "border-emerald-300 text-emerald-700 hover:bg-emerald-50" : ""}`}
                >
                  {m.isFree ? "무료 신청" : `${m.price} 결제`} <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              ) : (
                <div className="flex items-center gap-1 text-[11px] text-slate-400 shrink-0">
                  <Lock className="w-3 h-3" />D-{m.day - currentDay}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
