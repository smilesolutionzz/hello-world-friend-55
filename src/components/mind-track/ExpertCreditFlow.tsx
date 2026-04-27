import React from 'react';
import { motion } from 'framer-motion';
import { Ticket, Sparkles, CalendarCheck, ShieldCheck } from 'lucide-react';

const STEPS = [
  {
    n: 1,
    icon: Ticket,
    title: '상담권 활성화',
    body: '결제와 동시에 1회권이 자동 지급됩니다. 30일 안에 언제든 사용 가능.',
  },
  {
    n: 2,
    icon: Sparkles,
    title: 'AI 자동 매칭',
    body: '당신의 검사 결과·코칭 데이터를 분석해 가장 잘 맞는 전문가 3명을 추천합니다.',
  },
  {
    n: 3,
    icon: CalendarCheck,
    title: '40분 1:1 예약',
    body: '캘린더에서 원하는 시간을 골라 예약. 화상 또는 채팅 상담 중 선택.',
  },
];

const ExpertCreditFlow: React.FC = () => {
  return (
    <section className="my-12 md:my-16">
      <div className="text-center mb-8">
        <span className="inline-block text-[11px] font-bold tracking-[0.18em] uppercase text-muted-foreground mb-2">
          Expert 1:1 (Included)
        </span>
        <h2 className="text-2xl md:text-3xl font-black text-foreground break-keep">
          전문가 상담권 1회 = 어떻게 쓰나요?
        </h2>
        <p className="text-sm text-muted-foreground mt-2 break-keep">
          AI 분석으로 충분하지 않을 때, 진짜 사람의 눈으로 한 번 더 짚어드립니다
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-3 md:gap-4">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl border border-border bg-white dark:bg-card p-5 relative"
            >
              <div className="absolute -top-2.5 left-5 bg-foreground text-background text-[10px] font-black px-2 py-0.5 rounded-full tracking-wider">
                STEP {s.n}
              </div>
              <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex items-center justify-center mb-3 mt-1">
                <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="font-bold text-base text-foreground mb-1.5 break-keep">{s.title}</h3>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed break-keep">{s.body}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-5 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/60 dark:bg-emerald-950/30 px-4 py-3 flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs md:text-sm text-emerald-900 dark:text-emerald-100 break-keep leading-relaxed">
          <strong>강제가 아닙니다.</strong> 30일 내내 AI 코칭만 받아도 됩니다.
          상담권은 "필요할 때 쓰는 안전망"으로 생각하세요.
        </p>
      </div>
    </section>
  );
};

export default ExpertCreditFlow;
