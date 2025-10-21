import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, TrendingUp, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface OrganizationStatsProps {
  organizationId: string;
  dateRange: {
    start: Date;
    end: Date;
  };
  selectedCategory?: string;
}

interface Stats {
  totalMembers: number;
  totalTests: number;
  avgTestScore: number;
  completionRate: number;
}

export const OrganizationStats = ({ organizationId, dateRange, selectedCategory = 'all' }: OrganizationStatsProps) => {
  const [stats, setStats] = useState<Stats>({
    totalMembers: 0,
    totalTests: 0,
    avgTestScore: 0,
    completionRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [organizationId, dateRange, selectedCategory]);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // 등록된 멤버 수
      const { count: memberCount } = await supabase
        .from('organization_members')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId);

      // 멤버들의 ID 가져오기
      const { data: members } = await supabase
        .from('organization_members')
        .select('user_id')
        .eq('organization_id', organizationId);

      const memberIds = members?.map(m => m.user_id) || [];

      if (memberIds.length > 0) {
        // 검사 결과 수와 평균 점수 (카테고리 필터 적용)
        let query = supabase
          .from('test_results')
          .select('scores, created_at, test_type_id')
          .in('user_id', memberIds)
          .gte('created_at', dateRange.start.toISOString())
          .lte('created_at', dateRange.end.toISOString());

        if (selectedCategory !== 'all') {
          query = query.eq('test_type_id', selectedCategory);
        }

        const { data: testResults } = await query;

        const totalTests = testResults?.length || 0;
        
        // 평균 점수 계산
        let totalScore = 0;
        let scoreCount = 0;
        testResults?.forEach(result => {
          if (result.scores) {
            const scores = Object.values(result.scores as Record<string, number>);
            totalScore += scores.reduce((sum, score) => sum + score, 0);
            scoreCount += scores.length;
          }
        });

        const avgScore = scoreCount > 0 ? totalScore / scoreCount : 0;

        setStats({
          totalMembers: memberCount || 0,
          totalTests,
          avgTestScore: Number(avgScore.toFixed(1)),
          completionRate: memberCount ? ((totalTests / memberCount) * 100) : 0
        });
      } else {
        setStats({
          totalMembers: memberCount || 0,
          totalTests: 0,
          avgTestScore: 0,
          completionRate: 0
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: '등록 인원 수',
      value: stats.totalMembers,
      suffix: '명',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: '검사 누적 수',
      value: stats.totalTests,
      suffix: '회',
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: '평균 점수',
      value: stats.avgTestScore,
      suffix: '점',
      icon: Activity,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: '참여율',
      value: stats.completionRate.toFixed(1),
      suffix: '%',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  if (loading) {
    return (
      <div className="grid md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stat.value}{stat.suffix}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
