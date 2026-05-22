import React, { useRef, useState } from 'react';
import { Heart, Sparkles, CalendarDays, MessageSquare, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = [
  { n: 1, icon: Heart, title: '고민 선택', body: '주제 한 가지만 골라요', time: '30초' },
  { n: 2, icon: Sparkles, title: 'AI 자동 매칭', body: '나에게 맞는 전문가 3명', time: '10초' },
  { n: 3, icon: CalendarDays, title: '시간 예약', body: '원하는 40분 슬롯 선택', time: '1분' },
  { n: 4, icon: MessageSquare, title: '1:1 상담', body: '화상 또는 채팅으로', time: '40분' },
  { n: 5, icon: FileText, title: '후속 케어', body: '요약 리포트 자동 발송', time: '평생' },
];

const ConsultationFlowSteps: React.FC = () => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const scrollTo = (idx: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.children[idx] as HTMLElement | undefined;
    if (card) card.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  };

  const handleScroll = () => {
    const el = scrollerRef.current;
    if (!el) return;
    const cardWidth = el.scrollWidth / STEPS.length;
    const idx = Math.round(el.scrollLeft / cardWidth);
    setActive(Math.min(STEPS.length - 1, Math.max(0, idx)));
  };

  return (
    <section className="my-4">
      <div className="flex items-end justify-between mb-3 px-1">
        <div>
          <h2 className="text-base font-bold text-foreground tracking-tight">상담은 이렇게 진행돼요</h2>
          <p className="text-[12px] text-muted-foreground mt-0.5">평균 40분 · 한 번이면 끝</p>
        </div>
        <div className="hidden md:flex items-center gap-1">
          <button
            aria-label="이전"
            onClick={() => scrollTo(Math.max(0, active - 1))}
            className="w-8 h-8 rounded-full border border-border bg-white hover:bg-muted flex items-center justify-center"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            aria-label="다음"
            onClick={() => scrollTo(Math.min(STEPS.length - 1, active + 1))}
            className="w-8 h-8 rounded-full border border-border bg-white hover:bg-muted flex items-center justify-center"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal slide carousel */}
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="flex gap-3 overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 px-4 pb-2"
        style={{ scrollPaddingLeft: 16 }}
      >
        {STEPS.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.n}
              className="snap-center shrink-0 w-[78%] sm:w-[44%] md:w-[28%] bg-white border border-border rounded-2xl p-5"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-[11px] font-bold text-muted-foreground tracking-widest">STEP {String(s.n).padStart(2, '0')}</span>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">{s.time}</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-foreground text-background flex items-center justify-center mb-3">
                <Icon className="w-4.5 h-4.5" />
              </div>
              <h3 className="font-semibold text-[15px] text-foreground tracking-tight mb-1">{s.title}</h3>
              <p className="text-[12.5px] text-muted-foreground leading-relaxed break-keep">{s.body}</p>
            </div>
          );
        })}
      </div>

      {/* Dots indicator */}
      <div className="flex items-center justify-center gap-1.5 mt-3">
        {STEPS.map((_, i) => (
          <button
            key={i}
            aria-label={`${i + 1}단계`}
            onClick={() => scrollTo(i)}
            className={cn(
              'h-1.5 rounded-full transition-all',
              i === active ? 'w-6 bg-foreground' : 'w-1.5 bg-border'
            )}
          />
        ))}
      </div>
    </section>
  );
};

export default ConsultationFlowSteps;
