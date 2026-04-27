import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, CalendarDays, MessageSquare, FileText } from 'lucide-react';

const STEPS = [
  {
    n: 1,
    icon: Heart,
    title: '고민 선택',
    body: '우울·불안·수면·자존감·관계·육아 중 가장 큰 고민을 선택합니다.',
    time: '30초',
  },
  {
    n: 2,
    icon: Sparkles,
    title: 'AI 자동 매칭',
    body: '검사 결과·코칭 데이터를 분석해 가장 잘 맞는 전문가 3명을 추천합니다.',
    time: '10초',
  },
  {
    n: 3,
    icon: CalendarDays,
    title: '시간 예약',
    body: '캘린더에서 원하는 40분 슬롯을 선택. 예약 즉시 확정 알림 발송.',
    time: '1분',
  },
  {
    n: 4,
    icon: MessageSquare,
    title: '1:1 상담',
    body: '화상 또는 채팅으로 진행. 시작 5분 전 카카오톡으로 입장 링크 도착.',
    time: '40분',
  },
  {
    n: 5,
    icon: FileText,
    title: '후속 케어',
    body: '상담 요약 리포트 자동 발송 + 30일 마음 트랙으로 변화 추적.',
    time: '평생',
  },
];

const ConsultationFlowSteps: React.FC = () => {
  return (
    <section className="my-10 md:my-14">
      <div className="text-center mb-8">
        <span className="inline-block text-[11px] font-bold tracking-[0.18em] uppercase text-muted-foreground mb-2">
          How It Works
        </span>
        <h2 className="text-2xl md:text-3xl font-black text-foreground break-keep">
          전문가 상담은 이렇게 진행됩니다
        </h2>
        <p className="text-sm text-muted-foreground mt-2 break-keep">
          예약부터 후속 케어까지 평균 40분 한 번이면 끝
        </p>
      </div>

      <div className="relative">
        {/* 연결선 (데스크톱) */}
        <div className="hidden lg:block absolute top-12 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 relative">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="rounded-2xl border border-border bg-white dark:bg-card p-4 text-center hover:shadow-md transition-shadow"
              >
                <div className="relative mx-auto mb-3 w-12 h-12">
                  <div className="w-12 h-12 rounded-full bg-foreground text-background flex items-center justify-center shadow-md">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center">
                    {s.n}
                  </span>
                </div>
                <h3 className="font-bold text-sm text-foreground mb-1 break-keep">{s.title}</h3>
                <p className="text-[11px] md:text-xs text-muted-foreground leading-snug break-keep mb-2">
                  {s.body}
                </p>
                <div className="text-[11px] font-black text-white bg-emerald-600 dark:bg-emerald-500 inline-block px-2.5 py-1 rounded-full shadow-sm">
                  ⏱ {s.time}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ConsultationFlowSteps;
