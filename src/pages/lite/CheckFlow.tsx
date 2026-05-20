import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

/**
 * /check — 라이트 발달체크 (Day 2)
 * - 비회원도 끝까지 진행 가능 (회원가입/로그인/결제 요구 금지)
 * - Step 1: 자녀 나이 + 가장 걱정되는 영역 1개 선택
 * - Step 2: 선택 영역 3문항 (5점 척도)
 * - 하단 고정 CTA (56px)
 */

type AreaCode = 'language' | 'emotion' | 'social' | 'focus';

const AREAS: { code: AreaCode; label: string; desc: string; dot: string }[] = [
  { code: 'language', label: '언어 · 발달', desc: '말하기, 어휘, 표현이 또래보다 느린 것 같아요', dot: 'bg-sky-500' },
  { code: 'emotion',  label: '감정 · 행동', desc: '짜증, 분노, 기분 변화가 자주 보여요',           dot: 'bg-rose-500' },
  { code: 'social',   label: '사회성 · 학교', desc: '친구 관계, 새 환경 적응이 어려워 보여요',     dot: 'bg-amber-500' },
  { code: 'focus',    label: '집중력',      desc: '한 가지 일을 끝까지 하기 어려워해요',          dot: 'bg-emerald-500' },
];

const SCALE = [
  { value: 1, label: '전혀 아니다' },
  { value: 2, label: '별로 그렇지 않다' },
  { value: 3, label: '보통이다' },
  { value: 4, label: '자주 그렇다' },
  { value: 5, label: '매우 그렇다' },
];

const AGE_OPTIONS = Array.from({ length: 12 }, (_, i) => ({
  value: String(i + 1),
  label: `만 ${i + 1}세`,
}));

type Question = {
  area_code: AreaCode;
  question_no: number;
  prompt: string;
};

const DRAFT_KEY = 'lite_check_draft';

