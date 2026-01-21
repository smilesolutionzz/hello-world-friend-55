import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { FileText, TrendingUp, Target, Sparkles, Download, Loader2, Calendar, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useSubscription } from "@/hooks/useSubscription";
import { CashBalanceDisplay } from "@/components/paywall/CashBalanceDisplay";
import { BlurredContent } from "@/components/paywall/BlurredContent";

interface Report {
  id: string;
  report_type: string;
  period_start: string;
  period_end: string;
  total_tests: number;
  average_score: number;
  improvement_rate: number;
  goals_completed: number;
  goals_total: number;
  ai_insights: string;
  created_at: string;
}

export const WeeklyReport = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();
  const { isPremiumUser, isLifetimeUser } = useSubscription();
  const isPremium = isPremiumUser() || isLifetimeUser();

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('life_achievement_reports')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setReports(data || []);
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (reportType: 'weekly' | 'monthly' = 'weekly') => {
    try {
      setGenerating(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      toast({
        title: "리포트 생성 중...",
        description: "AI가 당신의 데이터를 분석하고 있습니다"
      });

      const { data, error } = await supabase.functions.invoke('generate-weekly-report', {
        body: { userId: user.id, reportType }
      });

      if (error) throw error;

      toast({
        title: "리포트가 생성되었습니다! 📊",
        description: "인사이트를 확인해보세요"
      });

      loadReports();
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "리포트 생성 실패",
        description: "잠시 후 다시 시도해주세요",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">로딩 중...</div>;
  }

  return (
    <div className="space-y-6">
      {/* 캐시 잔액 표시 */}
      <CashBalanceDisplay />
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            성장 리포트
            {!isPremium && (
              <Badge variant="secondary" className="ml-2">
                <Lock className="w-3 h-3 mr-1" />
                프리미엄
              </Badge>
            )}
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            AI가 분석한 당신의 진행 상황
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={() => generateReport('weekly')}
            disabled={generating || !isPremium}
          >
            {generating ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            주간 리포트 생성
          </Button>
        </div>
      </div>

      {reports.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">아직 생성된 리포트가 없습니다</p>
            <p className="text-sm text-muted-foreground mt-2">
              위 버튼을 눌러 첫 리포트를 생성해보세요!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {reports.map((report) => (
            <Card key={report.id} className="border-primary/20">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle>
                        {report.report_type === 'weekly' ? '주간' : '월간'} 리포트
                      </CardTitle>
                      <Badge variant="outline" className="bg-primary/10">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(report.period_start).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })} 
                        {' ~ '}
                        {new Date(report.period_end).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                      </Badge>
                    </div>
                    <CardDescription>
                      생성일: {new Date(report.created_at).toLocaleDateString('ko-KR')}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 통계 요약 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">{report.total_tests}</div>
                    <div className="text-sm text-muted-foreground">테스트 횟수</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">{report.average_score.toFixed(1)}%</div>
                    <div className="text-sm text-muted-foreground">평균 점수</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className={`text-2xl font-bold ${report.improvement_rate >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {report.improvement_rate >= 0 ? '+' : ''}{report.improvement_rate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">개선률</div>
                  </div>
                  <div className="text-center p-4 bg-muted rounded-lg">
                    <div className="text-2xl font-bold text-primary">
                      {report.goals_completed}/{report.goals_total}
                    </div>
                    <div className="text-sm text-muted-foreground">목표 달성</div>
                  </div>
                </div>

                {/* 목표 진행률 */}
                {report.goals_total > 0 && (
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-muted-foreground">목표 달성률</span>
                      <span className="font-medium">
                        {((report.goals_completed / report.goals_total) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <Progress value={(report.goals_completed / report.goals_total) * 100} />
                  </div>
                )}

                {/* AI 인사이트 - 프리미엄 전용 */}
                <BlurredContent
                  title="AI 분석 인사이트"
                  description="프리미엄 구독자만 AI 분석 인사이트를 볼 수 있습니다."
                  requiredCash={5000}
                >
                  <div className="bg-gradient-to-br from-primary/5 to-purple-500/5 p-6 rounded-lg border border-primary/20">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      AI 분석
                    </h3>
                    <p className="text-sm whitespace-pre-line leading-relaxed">
                      {report.ai_insights}
                    </p>
                  </div>
                </BlurredContent>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};