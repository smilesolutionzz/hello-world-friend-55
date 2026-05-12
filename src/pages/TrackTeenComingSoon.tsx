import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

export default function TrackTeenComingSoon() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <Helmet>
        <title>청소년 마음트랙 — 곧 출시</title>
        <meta name="description" content="청소년 트랙은 자녀 트랙 GA 이후 2차로 공개됩니다." />
      </Helmet>
      <div className="max-w-xl text-center space-y-6">
        <p className="text-sm tracking-[0.2em] text-muted-foreground">TRACK · TEEN</p>
        <h1 className="text-4xl md:text-5xl font-semibold leading-tight break-keep">
          청소년 마음트랙은 2차에 공개됩니다
        </h1>
        <p className="text-base text-muted-foreground break-keep">
          청소년 본인 응답·보호자 동의 흐름을 정교화 중입니다. 1기 베타 종료 후 공개돼요.
        </p>
        <Link to="/track/child" className="inline-block rounded-2xl bg-foreground text-background px-6 py-3 text-sm font-medium">
          먼저 자녀 트랙 보기
        </Link>
      </div>
    </div>
  );
}
