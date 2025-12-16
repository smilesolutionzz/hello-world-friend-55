import React, { useState, useEffect } from 'react';
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
import { motion, AnimatePresence } from 'framer-motion';

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

  const lastConcernDate = concerns[0]?.created_at || null;
  const lastAssessmentDate = assessments[0]?.completed_at || null;

  const tabs = [
    { id: 'overview', label: '대시보드', icon: LayoutDashboard },
    { id: 'concerns', label: '고민', icon: Heart, count: concerns.length },
    { id: 'assessments', label: '검사', icon: ClipboardCheck, count: assessments.length },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <UnifiedNavigation />
        <div className="relative">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute top-60 -left-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          </div>
          
          <header className="sticky top-16 z-10 bg-background/60 backdrop-blur-xl border-b border-border/50">
            <div className="max-w-5xl mx-auto px-4 py-3 md:py-4 flex items-center justify-center gap-2 md:gap-3">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                <FolderHeart className="w-4 h-4 md:w-5 md:h-5 text-primary-foreground" />
              </div>
              <h1 className="font-bold text-lg md:text-xl">내 기록</h1>
            </div>
          </header>
          
          <main className="max-w-5xl mx-auto px-4 py-6 md:py-8 space-y-4 md:space-y-6 relative">
            <div className="space-y-4 md:space-y-6 animate-pulse">
              <div className="h-20 md:h-24 rounded-2xl md:rounded-3xl bg-gradient-to-r from-muted/50 to-muted/30" />
              <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                <div className="h-60 md:h-72 rounded-2xl md:rounded-3xl bg-gradient-to-r from-muted/50 to-muted/30" />
                <div className="h-60 md:h-72 rounded-2xl md:rounded-3xl bg-gradient-to-r from-muted/50 to-muted/30" />
              </div>
              <div className="h-72 md:h-80 rounded-2xl md:rounded-3xl bg-gradient-to-r from-muted/50 to-muted/30" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <UnifiedNavigation />
      
      <div className="relative">
        {/* Decorative background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="absolute -top-40 -right-40 w-60 md:w-80 h-60 md:h-80 bg-gradient-to-br from-primary/20 to-purple-500/10 rounded-full blur-3xl"
          />
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="absolute top-60 -left-40 w-72 md:w-96 h-72 md:h-96 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl"
          />
        </div>

        {/* Header */}
        <header className="sticky top-16 z-10 bg-background/60 backdrop-blur-xl border-b border-border/50">
          <div className="max-w-5xl mx-auto px-4 py-3 md:py-4">
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center gap-2 md:gap-3"
            >
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20">
                <FolderHeart className="w-4 h-4 md:w-5 md:h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-bold text-lg md:text-xl text-foreground">내 기록</h1>
                <p className="text-[10px] md:text-xs text-muted-foreground hidden sm:block">나의 성장 여정을 확인하세요</p>
              </div>
            </motion.div>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="sticky top-[7.5rem] md:top-[8.5rem] z-10 bg-background/60 backdrop-blur-xl border-b border-border/30">
          <div className="max-w-5xl mx-auto px-3 md:px-4">
            <nav className="flex gap-1.5 md:gap-2 py-2 md:py-3">
              {tabs.map((tab, index) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;
                
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={cn(
                      "relative flex-1 py-2.5 md:py-3 px-2 md:px-4 rounded-xl md:rounded-2xl font-medium text-xs md:text-sm transition-all duration-300",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                        : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <div className="flex items-center justify-center gap-1 md:gap-2">
                      <Icon className={cn(
                        "w-3.5 h-3.5 md:w-4 md:h-4",
                        isActive && tab.id === 'concerns' && "fill-current"
                      )} />
                      <span>{tab.label}</span>
                      {tab.count !== undefined && (
                        <span className={cn(
                          "px-1.5 md:px-2 py-0.5 rounded-full text-[10px] md:text-xs font-semibold",
                          isActive 
                            ? "bg-primary-foreground/20 text-primary-foreground" 
                            : "bg-muted-foreground/20 text-muted-foreground"
                        )}>
                          {tab.count}
                        </span>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <main className="max-w-5xl mx-auto px-3 md:px-4 py-5 md:py-8 relative">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' ? (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-5 md:space-y-8"
              >
                {/* Reminder Banner */}
                <ReminderBanner 
                  lastConcernDate={lastConcernDate}
                  lastAssessmentDate={lastAssessmentDate}
                />

                {/* Milestones & Badges */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <MilestonesBadges 
                    concernCount={concerns.length}
                    assessmentCount={assessments.length}
                  />
                </motion.div>

                {/* AI Insight & Monthly Report Grid */}
                <div className="grid gap-5 md:gap-6 md:grid-cols-2">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <AIInsightSummary 
                      concerns={concerns}
                      assessments={assessments}
                    />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <MonthlyReport 
                      concerns={concerns}
                      assessments={assessments}
                    />
                  </motion.div>
                </div>

                {/* Growth Chart */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  <GrowthChart 
                    concerns={concerns}
                    assessments={assessments}
                  />
                </motion.div>
              </motion.div>
            ) : activeTab === 'concerns' ? (
              <motion.div
                key="concerns"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ConcernStorageList />
              </motion.div>
            ) : (
              <motion.div
                key="assessments"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <AssessmentHistory />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default ConcernStorage;