import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

export default function AboutExpert() {
  return (
    <div className="min-h-screen bg-white px-6 py-16 md:py-24">
      <Helmet>
        <title>운영자 소개 · 14년 발달 임상 경력</title>
        <meta name="description" content="14년 발달 임상 경력으로 만든 마음트랙. 한점미소발달센터 2곳 직접 운영." />
      </Helmet>
      <div className="max-w-3xl mx-auto space-y-12">
        <div className="space-y-4">
          <p className="text-sm tracking-[0.2em] text-muted-foreground">ABOUT · EXPERT</p>
          <h1 className="text-4xl md:text-5xl font-semibold leading-tight break-keep">
            14년 발달 임상 경력으로 만든 마음트랙
          </h1>
          <p className="text-base text-muted-foreground break-keep">
            현장에서 부딪힌 자녀·부모의 진짜 문제를 그대로 코칭 흐름에 옮겼습니다.
          </p>
        </div>

        <section className="rounded-3xl border border-border p-6 md:p-8 space-y-3">
          <h2 className="text-lg font-semibold">한점미소발달센터 2곳 운영 중</h2>
          <p className="text-sm text-muted-foreground break-keep">
            14년 누적 임상 케이스를 기반으로, 검사 결과를 부모가 이해할 수 있는 코칭 언어로 재구성합니다.
          </p>
        </section>

        <section className="rounded-3xl border border-border p-6 md:p-8 space-y-3">
          <h2 className="text-lg font-semibold">전문 영역</h2>
          <ul className="text-sm text-muted-foreground space-y-2 break-keep">
            <li>· 영유아·아동 발달 스크리닝 및 코칭</li>
            <li>· 부모-자녀 상호작용 코칭</li>
            <li>· 정서·행동 영역 가정 연계</li>
          </ul>
        </section>

        <div className="text-center pt-4">
          <Link to="/track/child" className="inline-block rounded-2xl bg-foreground text-background px-6 py-3 text-sm font-medium">
            자녀 마음트랙 시작하기
          </Link>
        </div>
      </div>
    </div>
  );
}
