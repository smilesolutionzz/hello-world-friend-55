import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Star, Lock, Crown, Check } from 'lucide-react';

const TRUST_CARDS = [
  {
    icon: ShieldCheck,
    title: '자격 검증',
    body: '국가공인 자격증 + 5년 이상 실무 경력만 입점. 매년 재인증.',
    accent: 'text-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
  },
  {
    icon: Star,
    title: '실명 후기만 게시',
    body: '실제 상담 이용자가 직접 작성한 후기만 노출됩니다.',
    accent: 'text-amber-600',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
  },
  {
    icon: Lock,
    title: '비밀 보장 100%',
    body: '상담 내용은 암호화 저장. 회사·가족·제3자 통보 절대 없음.',
    accent: 'text-emerald-600',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
  },
];

const ExpertTrustCards: React.FC = () => {
  return (
    <section className="my-10 md:my-14">
      <div className="text-center mb-6">
        <span className="inline-block text-[11px] font-bold tracking-[0.18em] uppercase text-muted-foreground mb-2">
          Why Trust Us
        </span>
        <h2 className="text-xl md:text-2xl font-black text-foreground break-keep">
          어떤 전문가를 만나게 되나요?
        </h2>
      </div>

      <div className="grid md:grid-cols-3 gap-3 md:gap-4 mb-6">
        {TRUST_CARDS.map((c, i) => {
          const Icon = c.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="rounded-2xl border border-border bg-white dark:bg-card p-5"
            >
              <div className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${c.accent}`} />
              </div>
              <h3 className="font-bold text-sm text-foreground mb-1.5">{c.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed break-keep">{c.body}</p>
            </motion.div>
          );
        })}
      </div>

      {/* 가격 카드 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="rounded-2xl border-2 border-foreground bg-white dark:bg-card p-5 md:p-6"
      >
        <div className="flex items-center gap-2 mb-3">
          <Crown className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-bold text-foreground">상담 가격 안내 · 시간 구독형</span>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="rounded-xl bg-muted/40 p-4">
            <div className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mb-1">기본</div>
            <div className="text-xl font-black text-foreground break-keep">시간당 ₩39,000</div>
            <div className="text-xs text-muted-foreground mt-1">5 / 10 / 20 / 30시간 시간권 · 만료 없음</div>
          </div>
          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-4">
            <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1">진행 방식</div>
            <div className="text-xl font-black text-emerald-700 dark:text-emerald-400 break-keep">화상 1배 · 홈티 1.5배</div>
            <div className="text-xs text-emerald-700 dark:text-emerald-400 mt-1 flex items-center gap-1">
              <Check className="w-3 h-3" /> 시간 단위 자유 사용
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default ExpertTrustCards;
