import { Helmet } from 'react-helmet-async';

export default function Reviews() {
  return (
    <div className="min-h-screen bg-white px-6 py-16 md:py-24">
      <Helmet>
        <title>졸업 후기 · 마음트랙</title>
        <meta name="description" content="마음트랙 30일을 졸업한 부모·자녀의 실제 후기와 점수 변화" />
      </Helmet>
      <div className="max-w-3xl mx-auto space-y-10">
        <div className="space-y-4">
          <p className="text-sm tracking-[0.2em] text-muted-foreground">REVIEWS</p>
          <h1 className="text-4xl md:text-5xl font-semibold leading-tight break-keep">
            30일 후, 가족의 마음이 어떻게 달라졌는지
          </h1>
          <p className="text-base text-muted-foreground break-keep">
            졸업 후기와 실제 점수 변화 그래프(공개 동의 기준).
          </p>
        </div>
        <div className="rounded-3xl border border-border p-8 text-center text-sm text-muted-foreground">
          1기 베타 졸업 후기가 곧 공개됩니다.
        </div>
      </div>
    </div>
  );
}
