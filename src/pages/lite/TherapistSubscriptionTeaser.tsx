import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

/**
 * /therapist-subscription — 맞춤 치료사 구독 (그릿지 식 정기 매칭) 티저
 * - 지금은 "준비 중" 안내 + 알림 신청 폼 + 단건 상담 보조 링크
 * - 백엔드 연결은 Phase 다음 단계에서
 */

const AREA_LABEL: Record<string, string> = {
  language: '언어 · 발달',
  emotion: '감정 · 행동',
  social: '사회성 · 학교',
  focus: '집중력',
};

const TherapistSubscriptionTeaser: React.FC = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const area = params.get('area') ?? '';
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      const key = 'therapist_subscription_waitlist';
      const raw = sessionStorage.getItem(key);
      const list = raw ? JSON.parse(raw) : [];
      list.push({ email, area, at: new Date().toISOString() });
      sessionStorage.setItem(key, JSON.stringify(list));
    } catch {}
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 break-keep flex flex-col">
      <header className="sticky top-0 z-10 bg-white/95 backdrop-blur border-b border-slate-100">
        <div className="max-w-md mx-auto px-5 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="text-slate-500 text-[15px]"
            aria-label="뒤로"
          >
            ←
          </button>
          <span className="text-[14px] font-medium text-slate-700">맞춤 치료사 구독</span>
        </div>
      </header>

      <main className="flex-1 w-full max-w-md mx-auto px-5 pt-6 pb-12">
        <div className="inline-flex items-center px-3 py-1 rounded-full border border-[#C8B88A]/40 bg-[#C8B88A]/10 text-[11px] font-medium text-[#8a7a4a] mb-4">
          준비 중 · 사전 알림 신청
        </div>

        <h1 className="text-[24px] font-bold leading-snug mb-3">
          내 아이에 꼭 맞는
          <br />치료사를 매칭해 드려요
        </h1>
        <p className="text-[15px] text-slate-500 mb-8 leading-relaxed">
          단건 상담이 아닌, <b className="text-slate-800">월간 정기 케어</b>로
          같은 치료사가 우리 아이를 꾸준히 함께 봐주는 구독형 모델이에요.
          {area && AREA_LABEL[area] && (
            <> 신청하신 영역 <b className="text-slate-800">{AREA_LABEL[area]}</b>에 맞는 치료사부터 우선 매칭됩니다.</>
          )}
        </p>

        <section className="rounded-3xl border border-slate-200 bg-slate-50 px-5 py-6 mb-6">
          <h2 className="text-[16px] font-semibold mb-4">구독에 포함돼요</h2>
          <ol className="flex flex-col gap-4">
            {[
              { t: '영역별 검증 치료사 매칭', d: '언어 · 감정 · 사회성 · 집중력 각 영역 전문가 풀에서 우리 아이 상황에 맞는 1인을 매칭' },
              { t: '주 1회 정기 코칭 세션', d: '화상 또는 대면 중 선택. 같은 치료사가 연속적으로 케어' },
              { t: '월간 진척 리포트', d: '치료사가 직접 작성하는 변화 리포트 + 가정에서 이어갈 미션' },
            ].map((item, idx) => (
              <li key={idx} className="flex gap-3">
                <span className="shrink-0 w-6 h-6 rounded-full bg-slate-900 text-white text-[12px] font-semibold flex items-center justify-center tabular-nums">
                  {idx + 1}
                </span>
                <div>
                  <p className="text-[15px] font-medium text-slate-900">{item.t}</p>
                  <p className="text-[13px] text-slate-500 mt-0.5 leading-relaxed">{item.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* 알림 신청 폼 */}
        {!submitted ? (
          <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 px-5 py-5 mb-6">
            <label htmlFor="email" className="block text-[14px] font-semibold mb-2">
              오픈 알림 받기
            </label>
            <p className="text-[12px] text-slate-500 mb-3">
              치료사 매칭이 열리면 가장 먼저 안내해 드려요.
            </p>
            <div className="flex gap-2">
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일 주소"
                className="flex-1 h-11 px-3 rounded-xl border border-slate-300 text-[14px] focus:outline-none focus:border-slate-900"
              />
              <button
                type="submit"
                className="h-11 px-4 rounded-xl bg-slate-900 text-white text-[14px] font-semibold active:scale-[0.98]"
              >
                신청
              </button>
            </div>
          </form>
        ) : (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-5 mb-6 text-[14px] text-emerald-800">
            신청이 접수됐어요. 오픈하면 가장 먼저 알려드릴게요.
          </div>
        )}

        {/* 보조 링크 — 단건 상담 */}
        <Link
          to="/expert-hiring"
          className="block text-center text-[13px] text-slate-500 underline underline-offset-2 hover:text-slate-700"
        >
          지금 1회 전문가 상담 받기 →
        </Link>
      </main>
    </div>
  );
};

export default TherapistSubscriptionTeaser;
