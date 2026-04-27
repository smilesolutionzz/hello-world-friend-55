import React from 'react';
import { motion } from 'framer-motion';
import { Ticket, Sparkles, CalendarCheck, ShieldCheck } from 'lucide-react';

const STEPS = [
  {
    n: 1,
    icon: Ticket,
    title: '상담권 활성화 & 전문가 추천 받기',
    body: '결제 즉시 마이페이지에 1회권이 적립됩니다. "전문가 매칭 시작" 버튼을 누르면 그동안의 검사 점수·일일 코칭 답변을 기반으로 가장 잘 맞는 전문가 3명이 카드 형태로 제시됩니다. (소요 시간: 약 30초)',
  },
  {
    n: 2,
    icon: CalendarCheck,
    title: '캘린더에서 40분 슬롯 예약하기',
    body: '추천 전문가 카드에서 "예약하기"를 누르면 7일치 가능 시간이 30분 단위로 보입니다. 원하는 날짜·시간을 고르고 상담 주제(예: "최근 불면 + 직장 스트레스")를 한 줄 적으면 즉시 예약 확정 알림이 카톡·이메일로 발송됩니다.',
  },
  {
    n: 3,
    icon: ShieldCheck,
    title: '상담 진행 후 7일 케어 받기',
    body: '예약 시간 5분 전 입장 링크가 도착합니다. 화상 또는 채팅 중 선택해 40분 1:1 상담을 진행하고, 종료 후 24시간 안에 전문가가 직접 작성한 "맞춤 실천 플랜 PDF"가 발송됩니다. 이후 7일간 채팅으로 추가 질문도 가능합니다.',
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
