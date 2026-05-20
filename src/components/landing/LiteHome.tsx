import React from 'react';
import { Link } from 'react-router-dom';
import { LITE_PRIMARY_CTA } from '@/config/liteMode';

/**
 * LiteHome — Day 1 라이트 홈
 * - 한 화면, 핵심 1개(발달체크 시작하기)
 * - 본문 17px 이상, break-keep
 * - 네비/푸터/스티키바/코파일럿 전부 숨김
 */
const LiteHome: React.FC = () => {
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
      </div>
    </main>
  );
};

export default LiteHome;
