import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';
import { ProgressTracker } from '@/components/tracking/ProgressTracker';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Brain, Heart, Smile, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TestResult {
  id: string;
  test_type: string;
  score: number;
  date: string;
  category: string;
}

const ProgressTracking = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<TestResult[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: '로그인 필요',
          description: '변화 추적 기능을 사용하려면 로그인해주세요.',
          variant: 'destructive'
        });
        navigate('/auth');
        return;
      }

      // 임시 데모 데이터 (실제로는 Supabase에서 가져와야 함)
      const demoResults: TestResult[] = [
        {
          id: '1',
          test_type: 'depression_test',
          score: 15,
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          category: 'depression'
        },
        {
          id: '2',
          test_type: 'depression_test',
          score: 12,
          date: new Date().toISOString(),
          category: 'depression'
        }
      ];

      setResults(demoResults);
      
      // TODO: 실제 구현 시 아래 코드 사용
      // const response: any = await supabase
      //   .from('premium_assessment_results')
      //   .select('*')
      //   .eq('user_id', user.id)
      //   .order('created_at', { ascending: false });
      
    } catch (error) {
      console.error('Failed to fetch results:', error);
      toast({
        title: '오류',
        description: '검사 결과를 불러오는데 실패했습니다.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getCategoryFromTestType = (testType: string): string => {
    if (testType.includes('depression')) return 'depression';
    if (testType.includes('anxiety') || testType.includes('panic')) return 'anxiety';
    if (testType.includes('adhd')) return 'adhd';
    if (testType.includes('stress')) return 'stress';
    return 'general';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'depression': return <Heart className="w-5 h-5" />;
      case 'anxiety': return <AlertCircle className="w-5 h-5" />;
      case 'adhd': return <Brain className="w-5 h-5" />;
      case 'stress': return <TrendingUp className="w-5 h-5" />;
      default: return <Smile className="w-5 h-5" />;
    }
  };

  const categories = [
    { id: 'all', label: '전체' },
    { id: 'depression', label: '우울' },
    { id: 'anxiety', label: '불안' },
    { id: 'adhd', label: 'ADHD' },
    { id: 'stress', label: '스트레스' },
    { id: 'general', label: '기타' }
  ];

  const filteredResults = selectedCategory === 'all' 
    ? results 
    : results.filter(r => r.category === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <UnifiedNavigation />
        <div className="container mx-auto px-4 py-16 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">데이터를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      <UnifiedNavigation />
      
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            변화 추적 대시보드
          </h1>
          <p className="text-xl text-muted-foreground">
            당신의 성장과 변화를 한눈에 확인하세요
          </p>
        </div>

        {/* 전체 요약 */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">총 검사 횟수</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary">{results.length}회</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">추적 중인 항목</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary">
                {new Set(results.map(r => r.category)).size}개
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">최근 검사</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold">
                {results.length > 0 
                  ? new Date(results[0].date).toLocaleDateString('ko-KR')
                  : '없음'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 카테고리별 추적 */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-6">
          <TabsList className="grid grid-cols-6 w-full max-w-3xl mx-auto">
            {categories.map(cat => (
              <TabsTrigger key={cat.id} value={cat.id} className="gap-2">
                {cat.id !== 'all' && getCategoryIcon(cat.id)}
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map(cat => (
            <TabsContent key={cat.id} value={cat.id} className="space-y-6">
              {filteredResults.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <p className="text-muted-foreground mb-4">
                      아직 {cat.label === '전체' ? '' : cat.label + ' '} 검사 기록이 없습니다
                    </p>
                    <Button onClick={() => navigate('/assessment')}>
                      첫 검사 시작하기
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 gap-6">
                  {Array.from(new Set(filteredResults.map(r => r.test_type))).map(testType => {
                    const testResults = filteredResults.filter(r => r.test_type === testType);
                    return (
                      <ProgressTracker 
                        key={testType}
                        results={testResults}
                        category={testResults[0]?.category || 'general'}
                      />
                    );
                  })}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Card className="bg-gradient-to-r from-primary/5 to-primary/10">
            <CardContent className="py-8">
              <h3 className="text-2xl font-bold mb-4">지속적인 변화 추적으로 더 나은 내가 되세요</h3>
              <p className="text-muted-foreground mb-6">
                정기적인 검사로 변화를 추적하고, AI의 맞춤형 피드백을 받아보세요
              </p>
              <Button 
                size="lg"
                onClick={() => navigate('/assessment')}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                지금 검사하기
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProgressTracking;
