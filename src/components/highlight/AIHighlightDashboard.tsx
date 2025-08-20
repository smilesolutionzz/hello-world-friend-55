import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, FileText, Users, Download, Calendar, AlertTriangle } from 'lucide-react';
import { AIAnalysisEngine } from '@/components/ai-analysis/AIAnalysisEngine';
import { ObservationLog } from '@/components/observation/ObservationLog';
import { ReportGenerator } from '@/components/reports/ReportGenerator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  display_name: string;
  created_at: string;
}

interface AIHighlightData {
  profile: Profile;
  observationLogs: any[];
  testResults: any[];
  externalData: any[];
  analysisResults: any[];
  reports: any[];
}

interface AIHighlightDashboardProps {
  profileId?: string;
}

export const AIHighlightDashboard: React.FC<AIHighlightDashboardProps> = ({ profileId }) => {
  const [data, setData] = useState<AIHighlightData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, [profileId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let targetProfileId = profileId;
      if (!targetProfileId) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();
        targetProfileId = profile?.id;
      }

      if (!targetProfileId) return;

      // Load profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetProfileId)
        .single();

      // Load observation logs
      const { data: observationLogs } = await supabase
        .from('observation_sessions')
        .select('*')
        .eq('profile_id', targetProfileId)
        .order('created_at', { ascending: false });

      // Load test results
      const { data: testResults } = await supabase
        .from('assessments')
        .select('*')
        .eq('profile_id', targetProfileId)
        .order('completed_at', { ascending: false });

      // Load analysis results
      const { data: analysisResults } = await supabase
        .from('assessments')
        .select('*')
        .eq('profile_id', targetProfileId)
        .eq('age_group', 'comprehensive')
        .order('completed_at', { ascending: false });

      // Load generated reports
      const { data: reports } = await supabase
        .from('assessments')
        .select('*')
        .eq('profile_id', targetProfileId)
        .not('analysis', 'is', null)
        .order('completed_at', { ascending: false });

      setData({
        profile: profile || { id: targetProfileId, display_name: '사용자', created_at: new Date().toISOString() },
        observationLogs: observationLogs || [],
        testResults: testResults || [],
        externalData: [], // 추후 확장
        analysisResults: analysisResults || [],
        reports: reports || []
      });
    } catch (error) {
      console.error('Dashboard data loading error:', error);
      toast({
        title: "데이터 로딩 실패",
        description: "대시보드 데이터를 불러오는데 실패했습니다.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAnalysisComplete = (result: any) => {
    setAnalysisResult(result);
    setActiveTab('reports');
    toast({
      title: "AI 분석 완료",
      description: "종합 분석이 완료되었습니다. 리포트를 생성할 수 있습니다.",
    });
  };

  const handleObservationSave = async () => {
    await loadDashboardData();
    toast({
      title: "관찰일지 저장됨",
      description: "새로운 관찰일지가 저장되었습니다.",
    });
  };

  const handleReportGenerated = async () => {
    await loadDashboardData();
    toast({
      title: "리포트 생성 완료",
      description: "새로운 리포트가 생성되었습니다.",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Brain className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">AI Highlight 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500" />
          <p className="text-muted-foreground">데이터를 불러올 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Highlight 대시보드</h1>
          <p className="text-muted-foreground mt-1">
            {data.profile.display_name}님의 종합 발달 분석 시스템
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          <Calendar className="h-4 w-4 mr-1" />
          마지막 업데이트: {new Date().toLocaleDateString()}
        </Badge>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold">{data.observationLogs.length}</p>
              <p className="text-sm text-muted-foreground">관찰일지</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <Brain className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold">{data.testResults.length}</p>
              <p className="text-sm text-muted-foreground">테스트 결과</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-purple-600" />
            <div>
              <p className="text-2xl font-bold">{data.analysisResults.length}</p>
              <p className="text-sm text-muted-foreground">AI 분석</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <Download className="h-8 w-8 text-orange-600" />
            <div>
              <p className="text-2xl font-bold">{data.reports.length}</p>
              <p className="text-sm text-muted-foreground">생성된 리포트</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="observation">관찰일지</TabsTrigger>
          <TabsTrigger value="analysis">AI 분석</TabsTrigger>
          <TabsTrigger value="reports">리포트</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activities */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">최근 활동</h3>
              <div className="space-y-3">
                {[...data.observationLogs, ...data.testResults]
                  .sort((a, b) => new Date(b.created_at || b.completed_at).getTime() - new Date(a.created_at || a.completed_at).getTime())
                  .slice(0, 5)
                  .map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <div className="h-2 w-2 bg-primary rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {item.session_notes ? '관찰일지 작성' : '테스트 완료'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(item.created_at || item.completed_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </Card>

            {/* Risk Assessment */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">위험도 평가</h3>
              <div className="space-y-4">
                {data.analysisResults.length > 0 ? (
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">최근 분석 결과</span>
                      <Badge variant={
                        data.analysisResults[0].risk_level === 'high' ? 'destructive' :
                        data.analysisResults[0].risk_level === 'medium' ? 'secondary' : 'outline'
                      }>
                        {data.analysisResults[0].risk_level === 'high' ? '높음' :
                         data.analysisResults[0].risk_level === 'medium' ? '보통' : '낮음'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(data.analysisResults[0].completed_at).toLocaleDateString()} 분석
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>아직 AI 분석 결과가 없습니다.</p>
                    <p className="text-sm">AI 분석 탭에서 종합 분석을 시작하세요.</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="observation">
          <ObservationLog profileId={data.profile.id} onSave={handleObservationSave} />
        </TabsContent>

        <TabsContent value="analysis">
          <AIAnalysisEngine
            data={{
              observationLogs: data.observationLogs,
              testResults: data.testResults,
              externalData: data.externalData,
              profileId: data.profile.id
            }}
            onAnalysisComplete={handleAnalysisComplete}
          />
        </TabsContent>

        <TabsContent value="reports">
          <ReportGenerator
            data={{
              aiAnalysis: analysisResult,
              profileId: data.profile.id,
              childName: data.profile.display_name,
              birthDate: data.profile.created_at,
              reportType: 'ai_only'
            }}
            onReportGenerated={handleReportGenerated}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};