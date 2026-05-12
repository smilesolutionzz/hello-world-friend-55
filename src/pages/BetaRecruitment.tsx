import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

const VALID_CODES = ['COMMUNITY1', 'PILOT1'];

export default function BetaRecruitment() {
  const [params] = useSearchParams();
  const code = params.get('code');
  const valid = code ? VALID_CODES.includes(code.toUpperCase()) : false;

  if (!valid) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="max-w-md text-center space-y-4">
          <p className="text-sm tracking-[0.2em] text-muted-foreground">BETA · PRIVATE</p>
          <h1 className="text-2xl font-semibold">초대 코드가 필요합니다</h1>
          <p className="text-sm text-muted-foreground break-keep">
            이 페이지는 공개되지 않은 베타 1기 모집 페이지입니다. 초대받은 분께 전달된 링크로 접속해주세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white px-6 py-16 md:py-24">
      <Helmet>
        <title>마음트랙 1기 베타 파트너 모집</title>
        <meta name="description" content="3년 함께한 290명 커뮤니티 — 시드 파트너 발달센터·상담센터 20곳 모집" />
      </Helmet>
      <div className="max-w-2xl mx-auto space-y-10">
        <div className="space-y-4">
          <p className="text-sm tracking-[0.2em] text-muted-foreground">BETA 1기 · 비공개 모집</p>
          <h1 className="text-4xl md:text-5xl font-semibold leading-tight break-keep">
            3년 함께한 290명 커뮤니티 — 마음트랙 1기 베타 파트너 모집
          </h1>
          <p className="text-base text-muted-foreground break-keep">
            시드 파트너 발달센터·상담센터 20곳을 모십니다. 한점미소발달센터 2곳 + 외부 19곳.
          </p>
        </div>

        <div className="rounded-3xl border border-border p-6 md:p-8 space-y-3">
          <h2 className="text-lg font-semibold">참여 조건</h2>
          <ul className="text-sm text-muted-foreground space-y-2 break-keep">
            <li>· 50% 할인 적용</li>
            <li>· 졸업 시 후기 1건 작성</li>
            <li>· 케이스 스터디 협조</li>
          </ul>
        </div>

        <div className="rounded-3xl border border-border p-6 md:p-8 space-y-4">
          <h2 className="text-lg font-semibold">신청 폼</h2>
          <p className="text-sm text-muted-foreground break-keep">
            폼 연결은 다음 단계에서 추가됩니다. 임시로 이메일로 신청해주세요: kijung_kku@naver.com
          </p>
        </div>
      </div>
    </div>
  );
}
