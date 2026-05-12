import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

export default function TrackAdultComingSoon() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <Helmet>
        <title>성인 마음트랙 — 곧 출시</title>
        <meta name="description" content="성인 트랙은 자녀 트랙 GA 이후 2차로 공개됩니다." />
      </Helmet>
      <div className="max-w-xl text-center space-y-6">
        <p className="text-sm tracking-[0.2em] text-muted-foreground">TRACK · ADULT</p>
        <h1 className="text-4xl md:text-5xl font-semibold leading-tight break-keep">
          성인 마음트랙은 2차에 공개됩니다
        </h1>
        <p className="text-base text-muted-foreground break-keep">
          14년 임상 데이터를 바탕으로 설계 중입니다. 자녀 트랙 1기 결과를 검증한 뒤 공개해요.
        </p>
        <Link to="/track/child" className="inline-block rounded-2xl bg-foreground text-background px-6 py-3 text-sm font-medium">
          먼저 자녀 트랙 보기
        </Link>
      </div>
    </div>
  );
}
