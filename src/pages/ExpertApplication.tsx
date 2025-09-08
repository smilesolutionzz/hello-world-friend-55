import React from 'react';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';
import { ExpertApplicationForm } from '@/components/expert/ExpertApplicationForm';
import AuthenticationGuard from '@/components/observation/AuthenticationGuard';

const ExpertApplicationPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <UnifiedNavigation />
      <AuthenticationGuard fallbackMessage="전문가 신청을 위해서는 로그인이 필요합니다.">
        <div className="container mx-auto py-8">
          <ExpertApplicationForm />
        </div>
      </AuthenticationGuard>
    </div>
  );
};

export default ExpertApplicationPage;