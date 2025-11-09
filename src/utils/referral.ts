// 리퍼럴 시스템 유틸리티

export const REFERRAL_REWARDS = {
  inviter: 50, // 추천인에게 50토큰
  invitee: 50, // 피추천인에게 50토큰
  socialShare: 200, // SNS 공유 시 200토큰
  maxReferrals: 10, // 최대 10명까지 추천 가능
};

// 리퍼럴 코드 생성
export const generateReferralCode = (userId: string): string => {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 7);
  return `${userId.substring(0, 4)}${timestamp}${randomStr}`.toUpperCase();
};

// 리퍼럴 링크 생성
export const generateReferralLink = (code: string): string => {
  const baseUrl = window.location.origin;
  return `${baseUrl}?ref=${code}`;
};

// URL에서 리퍼럴 코드 추출
export const getReferralCodeFromUrl = (): string | null => {
  const params = new URLSearchParams(window.location.search);
  return params.get('ref');
};

// 리퍼럴 보상 메시지
export const getReferralRewardMessage = (type: 'inviter' | 'invitee' | 'social'): string => {
  switch (type) {
    case 'inviter':
      return `🎉 친구 초대 성공! ${REFERRAL_REWARDS.inviter}토큰이 지급되었습니다!`;
    case 'invitee':
      return `🎁 초대 코드 적용! ${REFERRAL_REWARDS.invitee}토큰이 지급되었습니다!`;
    case 'social':
      return `📱 SNS 공유 완료! ${REFERRAL_REWARDS.socialShare}토큰이 지급되었습니다!`;
    default:
      return '';
  }
};
