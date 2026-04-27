import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Clock, BookOpen, FileBarChart2, Trophy } from 'lucide-react';

const SAMPLE_DAYS = [
  {
    day: 1,
    title: '오늘의 마음 점수 측정하기',
    body: '간단한 5문항으로 출발선을 기록해요. 30일 후 변화를 비교할 수 있는 베이스라인이 만들어집니다.',
    icon: BookOpen,
    accent: 'from-blue-500 to-indigo-500',
    label: '시작',
  },
  {
    day: 7,
    title: '첫 주 변화 리포트 도착',
    body: '한 주 동안 측정된 마음 점수, 잠/스트레스 패턴을 그래프로 받아봐요. RCI(신뢰변화지수)로 의미 있는 변화를 검증합니다.',
    icon: FileBarChart2,
    accent: 'from-violet-500 to-purple-500',
    label: '리포트',
  },
  {
    day: 15,
    title: '중간 점검 — 작은 승리 축하',
    body: '15일 동안 쌓인 데이터로 가장 큰 변화 영역을 찾아 강화 미션을 처방합니다.',
    icon: Mail,
    accent: 'from-amber-500 to-orange-500',
    label: '중간 점검',
  },
  {
    day: 30,
    title: '변화 종합 PDF + 다음 30일 가이드',
    body: '30일 전체 변화를 박사급 분석으로 정리한 PDF와, 이후에도 지속 가능한 셀프 코칭 가이드를 받습니다.',
    icon: Trophy,
    accent: 'from-emerald-500 to-teal-500',
    label: '졸업',
  },
];

const DailyMissionPreview: React.FC = () => {
  return (
    <section className="my-12 md:my-16">
      <div className="text-center mb-8">
        <span className="inline-block text-[11px] font-bold tracking-[0.18em] uppercase text-muted-foreground mb-2">
          Inside the 30 Days
        </span>
        <h2 className="text-2xl md:text-3xl font-black text-foreground break-keep">
          30일간 매일 무슨 일이 일어나나요?
        </h2>
        <p className="text-sm text-muted-foreground mt-2 break-keep flex items-center justify-center gap-1.5 flex-wrap">
          <Clock className="w-3.5 h-3.5" />
          매일 오전 8시 메일 도착 · 5분 안에 끝나는 코칭 미션
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 md:gap-4">
        {SAMPLE_DAYS.map((d, i) => {
          const Icon = d.icon;
          return (
            <motion.div
              key={d.day}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="rounded-2xl border border-border bg-white dark:bg-card p-5 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${d.accent} flex items-center justify-center text-white shadow-md`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">{d.label}</div>
                  <div className="text-lg font-black text-foreground tabular-nums">Day {d.day}</div>
                </div>
              </div>
              <h3 className="font-bold text-sm md:text-base text-foreground mb-1.5 break-keep">
                {d.title}
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed break-keep">
                {d.body}
              </p>
            </motion.div>
          );
        })}
      </div>

      <p className="text-center text-[11px] text-muted-foreground mt-5 italic">
        ※ 위는 공통 샘플이며, 결제 후 선택한 목표(우울/불안/수면 등)에 맞춰 매일 미션이 자동 맞춤됩니다.
      </p>
    </section>
  );
};

export default DailyMissionPreview;
