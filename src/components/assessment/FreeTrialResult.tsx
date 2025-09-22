import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Brain, Share2, Crown, Lock, ArrowRight, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FreeTrialResultProps {
  result: {
    level?: string;
    color?: string;
    bgColor?: string;
    borderColor?: string;
    description?: string;
    recommendations?: string[];
    personalityType?: any;
    traits?: any;
    pastLifeJob?: any;
    counts?: any;
    testType?: string;
  };
}

const FreeTrialResult = ({ result }: FreeTrialResultProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleShare = async () => {
    const shareText = `나의 심리테스트 결과를 확인해보세요!`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: '심리테스트 결과',
          text: shareText,
          url: window.location.href
        });
      } catch (error) {
        console.log('공유 취소됨');
      }
    } else {
      navigator.clipboard.writeText(`${shareText} ${window.location.href}`);
      toast({
        title: "링크 복사 완료",
        description: "결과 링크가 클립보드에 복사되었습니다.",
      });
    }
  };

  const handleUpgrade = () => {
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-500/10 to-blue-500/20 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Brain className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-brand-gradient">무료 체험 결과</h1>
          </div>
          <p className="text-muted-foreground">
            기본 분석 결과입니다. 회원가입하면 AI 초정밀 분석을 받으실 수 있어요!
          </p>
        </div>

        <div className="grid gap-6">
          {/* Basic Result Card */}
          <Card className="hover-glow transition-all duration-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl flex items-center gap-2">
                  📊 기본 분석 결과
                  <Badge className="bg-gray-100 text-gray-600 text-xs">
                    무료 버전
                  </Badge>
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {result.level && (
                <div className={`p-4 rounded-lg ${result.bgColor} ${result.borderColor} border`}>
                  <h3 className={`text-lg font-semibold mb-2 ${result.color}`}>
                    {result.level}
                  </h3>
                  <p className="text-gray-700 mb-4">{result.description}</p>
                  
                  {result.recommendations && (
                    <div>
                      <h4 className="font-medium mb-2">기본 권장사항:</h4>
                      <ul className="space-y-1">
                        {result.recommendations.slice(0, 2).map((rec, index) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {result.personalityType && (
                <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                  <h3 className="text-lg font-semibold mb-2 text-purple-700">
                    {result.personalityType.type}
                  </h3>
                  <p className="text-gray-700 mb-4">{result.personalityType.description}</p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2 text-purple-600">주요 특성:</h4>
                      <ul className="space-y-1">
                        {result.personalityType.strengths?.slice(0, 2).map((strength: string, index: number) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                            {strength}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2 text-purple-600">발전 방향:</h4>
                      <ul className="space-y-1">
                        {result.personalityType.tips?.slice(0, 2).map((tip: string, index: number) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                            {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {result.pastLifeJob && (
                <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                  <h3 className="text-lg font-semibold mb-2 text-amber-700 flex items-center gap-2">
                    <Crown className="w-5 h-5" />
                    {result.pastLifeJob.job}
                  </h3>
                  <p className="text-gray-700 mb-3">{result.pastLifeJob.description}</p>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium mb-1 text-amber-600">시대적 배경:</h4>
                      <p className="text-sm text-gray-600">{result.pastLifeJob.era}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2 text-amber-600">주요 특성:</h4>
                      <div className="grid grid-cols-2 gap-1">
                        {result.pastLifeJob.traits?.slice(0, 4).map((trait: string, index: number) => (
                          <div key={index} className="text-sm text-gray-600 flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 flex-shrink-0"></div>
                            {trait}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-amber-100 p-3 rounded-lg">
                      <h4 className="font-medium mb-1 text-amber-700">현재와의 연결점:</h4>
                      <p className="text-sm text-amber-700">{result.pastLifeJob.modernConnection}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upgrade CTA Card */}
          <Card className="relative overflow-hidden border-2 border-transparent bg-clip-border">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-lg"></div>
            <div className="relative z-10">
              <CardHeader>
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Crown className="w-8 h-8 text-yellow-500" />
                  <CardTitle className="text-xl text-center bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                    AI 초정밀 전문가급 해석 받기
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="text-center space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        NOW
                      </div>
                      현재 무료 해석
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-2">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                        기본적인 점수 분석
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                        일반적인 결과 요약
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                        표면적 권장사항
                      </li>
                    </ul>
                  </div>
                  
                  <div className="p-4 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-xl border-2 border-transparent bg-clip-border relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-xl"></div>
                    <div className="relative z-10">
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          PRO
                        </div>
                        <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          AI 초정밀 해석
                        </span>
                      </h4>
                      <ul className="text-sm space-y-2">
                        <li className="flex items-center gap-2">
                          <Star className="w-3 h-3 text-yellow-500" />
                          <span className="font-medium text-blue-700">2000자+ 상세 분석</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Star className="w-3 h-3 text-yellow-500" />
                          <span className="font-medium text-purple-700">전문가급 해석</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Star className="w-3 h-3 text-yellow-500" />
                          <span className="font-medium text-pink-700">개인 맞춤 솔루션</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <Star className="w-3 h-3 text-yellow-500" />
                          <span className="font-medium text-blue-700">심층 심리 분석</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
                  <p className="text-sm text-amber-800">
                    ✨ <strong>지금 회원가입하면</strong> 이 테스트도 <strong className="text-amber-900">AI 초정밀 해석</strong>으로 다시 받아보실 수 있어요!
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button 
                    onClick={handleUpgrade}
                    className="flex-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:opacity-90 text-white"
                    size="lg"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    AI 초정밀 해석 받기
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  
                  <Button 
                    onClick={handleShare}
                    variant="outline"
                    className="flex-1"
                    size="lg"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    결과 공유하기
                  </Button>
                </div>
              </CardContent>
            </div>
          </Card>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              variant="outline"
              onClick={() => navigate('/free-trial')}
              className="flex-1 max-w-xs"
            >
              다른 무료 테스트 해보기
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate('/')}
              className="flex-1 max-w-xs"
            >
              홈으로 돌아가기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreeTrialResult;