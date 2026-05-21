import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSmartBack } from '@/hooks/useSmartBack';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Home, Gamepad2, Sparkles } from 'lucide-react';
import GameCounseling3DMode from '@/components/metaverse/GameCounseling3DMode';

/**
 * MetaverseVoice — "게임 검사" 페이지 (흰 배경 미니멀)
 * 음성 상담은 /voice-counseling 으로 분리됨.
 */
const MetaverseVoicePage = () => {
  const navigate = useNavigate();
  const goBack = useSmartBack('/home');
  const [started, setStarted] = useState(false);

  if (started) {
    return <GameCounseling3DMode />;
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* 상단 네비 */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <button
            onClick={goBack}
            className="inline-flex items-center gap-1 text-[13px] text-slate-600 active:scale-95"
            aria-label="뒤로"
          >
            <ArrowLeft className="w-4 h-4" /> 뒤로
          </button>
          <div className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#C8B88A]" />
            <span className="text-[13px] font-semibold tracking-tight">
              AIH<span className="text-[#8a7a4d]">PRO</span>
            </span>
          </div>
          <button
            onClick={() => navigate('/home')}
            className="inline-flex items-center gap-1 text-[13px] text-slate-600 active:scale-95"
            aria-label="홈"
          >
            <Home className="w-4 h-4" />
          </button>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-5 pt-8 pb-40 break-keep">
        {/* 헤더 */}
        <header className="mb-8">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-[#8a7a4d] uppercase mb-2">
            <span className="w-1 h-1 rounded-full bg-[#C8B88A]" />
            Game-based Assessment
          </span>
          <h1 className="text-[28px] md:text-[34px] font-bold tracking-tight leading-tight">
            게임 검사
          </h1>
          <p className="mt-2 text-[14px] md:text-[15px] text-slate-600 leading-relaxed">
            대화형 미니게임을 통해 감정·관계·인지 패턴을 자연스럽게 관찰합니다.
            <br />질문지 없이도 핵심 신호를 포착할 수 있어요.
          </p>
        </header>

        {/* 특징 카드 */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
          {[
            { t: '01', h: '비대면 친화', d: '말로 꺼내기 어려운 마음을 게임으로 표현' },
            { t: '02', h: '아동·성인 모두', d: '연령별 시나리오와 캐릭터 선택' },
            { t: '03', h: '리포트 자동화', d: '플레이 직후 인사이트 요약 제공' },
          ].map((c) => (
            <div key={c.t} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-[0_1px_0_rgba(0,0,0,0.02)]">
              <div className="text-[11px] font-semibold tracking-wider text-[#8a7a4d]">{c.t}</div>
              <div className="mt-1 text-[14px] font-bold">{c.h}</div>
              <div className="mt-1 text-[12px] text-slate-500 leading-relaxed">{c.d}</div>
            </div>
          ))}
        </section>

        {/* 시작 카드 */}
        <section className="rounded-3xl border border-[#C8B88A]/30 ring-1 ring-[#C8B88A]/10 bg-white p-6 md:p-8">
          <div className="flex items-center gap-2 text-[11px] font-semibold tracking-wider text-[#8a7a4d] uppercase">
            <Gamepad2 className="w-3.5 h-3.5" /> Ready
          </div>
          <h2 className="mt-2 text-[20px] md:text-[22px] font-bold leading-snug">
            지금 바로 5분 게임 검사 시작
          </h2>
          <p className="mt-1.5 text-[13px] text-slate-600 leading-relaxed">
            마이크와 화면 접근 권한이 필요할 수 있어요. 결과는 자동으로 리포트에 저장됩니다.
          </p>
          <Button
            onClick={() => setStarted(true)}
            className="mt-5 w-full md:w-auto h-12 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-[14px] font-semibold"
          >
            <Gamepad2 className="w-4 h-4 mr-1.5" /> 게임 검사 시작하기
          </Button>

          <div className="mt-4 text-[11px] text-slate-400">
            음성으로 1:1 대화를 원하시면{' '}
            <button
              onClick={() => navigate('/voice-counseling')}
              className="underline underline-offset-2 hover:text-slate-600"
            >
              음성 상담
            </button>
            을 이용해 주세요.
          </div>
        </section>
      </main>
    </div>
  );
};

export default MetaverseVoicePage;
