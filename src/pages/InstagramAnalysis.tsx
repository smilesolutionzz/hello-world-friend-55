import { Helmet } from "react-helmet-async";
import InstagramFeedAnalysis from "./InstagramFeedAnalysis";

const InstagramAnalysis = () => {
  const canonical = typeof window !== "undefined" ? `${window.location.origin}/instagram-analysis` : "/instagram-analysis";

  return (
    <>
      <Helmet>
        <title>인스타 피드 심리분석 | 스크린샷 3장</title>
        <meta
          name="description"
          content="인스타 피드 스크린샷 3장으로 AI가 무의식 심리 패턴을 분석합니다."
        />
        <link rel="canonical" href={canonical} />
      </Helmet>
      <InstagramFeedAnalysis />
    </>
  );
};

export default InstagramAnalysis;
