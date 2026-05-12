import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Award, MapPin, Users, ShieldCheck, BookOpen, Heart } from 'lucide-react';

const CAREER_TIMELINE = [
  { year: '2012', label: '발달 임상 현장 입문' },
  { year: '2016', label: '아동·청소년 발달 코칭 전문 과정 수료' },
  { year: '2019', label: '한점미소발달센터 1호점 개소' },
  { year: '2022', label: '한점미소발달센터 2호점 개소' },
  { year: '2024', label: '누적 임상 케이스 2,000+ 가족' },
  { year: '2026', label: 'AIHPRO 마음트랙 30일 출시' },
];

const CENTERS = [
  {
    name: '한점미소발달센터 1호점',
    years: '운영 7년차',
    focus: '영유아·아동 발달 스크리닝, 부모-자녀 상호작용 코칭',
  },
  {
    name: '한점미소발달센터 2호점',
    years: '운영 4년차',
    focus: '학령기 정서·행동 코칭, 가정 연계 프로그램',
  },
];

const SPECIALTIES = [
  { icon: Users, title: '영유아·아동 발달 스크리닝', desc: '12개월부터 학령전기까지, 발달 영역별 정밀 관찰과 가정 코칭' },
  { icon: Heart, title: '부모-자녀 상호작용 코칭', desc: '가정에서 매일 1분 안에 적용 가능한 코칭 행동을 부모에게 전달' },
  { icon: BookOpen, title: '정서·행동 영역 가정 연계', desc: '센터 세션과 가정 일상을 연결해 변화가 일상에 정착되도록 설계' },
];

const ANONYMIZED_CASES = [
  {
    tag: '5세 · 정서 조절',
    title: '아침마다 폭발하던 아이, 30일 후 부모가 먼저 달라졌습니다',
    summary:
      '엄마의 반응 패턴을 매일 1분 체크인으로 기록하면서, 30일차에 아침 갈등이 주 5회에서 주 1회로 감소.',
  },
  {
    tag: '7세 · 또래 관계',
    title: '학교에서 말이 없던 아이의 관계 점수가 변한 순간',
    summary:
      '부모 관찰 + 자녀 자가 응답 데이터를 매주 비교하며 코칭 방향을 조정. 8주차부터 또래 발화량 유의미 증가.',
  },
  {
    tag: '4세 · 수면·일상 루틴',
    title: '잠들기까지 1시간 → 15분, 가족 전체 수면 점수가 회복',
    summary:
      '저녁 루틴 코칭 카드를 14일간 적용. 부모의 일관성 점수가 먼저 상승하고, 자녀 수면 잠복기가 단축됨.',
  },
];

