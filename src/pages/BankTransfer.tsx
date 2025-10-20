import React from 'react';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';
import BankTransferRequest from '@/components/BankTransferRequest';

const BankTransfer = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <UnifiedNavigation />
      
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            토큰 구매
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            안전한 카드 결제로 토큰을 구매하세요. 즉시 충전됩니다.
          </p>
        </div>
        
        <BankTransferRequest />
      </div>
    </div>
  );
};

export default BankTransfer;