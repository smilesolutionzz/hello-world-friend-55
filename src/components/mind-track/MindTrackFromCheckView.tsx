import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Shield, Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { startMindTrackTrial } from '@/lib/mindTrackEnrollment';
import { trackEvent } from '@/components/common/Analytics';
import { MIND_TRACK_7_PRICE } from '@/constants/tokenCosts';


type AreaCode = 'language' | 'emotion' | 'social' | 'focus';

interface Props {
  user: any | null;
  area: AreaCode;
  age: string | null;
  score: number | null;
  audience: 'child' | 'adult' | 'parent' | 'teen';
}

const AREA_LABEL: Record<AreaCode, { short: string; full: string; hook: string }> = {
  language: {
    short: '언어 발달',
    full: '언어 · 표현 발달',
    hook: '아이의 말문이 또래만큼 트이고 있는지',
  },
  emotion: {
    short: '감정 · 행동',
    full: '감정 조절 · 행동 발달',
    hook: '아이의 감정 기복과 훈육 갈등이 잦은 편인지',
  },
  social: {
    short: '사회성',
    full: '사회성 · 또래 관계',
    hook: '아이가 친구와 어울리는 데 어려움이 없는지',
  },
  focus: {
    short: '집중력',
    full: '집중력 · 자기조절',
    hook: '아이가 한 가지에 끝까지 집중하는 힘이 있는지',
  },
};

// 체크 영역 → 7일 코칭 트랙 매핑
const AREA_TO_GOAL: Record<AreaCode, string> = {
  language: 'child_development',
  emotion: 'family_communication',
  social: 'family_communication',
  focus: 'child_development',
};

