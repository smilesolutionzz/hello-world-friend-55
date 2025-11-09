// 리퍼럴 시스템 유틸리티

export const REFERRAL_REWARDS = {
  inviter: 30, // 추천인에게 30일 추가
  invitee: 7, // 피추천인에게 7일 추가
  socialShare: 14, // SNS 공유 시 14일 추가
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
      return `🎉 친구 초대 성공! ${REFERRAL_REWARDS.inviter}일 무료 기간이 추가되었습니다!`;
    case 'invitee':
      return `🎁 초대 코드 적용! ${REFERRAL_REWARDS.invitee}일 무료 기간이 추가되었습니다!`;
    case 'social':
      return `📱 SNS 공유 완료! ${REFERRAL_REWARDS.socialShare}일 무료 기간이 추가되었습니다!`;
    default:
      return '';
  }
};
