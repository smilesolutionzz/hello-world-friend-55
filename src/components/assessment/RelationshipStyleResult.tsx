import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Heart, Share2, Download, CheckCircle, Users, MessageCircle, ShieldCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RelationshipStyleResultProps {
  result: {
    type: string;
    scores: Record<string, number>;
    result: {
      title: string;
      description: string;
      characteristics: string[];
      advice: string;
      color: string;
      icon: any;
    };
    answers: Record<number, string>;
  };
}

const RelationshipStyleResult = ({ result }: RelationshipStyleResultProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const IconComponent = result.result.icon;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: '관계 스타일 진단 결과',
          text: `나의 관계 스타일: ${result.result.title}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('공유 취소됨');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "링크가 복사되었습니다",
        description: "다른 사람들과 공유해보세요!",
      });
    }
  };

  const getScorePercentage = (type: string) => {
    const totalQuestions = Object.keys(result.answers).length;
    return Math.round((result.scores[type] / totalQuestions) * 100);
  };

  const improvements = [
    {
      title: "의사소통 개선하기",
      description: "상대방의 말을 끝까지 듣고 공감하는 연습을 해보세요.",
      difficulty: "쉬움"
    },
    {
      title: "감정 표현 연습하기",
      description: "자신의 감정을 정확히 인식하고 적절히 표현하는 방법을 배워보세요.",
      difficulty: "보통"
    },
    {
      title: "갈등 해결 스킬 학습",
      description: "건설적인 갈등 해결 방법을 배우고 실생활에 적용해보세요.",
      difficulty: "어려움"
    }
  ];

  const relatedTests = [
    {
      title: "애착 유형 검사",
      description: "어린 시절 형성된 애착 패턴 분석",
      path: "/assessment?test=attachment",
      duration: "5분"
    },
    {
      title: "자존감 측정",
      description: "건강한 관계의 기초인 자존감 체크",
      path: "/assessment?test=selfesteem",
      duration: "4분"
    },
    {
      title: "성격 5요인 검사",
      description: "관계에서 나타나는 성격 특성 파악",
      path: "/assessment?test=bigfive",
      duration: "5분"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-pink-500/10">
              <IconComponent className="w-8 h-8 text-pink-500" />
            </div>
            <h1 className="text-3xl font-bold">관계 스타일 진단 결과</h1>
          </div>
          <p className="text-muted-foreground">
            당신의 인간관계 패턴과 개선 방향을 확인해보세요
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* 주요 결과 */}
            <Card className="border-pink-200/50">
              <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <IconComponent className={`w-12 h-12 ${result.result.color}`} />
                  <CardTitle className={`text-2xl ${result.result.color}`}>
                    {result.result.title}
                  </CardTitle>
                </div>
                <p className="text-muted-foreground text-lg">
                  {result.result.description}
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      주요 특징
                    </h4>
                    <div className="grid gap-2">
                      {result.result.characteristics.map((char, index) => (
                        <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm">{char}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20">
                    <h4 className="font-semibold mb-2 text-pink-700 dark:text-pink-300">
                      💡 개선 조언
                    </h4>
                    <p className="text-sm text-pink-600 dark:text-pink-200">
                      {result.result.advice}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 상세 점수 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  관계 스타일 분석
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(result.scores).map(([type, score]) => {
                    const percentage = getScorePercentage(type);
                    const types = {
                      secure: { name: "안정형", color: "bg-green-500" },
                      anxious: { name: "불안형", color: "bg-orange-500" },
                      avoidant: { name: "회피형", color: "bg-blue-500" },
                      dismissive: { name: "무시형", color: "bg-purple-500" }
                    };
                    
                    return (
                      <div key={type} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="font-medium">{types[type as keyof typeof types].name}</span>
                          <span className="text-sm text-muted-foreground">{percentage}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-500 ${types[type as keyof typeof types].color}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* 개선 방법 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  관계 개선 방법
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {improvements.map((improvement, index) => (
                    <div key={index} className="p-4 rounded-lg border bg-muted/20">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{improvement.title}</h4>
                        <Badge variant={
                          improvement.difficulty === "쉬움" ? "default" :
                          improvement.difficulty === "보통" ? "secondary" : "destructive"
                        }>
                          {improvement.difficulty}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{improvement.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            {/* 액션 버튼 */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Button 
                    onClick={handleShare}
                    variant="outline" 
                    className="w-full"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    결과 공유하기
                  </Button>
                  <Button 
                    onClick={() => navigate('/ai-counselor?mode=relationship')}
                    className="w-full bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700"
                  >
                    <Heart className="w-4 h-4 mr-2" />
                    AI 관계 상담받기
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 추천 검사 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">추천 검사</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {relatedTests.map((test, index) => (
                  <div 
                    key={index}
                    className="p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => navigate(test.path)}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-medium text-sm">{test.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {test.duration}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{test.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* 전문가 상담 */}
            <Card className="bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20">
              <CardContent className="p-6 text-center">
                <Heart className="w-8 h-8 text-pink-500 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">전문가 상담</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  관계 전문 상담사와 1:1 상담을 받아보세요
                </p>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/experts?category=relationship')}
                  className="w-full"
                >
                  상담사 찾기
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Button 
            variant="outline"
            onClick={() => navigate('/relationship-package')}
            className="mr-4"
          >
            다른 관계 검사 보기
          </Button>
          <Button 
            onClick={() => navigate('/')}
          >
            홈으로 돌아가기
          </Button>
        </div>
      </div>
    </div>
  );
};

export { RelationshipStyleResult };