import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LineChart, Sparkles, Users, UserRound, ChevronRight, X } from 'lucide-react';

const STORAGE_KEY = 'post_quiz_onboarding_seen_v1';

interface Step {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  badge: string;
  title: string;
  body: string;
  cta: string;
  to: string;
}

const STEPS: Step[] = [
  {
    id: 'journey',
    icon: LineChart,
    badge: '01 · 나의 여정',
    title: '검사 결과를 시간순으로 누적하세요',
    body: '오늘의 결과는 RCI 기반으로 자동 저장되어, 다음 검사와 비교됩니다. 변화를 데이터로 확인하세요.',
    cta: '여정 살펴보기',
    to: '/my-journey',
  },
  {
    id: 'track',
    icon: Sparkles,
    badge: '02 · 마음 트랙',
    title: '7일 코칭 트랙으로 실제 변화 만들기',
    body: 'AI가 매일 미션을 보내고, 7일 후 변화량을 측정합니다. 검사만으로 끝내지 마세요.',
    cta: '마음 트랙 열기',
    to: '/mind-track',
  },
  {
    id: 'expert',
    icon: Users,
    badge: '03 · 전문가',
    title: '필요할 때 검증된 전문가와 1:1 연결',
    body: '구독자는 매월 무료 상담 1회 포함. AI 매칭으로 가장 적합한 전문가를 추천합니다.',
    cta: '전문가 보기',
    to: '/expert-hiring',
  },
  {
    id: 'profile',
    icon: UserRound,
    badge: '04 · MY',
    title: '이용권 · 리포트 · 리워드를 한곳에서',
    body: '보유 이용권, 누적 포인트, 받은 리포트를 MY 탭에서 관리하세요.',
    cta: '시작하기',
    to: '/profile',
  },
];

interface Props {
  /** 강제로 표시 (테스트용). 기본: localStorage 플래그 미존재 시 자동 표시 */
  force?: boolean;
}

/**
 * 검사 완료 직후 1회만 노출되는 4단계 코치마크 오버레이.
 * 여정 → 마음 트랙 → 전문가 → MY 순으로 유도.
 */
const PostQuizOnboardingTour: React.FC<Props> = ({ force = false }) => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (force) {
      setOpen(true);
      return;
    }
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        // 결과가 렌더된 직후 살짝 지연
        const t = setTimeout(() => setOpen(true), 1200);
        return () => clearTimeout(t);
      }
    } catch {}
  }, [force]);

  const close = () => {
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch {}
    setOpen(false);
  };

  const next = () => {
    if (idx < STEPS.length - 1) {
      setIdx(idx + 1);
    } else {
      close();
      navigate(STEPS[STEPS.length - 1].to);
    }
  };

  const goNow = () => {
    close();
    navigate(STEPS[idx].to);
  };

  if (!open) return null;

  const step = STEPS[idx];
  const Icon = step.icon;

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/55 backdrop-blur-sm flex items-end sm:items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="post-quiz-tour-title"
    >
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <div className="flex items-center gap-1.5">
            {STEPS.map((s, i) => (
              <span
                key={s.id}
                className={`h-1 rounded-full transition-all ${
                  i === idx ? 'w-6 bg-[#C8B88A]' : i < idx ? 'w-3 bg-[#C8B88A]/60' : 'w-3 bg-gray-200'
                }`}
              />
            ))}
          </div>
          <button
            onClick={close}
            className="p-1 text-gray-400 hover:text-gray-700 transition-colors"
            aria-label="닫기"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pb-6 pt-3">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-[#C8B88A]/15 flex items-center justify-center">
              <Icon className="w-6 h-6 text-[#8a7a4d]" />
            </div>
            <span className="text-[11px] font-bold tracking-wider text-[#8a7a4d]">{step.badge}</span>
          </div>

          <h2 id="post-quiz-tour-title" className="text-lg font-bold text-gray-900 break-keep leading-snug mb-2">
            {step.title}
          </h2>
          <p className="text-sm text-gray-600 break-keep leading-relaxed">{step.body}</p>
        </div>

        {/* Actions */}
        <div className="px-5 pb-5 flex items-center gap-2">
          <button
            onClick={close}
            className="text-xs text-gray-500 px-3 py-2 hover:text-gray-800"
          >
            건너뛰기
          </button>
          <div className="flex-1" />
          <button
            onClick={goNow}
            className="text-sm font-medium text-[#8a7a4d] px-4 py-2.5 rounded-xl hover:bg-[#C8B88A]/10 transition-colors"
          >
            {step.cta}
          </button>
          <button
            onClick={next}
            className="text-sm font-bold text-white bg-gray-900 px-5 py-2.5 rounded-xl flex items-center gap-1 hover:bg-black transition-colors"
          >
            {idx < STEPS.length - 1 ? '다음' : '완료'}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostQuizOnboardingTour;
