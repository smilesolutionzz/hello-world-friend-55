/**
 * 카카오톡 공유 유틸리티
 * 통합 카카오 공유 기능을 제공합니다.
 */

export interface KakaoShareOptions {
  title: string;
  description: string;
  imageUrl?: string;
  url?: string;
  buttonText?: string;
  referralCode?: string;
  testType?: string;
}

const DEFAULT_IMAGE = 'https://aihpro.com/og-image.png';
const BASE_URL = 'https://aihpro.com';

/**
 * 카카오 SDK 초기화 여부 확인
 */
export const isKakaoInitialized = (): boolean => {
  return typeof window !== 'undefined' && 
    (window as any).Kakao && 
    (window as any).Kakao.isInitialized();
};

/**
 * 카카오톡 피드 공유
 */
export const shareToKakao = (options: KakaoShareOptions): boolean => {
  // 현재 경로를 aihpro.com 도메인으로 변환
  const currentPath = window.location.pathname + window.location.search;
  const defaultUrl = `${BASE_URL}${currentPath}`;
  
  const {
    title,
    description,
    imageUrl = DEFAULT_IMAGE,
    url = defaultUrl,
    buttonText = '나도 해보기',
    referralCode,
  } = options;

  // 레퍼럴 코드가 있으면 URL에 추가
  let shareUrl = url;
  if (referralCode && !url.includes('ref=')) {
    const separator = url.includes('?') ? '&' : '?';
    shareUrl = `${url}${separator}ref=${referralCode}`;
  }

  // 카카오 SDK 사용 가능한 경우
  if (isKakaoInitialized()) {
    try {
      (window as any).Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title,
          description,
          imageUrl,
          link: {
            mobileWebUrl: shareUrl,
            webUrl: shareUrl,
          },
        },
        buttons: [
          {
            title: buttonText,
            link: {
              mobileWebUrl: shareUrl,
              webUrl: shareUrl,
            },
          },
        ],
      });
      return true;
    } catch (error) {
      console.error('Kakao Share Error:', error);
    }
  }

  // 폴백: 모바일에서 카카오톡 앱 직접 호출
  if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
    const message = `${title}\n\n${description}\n\n👉 ${shareUrl}`;
    window.location.href = `kakaotalk://send?text=${encodeURIComponent(message)}`;
    return true;
  }

  // 최후 폴백: 클립보드 복사
  const message = `${title}\n\n${description}\n\n👉 ${shareUrl}`;
  navigator.clipboard.writeText(message);
  return false;
};

/**
 * 테스트 결과 공유 (바이럴 최적화)
 */
export const shareTestResult = (options: {
  testName: string;
  resultTitle: string;
  resultSummary: string;
  emoji?: string;
  score?: string | number;
  referralCode?: string;
}) => {
  const { testName, resultTitle, resultSummary, emoji = '✨', score, referralCode } = options;

  const title = `${emoji} ${testName} 결과: ${resultTitle}`;
  const description = score 
    ? `${resultSummary}\n\n🎯 점수: ${score}`
    : resultSummary;

  return shareToKakao({
    title,
    description: `${description}\n\n#심리테스트 #AIHPRO`,
    buttonText: '나도 테스트하기 🔮',
    referralCode,
  });
};

/**
 * AI 분석 결과 공유
 */
export const shareAnalysisResult = (options: {
  analysisType: string;
  summary: string;
  keyInsight?: string;
  referralCode?: string;
}) => {
  const { analysisType, summary, keyInsight, referralCode } = options;

  const title = `🧠 AI ${analysisType} 분석 결과`;
  const description = keyInsight 
    ? `${summary}\n\n💡 핵심 인사이트: ${keyInsight}`
    : summary;

  return shareToKakao({
    title,
    description,
    buttonText: 'AI 분석 받아보기',
    referralCode,
  });
};

/**
 * 친구 초대 공유
 */
export const shareReferral = (referralCode: string, userName?: string) => {
  const inviterName = userName || '친구';
  
  return shareToKakao({
    title: `${inviterName}님이 AI 심리검사를 추천해요! 🎁`,
    description: '무료 AI 심리검사와 발달평가를 받아보세요. 가입하면 보너스 캐시도 드려요!',
    url: `${BASE_URL}?ref=${referralCode}`,
    buttonText: '무료로 시작하기',
    referralCode,
  });
};

/**
 * 일반 페이지 공유
 */
export const sharePage = (options?: Partial<KakaoShareOptions>) => {
  return shareToKakao({
    title: options?.title || 'AIHPRO - AI 심리검사 플랫폼',
    description: options?.description || 'AI 기반 심리검사, 발달평가, 전문가 상담을 한곳에서!',
    url: options?.url || window.location.href,
    buttonText: options?.buttonText || '자세히 보기',
    ...options,
  });
};
