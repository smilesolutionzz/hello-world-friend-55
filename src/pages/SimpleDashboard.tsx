import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ClipboardList, TrendingUp, Clock, ArrowRight, Crown, Brain } from 'lucide-react';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import AuthenticationGuard from '@/components/observation/AuthenticationGuard';

interface Profile {
  display_name: string;
  subscription_tier: string;
}

interface RecentActivity {
  id: string;
  type: string;
  title: string;
  score?: number;
  created_at: string;
}

function SimpleDashboardContent() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [stats, setStats] = useState({ totalTests: 0, avgScore: 0, streak: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 프로필 로드
      const { data: profileData } = await supabase
        .from('profiles')
        .select('display_name, subscription_tier')
        .eq('user_id', user.id)
        .maybeSingle();
      
      setProfile(profileData);

      // 검사 결과 로드
      const { data: assessments } = await supabase
        .from('assessments')
        .select('id, created_at, results, age_group')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      // 통계 계산
      const totalTests = assessments?.length || 0;
      let totalScore = 0;
      const recentActivities: RecentActivity[] = [];

      assessments?.forEach((assessment) => {
        let score = 0;
        if (assessment.results && typeof assessment.results === 'object') {
          const results = assessment.results as Record<string, unknown>;
          if (typeof results.total === 'number') score = results.total;
          else if (typeof results.totalScore === 'number') score = results.totalScore;
        }
        totalScore += score;

        recentActivities.push({
          id: assessment.id,
          type: 'assessment',
          title: `${assessment.age_group || '발달'} 검사`,
          score: score > 0 ? score : undefined,
          created_at: assessment.created_at,
        });
      });

      setStats({
        totalTests,
        avgScore: totalTests > 0 ? Math.round(totalScore / totalTests) : 0,
        streak: 0, // 간소화로 streak 계산 제거
      });

      setActivities(recentActivities.slice(0, 5));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <UnifiedNavigation />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              안녕하세요, {profile?.display_name || '사용자'}님
            </h1>
            <p className="text-muted-foreground mt-1">오늘도 발달 관리를 시작해보세요</p>
          </div>
          {profile?.subscription_tier === 'premium' && (
            <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
              <Crown className="w-3 h-3 mr-1" />
              프리미엄
            </Badge>
          )}
        </div>

        {/* 핵심 통계 - 단순화 */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <ClipboardList className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">총 검사</p>
                  <p className="text-2xl font-bold text-foreground">{stats.totalTests}회</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500/10">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">평균 점수</p>
                  <p className="text-2xl font-bold text-foreground">{stats.avgScore}점</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 빠른 액션 */}
        <Card className="mb-8 bg-gradient-to-r from-primary/10 to-blue-500/10 border-primary/20">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-primary/20">
                  <Brain className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">새 검사 시작하기</h3>
                  <p className="text-sm text-muted-foreground">1분 만에 발달 상태를 확인해보세요</p>
                </div>
              </div>
              <Button onClick={() => navigate('/assessment')} className="gap-2">
                시작하기
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 최근 활동 */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Clock className="w-5 h-5" />
              최근 활동
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>아직 검사 기록이 없습니다.</p>
                <p className="text-sm mt-1">첫 번째 검사를 시작해보세요!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <ClipboardList className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{activity.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(activity.created_at), 'M월 d일 a h:mm', { locale: ko })}
                        </p>
                      </div>
                    </div>
                    {activity.score !== undefined && (
                      <Badge variant="secondary" className="text-sm">
                        {activity.score}점
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function SimpleDashboard() {
  return (
    <AuthenticationGuard
      fallbackMessage="대시보드를 이용하려면 로그인이 필요합니다."
      redirectPath="/auth"
    >
      <SimpleDashboardContent />
    </AuthenticationGuard>
  );
}
