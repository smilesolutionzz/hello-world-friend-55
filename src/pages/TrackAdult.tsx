import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Compass, Brain, Moon, HeartPulse } from 'lucide-react';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MIND_TRACK_7_PRICE,
  MIND_TRACK_7_ORIGINAL_PRICE,
  MIND_TRACK_PRICE,
} from '@/constants/tokenCosts';
import { trackTrackEntryClick } from '@/lib/trackEntryAnalytics';

const FOCUS_AREAS = [
  {
    icon: HeartPulse,
    title: '번아웃 회복',
    desc: '직장·관계로 지친 마음을 7일에 걸쳐 단계적으로 회복합니다.',
  },
  {
    icon: Brain,
    title: '불안 진정',
    desc: '걱정·예기불안의 패턴을 분석해 매일의 진정 미션을 처방합니다.',
  },
  {
    icon: Moon,
    title: '수면·이완',
    desc: '잠들기 어려운 밤, 호흡·이완 루틴으로 회복 사이클을 복원합니다.',
  },
  {
    icon: Compass,
    title: '관계 스트레스',
    desc: '가까운 사람과의 거리감을 코칭 관점에서 다시 설계합니다.',
  },
];

const STEPS = [
  { n: '01', t: '2분 자가 체크', d: '지금 상태를 빠르게 진단해 트랙을 개인화합니다.' },
  { n: '02', t: '7일 마음 트랙 시작', d: '매일 5분 미션 + 코칭 리포트가 발행됩니다.' },
  { n: '03', t: '리포트 + 전문가 매칭', d: '완주 시 PDF 리포트와 전문가 1:1 매칭이 열립니다.' },
];

export default function TrackAdult() {
  const navigate = useNavigate();
  const startQuiz = () => {
    trackTrackEntryClick({ audience: 'adult', source: 'track_adult_landing', destination: '/quiz?audience=adult' });
    navigate('/quiz?audience=adult');
  };
  const goPay = () => {
    trackTrackEntryClick({ audience: 'adult', source: 'track_adult_landing', destination: '/mind-track?audience=adult' });
    navigate('/mind-track?audience=adult');
  };

  return (
    <>
      <Helmet>
        <title>성인 마음트랙 7일 | AIHPRO</title>
        <meta
          name="description"
          content="번아웃·불안·수면·관계 스트레스. 7일 마음트랙으로 단계별 회복을 시작하세요."
        />
        <link rel="canonical" href="https://aihpro.app/track/adult" />
      </Helmet>
      <UnifiedNavigation />

      <main className="bg-white pt-16 pb-24">
        {/* Hero */}
        <section className="container mx-auto px-6 pt-12 pb-16 max-w-5xl text-center">
          <Badge
            variant="outline"
            className="mb-5 border-[#C8B88A]/40 text-[#8a7a4c] bg-[#C8B88A]/5"
          >
            <Sparkles className="w-3 h-3 mr-1" />
            TRACK · ADULT · 베타
          </Badge>
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-tight break-keep mb-6">
            지친 어른을 위한
            <br />
            <span className="text-[#8a7a4c]">7일 마음 트랙</span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed break-keep mb-10">
            번아웃·불안·수면·관계 스트레스까지.
            <br className="hidden md:block" />
            매일 5분, 한 단계씩 회복하는 코칭 트랙.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Button
              size="lg"
              onClick={startQuiz}
              className="bg-foreground text-background hover:bg-foreground/90 rounded-2xl px-7 h-12"
            >
              2분 자가 체크부터 시작
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={goPay}
              className="rounded-2xl px-7 h-12 border-foreground/15"
            >
              7일 트랙 ₩{MIND_TRACK_7_PRICE.toLocaleString()} 바로 시작
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-4">
            정가 ₩{MIND_TRACK_7_ORIGINAL_PRICE.toLocaleString()} ·{' '}
            30일 장기 트랙 ₩{MIND_TRACK_PRICE.toLocaleString()}도 선택 가능
          </p>
        </section>

        {/* Focus areas */}
        <section className="container mx-auto px-6 max-w-5xl py-12">
          <p className="text-xs tracking-[0.2em] text-muted-foreground text-center mb-3">
            FOCUS AREAS
          </p>
          <h2 className="text-2xl md:text-3xl font-semibold text-center mb-10 break-keep">
            성인을 위해 다시 설계된 4개 트랙
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {FOCUS_AREAS.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-3xl border border-foreground/10 bg-white p-6 hover:border-foreground/25 transition-colors"
              >
                <div className="w-10 h-10 rounded-2xl bg-[#C8B88A]/10 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-[#8a7a4c]" />
                </div>
                <h3 className="text-lg font-semibold mb-1.5">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed break-keep">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Steps */}
        <section className="container mx-auto px-6 max-w-4xl py-16">
          <p className="text-xs tracking-[0.2em] text-muted-foreground text-center mb-3">
            HOW IT WORKS
          </p>
          <h2 className="text-2xl md:text-3xl font-semibold text-center mb-12 break-keep">
            3단계로 진행되는 코칭 흐름
          </h2>
          <div className="space-y-4">
            {STEPS.map((s) => (
              <div
                key={s.n}
                className="rounded-3xl border border-foreground/10 bg-white p-6 md:p-8 flex gap-5 items-start"
              >
                <span className="text-2xl font-semibold text-[#C8B88A] tabular-nums shrink-0">
                  {s.n}
                </span>
                <div>
                  <h3 className="text-lg font-semibold mb-1">{s.t}</h3>
                  <p className="text-sm text-muted-foreground break-keep">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-6 max-w-3xl py-12 text-center">
          <div className="rounded-3xl bg-foreground text-background p-10 md:p-14">
            <h2 className="text-2xl md:text-3xl font-semibold mb-3 break-keep">
              오늘의 나에게, 7일을 선물하세요
            </h2>
            <p className="text-sm md:text-base text-background/70 mb-7 break-keep">
              매일 5분이면 충분합니다. 완주 후 전문가 매칭이 열립니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                onClick={goPay}
                className="bg-background text-foreground hover:bg-background/90 rounded-2xl px-7 h-12"
              >
                ₩{MIND_TRACK_7_PRICE.toLocaleString()} 7일 트랙 시작
              </Button>
              <Link
                to="/track/child"
                className="inline-flex items-center justify-center rounded-2xl px-7 h-12 border border-background/30 text-background/90 hover:bg-background/10 transition-colors text-sm"
              >
                자녀 트랙 보러가기
              </Link>
            </div>
            <p className="text-[11px] text-background/50 mt-6">
              AIHPRO는 발달 코칭 · 의사결정 보조 도구이며, 의료 진단·치료를 대체하지 않습니다.
            </p>
          </div>
        </section>
      </main>
    </>
  );
}