export default function AboutExpert() {
  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>운영자 소개 · 14년 발달 임상 경력</title>
        <meta
          name="description"
          content="한점미소발달센터 2곳을 직접 운영하는 14년 임상 전문가가 설계한 마음트랙. 누적 2,000+ 가족 코칭 데이터로 만들어졌습니다."
        />
      </Helmet>

      {/* Hero */}
      <section className="px-6 pt-20 pb-16 md:pt-28 md:pb-24">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-foreground/5 px-4 py-1.5 text-xs tracking-[0.2em] text-muted-foreground">
              <ShieldCheck className="w-3.5 h-3.5" />
              ABOUT · EXPERT
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-semibold leading-[1.15] tracking-tight break-keep">
            14년 발달 임상 경력으로
            <br />
            만든 마음트랙
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed break-keep max-w-2xl">
            현장에서 부모가 매일 마주치는 진짜 고민을 그대로 30일 코칭 흐름에 옮겼습니다. 검사지가 아닌, 일상의 변화를 만드는 도구입니다.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <div className="rounded-2xl border border-border bg-white px-5 py-3">
              <div className="text-xs text-muted-foreground">누적 임상 케이스</div>
              <div className="text-2xl font-semibold mt-1">2,000<span className="text-base text-muted-foreground">+ 가족</span></div>
            </div>
            <div className="rounded-2xl border border-border bg-white px-5 py-3">
              <div className="text-xs text-muted-foreground">직접 운영 센터</div>
              <div className="text-2xl font-semibold mt-1">2<span className="text-base text-muted-foreground">곳</span></div>
            </div>
            <div className="rounded-2xl border border-border bg-white px-5 py-3">
              <div className="text-xs text-muted-foreground">발달 임상 경력</div>
              <div className="text-2xl font-semibold mt-1">14<span className="text-base text-muted-foreground">년</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* Centers */}
      <section className="px-6 py-16 md:py-20 bg-[#FAFAF7]">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="space-y-3">
            <p className="text-xs tracking-[0.2em] text-muted-foreground">01 · OUR CENTERS</p>
            <h2 className="text-3xl md:text-4xl font-semibold leading-tight break-keep">
              한점미소발달센터 2곳을 직접 운영합니다
            </h2>
            <p className="text-muted-foreground break-keep max-w-2xl">
              마음트랙은 책상 위에서 만든 검사지가 아닙니다. 실제 센터 현장에서 매일 마주치는 부모·자녀의 케이스를 코칭 흐름으로 옮긴 결과물입니다.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {CENTERS.map((c) => (
              <div key={c.name} className="rounded-3xl border border-border bg-white p-6 md:p-8 space-y-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5" />
                  {c.years}
                </div>
                <h3 className="text-xl font-semibold break-keep">{c.name}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed break-keep">{c.focus}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Specialties */}
      <section className="px-6 py-16 md:py-24">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="space-y-3">
            <p className="text-xs tracking-[0.2em] text-muted-foreground">02 · SPECIALTIES</p>
            <h2 className="text-3xl md:text-4xl font-semibold leading-tight break-keep">
              전문 영역
            </h2>
          </div>
          <div className="space-y-3">
            {SPECIALTIES.map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.title} className="rounded-3xl border border-border p-6 md:p-7 flex gap-5 items-start">
                  <div className="rounded-2xl bg-foreground/5 p-3 shrink-0">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1.5 min-w-0">
                    <h3 className="text-lg font-semibold break-keep">{s.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed break-keep">{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Career timeline */}
      <section className="px-6 py-16 md:py-20 bg-[#FAFAF7]">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="space-y-3">
            <p className="text-xs tracking-[0.2em] text-muted-foreground">03 · TIMELINE</p>
            <h2 className="text-3xl md:text-4xl font-semibold leading-tight break-keep">
              14년의 임상 발자취
            </h2>
          </div>
          <div className="relative pl-6 md:pl-8 border-l border-border space-y-8">
            {CAREER_TIMELINE.map((t) => (
              <div key={t.year} className="relative">
                <span className="absolute -left-[29px] md:-left-[37px] top-1.5 w-3 h-3 rounded-full bg-foreground" />
                <div className="text-xs tracking-[0.18em] text-muted-foreground">{t.year}</div>
                <div className="text-base md:text-lg font-medium mt-1 break-keep">{t.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Anonymized cases */}
      <section className="px-6 py-16 md:py-24">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="space-y-3">
            <p className="text-xs tracking-[0.2em] text-muted-foreground">04 · CASE NOTES</p>
            <h2 className="text-3xl md:text-4xl font-semibold leading-tight break-keep">
              현장 케이스 노트
            </h2>
            <p className="text-sm text-muted-foreground break-keep max-w-2xl">
              가족 식별 정보는 모두 제거하고, 코칭 패턴과 결과만 남긴 익명 사례입니다.
            </p>
          </div>
          <div className="space-y-4">
            {ANONYMIZED_CASES.map((c) => (
              <div key={c.title} className="rounded-3xl border border-border p-6 md:p-8 space-y-3">
                <span className="inline-block text-xs tracking-[0.15em] text-muted-foreground bg-foreground/5 px-3 py-1 rounded-full">
                  {c.tag}
                </span>
                <h3 className="text-lg md:text-xl font-semibold leading-snug break-keep">{c.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed break-keep">{c.summary}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground/70 break-keep">
            본 페이지는 발달 코칭·의사결정 지원을 목적으로 하며, 의학적 진단·치료를 대체하지 않습니다.
          </p>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="px-6 py-20 md:py-28 bg-foreground text-background">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <Award className="w-8 h-8 mx-auto opacity-70" />
          <h2 className="text-3xl md:text-4xl font-semibold leading-tight break-keep">
            14년 임상 데이터를 기반으로,
            <br />
            우리 가족의 30일이 시작됩니다
          </h2>
          <p className="text-base text-background/70 break-keep max-w-xl mx-auto">
            매일 1분 체크인 + 임상 검증 검사. 30일 후 가족의 마음 점수가 어떻게 달라졌는지 숫자로 보여드립니다.
          </p>
          <div className="flex flex-wrap gap-3 justify-center pt-4">
            <Link
              to="/track/child"
              className="inline-block rounded-2xl bg-background text-foreground px-6 py-3.5 text-sm font-medium hover:opacity-90 transition"
            >
              자녀 마음트랙 시작하기
            </Link>
            <Link
              to="/expert-hiring"
              className="inline-block rounded-2xl border border-background/30 text-background px-6 py-3.5 text-sm font-medium hover:bg-background/10 transition"
            >
              전문가 상담 알아보기
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
