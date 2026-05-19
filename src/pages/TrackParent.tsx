import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Heart, Users, Shield, BookOpen } from 'lucide-react';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  MIND_TRACK_7_PRICE,
  MIND_TRACK_7_ORIGINAL_PRICE,
  MIND_TRACK_PRICE,
} from '@/constants/tokenCosts';
import { trackTrackEntryClick } from '@/lib/trackEntryAnalytics';

/**
 * Parent track landing (audience='parent').
 * 자녀 트랙(/track/child=/mind-track)과 분리된 부모 전용 코칭 트랙 — Phase 1 스케치.
 * - 결제 진입: /quiz?audience=parent → /mind-track?audience=parent
 * - 콘텐츠: src/lib/mindTrackDayCopy.ts DAY_COPY_7_PARENT 참고
 */

const FOCUS_AREAS = [
  { icon: Heart, title: '부모 번아웃·죄책감', desc: '"좋은 부모여야 한다"는 압박을 내려놓고 내 에너지부터 회복합니다.' },
  { icon: Users, title: '아이와의 갈등 순간', desc: '떼쓰기·등원 거부·취침 거부 등 가장 힘든 장면 대응 루틴을 설계합니다.' },
  { icon: Shield, title: '나만의 경계 만들기', desc: '가족·일·SNS로부터 내 에너지를 지키는 한 문장을 미리 준비합니다.' },
  { icon: BookOpen, title: '자녀 트랙과 연계', desc: '완주 시 아이용 트랙으로 자연스럽게 연결되어 가족 단위 변화를 만듭니다.' },
];

const STEPS = [
  { n: '01', t: '2분 부모 자가 체크', d: '번아웃·죄책감·관계 스트레스를 함께 측정합니다.' },
  { n: '02', t: '7일 부모 마음 트랙', d: '매일 5분, "나 먼저 채우는" 회복 루틴을 따라갑니다.' },
  { n: '03', t: '리포트 + 자녀 트랙 연계', d: '완주 시 부모 변화 리포트 + 자녀 트랙 매칭이 열립니다.' },
];

export default function TrackParent() {
  const navigate = useNavigate();
  const startQuiz = () => {
    trackTrackEntryClick({ audience: 'parent', source: 'track_parent_landing', destination: '/quiz?audience=parent' });
    navigate('/quiz?audience=parent');
  };
  const goPay = () => {
    trackTrackEntryClick({ audience: 'parent', source: 'track_parent_landing', destination: '/mind-track?audience=parent' });
    navigate('/mind-track?audience=parent');
  };

  return (
    <>
      <Helmet>
        <title>부모 마음트랙 7일 | AIHPRO</title>
        <meta
          name="description"
          content="부모 번아웃·죄책감·아이와의 갈등. 7일 부모 마음트랙으로 나부터 회복하세요."
        />
        <link rel="canonical" href="https://aihpro.app/track/parent" />
      </Helmet>
      <UnifiedNavigation />

      <main className="bg-white pt-16 pb-24">
        <section className="container mx-auto px-6 pt-12 pb-16 max-w-5xl text-center">
          <Badge
            variant="outline"
            className="mb-5 border-[#C8B88A]/40 text-[#8a7a4c] bg-[#C8B88A]/5"
          >
            <Sparkles className="w-3 h-3 mr-1" />
            TRACK · PARENT · 베타
          </Badge>
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-tight break-keep mb-6">
            아이를 돌보느라
            <br />
            지친 부모를 위한{' '}
            <span className="text-[#8a7a4c]">7일 마음 트랙</span>
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed break-keep mb-10">
            번아웃·죄책감·아이와의 갈등.
            <br className="hidden md:block" />
            나를 먼저 채우는 루틴으로 가족 전체가 회복됩니다.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Button
              size="lg"
              onClick={startQuiz}
              className="bg-foreground text-background hover:bg-foreground/90 rounded-2xl px-7 h-12"
            >
              2분 부모 체크부터 시작
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

        <section className="container mx-auto px-6 max-w-5xl py-12">
          <p className="text-xs tracking-[0.2em] text-muted-foreground text-center mb-3">
            FOCUS AREAS
          </p>
          <h2 className="text-2xl md:text-3xl font-semibold text-center mb-10 break-keep">
            부모를 위해 다시 설계된 4개 영역
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
                <p className="text-sm text-muted-foreground leading-relaxed break-keep">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="container mx-auto px-6 max-w-4xl py-16">
          <p className="text-xs tracking-[0.2em] text-muted-foreground text-center mb-3">
            HOW IT WORKS
          </p>
          <h2 className="text-2xl md:text-3xl font-semibold text-center mb-12 break-keep">
            3단계로 진행되는 부모 코칭
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

        <section className="container mx-auto px-6 max-w-3xl py-12 text-center">
          <div className="rounded-3xl bg-foreground text-background p-10 md:p-14">
            <h2 className="text-2xl md:text-3xl font-semibold mb-3 break-keep">
              아이보다, 오늘은 나에게 7일을
            </h2>
            <p className="text-sm md:text-base text-background/70 mb-7 break-keep">
              매일 5분이면 충분합니다. 완주 후 자녀 트랙으로 자연스럽게 이어집니다.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                size="lg"
                onClick={goPay}
                className="bg-background text-foreground hover:bg-background/90 rounded-2xl px-7 h-12"
              >
                ₩{MIND_TRACK_7_PRICE.toLocaleString()} 부모 트랙 시작
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
