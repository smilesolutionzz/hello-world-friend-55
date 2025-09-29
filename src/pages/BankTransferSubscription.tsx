import React from 'react';
import { useLocation } from 'react-router-dom';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';
import SubscriptionBankTransfer from '@/components/SubscriptionBankTransfer';

const BankTransferSubscription = () => {
  const location = useLocation();
  const selectedPlanId = location.state?.selectedPlanId;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <UnifiedNavigation />
      
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            무통장입금으로 구독하기
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            간편한 무통장입금으로 구독을 시작하세요. 입금 확인 후 24시간 내에 구독이 활성화됩니다.
          </p>
        </div>
        
        <SubscriptionBankTransfer selectedPlanId={selectedPlanId} />
      </div>
    </div>
  );
};

export default BankTransferSubscription;