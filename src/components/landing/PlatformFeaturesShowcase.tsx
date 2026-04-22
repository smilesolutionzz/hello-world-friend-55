import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  Calendar,
  FileText,
  Mic,
  Users,
  ShieldAlert,
  ClipboardList,
  Activity,
} from "lucide-react";

interface FeatureItem {
  icon: React.ElementType;
  title: string;
  desc: string;
  badge: string;
  cta: string;
  to: string;
  accent: string;
}

const FEATURES: FeatureItem[] = [
  {
    icon: Sparkles,
    title: "즉석 AI 분석",
    desc: "고민 한 줄만 적으면 30초 안에 임상 기반 인사이트와 추천 검사를 받아봅니다.",
    badge: "무료 체험",
    cta: "지금 분석해보기",
    to: "/#instant-analysis",
    accent: "from-amber-50 to-white",
  },
  {
    icon: Calendar,
    title: "30일 마인드 트랙",
    desc: "매일 체크인 + 미션 + 위험 감지로 마음 변화를 한 달간 추적합니다. (Day 7/14/21/30 전문가 개입)",
    badge: "킬러 프로덕트",
    cta: "트랙 시작하기",
    to: "/mind-track",
    accent: "from-violet-50 to-white",
  },
  {
    icon: FileText,
    title: "전문가급 AI 리포트",
    desc: "RCI·SEM 기반 임상 통계 + 7대 데이터 소스 교차 분석. 병원 진료 시 그대로 제출 가능합니다.",
    badge: "₩3,900~",
    cta: "샘플 리포트 보기",
    to: "/sample-report",
    accent: "from-blue-50 to-white",
  },
  {
    icon: ClipboardList,
    title: "20+ 심리 검사",
    desc: "ADHD·우울·불안·관계·자아·치매 위험까지. 연령별 진단 경로 제공.",
    badge: "₩990~",
    cta: "검사 둘러보기",
    to: "/assessment",
    accent: "from-emerald-50 to-white",
  },
  {
    icon: Mic,
    title: "AI 아지트 (음성 상담)",
    desc: "한국어 특화 실시간 음성 대화로 마음을 정리하고, 자동으로 변화 데이터를 누적합니다.",
    badge: "휴먼터치",
    cta: "대화 시작",
    to: "/metaverse-voice",
    accent: "from-rose-50 to-white",
  },
  {
    icon: Users,
    title: "전문가 매칭",
    desc: "11명의 검증된 심리 전문가 + 50+ 제휴기관. 텍스트/영상/집중 케어 단계별 결제.",
    badge: "검증 완료",
    cta: "전문가 찾기",
    to: "/expert-hiring",
    accent: "from-sky-50 to-white",
  },
  {
    icon: Activity,
    title: "변화 추적 대시보드",
    desc: "검사·관찰·상담 기록을 RCI 기반으로 시간축 비교. 내 마음의 성장이 눈에 보입니다.",
    badge: "프리미엄",
    cta: "내 여정 보기",
    to: "/my-journey",
    accent: "from-indigo-50 to-white",
  },
  {
    icon: ShieldAlert,
    title: "위기 감지 & 케어콜",
    desc: "3일 연속 미체크 또는 점수 30% 하락 시 무료 케어콜 알림이 자동으로 작동합니다.",
    badge: "안전망",
    cta: "안전 시스템 알아보기",
    to: "/mind-track",
    accent: "from-orange-50 to-white",
  },
];

const PlatformFeaturesShowcase: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className="bg-white py-20 md:py-28">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-14 md:mb-16">
          <span className="inline-block px-4 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold tracking-wide mb-5">
            AIHPRO가 만든 8가지 핵심 기능
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight break-keep">
            "이게 다 무슨 서비스예요?"
            <br className="hidden md:block" />
            <span className="text-slate-500"> 한 번에 정리해 드립니다.</span>
          </h2>
          <p className="mt-5 text-base md:text-lg text-slate-600 max-w-2xl mx-auto break-keep leading-relaxed">
            AI의 정확함과 전문가의 따뜻함을 결합한 통합 마음 케어 플랫폼.
            검사부터 30일 추적, 전문가 상담까지 한 곳에서 끝납니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <button
                key={f.title}
                onClick={() => navigate(f.to)}
                className={`group text-left bg-gradient-to-br ${f.accent} border border-slate-200 rounded-2xl p-6 hover:border-slate-900 hover:shadow-xl transition-all duration-300 flex flex-col`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl bg-white border border-slate-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5 text-slate-900" strokeWidth={1.6} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-700 bg-white/80 backdrop-blur px-2.5 py-1 rounded-full border border-slate-200">
                    {f.badge}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2 break-keep">
                  {f.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed break-keep flex-1">
                  {f.desc}
                </p>
                <span className="mt-4 text-xs font-semibold text-slate-900 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                  {f.cta} →
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={() => navigate("/pricing")}
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold px-8 py-4 rounded-full transition-all shadow-lg hover:shadow-xl"
          >
            전체 요금제 한눈에 보기 →
          </button>
          <p className="mt-4 text-xs text-slate-500">
            ₩990 단건 검사 · ₩3,900 심층 리포트 · ₩9,900 무제한 구독
          </p>
        </div>
      </div>
    </section>
  );
};

export default PlatformFeaturesShowcase;
