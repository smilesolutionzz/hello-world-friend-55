import React, { useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MIND_TRACK_7_PRICE } from '@/constants/tokenCosts';

/**
 * /check/done — Day 3 즉시 리포트
 * - 결제/로그인 0회. 결과 100% 공개. 블러/잠금 없음.
 * - 진단/장애/치료 단어 금지. "참고용 체크", "살펴볼 점" 톤.
 * - CTA: 1순위 "7일 챌린지 시작하기" (mind_track_7 결제), 2순위 "맞춤 치료사 구독" (티저).
 *        위기 점수일 때만 작은 안전망 링크로 /expert-hiring?urgent=true 노출.
 */

type AreaCode = 'language' | 'emotion' | 'social' | 'focus';

type CheckResult = {
  age: string;
  area: AreaCode;
  answers: Record<number, number>;
  questions?: { question_no: number; prompt: string }[];
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

/**
 * 발달 점수 (높을수록 좋음). 5문항 × 5점척도 → 최소 5, 최대 25.
 * 발달 점수 = ((max - total) / (max - min)) × 100.
 */
function toScore(total: number, questionCount: number = 5): number {
  const min = questionCount;
  const max = questionCount * 5;
  const pct = Math.max(0, Math.min(100, Math.round(((max - total) / (max - min)) * 100)));
  return pct;
}

/** 응답 강도 라벨 (1~5점 → 짧은 해석 문구) */
function answerInsight(v: number): { tag: string; tone: string } {
  if (v <= 1) return { tag: '전혀 아니다', tone: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  if (v === 2) return { tag: '드물게 보임', tone: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  if (v === 3) return { tag: '가끔 보임', tone: 'text-amber-700 bg-amber-50 border-amber-200' };
  if (v === 4) return { tag: '자주 보임', tone: 'text-rose-700 bg-rose-50 border-rose-200' };
  return { tag: '매우 자주 보임', tone: 'text-rose-700 bg-rose-50 border-rose-200' };
}

/** 또래 평균 (참고치, 75점 기준). 실데이터 누적 전 임시 벤치마크. */
const PEER_AVG = 75;

/** 또래 대비 상태 카피. 발달 점수가 높을수록 편안한 톤. */
function toToneLabel(score: number): { tag: string; color: string } {
  if (score >= PEER_AVG) return { tag: '또래 평균 수준', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  if (score >= PEER_AVG - 20) return { tag: '살펴볼 점이 있어요', color: 'text-amber-700 bg-amber-50 border-amber-200' };
  return { tag: '함께 봐 주시면 좋아요', color: 'text-rose-700 bg-rose-50 border-rose-200' };
}

/** 또래 평균과의 비교 한 줄 (위협적이지 않게). */
function toPeerLine(score: number): string {
  const gap = score - PEER_AVG;
  if (gap >= 5) return `또래 평균(${PEER_AVG}점)보다 ${gap}점 높아요`;
  if (gap >= -4) return `또래 평균(${PEER_AVG}점)과 비슷한 수준이에요`;
  return `또래 평균(${PEER_AVG}점)보다 ${Math.abs(gap)}점 낮은 편이에요`;
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
  // 위기 안전망: 전체 점수 매우 낮거나, 감정 영역에서 평균 이하
  const showSafetyNet = score < 40 || (result.area === 'emotion' && score < 50);

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
            <span className="text-[12px] text-slate-400 mb-3 ml-1">/ 100</span>
          </div>
          <p className="text-[13px] text-slate-600 mt-2">{toPeerLine(score)}</p>

          {/* 또래 평균 비교 막대 */}
          <div className="mt-4">
            <div className="relative h-2 rounded-full bg-slate-200 overflow-visible">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-slate-900 transition-all"
                style={{ width: `${score}%` }}
              />
              {/* 또래 평균 마커 */}
              <div
                className="absolute -top-1 -translate-x-1/2"
                style={{ left: `${PEER_AVG}%` }}
                aria-label={`또래 평균 ${PEER_AVG}점`}
              >
                <div className="w-0.5 h-4 bg-amber-500 mx-auto" />
              </div>
            </div>
            <div className="flex justify-between mt-2 text-[11px] text-slate-400 tabular-nums">
              <span>0</span>
              <span className="text-amber-600">또래 평균 {PEER_AVG}점</span>
              <span>100</span>
            </div>
          </div>

          <div className={`inline-flex items-center mt-4 px-3 py-1 rounded-full text-[12px] font-medium border ${tone.color}`}>
            {tone.tag}
          </div>
        </section>
        <p className="text-[12px] text-slate-400 mb-8">
          ※ 진단이 아닌, 부모님이 일상에서 살펴보시도록 돕는 참고용 체크예요. 점수는 높을수록 또래 평균에 가깝습니다.
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

      {/* 하단 CTA — 7일 챌린지 메인 + 치료사 구독 보조 + (조건부) 안전망 */}
      <div className="fixed bottom-0 inset-x-0 z-20 bg-white/95 backdrop-blur border-t border-slate-100">
        <div className="max-w-md mx-auto px-5 pt-3 pb-4 flex flex-col gap-2">
          <p className="text-[12px] text-slate-500 text-center mb-0.5">
            카드 등록 없이 · 지금 바로 시작
          </p>

          {/* 메인: 3일 무료 체험 */}
          <Link
            to={`/mind-track?audience=child&from=check&area=${result.area}&age=${encodeURIComponent(result.age)}&score=${score}`}
            className="w-full rounded-2xl bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between active:scale-[0.99] transition"
          >
            <span className="flex flex-col items-start">
              <span className="text-[17px] font-semibold leading-tight">3일 무료 체험 시작하기</span>
              <span className="text-[11px] text-white/70 mt-0.5">
                {copy.shortLabel} 7일 부모 코칭 · 4일차부터 ₩{MIND_TRACK_7_PRICE.toLocaleString('ko-KR')}
              </span>
            </span>
            <span className="text-[18px]">→</span>
          </Link>

          {/* 보조: 맞춤 치료사 구독 */}
          <Link
            to={`/therapist-subscription?from=check&area=${result.area}`}
            className="w-full rounded-2xl bg-white border border-[#C8B88A]/50 text-slate-900 px-5 py-2.5 flex items-center justify-between hover:bg-[#C8B88A]/5 transition"
          >
            <span className="flex flex-col items-start">
              <span className="text-[14px] font-semibold leading-tight">맞춤 치료사 구독 알아보기</span>
              <span className="text-[11px] text-slate-500 mt-0.5">내 아이에 맞는 치료사 매칭 · 월간 정기 코칭</span>
            </span>
            <span className="text-[14px] text-[#8a7a4a]">→</span>
          </Link>

          {/* 위기 안전망 — 조건부 */}
          {showSafetyNet && (
            <>
              <Link
                to="/expert-hiring?urgent=true"
                className="text-center text-[12px] text-slate-400 underline underline-offset-2 hover:text-slate-600 mt-1"
              >
                걱정이 크다면 전문가에게 바로 도움받기
              </Link>
              <Link
                to={`/find-center?region=${encodeURIComponent('서울')}`}
                className="text-center text-[12px] text-slate-400 underline underline-offset-2 hover:text-slate-600"
              >
                우리 동네 기관 찾기
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckDone;
