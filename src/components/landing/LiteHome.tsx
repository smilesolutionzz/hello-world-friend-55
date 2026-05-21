import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LITE_PRIMARY_CTA } from '@/config/liteMode';
import { supabase } from '@/integrations/supabase/client';

/**
 * LiteHome — Day 1 라이트 홈
 * - 첫 방문자: 발달체크 시작하기 단일 진입점
 * - 재방문자(로그인 또는 발달체크 1회 완료): /home 으로 자동 이동
 */
const LiteHome: React.FC = () => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const checkDone = (() => {
        try { return localStorage.getItem('aihpro_check_done') === '1'; } catch { return false; }
      })();
      const { data } = await supabase.auth.getSession();
      if (cancelled) return;
      if (data.session || checkDone) {
        navigate('/home', { replace: true });
        return;
      }
      setChecking(false);
    })();
    return () => { cancelled = true; };
  }, [navigate]);

  if (checking) {
    return <div className="min-h-screen w-full bg-white" />;
  }

  return (
    <main
      id="main-content"
      className="min-h-screen w-full bg-white text-slate-900 flex flex-col items-center justify-center px-6 py-16 break-keep"
    >
      <div className="w-full max-w-md text-center">
        <p className="text-[15px] font-medium tracking-wide text-slate-500 mb-4">
          엄마를 위한 발달 체크
        </p>
        <h1 className="text-[28px] sm:text-[32px] font-bold leading-tight text-slate-900 mb-5">
          우리 아이 발달,
          <br />
          1분 만에 가볍게 체크
        </h1>
        <p className="text-[17px] leading-relaxed text-slate-600 mb-10">
          어려운 검사 말고, 부모의 언어로.
          <br />
          지금 무료로 시작하세요.
        </p>

        <Link
          to={LITE_PRIMARY_CTA.href}
          className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-6 py-5 text-[18px] font-semibold text-white shadow-sm transition active:scale-[0.98]"
        >
          {LITE_PRIMARY_CTA.label}
        </Link>

        <p className="mt-6 text-[14px] text-slate-400">
          가입 없이 바로 시작 · 약 1분 소요
        </p>

        <div className="mt-10 flex items-center justify-center gap-5 text-[14px] text-slate-500">
          <Link to="/home" className="underline-offset-4 hover:underline">
            홈으로 가기
          </Link>
          <span className="text-slate-300">·</span>
          <Link to="/auth" className="underline-offset-4 hover:underline">
            로그인
          </Link>
        </div>
      </div>
    </main>
  );
};

export default LiteHome;
