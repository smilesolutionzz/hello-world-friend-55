import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Clock, ClipboardCheck, Eye, Brain, Phone, Repeat, Target, Trophy } from 'lucide-react';

const SAMPLE_DAYS_7 = [
  {
    day: 1,
    title: '출발선 진단 — 5종 자가진단으로 마음 점수 기록',
    body: '우울·불안·스트레스·수면·에너지 5축 자가진단 + 마음 점수 측정. "내가 지금 어디에 있는지"가 숫자로 또렷해집니다. 7일 후 비교의 절대 기준이 돼요.',
    icon: ClipboardCheck,
    accent: 'from-blue-500 to-indigo-500',
    label: 'Day 01 · 진단',
  },
  {
    day: 2,
    title: '24시간 자기관찰 — 아침/점심/저녁 3회 체크인',
    body: '하루 3번 1분 체크인으로 내 감정·에너지 곡선을 추적해요. AI가 자동으로 "당신의 무너지는 시간대"를 찾아냅니다.',
    icon: Eye,
    accent: 'from-cyan-500 to-blue-500',
    label: 'Day 02 · 관찰',
  },
  {
    day: 3,
    title: '뿌리 패턴 진단 — 박사급 AI 심층 분석',
    body: '2일치 데이터를 Gemini 3.1이 분석해 핵심 패턴 1가지를 골라줘요. "왜 이렇게 반복되는지"가 보이는 순간, 변화가 시작됩니다.',
    icon: Brain,
    accent: 'from-violet-500 to-purple-500',
    label: 'Day 03 · 분석',
  },
  {
    day: 4,
    title: '전문가 1:1 개입 — 15분 무료 매칭 상담',
    body: '내 데이터를 본 전문가가 직접 처방을 줘요. 혼자 절대 못 보는 사각지대를 찔러주는 날. 7일 트랙 결제자 무료 크레딧 포함.',
    icon: Phone,
    accent: 'from-amber-500 to-orange-500',
    label: 'Day 04 · 개입',
  },
  {
    day: 5,
    title: '회복 루틴 3가지 압축 — 평생 가져갈 무기',
    body: '4일간 가장 효과 있던 행동을 3가지로 압축해 일상에 심어요. 단순 팁이 아니라 "내 데이터로 검증된 처방"입니다.',
    icon: Repeat,
    accent: 'from-emerald-500 to-teal-500',
    label: 'Day 05 · 설계',
  },
  {
    day: 6,
    title: '실전 — 가장 무너지던 순간에 새 루틴 적용',
    body: '평소 가장 어려웠던 상황(스트레스/관계/수면)에 직접 써봐요. "어, 진짜 다르네"가 체감되는 날. 진짜 변화 검증.',
    icon: Target,
    accent: 'from-rose-500 to-pink-500',
    label: 'Day 06 · 실전',
  },
  {
    day: 7,
    title: '7일 변화 리포트 + 다음 30일 가이드 (PDF)',
    body: 'Day 1과 비교한 종합 변화 리포트(PDF)와, 이후에도 혼자 이어갈 수 있는 셀프 코칭 가이드를 받습니다. 더 가고 싶다면 +23일 연장권으로 풀 30일까지.',
    icon: Trophy,
    accent: 'from-yellow-500 to-amber-500',
    label: 'Day 07 · 졸업',
  },
];

const DailyMissionPreview: React.FC = () => {
  return (
    <section className="my-12 md:my-16">
      <div className="text-center mb-8">
        <span className="inline-block text-[11px] font-bold tracking-[0.18em] uppercase text-muted-foreground mb-2">
          Inside the 7 Days
        </span>
        <h2 className="text-2xl md:text-3xl font-black text-foreground break-keep">
          7일 안에 진짜 발가벗겨지고, 진짜 좋아지는 압축 트랙
        </h2>
        <p className="text-sm text-muted-foreground mt-2 break-keep flex items-center justify-center gap-1.5 flex-wrap">
          <Clock className="w-3.5 h-3.5" />
          매일 오전 8시 메일 도착 · 5분 미션 + AI 분석 + 전문가 개입까지
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3 md:gap-4">
        {SAMPLE_DAYS_7.map((d, i) => {
          const Icon = d.icon;
          return (
            <motion.div
              key={d.day}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
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

      <p className="text-center text-[11px] text-muted-foreground mt-5 italic break-keep">
        ※ 결제 후 선택한 목표(우울/불안/수면 등)에 맞춰 매일 미션이 자동 맞춤됩니다. 7일 완주 시 +23일 연장권(₩12,900)으로 풀 30일 트랙 이어가기 가능.
      </p>
    </section>
  );
};

export default DailyMissionPreview;
