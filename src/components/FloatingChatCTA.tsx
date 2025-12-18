import React from 'react';
import { useLocation } from 'react-router-dom';

const FloatingChatCTA = () => {
  const location = useLocation();
  
  // 결과 페이지와 메타버스 페이지에서는 숨김
  const hideOnRoutes = ['/fun-test-result', '/han-medicine-test', '/metaverse-voice'];
  if (hideOnRoutes.some(route => location.pathname.includes(route))) {
    return null;
  }

  // 플로팅 채팅 버튼 제거 - 상단 네비게이션으로 이동됨
  return null;
};

export default FloatingChatCTA;