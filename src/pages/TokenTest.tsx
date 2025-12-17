import React from 'react';
import TokenTestDashboard from '@/components/TokenTestDashboard';
import AuthenticationGuard from '@/components/observation/AuthenticationGuard';

const TokenTest = () => {
  return (
    <AuthenticationGuard fallbackMessage="캐시 테스트를 사용하려면 로그인이 필요합니다.">
      <TokenTestDashboard />
    </AuthenticationGuard>
  );
};

export default TokenTest;