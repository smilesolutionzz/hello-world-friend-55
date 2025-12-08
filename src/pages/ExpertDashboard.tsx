import React, { useState, useEffect } from 'react';
import { ExpertDashboard } from '@/components/expert/ExpertDashboard';
import { ExpertImageGenerator } from '@/components/expert/ExpertImageGenerator';
import { ExpertAnalyticsDashboard } from '@/components/booking/ExpertAnalyticsDashboard';
import { ExpertRealtimeConsultations } from '@/components/consultation/ExpertRealtimeConsultations';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const ExpertDashboardPage = () => {
  // 테스트용: 첫 번째 전문가 ID 하드코딩 (이기훈)
  const expertId = 'e46b122c-1284-4847-be12-86b38c02a492';

  return (
    <div className="min-h-screen bg-background">
      <UnifiedNavigation />
      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="realtime" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="realtime" className="relative">
              실시간 상담
              <Badge variant="secondary" className="ml-1 bg-green-100 text-green-700 text-xs">NEW</Badge>
            </TabsTrigger>
            <TabsTrigger value="dashboard">대시보드</TabsTrigger>
            <TabsTrigger value="analytics">통계</TabsTrigger>
            <TabsTrigger value="images">이미지 생성</TabsTrigger>
          </TabsList>
          
          <TabsContent value="realtime">
            <ExpertRealtimeConsultations expertId={expertId} />
          </TabsContent>
          
          <TabsContent value="dashboard">
            <ExpertDashboard />
          </TabsContent>
          
          <TabsContent value="analytics">
            <ExpertAnalyticsDashboard expertId={expertId} />
          </TabsContent>
          
          <TabsContent value="images">
            <ExpertImageGenerator />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ExpertDashboardPage;
