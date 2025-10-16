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
            무통장입금으로 결제
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            간편한 무통장입금으로 결제하세요. 입금 확인 후 24시간 내에 처리됩니다.
          </p>
        </div>
        
        <BankTransferRequest />
      </div>
    </div>
  );
};

export default BankTransfer;