const MindTrackFromCheckView: React.FC<Props> = ({ user, area, age, score, audience }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const autoStartedRef = useRef(false);
  const meta = AREA_LABEL[area];
  const goal = AREA_TO_GOAL[area];

  const handleStart = async () => {
    if (!user) {
      // 로그인 후에도 체크 결과(age·score·area·audience)를 그대로 이어가도록 모든 파라미터를 redirect URL에 포함
      const params = new URLSearchParams({
        postLogin: '1',
        trial: '1',
        from: 'check',
        area,
        audience,
        autostart: '1',
      });
      if (age) params.set('age', age);
      if (score != null) params.set('score', String(score));
      navigate('/auth?redirect=' + encodeURIComponent(`/mind-track?${params.toString()}`));
      return;
    }
    setLoading(true);
    try {
      const concern = `자녀(${age ?? '아동'}세) ${meta.full} 체크 결과 ${score ?? '-'}점 — 부모 코칭으로 이어가기`;
      const res = await startMindTrackTrial({ goal, concern }, audience);
      if (!res.enrollmentId) throw new Error(res.error || '등록 실패');
      trackEvent('mind_track_trial_start', { goal, audience, from: 'check', area });
      toast.success('3일 무료 코칭을 시작합니다');
      const ip = new URLSearchParams({ intake: '1', from: 'check', audience, area });
      if (age) ip.set('age', age);
      if (score != null) ip.set('score', String(score));
      navigate(`/mind-track/start?${ip.toString()}`);

    } catch (e: any) {
      toast.error(e.message || '등록 중 오류가 발생했어요');
    } finally {
      setLoading(false);
    }
  };

  // 로그인 후 자동 진행 — autostart=1 이면서 user 있을 때 한 번만 트리거
  useEffect(() => {
    if (autoStartedRef.current) return;
    const sp = new URLSearchParams(location.search);
    const shouldAutoStart = sp.get('autostart') === '1' || (sp.get('postLogin') === '1' && sp.get('trial') === '1');
    if (shouldAutoStart && user && !loading) {
      autoStartedRef.current = true;
      handleStart();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, location.search]);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-white text-slate-900 break-keep">
      <main className="max-w-xl mx-auto px-5 pt-8 pb-[220px]">
        {/* 컨텍스트 배너 — 체크 정보 이어받기 */}
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 mb-6 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <p className="text-[14px] text-slate-700 leading-snug">
            방금 본 <strong className="text-slate-900">{age ?? ''}세 · {meta.full}</strong> 체크
            {typeof score === 'number' && (
              <> 결과 <strong className="text-slate-900 tabular-nums">{score}점</strong></>
            )}
            을 이어서 부모 코칭으로 연결해요.
          </p>
        </div>

        {/* 메인 카피 — 자녀 발달 부모에게 뾰족하게 */}
        <p className="text-[12px] font-bold tracking-[0.18em] text-[#8a7a4d] uppercase mb-3">
          7 DAY PARENT COACHING · 매일 5분
        </p>
        <h1 className="text-[30px] sm:text-[34px] leading-[1.2] font-bold text-slate-900 mb-4">
          {meta.hook},
          <br />
          <span className="text-blue-700">7일이면 보입니다.</span>
        </h1>
        <p className="text-[17px] leading-[1.65] text-slate-600 mb-8">
          발달 14년 전문가가 설계한 부모 코칭을
          <strong className="text-slate-900"> 카드 등록 없이 3일 무료</strong>로 체험하세요.
          오늘 본 체크 결과가 그대로 코칭에 반영돼요.
        </p>

        {/* 7일 흐름 — 한눈에 */}
        <section className="mb-8">
          <h2 className="text-[22px] font-bold text-slate-900 mb-4">7일, 이렇게 진행돼요</h2>
          <ol className="flex flex-col gap-3">
            {[
              { d: 'Day 1', t: '오늘 체크 결과로 출발점 정리' },
              { d: 'Day 2–3', t: '아이 발달에 맞춘 하루 1가지 부모 미션' },
              { d: 'Day 4', t: '전문가 1:1 코칭 (15분 무료 매칭)' },
              { d: 'Day 5–6', t: '집에서 통한 미션을 우리 집 루틴으로' },
              { d: 'Day 7', t: '7일 변화 리포트 + 다음 단계 가이드' },
            ].map((s, i) => (
              <li key={s.d} className="flex items-start gap-3">
                <span className="shrink-0 w-7 h-7 rounded-full bg-slate-900 text-white text-[13px] font-bold flex items-center justify-center tabular-nums">
                  {i + 1}
                </span>
                <div className="pt-0.5">
                  <div className="text-[13px] font-semibold text-blue-700">{s.d}</div>
                  <p className="text-[16px] leading-[1.55] text-slate-800">{s.t}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* 신뢰 줄 — 작은 폰트 금지 */}
        <ul className="grid grid-cols-1 gap-2.5 mb-8">
          {[
            '카드 등록 없이 3일 무료 · 4일차부터만 결제',
            `이어서 결제 시 7일 전체 ₩${MIND_TRACK_7_PRICE.toLocaleString()} (커피 한 잔 값)`,
            '의료 진단/치료 아님 · 부모를 위한 발달 코칭',
          ].map((t) => (
            <li key={t} className="flex items-start gap-2 text-[15px] text-slate-700 leading-relaxed">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-1 shrink-0" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </main>

      {/* 하단 고정 CTA — 큰 글씨 */}
      <div
        className="fixed inset-x-0 z-30 bg-white/95 backdrop-blur border-t border-slate-100"
        style={{ bottom: 'calc(env(safe-area-inset-bottom, 0px) + 64px)' }}
      >
        <div className="max-w-xl mx-auto px-5 pt-3 pb-3">
          <p className="text-[13px] text-slate-500 text-center mb-2">
            카드 등록 없이 · 지금 바로 시작 · 4일차부터 ₩{MIND_TRACK_7_PRICE.toLocaleString()}
          </p>
          <button
            type="button"
            onClick={handleStart}
            disabled={loading}
            className="w-full h-[60px] rounded-2xl bg-slate-900 text-white text-[18px] font-bold flex items-center justify-center gap-2 active:scale-[0.99] transition disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                시작하는 중…
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                3일 무료 코칭 시작하기
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
          <p className="flex items-center justify-center gap-1.5 text-[12px] text-slate-400 mt-2">
            <Shield className="w-3 h-3" />
            안전한 토스페이먼츠 결제 · 자동 갱신 없음
          </p>
        </div>
      </div>
    </div>
  );
};

export default MindTrackFromCheckView;
