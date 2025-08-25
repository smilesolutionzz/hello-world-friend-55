import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Loader2, Heart, Utensils, Dumbbell, Leaf, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const constitutionInfo = {
  soyang: {
    name: '소양인',
    description: '열이 많고 활동적인 체질',
    color: 'bg-red-500',
    characteristics: [
      '체격이 중간 정도이며 어깨가 발달',
      '성격이 급하고 활발함',
      '열이 많아 찬 음식을 선호',
      '땀을 많이 흘림',
      '소화력이 좋음'
    ],
    diet: [
      '시원한 성질의 음식 섭취',
      '수박, 참외, 오이 등',
      '돼지고기, 해산물',
      '매운 음식 피하기'
    ],
    lifestyle: [
      '충분한 수분 섭취',
      '과격한 운동보다 가벼운 운동',
      '스트레스 관리 중요',
      '충분한 휴식'
    ]
  },
  soeum: {
    name: '소음인',
    description: '차가운 성질을 가진 섬세한 체질',
    color: 'bg-blue-500',
    characteristics: [
      '체격이 작고 마른 편',
      '성격이 내성적이고 신중',
      '소화기가 약함',
      '찬 것을 싫어함',
      '손발이 차가움'
    ],
    diet: [
      '따뜻한 성질의 음식 섭취',
      '닭고기, 양고기, 생강',
      '따뜻한 차류',
      '찬 음식, 날것 피하기'
    ],
    lifestyle: [
      '몸을 따뜻하게 유지',
      '규칙적인 식사',
      '적당한 운동으로 체력 증진',
      '스트레스 피하기'
    ]
  },
  taeyang: {
    name: '태양인',
    description: '기운이 위로 올라가는 진취적인 체질',
    color: 'bg-orange-500',
    characteristics: [
      '머리와 목 부위가 발달',
      '성격이 개방적이고 진취적',
      '폐기능이 강하고 간기능이 약함',
      '땀을 적게 흘림',
      '변비 경향'
    ],
    diet: [
      '해산물, 조개류',
      '싱싱한 채소와 과일',
      '기름진 음식 피하기',
      '술, 육류 제한'
    ],
    lifestyle: [
      '하체 강화 운동',
      '규칙적인 배변 습관',
      '겸손한 마음가짐',
      '과로 피하기'
    ]
  },
  taeeum: {
    name: '태음인',
    description: '기운이 아래로 가라앉는 침착한 체질',
    color: 'bg-green-500',
    characteristics: [
      '체격이 크고 살이 잘 찜',
      '성격이 침착하고 인내심이 강함',
      '소화력이 좋음',
      '땀을 많이 흘림',
      '순환기계가 약함'
    ],
    diet: [
      '담백한 음식 위주',
      '쇠고기, 콩류, 도라지',
      '기름진 음식 제한',
      '과식 피하기'
    ],
    lifestyle: [
      '꾸준한 유산소 운동',
      '체중 관리',
      '금연, 금주',
      '규칙적인 생활'
    ]
  }
};

interface SasangConstitutionResultProps {
  result: any;
  onRestart: () => void;
}

export const SasangConstitutionResult: React.FC<SasangConstitutionResultProps> = ({ 
  result, 
  onRestart 
}) => {
  const [analysis, setAnalysis] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    generateAnalysis();
  }, [result]);

  const generateAnalysis = async () => {
    try {
      const response = await supabase.functions.invoke('sasang-analyzer', {
        body: {
          constitution: result.constitution,
          scores: result.scores,
          answers: result.answers
        }
      });

      if (response.error) throw response.error;
      
      setAnalysis(response.data.analysis);
    } catch (error) {
      console.error('분석 생성 중 오류:', error);
      toast({
        title: "분석 오류",
        description: "AI 분석 중 오류가 발생했습니다. 기본 결과를 표시합니다.",
        variant: "destructive"
      });
      setAnalysis('기본 체질 분석 결과입니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const constitutionData = constitutionInfo[result.constitution as keyof typeof constitutionInfo];
  
  if (!constitutionData) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="text-center py-8">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-destructive" />
          <p>체질 분석 결과를 불러올 수 없습니다.</p>
          <Button onClick={onRestart} className="mt-4">다시 검사하기</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* 주요 결과 */}
      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Badge className={`${constitutionData.color} text-white text-lg px-6 py-2`}>
              {constitutionData.name}
            </Badge>
          </div>
          <CardTitle className="text-2xl">사상체질 진단 결과</CardTitle>
          <CardDescription className="text-lg">
            {constitutionData.description}
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* 체질별 점수 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {Object.entries(result.scores).map(([type, score]) => (
              <div key={type} className="text-center">
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {constitutionInfo[type as keyof typeof constitutionInfo]?.name}
                </p>
                <Progress value={(score as number) / 24 * 100} className="mb-1" />
                <p className="text-xs text-muted-foreground">{score as number}/24</p>
              </div>
            ))}
          </div>

          {/* AI 분석 결과 */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-semibold mb-2 flex items-center">
              <Heart className="h-4 w-4 mr-2 text-red-500" />
              AI 맞춤 분석
            </h4>
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm">AI가 당신의 체질을 분석하고 있습니다...</span>
              </div>
            ) : (
              <p className="text-sm leading-relaxed whitespace-pre-line">{analysis}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 상세 정보 */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* 체질 특성 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Heart className="h-5 w-5 mr-2 text-red-500" />
              체질 특성
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {constitutionData.characteristics.map((item, index) => (
                <li key={index} className="text-sm flex items-start">
                  <span className="w-2 h-2 rounded-full bg-primary mt-2 mr-3 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* 식이 요법 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Utensils className="h-5 w-5 mr-2 text-green-500" />
              맞춤 식이요법
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {constitutionData.diet.map((item, index) => (
                <li key={index} className="text-sm flex items-start">
                  <span className="w-2 h-2 rounded-full bg-green-500 mt-2 mr-3 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* 생활 습관 */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Leaf className="h-5 w-5 mr-2 text-blue-500" />
              권장 생활습관
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {constitutionData.lifestyle.map((item, index) => (
                <div key={index} className="text-sm flex items-start">
                  <span className="w-2 h-2 rounded-full bg-blue-500 mt-2 mr-3 flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 액션 버튼 */}
      <div className="flex justify-center space-x-4">
        <Button variant="outline" onClick={onRestart}>
          다시 검사하기
        </Button>
        <Button onClick={() => window.print()}>
          결과 저장하기
        </Button>
      </div>
    </div>
  );
};