import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Play, MessageSquare, Brain, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TestType {
  id: string;
  name: string;
  typebot_url: string;
  duration_minutes: number;
  description: string;
}

export const TestSelector = () => {
  const [testTypes, setTestTypes] = useState<TestType[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchTestTypes();
  }, []);

  const fetchTestTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('test_types')
        .select('id, name, description, created_at');

      if (error) throw error;
      // Transform data to match expected interface
      const testTypes = data?.map(type => ({
        ...type,
        typebot_url: '',
        duration_minutes: 30
      })) || [];
      setTestTypes(testTypes);
    } catch (error: any) {
      toast({
        title: "테스트 로드 실패",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getTestIcon = (testName: string) => {
    if (testName.includes('언어')) return MessageSquare;
    if (testName.includes('회복력')) return Activity;
    if (testName.includes('ADHD')) return Brain;
    return Brain;
  };

  const handleStartTest = (testType: TestType) => {
    navigate(`/test/${testType.id}`, { 
      state: { 
        testType: testType
      } 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            3분 심리 검사
          </h1>
          <p className="text-muted-foreground">
            간단하고 빠른 자가진단으로 나를 더 잘 이해해보세요
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {testTypes.map((testType) => {
            const IconComponent = getTestIcon(testType.name);
            
            return (
              <Card key={testType.id} className="relative group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/20">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <IconComponent className="h-6 w-6 text-primary" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      <Clock className="w-3 h-3 mr-1" />
                      {testType.duration_minutes}분
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{testType.name}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {testType.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button 
                    onClick={() => handleStartTest(testType)}
                    className="w-full group-hover:bg-primary/90 transition-colors"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    검사 시작하기
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {testTypes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              현재 이용 가능한 검사가 없습니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};