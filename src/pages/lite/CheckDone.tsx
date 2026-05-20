import React from 'react';
import { Link } from 'react-router-dom';

/**
 * /check/done — Day 2 임시 완료 화면.
 * 결과 화면(/check/result)은 Day 3에서 구현.
 */
const CheckDone: React.FC = () => {
  return (
    <main className="min-h-screen bg-white text-slate-900 break-keep flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        <div className="w-14 h-14 rounded-full bg-slate-900 text-white mx-auto mb-6 flex items-center justify-center text-2xl">
          ✓
        </div>
        <h1 className="text-[24px] font-bold mb-3">응답이 저장됐어요</h1>
        <p className="text-[17px] text-slate-500 leading-relaxed mb-10">
          상세 결과 리포트는
          <br />곧 이 화면에서 보실 수 있어요.
        </p>
        <Link
          to="/"
          className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-6 py-4 text-[17px] font-semibold text-white"
        >
          처음으로
        </Link>
      </div>
    </main>
  );
};

export default CheckDone;
