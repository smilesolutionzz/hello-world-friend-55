import React from 'react';
import { ExpertDashboard } from '@/components/expert/ExpertDashboard';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';
import AuthenticationGuard from '@/components/observation/AuthenticationGuard';

const ExpertDashboardPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <UnifiedNavigation />
      <AuthenticationGuard fallbackMessage="전문가 대시보드를 사용하려면 로그인이 필요합니다.">
        <ExpertDashboard />
      </AuthenticationGuard>
    </div>
  );
};

export default ExpertDashboardPage;