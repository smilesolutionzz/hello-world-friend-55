import React from 'react';
import { ArrowRight, CheckCircle2, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MindTrackFocusId } from '@/lib/mindTrackFocusTracks';
import { MIND_TRACK_FOCUSES } from '@/lib/mindTrackFocusTracks';
import { cn } from '@/lib/utils';

interface QuickOption {
  id: MindTrackFocusId;
  emoji: string;
  label: string;
  helper: string;
}

const QUICK_OPTIONS: QuickOption[] = [
  { id: 'sleep', emoji: '😴', label: '잠이 안 와요', helper: '수면 회복' },
  { id: 'stress', emoji: '🌿', label: '늘 긴장돼요', helper: '스트레스 다스리기' },
  { id: 'mood', emoji: '☁️', label: '기분이 가라앉아요', helper: '감정 안정' },
  { id: 'relationship', emoji: '🤝', label: '관계가 힘들어요', helper: '관계 개선' },
  { id: 'parenting', emoji: '🤱', label: '육아가 버거워요', helper: '육아 번아웃 회복' },
];

interface TrackQuickPickerProps {
  selectedGoal: string | null;
  onSelect: (id: MindTrackFocusId) => void;
  onStart: () => void;
  loading?: boolean;
  showAdvancedOpen: boolean;
  onToggleAdvanced: () => void;
}

const TrackQuickPicker: React.FC<TrackQuickPickerProps> = ({
  selectedGoal,
  onSelect,
  onStart,
  loading,
  showAdvancedOpen,
  onToggleAdvanced,
}) => {
  const matched = selectedGoal
    ? MIND_TRACK_FOCUSES.find((f) => f.id === selectedGoal)
    : null;

  return (
    <div className="space-y-5">
      {/* 한 줄 질문 */}
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1 break-keep">
          지금 가장 신경 쓰이는 게 뭐예요?
        </h2>
        <p className="text-sm md:text-base text-slate-500 break-keep">
          한 가지만 골라주세요. 맞는 7일 마음 트랙을 바로 보여드려요.
        </p>
      </div>

      {/* 5개 큰 버튼 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        {QUICK_OPTIONS.map((opt) => {
          const active = selectedGoal === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelect(opt.id)}
              className={cn(
                'group relative h-28 md:h-32 px-5 md:px-6 rounded-2xl border-2 text-left transition-all flex items-center gap-4',
                active
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              )}
            >
              <span className="text-4xl md:text-5xl">{opt.emoji}</span>
              <span className="flex-1 min-w-0">
                <span className="block font-bold text-base md:text-lg text-slate-900 break-keep">
                  {opt.label}
                </span>
                <span className="block text-xs md:text-sm text-slate-500 mt-1 break-keep">
                  {opt.helper}
                </span>
              </span>
              {active && (
                <CheckCircle2 className="w-6 h-6 text-blue-600 shrink-0" />
              )}
            </button>
          );
        })}
        {/* 5번째는 풀폭 한 칸 */}
        <div className="hidden sm:block" />
      </div>

      {/* 매칭 결과 카드 */}
      <AnimatePresence mode="wait">
        {matched && (
          <motion.div
            key={matched.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="bg-white rounded-3xl border-2 border-blue-200 p-5 md:p-6"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-3xl md:text-4xl">{matched.icon}</span>
                <div className="min-w-0">
                  <div className="text-[11px] font-semibold text-blue-600 mb-0.5">
                    당신에게 맞는 트랙
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-slate-900 break-keep">
                    {matched.label}
                  </h3>
                </div>
              </div>
            </div>
            <p className="text-sm text-slate-600 break-keep mb-4">{matched.desc}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-5">
              {matched.weeklyThemes.map((theme, i) => (
                <div
                  key={i}
                  className="rounded-xl bg-slate-50 border border-slate-100 px-3 py-2"
                >
                  <div className="text-[10px] font-semibold text-slate-400">
                    {i + 1}주차
                  </div>
                  <div className="text-xs font-medium text-slate-800 break-keep mt-0.5">
                    {theme}
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={onStart}
              disabled={loading}
              className="w-full h-12 rounded-2xl bg-slate-900 text-white font-bold text-sm md:text-base inline-flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors disabled:opacity-60"
            >
              {loading ? '등록 중…' : (
                <>
                  이 트랙으로 시작하기
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 전체 보기 토글 — 카드형 CTA */}
      <button
        type="button"
        onClick={onToggleAdvanced}
        className={cn(
          'w-full group rounded-2xl border-2 p-4 md:p-5 text-left transition-all',
          showAdvancedOpen
            ? 'border-blue-300 bg-blue-50'
            : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white'
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="text-sm md:text-base font-bold text-slate-900 break-keep">
              {showAdvancedOpen ? '간단히 보기' : '전체 9개 트랙 / 카테고리로 보기'}
            </div>
            <div className="text-xs md:text-sm text-slate-500 mt-0.5 break-keep">
              {showAdvancedOpen
                ? '다시 5개 빠른 선택으로 돌아가기'
                : '내 고민에 꼭 맞는 트랙을 직접 골라보세요'}
            </div>
          </div>

          {/* 9개 아이콘 티저 */}
          {!showAdvancedOpen && (
            <div className="hidden sm:flex items-center -space-x-2 mr-2">
              {MIND_TRACK_FOCUSES.slice(0, 9).map((f) => (
                <span
                  key={f.id}
                  className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-base shadow-sm"
                  title={f.label}
                >
                  {f.icon}
                </span>
              ))}
            </div>
          )}

          <div
            className={cn(
              'w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all',
              showAdvancedOpen
                ? 'bg-blue-100 text-blue-600'
                : 'bg-white text-slate-400 group-hover:text-slate-600 border border-slate-200'
            )}
          >
            <ChevronDown
              className={cn(
                'w-5 h-5 transition-transform',
                showAdvancedOpen && 'rotate-180'
              )}
            />
          </div>
        </div>
      </button>
    </div>
  );
};

export default TrackQuickPicker;
