import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface TestResultsListProps {
  organizationId: string;
  dateRange: {
    start: Date;
    end: Date;
  };
  selectedCategory: string;
}

interface TestResult {
  id: string;
  user_id: string;
  test_type_id: string;
  scores: any;
  created_at: string;
  user_email?: string;
}

export const TestResultsList = ({ organizationId, dateRange, selectedCategory }: TestResultsListProps) => {
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResults();
  }, [organizationId, dateRange, selectedCategory]);

  const fetchResults = async () => {
    try {
      setLoading(true);

      // 멤버 ID 가져오기
      const { data: members } = await supabase
        .from('organization_members')
        .select('user_id')
        .eq('organization_id', organizationId);

      const memberIds = members?.map(m => m.user_id) || [];

      if (memberIds.length === 0) {
        setResults([]);
        setLoading(false);
        return;
      }

      // 검사 결과 가져오기
      let query = supabase
        .from('test_results')
        .select('*')
        .in('user_id', memberIds)
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString())
        .order('created_at', { ascending: false })
        .limit(50);

      if (selectedCategory !== 'all') {
        query = query.eq('test_type_id', selectedCategory);
      }

      const { data: testResults } = await query;

      // 사용자 이메일 정보 가져오기
      if (testResults && testResults.length > 0) {
        const userIds = [...new Set(testResults.map(r => r.user_id))];
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, email')
          .in('id', userIds);

        const emailMap = new Map(profiles?.map(p => [p.id, p.email]) || []);
        
        const resultsWithEmail = testResults.map(result => ({
          ...result,
          user_email: emailMap.get(result.user_id) || '알 수 없음'
        }));

        setResults(resultsWithEmail);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error('Error fetching test results:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const getTestTypeName = (id: string): string => {
    const nameMap: Record<string, string> = {
      'adhd': 'ADHD',
      'depression': '우울',
      'anxiety': '불안',
      'stress': '스트레스',
      'bigfive': '성격',
      'attachment': '애착',
    };
    return nameMap[id] || id;
  };

  const getTestTypeColor = (id: string): string => {
    const colorMap: Record<string, string> = {
      'adhd': 'destructive',
      'depression': 'default',
      'anxiety': 'secondary',
      'stress': 'outline',
      'bigfive': 'default',
      'attachment': 'secondary',
    };
    return colorMap[id] || 'default';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>검사 결과 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>검사 결과 목록</CardTitle>
        <p className="text-sm text-muted-foreground">
          총 {results.length}개의 검사 결과
        </p>
      </CardHeader>
      <CardContent>
        {results.length > 0 ? (
          <div className="space-y-3">
            {results.map((result) => (
              <div
                key={result.id}
                className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={getTestTypeColor(result.test_type_id) as any}>
                        {getTestTypeName(result.test_type_id)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {result.user_email}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(result.created_at), {
                        addSuffix: true,
                        locale: ko,
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    {result.scores && (
                      <p className="text-sm font-medium">
                        점수: {JSON.stringify(result.scores).length > 50 
                          ? '상세 점수 포함' 
                          : JSON.stringify(result.scores)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>검사 결과가 없습니다</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
