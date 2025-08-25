import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import FunTestSelector from "@/components/assessment/FunTestSelector";
import PastLifeJobTest from "@/components/assessment/PastLifeJobTest";
import AnimalFaceTest from "@/components/assessment/AnimalFaceTest";
import InnerAnimalTest from "@/components/assessment/InnerAnimalTest";

type FunTestType = 'past-life-job' | 'animal-face-match' | 'inner-animal';

export default function FunTests() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [currentTest, setCurrentTest] = useState<FunTestType | null>(null);

  useEffect(() => {
    const testType = searchParams.get('type') as FunTestType;
    if (testType && ['past-life-job', 'animal-face-match', 'inner-animal'].includes(testType)) {
      setCurrentTest(testType);
    }
  }, [searchParams]);

  const handleTestSelect = (testType: string) => {
    setCurrentTest(testType as FunTestType);
    navigate(`/fun-tests?type=${testType}`, { replace: true });
  };

  const handleTestComplete = (result: any, testType: string) => {
    console.log('Fun test completed:', { result, testType });
    navigate('/fun-test-result', { 
      state: { result, testType },
      replace: true 
    });
  };

  const handleBack = () => {
    if (currentTest) {
      setCurrentTest(null);
      navigate('/fun-tests', { replace: true });
    } else {
      navigate('/');
    }
  };

  if (currentTest === 'past-life-job') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/20 to-warm-lavender/30 p-6">
        <div className="container mx-auto max-w-4xl">
          <PastLifeJobTest onComplete={handleTestComplete} onBack={handleBack} />
        </div>
      </div>
    );
  }

  if (currentTest === 'animal-face-match') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/20 to-warm-lavender/30 p-6">
        <div className="container mx-auto max-w-4xl">
          <AnimalFaceTest onComplete={handleTestComplete} onBack={handleBack} />
        </div>
      </div>
    );
  }

  if (currentTest === 'inner-animal') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/20 to-warm-lavender/30 p-6">
        <div className="container mx-auto max-w-4xl">
          <InnerAnimalTest onComplete={handleTestComplete} onBack={handleBack} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/20 to-warm-lavender/30">
      <div className="container mx-auto px-6 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-6 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            홈으로 돌아가기
          </Button>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-4">
              재미있는 3분 테스트 🎯
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              친구들과 함께 즐기는 AI 심리 테스트! 연령별 맞춤 추천으로 더욱 재미있게
            </p>
          </div>
        </div>

        {/* 테스트 선택 */}
        <FunTestSelector onTestSelect={handleTestSelect} />

        {/* 하단 안내 */}
        <div className="mt-12 text-center">
          <Card className="max-w-2xl mx-auto bg-white/50 backdrop-blur-sm border border-primary/20">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-3">🎉 더 전문적인 검사가 필요하다면?</h3>
              <p className="text-muted-foreground mb-4">
                한의학 기반 체질 분석이나 심리 상담 검사도 받아보세요
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/assessment')}
                  className="border-primary/30 hover:bg-primary/10"
                >
                  전문 심리검사 보러가기
                </Button>
                <Button 
                  onClick={() => navigate('/premium-assessment')}
                  className="bg-gradient-to-r from-primary to-primary/80"
                >
                  프리미엄 한의학 검사
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}