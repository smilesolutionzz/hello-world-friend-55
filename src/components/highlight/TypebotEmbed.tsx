import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LocationState {
  testType: {
    id: string;
    name: string;
    typebot_url: string;
    duration_minutes: number;
    description: string;
  };
}

export const TypebotEmbed = () => {
  const { testId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [testCompleted, setTestCompleted] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const { toast } = useToast();

  const testType = (location.state as LocationState)?.testType;

  useEffect(() => {
    if (!testType) {
      navigate('/dashboard');
      return;
    }

    // Listen for messages from the Typebot iframe
    const handleMessage = (event: MessageEvent) => {
      // Security: Only accept messages from typebot domain
      if (event.origin.includes('typebot.co') || event.origin.includes('localhost')) {
        console.log('Received message from Typebot:', event.data);
        
        // Check if the test is completed
        if (event.data.type === 'typebot:completed' || event.data.type === 'completed') {
          handleTestCompletion(event.data);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [testType]);

  const handleTestCompletion = async (data: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Generate mock scores based on test type
      const mockScores = generateMockScores(testType.name);
      
      const { data: result, error } = await supabase
        .from('test_results')
        .insert({
          user_id: user.id,
          test_type_id: testType.id,
          scores: mockScores,
          raw_data: data,
          completed_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      setTestResult(result);
      setTestCompleted(true);
      
      toast({
        title: "검사 완료!",
        description: "결과를 확인해보세요.",
      });
    } catch (error: any) {
      toast({
        title: "결과 저장 실패",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const generateMockScores = (testName: string) => {
    if (testName.includes('언어')) {
      return {
        vocabulary: Math.floor(Math.random() * 40) + 60,
        grammar: Math.floor(Math.random() * 40) + 60,
        comprehension: Math.floor(Math.random() * 40) + 60,
        expression: Math.floor(Math.random() * 40) + 60,
        total_score: Math.floor(Math.random() * 40) + 60
      };
    } else if (testName.includes('회복력')) {
      return {
        stress_management: Math.floor(Math.random() * 40) + 60,
        emotional_regulation: Math.floor(Math.random() * 40) + 60,
        adaptability: Math.floor(Math.random() * 40) + 60,
        social_support: Math.floor(Math.random() * 40) + 60,
        total_score: Math.floor(Math.random() * 40) + 60
      };
    } else if (testName.includes('ADHD')) {
      return {
        attention: Math.floor(Math.random() * 40) + 60,
        hyperactivity: Math.floor(Math.random() * 40) + 60,
        impulsivity: Math.floor(Math.random() * 40) + 60,
        executive_function: Math.floor(Math.random() * 40) + 60,
        total_score: Math.floor(Math.random() * 40) + 60
      };
    }
    return { total_score: Math.floor(Math.random() * 40) + 60 };
  };

  const handleViewResults = () => {
    if (testResult) {
      navigate(`/results/${testResult.id}`);
    }
  };

  if (!testType) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">잘못된 접근입니다.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              돌아가기
            </Button>
            <div>
              <h1 className="font-semibold">{testType.name}</h1>
              <p className="text-sm text-muted-foreground">
                소요 시간: 약 {testType.duration_minutes}분
              </p>
            </div>
          </div>
          
          {testCompleted && (
            <Button onClick={handleViewResults}>
              <Download className="w-4 h-4 mr-2" />
              결과 보기
            </Button>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {!testCompleted ? (
          <div className="w-full h-[800px] border rounded-lg overflow-hidden shadow-lg">
            <iframe
              ref={iframeRef}
              src={testType.typebot_url}
              width="100%"
              height="100%"
              frameBorder="0"
              allowFullScreen
              title={testType.name}
              className="w-full h-full"
            />
          </div>
        ) : (
          <div className="max-w-2xl mx-auto text-center py-16">
            <div className="mb-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">검사 완료!</h2>
              <p className="text-muted-foreground">
                {testType.name} 검사가 성공적으로 완료되었습니다.
              </p>
            </div>
            
            <div className="space-y-4">
              <Button onClick={handleViewResults} size="lg" className="mr-4">
                <Download className="w-4 h-4 mr-2" />
                결과 확인하기
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/dashboard')}
              >
                대시보드로 돌아가기
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};