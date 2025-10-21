import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle } from 'lucide-react';

interface TestInsightsProps {
  organizationId: string;
  dateRange: {
    start: Date;
    end: Date;
  };
}

interface InsightCard {
  title: string;
  count: number;
  description: string;
  severity: 'high' | 'medium' | 'low';
}

export const TestInsights = ({ organizationId, dateRange }: TestInsightsProps) => {
  const [insights, setInsights] = useState<InsightCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, [organizationId, dateRange]);

  const fetchInsights = async () => {
    try {
      setLoading(true);

      // 멤버 ID 가져오기
      const { data: members } = await supabase
        .from('organization_members')
        .select('user_id')
        .eq('organization_id', organizationId);

      const memberIds = members?.map(m => m.user_id) || [];

      if (memberIds.length === 0) {
        setInsights([]);
        setLoading(false);
        return;
      }

      // 검사 결과 가져오기
      const { data: testResults } = await supabase
        .from('test_results')
        .select('test_type_id, scores, created_at')
        .in('user_id', memberIds)
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString());

      // 인사이트 생성
      const insightData: InsightCard[] = [];

      // 증상별로 고점수 분석
      const symptomMap = new Map<string, number>();
      testResults?.forEach(result => {
        if (result.scores) {
          Object.entries(result.scores as Record<string, number>).forEach(([key, value]) => {
            if (value > 5) { // 높은 점수 기준
              symptomMap.set(key, (symptomMap.get(key) || 0) + 1);
            }
          });
        }
      });

      // 상위 증상들을 인사이트 카드로 변환
      const sortedSymptoms = Array.from(symptomMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);

      sortedSymptoms.forEach(([symptom, count]) => {
        insightData.push({
          title: `${getSymptomName(symptom)} 높은 그룹`,
          count,
          description: `${count}명의 구성원이 ${getSymptomName(symptom)} 영역에서 관심이 필요합니다`,
          severity: count > 10 ? 'high' : count > 5 ? 'medium' : 'low'
        });
      });

      setInsights(insightData);
    } catch (error) {
      console.error('Error fetching insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSymptomName = (key: string): string => {
    const nameMap: Record<string, string> = {
      'anxiety': '불안',
      'depression': '우울',
      'stress': '스트레스',
      'attention': '주의력',
      'hyperactivity': '과잉행동',
      'social_anxiety': '사회불안',
      'emotional_instability': '정서불안정'
    };
    return nameMap[key] || key;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'low': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="grid md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-48" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {insights.length === 0 ? (
        <Card className="col-span-3">
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-semibold mb-2">📊 데이터가 없습니다</p>
              <p className="text-sm">검사 데이터가 충분히 쌓이면 인사이트가 표시됩니다</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        insights.map((insight, index) => (
          <Card key={index} className={`border-2 ${getSeverityColor(insight.severity)}`}>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                {insight.title}
                <Badge variant={insight.severity === 'high' ? 'destructive' : 'secondary'}>
                  {insight.count}명
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {insight.description}
              </p>
              <div className="mt-4 text-xs text-muted-foreground">
                기준: {dateRange.start.toLocaleDateString('ko-KR')} ~ {dateRange.end.toLocaleDateString('ko-KR')}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};
