import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Activity, BarChart3, Target, Zap, Eye, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { MobileGrid, MobileCard, MobileButton } from '@/components/common/MobileOptimized';
import { useNavigate } from 'react-router-dom';

interface TrackingData {
  dailyGoal: number;
  currentProgress: number;
  streakDays: number;
  weeklyTrend: number[];
  engagementScore: number;
  recommendedActions: string[];
}

export const RealTimeTracking: React.FC = () => {
  const { user } = useAuthGuard();
  const navigate = useNavigate();
  const [trackingData, setTrackingData] = useState<TrackingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [liveStats, setLiveStats] = useState({
    currentViewers: 0,
    todayCompletions: 0
  });

  const handleActionClick = (action: string) => {
    if (action.includes('3분') || action.includes('일일 체크')) {
      navigate('/assessment');
      return;
    }
    if (action.includes('AI 분석') || action.includes('강점')) {
      navigate('/assessment');
      return;
    }
    if (action.includes('재분석') || action.includes('지난주')) {
      navigate('/assessment-history');
      return;
    }
    if (action.includes('전문가') || action.includes('상담')) {
      navigate('/expert-hiring');
      return;
    }
    navigate('/assessment');
  };

  useEffect(() => {
    if (user) {
      loadTrackingData();
      loadLiveStats();
    }

    // APR 전략: 실시간 데이터로 긴급성과 사회적 증명 창출
    const interval = setInterval(() => {
      loadLiveStats();
      updateRealTimeElements();
    }, 5000); // 5초마다 업데이트

    return () => clearInterval(interval);
  }, [user]);

  const loadTrackingData = async () => {
    try {
      // 사용자의 최근 30일 활동 데이터 조회
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: usageData } = await supabase
        .from('usage_tracking')
        .select('*')
        .eq('user_id', user?.id)
        .gte('usage_date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('usage_date', { ascending: true });

      const { data: testResults } = await supabase
        .from('test_results')
        .select('*')
        .eq('user_id', user?.id)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false });

      // APR 전략: 10번 중 8번 성공 법칙 적용한 개인화 추천
      const recommendations = generateSmartRecommendations(usageData, testResults);
      const weeklyTrend = calculateWeeklyTrend(usageData);
      const streakDays = calculateStreakDays(usageData);
      const engagementScore = calculateEngagementScore(usageData, testResults);

      setTrackingData({
        dailyGoal: 3, // 일일 목표 (검사, 분석, 액션)
        currentProgress: Math.min(usageData?.filter(d => 
          d.usage_date === new Date().toISOString().split('T')[0]
        ).length || 0, 3),
        streakDays,
        weeklyTrend,
        engagementScore,
        recommendedActions: recommendations
      });
    } catch (error) {
      console.error('트래킹 데이터 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLiveStats = async () => {
    try {
      // 실시간 통계 (APR의 즉시성 전략)
      const today = new Date().toISOString().split('T')[0];
      
      const { data: todayUsage } = await supabase
        .from('usage_tracking')
        .select('user_id', { count: 'exact' })
        .eq('usage_date', today);

      // 모의 실시간 뷰어 수 (실제로는 웹소켓으로 구현)
      const mockViewers = Math.floor(Math.random() * 50) + 20;

      setLiveStats({
        currentViewers: mockViewers,
        todayCompletions: todayUsage?.length || 0
      });
    } catch (error) {
      console.error('실시간 통계 로드 오류:', error);
    }
  };

  const generateSmartRecommendations = (usage: any[], tests: any[]) => {
    const recommendations = [];
    const recentUsage = usage?.slice(-7) || [];
    const recentTests = tests?.slice(0, 3) || [];

    // APR 전략: 소비자와 싱크로 맞추기
    if (recentUsage.length < 3) {
      recommendations.push("🎯 3분 만에 완료되는 일일 체크를 시작해보세요");
    }

    if (recentTests.length === 0) {
      recommendations.push("🧠 AI 분석으로 당신의 숨겨진 강점을 발견하세요");
    }

    if (recentTests.length > 0 && recentTests[0].created_at) {
      const daysSinceLastTest = Math.floor(
        (Date.now() - new Date(recentTests[0].created_at).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysSinceLastTest > 7) {
        recommendations.push("📈 지난주보다 더 나은 결과를 위한 재분석을 추천드려요");
      }
    }

    // 성과 기반 추천 (APR의 성과 마케팅 전략)
    recommendations.push("⭐ 94%의 사용자가 만족한 전문가 상담을 예약해보세요");

    return recommendations.slice(0, 3);
  };

  const calculateWeeklyTrend = (usage: any[]) => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dateStr = date.toISOString().split('T')[0];
      return usage?.filter(u => u.usage_date === dateStr).length || 0;
    });
    return last7Days;
  };

  const calculateStreakDays = (usage: any[]) => {
    if (!usage?.length) return 0;
    
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      const hasUsage = usage.some(u => u.usage_date === dateStr);
      if (hasUsage) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  const calculateEngagementScore = (usage: any[], tests: any[]) => {
    const usageScore = Math.min((usage?.length || 0) * 5, 50);
    const testScore = Math.min((tests?.length || 0) * 15, 50);
    return Math.min(usageScore + testScore, 100);
  };

  const updateRealTimeElements = () => {
    // APR 전략: 역동적 요소로 긴급성 창출
    const elements = document.querySelectorAll('.real-time-pulse');
    elements.forEach(el => {
      el.classList.add('animate-pulse');
      setTimeout(() => el.classList.remove('animate-pulse'), 1000);
    });
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-2/3"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* APR 전략: 실시간 활동 표시로 FOMO 유발 */}
      <MobileCard className="border-l-4 border-l-primary/60 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Eye className="h-4 w-4 lg:h-5 lg:w-5 text-red-500 animate-pulse flex-shrink-0" />
            <span className="font-medium text-sm lg:text-base">지금 이 순간</span>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs lg:text-sm">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>{liveStats.currentViewers}명 접속 중</span>
            </div>
            <div className="flex items-center gap-1">
              <Zap className="h-3 w-3 lg:h-4 lg:w-4 text-orange-500 flex-shrink-0" />
              <span>오늘 {liveStats.todayCompletions}명 완료</span>
            </div>
          </div>
        </div>
      </MobileCard>

      <MobileGrid cols={2} gap="md">
        {/* 개인 성과 트래킹 */}
        <MobileCard>
          <div className="mb-4">
            <h3 className="flex items-center gap-2 text-base lg:text-lg font-semibold">
              <Target className="h-4 w-4 lg:h-5 lg:w-5 text-primary" />
              오늘의 목표
            </h3>
          </div>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>진행률</span>
                <span>{trackingData?.currentProgress}/{trackingData?.dailyGoal}</span>
              </div>
              <Progress 
                value={(trackingData?.currentProgress || 0) / (trackingData?.dailyGoal || 1) * 100} 
                className="h-3"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-lg lg:text-2xl font-bold text-primary">
                  {trackingData?.streakDays}
                </div>
                <div className="text-xs lg:text-sm text-muted-foreground">연속 일수</div>
              </div>
              <div className="text-center">
                <div className="text-lg lg:text-2xl font-bold text-green-600">
                  {trackingData?.engagementScore}
                </div>
                <div className="text-xs lg:text-sm text-muted-foreground">참여 점수</div>
              </div>
            </div>
          </div>
        </MobileCard>

        {/* 주간 트렌드 */}
        <MobileCard>
          <div className="mb-4">
            <h3 className="flex items-center gap-2 text-base lg:text-lg font-semibold">
              <BarChart3 className="h-4 w-4 lg:h-5 lg:w-5 text-primary" />
              7일 활동 트렌드
            </h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-end gap-2 h-24">
              {trackingData?.weeklyTrend.map((value, index) => (
                <div
                  key={index}
                  className="flex-1 bg-primary/20 rounded-t-sm relative"
                  style={{ height: `${Math.max(value * 20, 8)}px` }}
                >
                  <div 
                    className="bg-primary rounded-t-sm w-full transition-all duration-500"
                    style={{ height: `${Math.max(value * 20, 8)}px` }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              {['월', '화', '수', '목', '금', '토', '일'].map((day, index) => (
                <span key={index}>{day}</span>
              ))}
            </div>
          </div>
        </MobileCard>
      </MobileGrid>

      {/* APR 전략: 스마트 추천으로 다음 액션 유도 */}
      <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            AI 추천 액션
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {trackingData?.recommendedActions.map((action, index) => (
              <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 bg-white rounded-lg border gap-3">
                <span className="text-sm text-foreground">{action}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleActionClick(action)}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto"
                  aria-label="추천 액션 시작하기"
                >
                  시작하기
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* APR 전략: 긴급성 메시지 */}
      <Card className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200">
        <CardContent className="p-4 lg:p-6 text-center">
          <h3 className="text-lg lg:text-xl font-bold mb-2 text-orange-900">⚡ 지금이 변화의 순간!</h3>
          <p className="mb-4 text-orange-700 text-sm lg:text-base">
            {trackingData?.streakDays && trackingData.streakDays > 0 
              ? `${trackingData.streakDays}일 연속 기록을 이어가세요!`
              : "오늘 시작하면 내일이 달라집니다!"
            }
          </p>
          <Button
            onClick={() => navigate('/assessment')}
            className="bg-orange-500 hover:bg-orange-600 text-white font-medium"
            aria-label="지금 시작하기"
          >
            지금 시작하기
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};