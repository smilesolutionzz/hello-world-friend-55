import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Play, MessageSquare, Brain, Activity, Home, ArrowLeft } from 'lucide-react';
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
      // Mock data with Korean translations
      const mockTestTypes = [
        {
          id: 'adhd-test',
          name: 'ADHD 검사',
          description: '주의력결핍 과잉행동장애 종합 평가',
          typebot_url: '',
          duration_minutes: 3
        },
        {
          id: 'depression-test',
          name: '우울증 검사',
          description: '우울증 선별 진단 평가',
          typebot_url: '',
          duration_minutes: 3
        },
        {
          id: 'anxiety-test',
          name: '불안장애 검사',
          description: '불안장애 종합 평가 진단',
          typebot_url: '',
          duration_minutes: 3
        },
        {
          id: 'autism-spectrum-test',
          name: '자폐스펙트럼장애 검사',
          description: 'ASD 조기선별 및 발달평가',
          typebot_url: '',
          duration_minutes: 3
        },
        {
          id: 'developmental-delay-test',
          name: '발달지연 검사',
          description: '전반적 발달지연 선별진단',
          typebot_url: '',
          duration_minutes: 3
        },
        {
          id: 'language-development',
          name: '언어발달 검사',
          description: '언어 능력 및 발달 평가',
          typebot_url: '',
          duration_minutes: 3
        },
        {
          id: 'sensory-integration-test',
          name: '감각통합장애 검사',
          description: '감각처리 및 통합능력 평가',
          typebot_url: '',
          duration_minutes: 3
        },
        {
          id: 'learning-disability-test',
          name: '학습장애 검사',
          description: '학습능력 및 인지기능 평가',
          typebot_url: '',
          duration_minutes: 3
        },
        {
          id: 'social-development-test',
          name: '사회성 발달 검사',
          description: '사회적 상호작용 및 적응 평가',
          typebot_url: '',
          duration_minutes: 3
        },
        {
          id: 'tic-disorder-test',
          name: '틱장애 검사',
          description: '틱 증상 및 행동패턴 평가',
          typebot_url: '',
          duration_minutes: 3
        },
        {
          id: 'premium-assessment',
          name: '프리미엄 종합검사',
          description: '전문가급 종합 심리 평가',
          typebot_url: '',
          duration_minutes: 3
        }
      ];
      
      setTestTypes(mockTestTypes);
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
    if (testName.includes('자폐') || testName.includes('발달지연')) return Brain;
    return Brain;
  };

  const handleStartTest = (testType: TestType) => {
    console.log('Starting test:', testType.name);
    
    // Navigate to different pages based on test type
    switch (testType.id) {
      case 'adhd-test':
        navigate('/assessment');
        break;
      case 'depression-test':
        navigate('/assessment'); 
        break;
      case 'anxiety-test':
        navigate('/assessment');
        break;
      case 'autism-spectrum-test':
        navigate('/assessment');
        break;
      case 'developmental-delay-test':
        navigate('/assessment');
        break;
      case 'language-development':
        navigate('/assessment');
        break;
      case 'sensory-integration-test':
        navigate('/assessment');
        break;
      case 'learning-disability-test':
        navigate('/assessment');
        break;
      case 'social-development-test':
        navigate('/assessment');
        break;
      case 'tic-disorder-test':
        navigate('/assessment');
        break;
      case 'premium-assessment':
        navigate('/premium-assessment');
        break;
      default:
        navigate('/assessment');
    }
  };

  const handleGoHome = () => {
    navigate('/');
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
        {/* Header with Home Button */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="outline"
            onClick={handleGoHome}
            className="flex items-center gap-2"
          >
            <Home className="w-4 h-4" />
            홈으로 가기
          </Button>
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            뒤로가기
          </Button>
        </div>

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