const CheckFlow: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);

  // Step 1 state
  const [age, setAge] = useState<string>('');
  const [area, setArea] = useState<AreaCode | ''>('');

  // Step 2 state
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQ, setLoadingQ] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});

  // Restore draft
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        if (d.age) setAge(d.age);
        if (d.area) setArea(d.area);
      }
    } catch {}
  }, []);

  // Persist draft
  useEffect(() => {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ age, area, answers }));
  }, [age, area, answers]);

  const canNextStep1 = age !== '' && area !== '';
  const canSubmit = questions.length > 0 && questions.every((q) => answers[q.question_no]);

  const fetchQuestions = async (code: AreaCode) => {
    setLoadingQ(true);
    const { data, error } = await supabase
      .from('lite_assessments')
      .select('area_code, question_no, prompt')
      .eq('area_code', code)
      .eq('is_active', true)
      .order('question_no', { ascending: true });
    if (!error && data) {
      setQuestions(data as Question[]);
    }
    setLoadingQ(false);
  };

  const handleNext = async () => {
    if (!canNextStep1 || area === '') return;
    await fetchQuestions(area);
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  };

  const handleSubmit = () => {
    const payload = {
      age,
      area,
      answers,
      total: Object.values(answers).reduce((a, b) => a + b, 0),
      submittedAt: new Date().toISOString(),
    };
    sessionStorage.setItem('lite_check_result', JSON.stringify(payload));
    // 결과 페이지는 Day 3에서 — 지금은 임시 안내
    navigate('/check/done', { replace: true });
  };

  const progressPct = useMemo(() => (step === 1 ? 50 : 100), [step]);

  return (
    <div className="min-h-screen bg-white text-slate-900 break-keep flex flex-col">
      {/* Top progress */}
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-slate-100">
        <div className="max-w-md mx-auto px-5 py-3 flex items-center gap-3">
          <button
            onClick={() => (step === 2 ? setStep(1) : navigate('/'))}
            className="text-slate-500 text-[15px]"
            aria-label="뒤로"
          >
            ←
          </button>
          <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-slate-900 transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="text-[13px] text-slate-500 tabular-nums">{step}/2</span>
        </div>
      </header>

      <main className="flex-1 w-full max-w-md mx-auto px-5 pt-6 pb-32">
        {step === 1 && (
          <section>
            <h1 className="text-[24px] font-bold leading-snug mb-2">
              우리 아이에 대해
              <br />
              두 가지만 알려주세요
            </h1>
            <p className="text-[15px] text-slate-500 mb-8">1분이면 돼요.</p>

            {/* 나이 */}
            <label className="block text-[17px] font-semibold mb-3">자녀 나이</label>
            <div className="relative mb-8">
              <select
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full h-14 px-4 text-[18px] rounded-2xl bg-slate-50 border border-slate-200 appearance-none pr-10"
              >
                <option value="" disabled>선택해 주세요</option>
                {AGE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">▾</span>
            </div>

            {/* 영역 */}
            <label className="block text-[17px] font-semibold mb-3">
              가장 걱정되는 영역 <span className="text-slate-400 font-normal">하나만 골라요</span>
            </label>
            <div className="flex flex-col gap-3">
              {AREAS.map((a) => {
                const selected = area === a.code;
                return (
                  <button
                    key={a.code}
                    type="button"
                    onClick={() => setArea(a.code)}
                    className={[
                      'w-full text-left rounded-2xl border px-5 py-4 transition',
                      'min-h-[88px] flex items-start gap-3',
                      selected
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-900 active:bg-slate-50',
                    ].join(' ')}
                    aria-pressed={selected}
                  >
                    <span className={`mt-1 w-2.5 h-2.5 rounded-full ${selected ? 'bg-white' : a.dot}`} />
                    <span className="flex-1">
                      <span className="block text-[18px] font-semibold leading-tight">{a.label}</span>
                      <span className={`block text-[14px] mt-1 ${selected ? 'text-white/80' : 'text-slate-500'}`}>
                        {a.desc}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {step === 2 && (
          <section>
            <p className="text-[14px] text-slate-500 mb-1">
              {AREAS.find((a) => a.code === area)?.label}
            </p>
            <h1 className="text-[22px] font-bold leading-snug mb-6">
              최근 1~2주 모습을
              <br />떠올리며 답해 주세요
            </h1>

            {loadingQ && <p className="text-[15px] text-slate-500">불러오는 중…</p>}

            <ol className="flex flex-col gap-7">
              {questions.map((q, idx) => (
                <li key={q.question_no}>
                  <p className="text-[17px] font-medium leading-relaxed mb-3">
                    <span className="text-slate-400 mr-1">{idx + 1}.</span>
                    {q.prompt}
                  </p>
                  <div className="grid grid-cols-5 gap-1.5">
                    {SCALE.map((s) => {
                      const active = answers[q.question_no] === s.value;
                      return (
                        <button
                          key={s.value}
                          type="button"
                          onClick={() =>
                            setAnswers((p) => ({ ...p, [q.question_no]: s.value }))
                          }
                          className={[
                            'h-12 rounded-xl text-[14px] font-medium transition border',
                            active
                              ? 'bg-slate-900 text-white border-slate-900'
                              : 'bg-white text-slate-600 border-slate-200 active:bg-slate-50',
                          ].join(' ')}
                          aria-pressed={active}
                        >
                          {s.value}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex justify-between mt-2 px-0.5">
                    <span className="text-[12px] text-slate-400">전혀 아니다</span>
                    <span className="text-[12px] text-slate-400">매우 그렇다</span>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        )}
      </main>

      {/* 하단 고정 CTA */}
      <div className="fixed bottom-0 inset-x-0 z-20 bg-white/95 backdrop-blur border-t border-slate-100">
        <div className="max-w-md mx-auto px-5 py-3">
          {step === 1 ? (
            <button
              type="button"
              disabled={!canNextStep1}
              onClick={handleNext}
              className={[
                'w-full h-14 rounded-2xl text-[18px] font-semibold transition',
                canNextStep1
                  ? 'bg-slate-900 text-white active:scale-[0.98]'
                  : 'bg-slate-200 text-slate-400',
              ].join(' ')}
            >
              다음
            </button>
          ) : (
            <button
              type="button"
              disabled={!canSubmit}
              onClick={handleSubmit}
              className={[
                'w-full h-14 rounded-2xl text-[18px] font-semibold transition',
                canSubmit
                  ? 'bg-slate-900 text-white active:scale-[0.98]'
                  : 'bg-slate-200 text-slate-400',
              ].join(' ')}
            >
              결과 보기
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckFlow;
