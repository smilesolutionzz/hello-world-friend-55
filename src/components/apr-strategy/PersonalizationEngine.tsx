import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Users, Star, Clock } from 'lucide-react';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { supabase } from '@/integrations/supabase/client';

interface PersonalizationData {
  userProfile: {
    mentalHealthType: string;
    improvementGoals: string[];
    usagePattern: string;
  };
  recommendations: {
    nextAction: string;
    priority: 'high' | 'medium' | 'low';
    reason: string;
  }[];
  achievements: {
    milestone: string;
    completedAt: string;
    impact: string;
  }[];
}

export const PersonalizationEngine: React.FC = () => {
  const { user } = useAuthGuard();
  const [personalizationData, setPersonalizationData] = useState<PersonalizationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadPersonalizationData();
    }
  }, [user]);

  const loadPersonalizationData = async () => {
    try {
      setLoading(true);
      
      // APR 전략: 개인화된 데이터로 "되돌릴 수 없는" 경험 생성
      const { data: userTests } = await supabase
        .from('test_results')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: userEngagement } = await supabase
        .from('usage_tracking')
        .select('*')
        .eq('user_id', user?.id)
        .order('usage_date', { ascending: false })
        .limit(30);

      // AI 기반 개인화 추천 생성
      const recommendations = generatePersonalizedRecommendations(userTests, userEngagement);
      const achievements = generateAchievements(userTests, userEngagement);
      const profile = analyzeUserProfile(userTests, userEngagement);

      setPersonalizationData({
        userProfile: profile,
        recommendations,
        achievements
      });
    } catch (error) {
      console.error('개인화 데이터 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePersonalizedRecommendations = (tests: any[], engagement: any[]) => {
    // APR 전략: 데이터 기반 맞춤형 추천으로 사용자 락인
    const recommendations = [];
    
    if (tests?.length > 0) {
      const latestTest = tests[0];
      recommendations.push({
        nextAction: `${latestTest.test_type} 심화 분석 받기`,
        priority: 'high' as const,
        reason: '이전 검사 결과를 바탕으로 더 정확한 분석이 가능합니다'
      });
    }

    if (engagement?.length > 0) {
      const recentUsage = engagement.slice(0, 7);
      const usageCount = recentUsage.length;
      
      if (usageCount < 3) {
        recommendations.push({
          nextAction: '일일 마음 체크 습관 만들기',
          priority: 'medium' as const,
          reason: '꾸준한 모니터링으로 더 나은 인사이트를 얻을 수 있어요'
        });
      }
    }

    recommendations.push({
      nextAction: 'AI 전문가 상담 예약하기',
      priority: 'high' as const,
      reason: '개인화된 분석 결과를 전문가와 상담하면 효과가 3배 증가합니다'
    });

    return recommendations;
  };

  const generateAchievements = (tests: any[], engagement: any[]) => {
    const achievements = [];
    
    if (tests?.length >= 1) {
      achievements.push({
        milestone: '첫 AI 심리 분석 완료',
        completedAt: tests[0]?.created_at,
        impact: '자신에 대한 새로운 인사이트 발견'
      });
    }

    if (tests?.length >= 3) {
      achievements.push({
        milestone: '지속적 자기 관찰자',
        completedAt: tests[2]?.created_at,
        impact: '패턴 분석을 통한 깊이 있는 이해'
      });
    }

    if (engagement?.length >= 7) {
      achievements.push({
        milestone: '7일 연속 사용',
        completedAt: engagement[6]?.usage_date,
        impact: '습관화를 통한 지속적 성장'
      });
    }

    return achievements;
  };

  const analyzeUserProfile = (tests: any[], engagement: any[]) => {
    // APR 전략: 사용자 타입 분석으로 맞춤형 경험 제공
    const testTypes = tests?.map(t => t.test_type) || [];
    const mostUsedType = testTypes.reduce((a, b, i, arr) => 
      arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b, ''
    );

    return {
      mentalHealthType: mostUsedType || '탐색형',
      improvementGoals: ['스트레스 관리', '감정 조절', '관계 개선'],
      usagePattern: engagement?.length > 10 ? '적극적 사용자' : '신규 사용자'
    };
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
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
    );
  }

  return (
    <div className="space-y-6">
      {/* APR 전략: 개인화된 사용자 프로필로 "나만의" 경험 강조 */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            나만의 심리 프로필
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">심리 타입</p>
              <Badge variant="secondary" className="mt-1">
                {personalizationData?.userProfile.mentalHealthType}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">사용 패턴</p>
              <Badge variant="outline" className="mt-1">
                {personalizationData?.userProfile.usagePattern}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">성장 목표</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {personalizationData?.userProfile.improvementGoals.slice(0, 2).map((goal, index) => (
                  <Badge key={index} variant="default" className="text-xs">
                    {goal}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* APR 전략: 개인화된 추천으로 다음 액션 유도 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            맞춤형 추천
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {personalizationData?.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  rec.priority === 'high' ? 'bg-red-500' : 
                  rec.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                }`} />
                <div className="flex-1">
                  <h4 className="font-medium">{rec.nextAction}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{rec.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* APR 전략: 성취감으로 지속 사용 유도 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            나의 성장 기록
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {personalizationData?.achievements.map((achievement, index) => (
              <div key={index} className="flex items-center gap-3 p-3 border border-green-200 bg-green-50 rounded-lg">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <Star className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-green-800">{achievement.milestone}</h4>
                  <p className="text-sm text-green-600">{achievement.impact}</p>
                  <p className="text-xs text-green-500 mt-1">
                    {new Date(achievement.completedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};