import React, { useState, useEffect } from 'react';
import { ExpertDashboard } from '@/components/expert/ExpertDashboard';
import { ExpertImageGenerator } from '@/components/expert/ExpertImageGenerator';
import { ExpertAnalyticsDashboard } from '@/components/booking/ExpertAnalyticsDashboard';
import { ExpertRealtimeConsultations } from '@/components/consultation/ExpertRealtimeConsultations';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';
import AuthenticationGuard from '@/components/observation/AuthenticationGuard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { supabase } from '@/integrations/supabase/client';

const ExpertDashboardPage = () => {
  const [expertId, setExpertId] = useState<string | null>(null);

  useEffect(() => {
    checkExpertStatus();
  }, []);

  const checkExpertStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: expert } = await supabase
        .from('experts')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_verified', true)
        .single();

      if (expert) {
        setExpertId(expert.id);
      }
    } catch (error) {
      console.error('Error checking expert status:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <UnifiedNavigation />
      <AuthenticationGuard fallbackMessage="전문가 대시보드를 사용하려면 로그인이 필요합니다.">
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
              {expertId ? (
                <ExpertRealtimeConsultations expertId={expertId} />
              ) : (
                <div className="text-center py-8">전문가 인증이 필요합니다.</div>
              )}
            </TabsContent>
            
            <TabsContent value="dashboard">
              <ExpertDashboard />
            </TabsContent>
            
            <TabsContent value="analytics">
              {expertId ? (
                <ExpertAnalyticsDashboard expertId={expertId} />
              ) : (
                <div className="text-center py-8">전문가 인증이 필요합니다.</div>
              )}
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