import React from 'react';

// 토큰 시스템 폐기 - 항상 onProceed를 바로 호출할 수 있도록 패스스루
interface TokenGateWrapperProps {
  onProceed: () => void;
  requiredTokens?: number;
  featureName?: string;
  children?: React.ReactNode;
}

const TokenGateWrapper: React.FC<TokenGateWrapperProps> = ({ children }) => {
  return <>{children}</>;
};

export default TokenGateWrapper;
