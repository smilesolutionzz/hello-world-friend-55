import React from 'react';
import { ExpertDashboard } from '@/components/expert/ExpertDashboard';
import { ExpertImageGenerator } from '@/components/expert/ExpertImageGenerator';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';
import AuthenticationGuard from '@/components/observation/AuthenticationGuard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ExpertDashboardPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <UnifiedNavigation />
      <AuthenticationGuard fallbackMessage="전문가 대시보드를 사용하려면 로그인이 필요합니다.">
        <div className="container mx-auto px-4 py-6">
          <Tabs defaultValue="dashboard" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="dashboard">대시보드</TabsTrigger>
              <TabsTrigger value="images">이미지 생성</TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard">
              <ExpertDashboard />
            </TabsContent>
            
            <TabsContent value="images">
              <ExpertImageGenerator />
            </TabsContent>
          </Tabs>
        </div>
      </AuthenticationGuard>
    </div>
  );
};

export default ExpertDashboardPage;