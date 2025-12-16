import React, { useState, useEffect, useMemo } from 'react';
import { ConcernStorageList } from '@/components/concern/ConcernStorageList';
import AssessmentHistory from '@/components/history/AssessmentHistory';
import { GrowthChart } from '@/components/storage/GrowthChart';
import { MilestonesBadges } from '@/components/storage/MilestonesBadges';
import { ReminderBanner } from '@/components/storage/ReminderBanner';
import { AIInsightSummary } from '@/components/storage/AIInsightSummary';
import { MonthlyReport } from '@/components/storage/MonthlyReport';
import { Heart, ClipboardCheck, FolderHeart, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface ConcernData {
  id: string;
  concern_text: string;
  analysis_type: string;
  analysis_severity: string;
  analysis_advice: string;
  created_at: string;
}

interface AssessmentData {
  id: string;
  completed_at: string;
  results?: any;
  risk_level?: 'low' | 'medium' | 'high';
}

const ConcernStorage = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'concerns' | 'assessments'>('overview');
  const [concerns, setConcerns] = useState<ConcernData[]>([]);
  const [assessments, setAssessments] = useState<AssessmentData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // 병렬로 데이터 로드
      const [concernsResult, assessmentsResult, testResultsResult] = await Promise.all([
        supabase
          .from('concern_storage')
          .select('id, concern_text, analysis_type, analysis_severity, analysis_advice, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('assessments')
          .select('id, created_at, results, risk_level')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('test_results')
          .select('id, created_at, completed_at, scores')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
      ]);

      if (concernsResult.data) {
        setConcerns(concernsResult.data as ConcernData[]);
      }

      // assessments와 test_results 병합
      const combinedAssessments: AssessmentData[] = [];
      
      if (assessmentsResult.data) {
        assessmentsResult.data.forEach(a => {
          combinedAssessments.push({
            id: a.id,
            completed_at: a.created_at,
            results: a.results,
            risk_level: a.risk_level as any
          });
        });
      }

      if (testResultsResult.data) {
        testResultsResult.data.forEach(r => {
          const scores = r.scores as any;
          combinedAssessments.push({
            id: r.id,
            completed_at: r.completed_at || r.created_at,
            results: scores,
            risk_level: scores?.severity === '심각' || scores?.severity === '높음' ? 'high' :
                       scores?.severity === '중등도' || scores?.severity === '보통' ? 'medium' : 'low'
          });
        });
      }

      // 날짜순 정렬
      combinedAssessments.sort((a, b) => 
        new Date(b.completed_at).getTime() - new Date(a.completed_at).getTime()
      );

      setAssessments(combinedAssessments);
    } catch (error) {
      console.error('데이터 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  // 마지막 기록 날짜
  const lastConcernDate = concerns[0]?.created_at || null;
  const lastAssessmentDate = assessments[0]?.completed_at || null;

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <UnifiedNavigation />
        <header className="sticky top-16 z-10 bg-background/80 backdrop-blur-md border-b">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-center gap-2">
            <FolderHeart className="w-5 h-5 text-primary" />
            <h1 className="font-semibold text-lg">내 기록</h1>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          <Skeleton className="h-32 w-full" />
          <div className="grid md:grid-cols-2 gap-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
          <Skeleton className="h-80 w-full" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <UnifiedNavigation />
      
      {/* 헤더 */}
      <header className="sticky top-16 z-10 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-center gap-2">
          <FolderHeart className="w-5 h-5 text-primary" />
          <h1 className="font-semibold text-lg">내 기록</h1>
        </div>
      </header>

      {/* 탭 네비게이션 */}
      <div className="border-b bg-background">
        <div className="max-w-4xl mx-auto px-4">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('overview')}
              className={cn(
                "flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors",
                activeTab === 'overview'
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <LayoutDashboard className="w-4 h-4 mx-auto mb-1" />
              대시보드
            </button>
            <button
              onClick={() => setActiveTab('concerns')}
              className={cn(
                "flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors",
                activeTab === 'concerns'
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Heart className={cn("w-4 h-4 mx-auto mb-1", activeTab === 'concerns' && "fill-current")} />
              고민 ({concerns.length})
            </button>
            <button
              onClick={() => setActiveTab('assessments')}
              className={cn(
                "flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors",
                activeTab === 'assessments'
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <ClipboardCheck className="w-4 h-4 mx-auto mb-1" />
              검사 ({assessments.length})
            </button>
          </nav>
        </div>
      </div>

      {/* 콘텐츠 영역 */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {activeTab === 'overview' ? (
          <div className="space-y-6">
            {/* 리마인더 배너 */}
            <ReminderBanner 
              lastConcernDate={lastConcernDate}
              lastAssessmentDate={lastAssessmentDate}
            />

            {/* 마일스톤 & 뱃지 */}
            <MilestonesBadges 
              concernCount={concerns.length}
              assessmentCount={assessments.length}
            />

            {/* 성장 차트 & AI 인사이트 */}
            <div className="grid md:grid-cols-2 gap-6">
              <AIInsightSummary 
                concerns={concerns}
                assessments={assessments}
              />
              <MonthlyReport 
                concerns={concerns}
                assessments={assessments}
              />
            </div>

            {/* 성장 그래프 */}
            <GrowthChart 
              concerns={concerns}
              assessments={assessments}
            />
          </div>
        ) : activeTab === 'concerns' ? (
          <ConcernStorageList />
        ) : (
          <AssessmentHistory />
        )}
      </main>
    </div>
  );
};

export default ConcernStorage;
