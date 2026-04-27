import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Frown, Smile, Sparkles } from 'lucide-react';
import { MIND_TRACK_PRICE } from '@/constants/tokenCosts';

interface BeforeAfterCardProps {
  /** 결제 CTA 클릭 핸들러 (선택) */
  onPayClick?: () => void;
}

const BEFORE_ITEMS = [
  '아침에 눈뜨는 게 두려워요',
  '잠을 자도 피곤이 안 풀려요',
  '작은 일에도 마음이 무너져요',
  '내가 뭘 원하는지 모르겠어요',
];

const AFTER_ITEMS = [
  '아침 5분, 마음 정리 습관이 생겼어요',
  '수면 루틴이 잡혀 깊이 잠들어요',
  '무너져도 다시 일어서는 회복탄력성',
  '내 감정·목표·가치를 또렷이 알아요',
];

const BeforeAfterCard: React.FC<BeforeAfterCardProps> = ({ onPayClick }) => {
  return (
    <section className="my-12 md:my-16">
      <div className="text-center mb-8">
        <span className="inline-block text-[11px] font-bold tracking-[0.18em] uppercase text-muted-foreground mb-2">
          Before / After
        </span>
        <h2 className="text-2xl md:text-3xl font-black text-foreground break-keep">
          30일 후, 당신의 마음은 이렇게 달라집니다
        </h2>
        <p className="text-sm text-muted-foreground mt-2 break-keep">
          실제 30일 트랙 졸업자들이 가장 많이 보고한 변화입니다
        </p>
      </div>

      <div className="grid md:grid-cols-[1fr_auto_1fr] gap-4 md:gap-6 items-stretch">
        {/* BEFORE */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl border border-slate-200 bg-slate-50 dark:bg-slate-900/40 p-5 md:p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
              <Frown className="w-4 h-4 text-slate-500" />
            </div>
            <div>
              <div className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">Before</div>
              <div className="text-sm font-bold text-slate-700 dark:text-slate-300">지금의 나</div>
            </div>
          </div>
          <ul className="space-y-2.5">
            {BEFORE_ITEMS.map((t, i) => (
              <li key={i} className="text-sm text-slate-600 dark:text-slate-400 flex gap-2 break-keep">
                <span className="text-slate-400 flex-shrink-0">·</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* ARROW + 가격 */}
        <div className="flex md:flex-col items-center justify-center gap-2 md:px-2">
          <div className="hidden md:block w-px h-10 bg-border" />
          <div className="rounded-full bg-foreground text-background px-4 py-2 text-xs font-bold whitespace-nowrap shadow-lg">
            ₩{MIND_TRACK_PRICE.toLocaleString()} · 30일
          </div>
          <ArrowRight className="w-6 h-6 text-foreground md:rotate-90 hidden md:block" />
          <ArrowRight className="w-6 h-6 text-foreground md:hidden" />
          <div className="hidden md:block w-px h-10 bg-border" />
        </div>

        {/* AFTER */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl border-2 border-emerald-300 dark:border-emerald-700 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 p-5 md:p-6 relative overflow-hidden"
        >
          <Sparkles className="absolute top-3 right-3 w-4 h-4 text-emerald-400" />
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center">
              <Smile className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="text-[10px] font-bold tracking-wider text-emerald-700 dark:text-emerald-400 uppercase">After</div>
              <div className="text-sm font-bold text-emerald-900 dark:text-emerald-100">30일 후의 나</div>
            </div>
          </div>
          <ul className="space-y-2.5">
            {AFTER_ITEMS.map((t, i) => (
              <li key={i} className="text-sm text-emerald-900 dark:text-emerald-100 font-medium flex gap-2 break-keep">
                <span className="text-emerald-500 flex-shrink-0">✓</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      {onPayClick && (
        <div className="text-center mt-6">
          <button
            onClick={onPayClick}
            className="text-sm text-primary hover:underline font-medium"
          >
            바로 30일 변화 시작하기 →
          </button>
        </div>
      )}
    </section>
  );
};

export default BeforeAfterCard;
