import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Heart, UserCheck, ArrowRight } from 'lucide-react';

interface HumanTouchManifestoProps {
  /**
   * landing  — 큰 매니페스토 섹션 (선언·철학형 톤)
   * track    — /mind-track 상단 컴팩트 카드 (따뜻·감성형 톤)
   * report   — 리포트 결과 하단 신뢰 배지 (전문·신뢰형 톤)
   */
  variant?: 'landing' | 'track' | 'report';
}

/**
 * "AI × 전문가 = 진짜 휴먼터치" 철학을 위치별 다른 카피·디자인으로 노출
 * - 의료/진단 표현 금지, 코칭 톤 유지
 */
export const HumanTouchManifesto: React.FC<HumanTouchManifestoProps> = ({
  variant = 'landing',
}) => {
  if (variant === 'track') {
    // /mind-track 상단 — 감성·따뜻형
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl mx-auto"
      >
        <div className="relative overflow-hidden rounded-2xl border border-rose-100 bg-gradient-to-br from-rose-50/60 via-white to-amber-50/60 p-5 md:p-6">
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-rose-200/30 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 rounded-full bg-amber-200/30 blur-3xl" />

          <div className="relative flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-400 to-amber-400 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <Heart className="w-5 h-5" fill="currentColor" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-semibold tracking-wider text-rose-600 uppercase mb-1">
                Our Promise
              </p>
              <h3 className="text-base md:text-lg font-bold text-slate-900 break-keep leading-snug">
                AI가 듣고, <span className="text-rose-600">사람이 안아줍니다</span>
              </h3>
              <p className="text-[13px] md:text-sm text-slate-600 mt-1.5 leading-relaxed break-keep">
                혼자가 아니에요. AI는 24시간 곁에서 당신의 마음을 정리하고,
                <br className="hidden md:block" />
                필요한 순간엔 우리 전문가가 직접 연결됩니다.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (variant === 'report') {
    // 리포트 하단 — 전문·신뢰형
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 md:p-5">
        <div className="flex items-center gap-2 mb-3">
          <UserCheck className="w-4 h-4 text-slate-700" />
          <p className="text-xs font-semibold tracking-wide text-slate-700 uppercase">
            Human-in-the-Loop · 검수 체계
          </p>
        </div>
        <div className="flex items-center justify-between gap-2 text-[11px] md:text-xs">
          <Step n="01" label="AI 1차 분석" />
          <ArrowRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <Step n="02" label="전문가 검수" />
          <ArrowRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <Step n="03" label="당신에게 도착" />
        </div>
        <p className="text-[11px] text-slate-500 mt-3 leading-relaxed break-keep">
          이 리포트는 임상심리·상담 전문가 네트워크의 검수 프레임을 거칩니다.
          AI의 정확함과 전문가의 따뜻함이 함께 들어 있어요.
        </p>
      </div>
    );
  }

  // landing — 큰 선언형 매니페스토
  return (
    <section className="relative py-16 md:py-24 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7 }}
          className="text-center space-y-4"
        >
          <p className="text-[11px] md:text-xs font-bold tracking-[0.2em] text-slate-500 uppercase">
            Our Philosophy
          </p>
          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight break-keep">
            AI는 도구일 뿐,<br />
            <span className="bg-gradient-to-r from-slate-900 via-blue-700 to-purple-700 bg-clip-text text-transparent">
              회복은 사람과 함께합니다
            </span>
          </h2>
          <p className="text-sm md:text-base text-slate-600 max-w-2xl mx-auto break-keep leading-relaxed pt-2">
            AI 시대의 진짜 휴먼터치는 기술을 없애는 게 아니라,
            <br className="hidden md:block" />
            <strong className="text-slate-900">AI의 정확함</strong>과{' '}
            <strong className="text-slate-900">전문가의 따뜻함</strong>을 같은 자리에 두는 일이라고 믿어요.
          </p>
        </motion.div>

        {/* 3단계 시각화 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-10 md:mt-14 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6"
        >
          <PhilosophyCard
            step="01"
            icon={<Sparkles className="w-5 h-5" />}
            title="AI가 듣습니다"
            desc="24시간 비판 없이, 당신의 마음을 정리하고 패턴을 찾습니다."
            tone="blue"
          />
          <PhilosophyCard
            step="02"
            icon={<UserCheck className="w-5 h-5" />}
            title="전문가가 다듬습니다"
            desc="임상심리·상담 전문가 네트워크가 결과를 검수하고 보강합니다."
            tone="violet"
          />
          <PhilosophyCard
            step="03"
            icon={<Heart className="w-5 h-5" />}
            title="사람이 곁에 있습니다"
            desc="필요한 순간엔 전문가와 직접 연결되어, 끝까지 함께합니다."
            tone="rose"
          />
        </motion.div>

        {/* 하단 한 줄 선언 */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 md:mt-12 text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 bg-slate-50 text-xs md:text-sm text-slate-700">
            <Heart className="w-3.5 h-3.5 text-rose-500" fill="currentColor" />
            <span className="font-medium">
              혼자가 아니에요 — AI는 24시간, 전문가는 곁에서.
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const Step: React.FC<{ n: string; label: string }> = ({ n, label }) => (
  <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-white border border-slate-200">
    <span className="font-mono text-[10px] text-slate-400">{n}</span>
    <span className="font-semibold text-slate-700 whitespace-nowrap">{label}</span>
  </div>
);

const toneMap = {
  blue: {
    ring: 'border-blue-100',
    iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
    chip: 'text-blue-600',
  },
  violet: {
    ring: 'border-violet-100',
    iconBg: 'bg-gradient-to-br from-violet-500 to-purple-600',
    chip: 'text-violet-600',
  },
  rose: {
    ring: 'border-rose-100',
    iconBg: 'bg-gradient-to-br from-rose-500 to-pink-500',
    chip: 'text-rose-600',
  },
} as const;

const PhilosophyCard: React.FC<{
  step: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
  tone: keyof typeof toneMap;
}> = ({ step, icon, title, desc, tone }) => {
  const t = toneMap[tone];
  return (
    <div className={`relative bg-white rounded-2xl border ${t.ring} p-5 md:p-6 hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl ${t.iconBg} text-white flex items-center justify-center shadow-sm`}>
          {icon}
        </div>
        <span className={`font-mono text-xs font-bold ${t.chip}`}>{step}</span>
      </div>
      <h3 className="text-base md:text-lg font-bold text-slate-900 mb-1.5 break-keep">
        {title}
      </h3>
      <p className="text-[13px] md:text-sm text-slate-600 leading-relaxed break-keep">
        {desc}
      </p>
    </div>
  );
};

export default HumanTouchManifesto;
