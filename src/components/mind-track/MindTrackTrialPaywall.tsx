import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, Sparkles, CheckCircle2 } from 'lucide-react';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';
import SEOHead from '@/components/common/SEOHead';
import { MIND_TRACK_7_PRICE, MIND_TRACK_7_ORIGINAL_PRICE } from '@/constants/tokenCosts';

interface Props {
  currentDay: number;
  totalDays: number;
}

/**
 * 3일 무료 체험이 끝난 사용자에게 4일차 진입 시 보여주는 페이월.
 * 카드 미등록 상태에서 Day 1~3를 무료로 사용했고, Day 4부터 결제가 필요함을 안내.
 */
const MindTrackTrialPaywall: React.FC<Props> = ({ currentDay, totalDays }) => {
  const remainingDays = Math.max(0, totalDays - 3);
  return (
    <>
      <SEOHead
        title="3일 무료 체험 종료 · 7일 챌린지 계속하기 | AIHPRO"
        description="3일 무료 체험이 끝났어요. 나머지 4일 완주 코칭과 변화 리포트를 ₩7,900에 이어서 시작해 보세요."
        canonicalUrl="https://aihpro.app/mind-track/dashboard"
      />
      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50/20">
        <UnifiedNavigation />
        <section className="px-4 pt-24 pb-16">
          <div className="max-w-md mx-auto bg-white rounded-3xl border border-[#C8B88A]/40 ring-1 ring-[#C8B88A]/15 shadow-sm p-6 md:p-8">
            <div className="flex items-center gap-2 mb-2">
              <Lock className="w-4 h-4 text-[#8a7a4d]" />
              <span className="text-[11px] font-semibold tracking-wider text-[#8a7a4d] uppercase">
                Day {String(currentDay).padStart(2, '0')} · 잠금
              </span>
            </div>
            <h1 className="text-[22px] font-bold text-slate-900 leading-snug break-keep">
              3일 무료 체험을 완주했어요
            </h1>
            <p className="mt-2 text-[14px] text-slate-600 leading-relaxed break-keep">
              여기까지 오신 분은 상위 18%예요. 이제 나머지 {remainingDays}일 코칭과
              <br />변화 리포트만 남았습니다.
            </p>

            <div className="mt-5 space-y-2.5">
              {[
                `남은 ${remainingDays}일 맞춤 미션 + 일일 코칭 인사이트`,
                '7일차 변화 리포트 (시작 vs 지금 비교)',
                '맞춤 워크북 + AI 코파일럿 1:1 대화',
                '14일 환불 보장 · 자동 결제 없음',
              ].map((t) => (
                <div key={t} className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                  <span className="text-[13px] text-slate-700 leading-relaxed break-keep">{t}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl bg-slate-50 border border-slate-200 p-4 flex items-end justify-between">
              <div>
                <div className="text-[11px] text-slate-500">7일 완주 코칭</div>
                <div className="flex items-baseline gap-2">
                  <span className="text-[22px] font-bold text-slate-900">
                    ₩{MIND_TRACK_7_PRICE.toLocaleString('ko-KR')}
                  </span>
                  <span className="text-[12px] text-slate-400 line-through">
                    ₩{MIND_TRACK_7_ORIGINAL_PRICE.toLocaleString('ko-KR')}
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 rounded-full px-2 py-1">
                50% OFF
              </span>
            </div>

            <Link
              to="/pricing?product=mind_track_7&from=trial"
              className="mt-5 w-full rounded-2xl bg-slate-900 text-white px-5 py-4 flex items-center justify-center gap-2 active:scale-[0.99] transition"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-[15px] font-semibold">나머지 4일 이어서 시작하기</span>
            </Link>

            <Link
              to="/expert-hiring"
              className="mt-3 block text-center text-[12px] text-slate-400 underline underline-offset-2 hover:text-slate-600"
            >
              결제 대신 전문가와 1:1로 상담받기
            </Link>
          </div>
        </section>
      </div>
    </>
  );
};

export default MindTrackTrialPaywall;
