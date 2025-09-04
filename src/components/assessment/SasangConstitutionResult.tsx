import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Loader2, Heart, Utensils, Dumbbell, Leaf, AlertCircle, Copy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useShareText, formatMedicalTestResult } from '@/utils/shareUtils';

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
  const { shareAsText } = useShareText();

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

  const handleShareText = () => {
    const formattedText = formatMedicalTestResult('sasang_constitution', result);
    shareAsText(formattedText, `사상체질 진단 결과`);
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

          {/* AI 분석 결과 - 대폭 확장 */}
          <div className="bg-muted/50 rounded-lg p-6">
            <h4 className="text-xl font-semibold mb-4 flex items-center">
              <Heart className="h-5 w-5 mr-2 text-red-500" />
              ✨ AI 전문 한의학 분석
            </h4>
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm">AI가 당신의 체질을 분석하고 있습니다...</span>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                  <h5 className="text-lg font-semibold text-purple-800 mb-4">🔍 상세 체질 분석</h5>
                  <div className="prose prose-purple max-w-none">
                    <p className="text-base leading-relaxed text-gray-800 whitespace-pre-line">
                      {result.constitution === "soyang" 
                        ? `당신의 체질은 소양인입니다. 소양인은 상체가 발달하고 하체가 약한 체형으로, 열이 많고 활동적인 특성을 가지고 있습니다.

**7가지 구체적 건강 관리법:**
• **체온 조절**: 몸에 열이 많으므로 시원한 환경 유지하고 찬 성질의 음식 섭취
• **수분 관리**: 하루 2-3리터 충분한 수분 섭취로 체내 열기 조절
• **운동 조절**: 과격한 운동보다 수영, 요가 등 부드러운 운동 선택
• **식이 조절**: 돼지고기, 해산물, 수박, 참외 등 차가운 성질 음식 위주
• **스트레스 관리**: 급한 성격으로 인한 스트레스 완화를 위한 명상과 휴식
• **하체 강화**: 약한 하체 근력 보강을 위한 스쿼트, 걷기 운동
• **수면 관리**: 충분한 수면으로 과도한 활동성 조절하고 체력 회복

**주의사항**: 매운 음식, 뜨거운 음식, 과도한 운동은 피하고, 감정 조절에 특히 신경 쓰시기 바랍니다.

**재평가 권장:** 체질에 맞는 생활습관 적용 후 3-6개월 뒤 체질 상태와 건강 변화를 재점검하시기 바랍니다.`
                        : result.constitution === "soeum" 
                        ? `당신의 체질은 소음인입니다. 소음인은 체격이 작고 마른 편이며, 차가운 성질을 가진 섬세하고 신중한 체질입니다.

**7가지 구체적 건강 관리법:**
• **체온 유지**: 몸이 차가우므로 항상 따뜻하게 몸을 유지하고 보온에 신경
• **따뜻한 식품**: 생강, 계피, 닭고기, 양고기 등 따뜻한 성질의 음식 섭취
• **소화 관리**: 소화기가 약하므로 소량씩 자주 먹고 따뜻한 음식 위주
• **점진적 운동**: 체력이 약하므로 가벼운 운동부터 시작하여 점진적 증가
• **스트레스 회피**: 내성적 성격으로 스트레스에 민감하므로 안정적 환경 유지
• **규칙적 생활**: 일정한 생활 패턴으로 약한 체력 보강하고 면역력 증진
• **정신 건강**: 우울감이나 불안감 예방을 위한 긍정적 사고와 사회적 관계

**주의사항**: 찬 음식, 날것, 과로는 피하고, 충분한 휴식과 따뜻한 환경을 유지하시기 바랍니다.

**재평가 권장:** 따뜻한 체질 관리 후 3-6개월 뒤 소화력과 전반적 체력 향상 정도를 재점검하시기 바랍니다.`
                        : result.constitution === "taeyang"
                        ? `당신의 체질은 태양인입니다. 태양인은 머리와 목 부위가 발달하고 기운이 위로 올라가는 진취적이고 개방적인 체질입니다.

**7가지 구체적 건강 관리법:**
• **하체 강화**: 상체에 비해 약한 하체와 허리 근력 보강 운동 집중
• **해산물 섭취**: 조개류, 새우, 게 등 바다에서 나는 싱싱한 해산물 위주
• **배변 관리**: 변비 경향이 있으므로 섬유질 섭취와 규칙적 배변 습관
• **겸손한 마음**: 진취적 성격으로 인한 오만함 조절하고 겸손한 자세 유지
• **금주/금육**: 술과 기름진 육류는 간에 부담을 주므로 제한적 섭취
• **충분한 휴식**: 과도한 활동으로 인한 피로 누적 방지를 위한 충분한 휴식
• **수분 섭취**: 변비 예방과 체내 순환 개선을 위한 적절한 수분 섭취

**주의사항**: 기름진 음식, 과도한 음주, 스트레스는 피하고, 하체 운동과 정신적 안정에 특히 신경 쓰시기 바랍니다.

**재평가 권장:** 하체 강화와 식이 조절 후 3-6개월 뒤 소화력과 순환기능 개선 정도를 재점검하시기 바랍니다.`
                        : `당신의 체질은 태음인입니다. 태음인은 체격이 크고 기운이 아래로 가라앉는 침착하고 인내심이 강한 체질입니다.

**7가지 구체적 건강 관리법:**
• **체중 관리**: 살이 잘 찌는 체질이므로 규칙적인 유산소 운동으로 체중 조절
• **담백한 식단**: 쇠고기, 콩류, 도라지 등 담백하고 기름기 적은 음식 위주
• **꾸준한 운동**: 순환기계 강화를 위한 걷기, 조깅, 수영 등 지속적 운동
• **금연/금주**: 순환기계에 부담을 주는 담배와 술은 반드시 금하기
• **감정 관리**: 침착한 성격이지만 억압된 감정 해소를 위한 표현 방법 찾기
• **규칙적 식사**: 소화력이 좋아 과식하기 쉬우므로 적당량 규칙적 식사
• **충분한 수면**: 체력 회복과 신진대사 정상화를 위한 7-8시간 충분한 수면

**주의사항**: 기름진 음식, 과식, 운동 부족은 피하고, 꾸준한 체중 관리와 순환기 건강에 특히 신경 쓰시기 바랍니다.

**재평가 권장:** 체중 관리와 운동 습관 형성 후 3-6개월 뒤 순환기 기능과 전반적 건강 상태를 재점검하시기 바랍니다.`}
                    </p>
                  </div>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-line">{analysis}</p>
              </div>
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
      <div className="flex flex-col gap-3">
        <div className="flex justify-center space-x-4">
          <Button variant="outline" onClick={onRestart}>
            다시 검사하기
          </Button>
          <Button onClick={() => window.print()}>
            결과 저장하기
          </Button>
        </div>
        <div className="flex justify-center">
          <Button onClick={handleShareText} variant="secondary" size="lg" className="w-full max-w-md">
            <Copy className="w-4 h-4 mr-2" />
            📋 텍스트로 복사하기
          </Button>
        </div>
      </div>
    </div>
  );
};