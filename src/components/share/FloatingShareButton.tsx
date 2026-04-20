import React from 'react';

interface FloatingShareButtonProps {
  referralCode?: string;
  className?: string;
}

/**
 * 플로팅 공유 버튼 - 화면 하단에 고정
 * 레퍼럴 코드가 있으면 친구 초대용으로 동작
 */
export const FloatingShareButton: React.FC<FloatingShareButtonProps> = ({
  className = '',
}) => {
  void className;
  return null;
};

export default FloatingShareButton;
