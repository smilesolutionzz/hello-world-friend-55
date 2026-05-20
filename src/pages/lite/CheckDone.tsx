import React, { useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';

/**
 * /check/done — Day 3 즉시 리포트
 * - 결제/로그인 0회. 결과 100% 공개. 블러/잠금 없음.
 * - 진단/장애/치료 단어 금지. "참고용 체크", "살펴볼 점" 톤.
 * - CTA 위계: 1순위 "우리 동네 기관 찾기" (크게), 2순위 "30일 변화 추적하기(선택)" (작게)
 */

type AreaCode = 'language' | 'emotion' | 'social' | 'focus';

type CheckResult = {
  age: string;
  area: AreaCode;
  answers: Record<number, number>;
  total: number;
  submittedAt: string;
};

type AreaCopy = {
  label: string;
  shortLabel: string;
  peer: string;
  observations: string[];
  homeTips: string[];
};

const AREA_COPY: Record<AreaCode, AreaCopy> = {
  language: {
    label: '언어 · 발달',
    shortLabel: '언어',
    peer: '또래보다 표현이 적은 편으로 보여요',
    observations: [
      '하루 중 아이가 먼저 말을 거는 횟수가 줄었는지 살펴보세요.',
      '새 단어를 따라 말하기보다 손짓·표정으로 표현하려는 경향이 있는지 봐 주세요.',
      '질문에 단답형으로만 답하고 대화가 짧게 끊기는 순간이 있는지 떠올려 보세요.',
    ],
    homeTips: [
      '잠자기 전 5분, 오늘 가장 재밌었던 한 가지를 아이가 직접 말로 설명하게 해 주세요.',
      '그림책 한 페이지를 읽고 "여기서 뭐가 보여?"라고 열린 질문으로 되물어 주세요.',
      '아이의 말을 끊지 않고 끝까지 듣고, 마지막 단어를 한 번 더 따라 말해 주세요.',
    ],
  },
  emotion: {
    label: '감정 · 행동',
    shortLabel: '감정',
    peer: '또래에 비해 감정 기복이 조금 잦은 편으로 보여요',
    observations: [
      '하루 중 짜증·분노가 올라오는 시간대(아침/등하원/잠자기 전)가 정해져 있는지 살펴보세요.',
      '감정이 격해진 뒤 스스로 진정하는 데 걸리는 시간이 점점 길어지는지 봐 주세요.',
      '감정 표현이 말보다 행동(밀기, 던지기, 울기)으로 먼저 나오는 순간이 있는지 떠올려 보세요.',
    ],
    homeTips: [
      '아이가 짜증을 낼 때 "지금 화났구나"라고 감정 단어를 먼저 짚어 주세요.',
      '하루 한 번, 아이와 함께 깊게 숨을 3번 같이 들이쉬고 내쉬는 시간을 만들어 보세요.',
      '아이가 진정된 후 "아까 어떤 마음이었어?"라고 천천히 되짚어 주세요. 훈계는 잠시 미뤄도 괜찮아요.',
    ],
  },
  social: {
    label: '사회성 · 학교',
    shortLabel: '사회성',
    peer: '또래에 비해 새로운 관계에서 긴장이 큰 편으로 보여요',
    observations: [
      '아이가 친구 이름을 자주 언급하는지, 아니면 혼자 놀았다는 이야기가 늘었는지 살펴보세요.',
      '새로운 장소·새로운 사람 앞에서 평소보다 말수가 줄어드는지 봐 주세요.',
      '친구와 다툰 뒤 스스로 화해하려는 시도가 있는지, 회피하는지 떠올려 보세요.',
    ],
    homeTips: [
      '오늘 어린이집·학교에서 같이 논 친구 한 명의 이름을 자연스럽게 물어봐 주세요.',
      '주말에 1:1로 만날 수 있는 친구 한 명과 짧은 만남(30분~1시간)을 만들어 보세요.',
      '갈등 상황을 "어떻게 말하면 좋았을까?"라고 역할극처럼 함께 연습해 주세요.',
    ],
  },
  focus: {
    label: '집중력',
    shortLabel: '집중',
    peer: '또래에 비해 한 가지 일을 끝까지 마치는 데 어려움이 있는 편으로 보여요',
    observations: [
      '시작한 활동을 끝까지 마치는 비율이 절반 이하인지 살펴보세요.',
      '주변 소리·움직임에 쉽게 시선이 흩어지는지 봐 주세요.',
      '해야 할 일을 자주 잊거나, 같은 안내를 여러 번 해야 하는지 떠올려 보세요.',
    ],
    homeTips: [
      '한 번에 하나의 지시만 짧은 문장으로 전달해 주세요. ("책가방 정리해 줘" 하나만)',
      '타이머를 활용해 "10분만 집중" 같은 짧은 단위로 성공 경험을 쌓아 주세요.',
      '책상 위에 지금 필요한 물건만 남기고 나머지는 시야에서 치워 주세요.',
    ],
  },
};

/** 5점 척도 × 3문항 = 최대 15점. 역채점이므로 점수가 높을수록 "살펴볼 점이 많음". 100점 환산. */
function toScore(total: number): number {
  const max = 15;
  const pct = Math.max(0, Math.min(100, Math.round((total / max) * 100)));
  return pct;
}

/** 비위협적 카피: "이런 점을 함께 봐요" 톤 */
function toToneLabel(score: number): { tag: string; color: string } {
  if (score <= 40) return { tag: '편안한 편', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  if (score <= 65) return { tag: '살펴볼 점이 있어요', color: 'text-amber-700 bg-amber-50 border-amber-200' };
  return { tag: '함께 봐 주시면 좋아요', color: 'text-rose-700 bg-rose-50 border-rose-200' };
}

const CheckDone: React.FC = () => {
  const navigate = useNavigate();

  const result = useMemo<CheckResult | null>(() => {
    try {
      const raw = sessionStorage.getItem('lite_check_result');
      if (!raw) return null;
      return JSON.parse(raw) as CheckResult;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!result) {
      // 직접 진입 시 체크로 유도
      navigate('/check', { replace: true });
    }
  }, [result, navigate]);

  if (!result) return null;

  const copy = AREA_COPY[result.area];
  const score = toScore(result.total);
  const tone = toToneLabel(score);

  return (
    <div className="min-h-screen bg-white text-slate-900 break-keep flex flex-col">
      {/* 상단 */}
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-slate-100">
        <div className="max-w-md mx-auto px-5 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="text-slate-500 text-[15px]"
            aria-label="홈으로"
          >
            ←
          </button>
          <span className="text-[14px] font-medium text-slate-700">참고용 체크 결과</span>
        </div>
      </header>

      <main className="flex-1 w-full max-w-md mx-auto px-5 pt-6 pb-40">
        {/* 영역/안내 */}
        <p className="text-[13px] text-slate-500 mb-1">{copy.label}</p>
        <h1 className="text-[22px] font-bold leading-snug mb-5">
          오늘 {copy.shortLabel}에 대해
          <br />이런 점을 함께 봐요
        </h1>

        {/* 큰 숫자 카드 */}
        <section className="rounded-3xl border border-slate-200 bg-slate-50 px-6 py-7 mb-3">
          <div className="flex items-end gap-2">
            <span className="text-[15px] font-medium text-slate-600">{copy.shortLabel}</span>
            <span className="text-[64px] leading-none font-extrabold tracking-tight text-slate-900 tabular-nums">
              {score}
            </span>
            <span className="text-[18px] font-semibold text-slate-500 mb-2">점</span>
          </div>
          <p className="text-[13px] text-slate-500 mt-2">{copy.peer}</p>
          <div className={`inline-flex items-center mt-4 px-3 py-1 rounded-full text-[12px] font-medium border ${tone.color}`}>
            {tone.tag}
          </div>
        </section>
        <p className="text-[12px] text-slate-400 mb-8">
          ※ 진단이 아닌, 부모님이 일상에서 살펴보시도록 돕는 참고용 체크예요.
        </p>

        {/* 살펴보면 좋을 점 */}
        <section className="mb-8">
          <h2 className="text-[17px] font-semibold mb-3">살펴보면 좋을 점</h2>
          <ul className="flex flex-col gap-3">
            {copy.observations.map((obs, idx) => (
              <li key={idx} className="flex gap-3">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-slate-900 shrink-0" />
                <p className="text-[15px] leading-relaxed text-slate-800">{obs}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* 오늘 집에서 해볼 것 */}
        <section className="mb-8">
          <h2 className="text-[17px] font-semibold mb-3">오늘 집에서 해볼 것</h2>
          <ol className="flex flex-col gap-3">
            {copy.homeTips.map((tip, idx) => (
              <li key={idx} className="flex gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-slate-900 text-white text-[12px] font-semibold flex items-center justify-center tabular-nums">
                  {idx + 1}
                </span>
                <p className="text-[15px] leading-relaxed text-slate-800">{tip}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* 안내 */}
        <p className="text-[12px] text-slate-400 leading-relaxed">
          이 결과는 만 {result.age}세 아이의 최근 1~2주 모습을 부모님이 직접 체크한 내용으로 만들어졌어요.
          의료적 판단을 대신하지 않으며, 걱정이 길어진다면 가까운 전문가와 한 번 이야기 나눠 보시길 권해요.
        </p>
      </main>

      {/* 하단 CTA 2개 — 위계 분명히 */}
      <div className="fixed bottom-0 inset-x-0 z-20 bg-white/95 backdrop-blur border-t border-slate-100">
        <div className="max-w-md mx-auto px-5 py-3 flex flex-col gap-2">
          <Link
            to="/expert-hiring"
            className="w-full h-14 rounded-2xl bg-slate-900 text-white text-[18px] font-semibold flex items-center justify-center active:scale-[0.98] transition"
          >
            우리 동네 기관 찾기
          </Link>
          <Link
            to="/mind-track?audience=child"
            className="w-full h-11 rounded-xl text-[14px] font-medium text-slate-500 flex items-center justify-center hover:text-slate-700"
          >
            30일 변화 추적하기 (선택)
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CheckDone;
