import React from 'react';
import { Link } from 'react-router-dom';
import { LITE_PRIMARY_CTA } from '@/config/liteMode';

interface Props {
  /** 모달 안에서 쓸 때 닫기 콜백 (홈으로 가기 / 로그인 클릭 시) */
  onDismiss?: () => void;
  /** 모달 모드일 때 "홈으로 가기" 링크 대신 단순 닫기 버튼 노출 */
  modal?: boolean;
}

/**
 * LiteCTAContent — "발달체크 시작하기" 라이트 CTA 본문.
 * 풀스크린 페이지(LiteHome)와 모달(LiteCTAModal) 양쪽에서 공유한다.
 */
const LiteCTAContent: React.FC<Props> = ({ onDismiss, modal = false }) => {
  return (
    <div className="w-full max-w-md mx-auto text-center px-6 py-10 break-keep">
      <p className="text-[15px] font-medium tracking-wide text-slate-500 mb-4">
        엄마를 위한 발달 체크
      </p>
      <h1 className="text-[26px] sm:text-[30px] font-bold leading-tight text-slate-900 mb-5">
        우리 아이 발달,
        <br />
        1분 만에 가볍게 체크
      </h1>
      <p className="text-[16px] leading-relaxed text-slate-600 mb-9">
        어려운 검사 말고, 부모의 언어로.
        <br />
        지금 무료로 시작하세요.
      </p>

      <Link
        to={LITE_PRIMARY_CTA.href}
        onClick={onDismiss}
        className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-6 py-5 text-[18px] font-semibold text-white shadow-sm transition active:scale-[0.98]"
      >
        {LITE_PRIMARY_CTA.label}
      </Link>

      <p className="mt-5 text-[14px] text-slate-400">
        가입 없이 바로 시작 · 약 1분 소요
      </p>

      <div className="mt-8 flex items-center justify-center gap-5 text-[14px] text-slate-500">
        {modal ? (
          <button
            type="button"
            onClick={onDismiss}
            className="underline-offset-4 hover:underline"
          >
            홈으로 가기
          </button>
        ) : (
          <Link to="/home" className="underline-offset-4 hover:underline">
            홈으로 가기
          </Link>
        )}
        <span className="text-slate-300">·</span>
        <Link to="/auth" onClick={onDismiss} className="underline-offset-4 hover:underline">
          로그인
        </Link>
      </div>
    </div>
  );
};

export default LiteCTAContent;
