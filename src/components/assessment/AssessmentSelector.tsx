import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Crown, Camera, Heart, Zap, Brain, Target } from "lucide-react";
import { TOKEN_COSTS } from "@/constants/tokenCosts";

type TestType = 'psychological' | 'language' | 'panic' | 'depression' | 'adhd' | 'stress' | 'bigfive' | 'attachment' | 'career' | 'selfesteem' | 'dream' | 'saju';

interface AssessmentSelectorProps {
  onTestSelect: (testType: TestType) => void;
}

export const AssessmentSelector = ({ onTestSelect }: AssessmentSelectorProps) => {
  const assessmentTypes = [
    {
      id: 'psychological' as TestType,
      title: '3분 심리상태 체크',
      subtitle: '빠른 마음건강 진단',
      description: '연령대별 맞춤형 심리상태를 3분만에 확인하세요',
      cost: TOKEN_COSTS.PSYCHOLOGICAL_TEST,
      icon: Brain,
      color: 'from-purple-500 to-blue-500',
      badge: '인기',
      badgeColor: 'bg-red-500'
    },
    {
      id: 'language' as TestType,
      title: '언어발달 자가체크',
      subtitle: '우리 아이 언어발달 수준은?',
      description: '연령별 언어발달 단계를 체계적으로 진단합니다',
      cost: TOKEN_COSTS.LANGUAGE_TEST,
      icon: Camera,
      color: 'from-green-500 to-emerald-500',
      badge: '전문',
      badgeColor: 'bg-green-500'
    },
    {
      id: 'panic' as TestType,
      title: '불안감 수준 확인',
      subtitle: '나의 불안 정도는?',
      description: '불안장애 초기 증상을 체크하고 대처방법을 제시합니다',
      cost: TOKEN_COSTS.PANIC_TEST,
      icon: Heart,
      color: 'from-orange-500 to-red-500',
      badge: '빠른',
      badgeColor: 'bg-orange-500'
    },
    {
      id: 'depression' as TestType,
      title: '우울감 자가체크',
      subtitle: '마음의 우울함 측정',
      description: '우울증 초기 증상을 확인하고 전문적인 조언을 받아보세요',
      cost: TOKEN_COSTS.DEPRESSION_TEST,
      icon: Zap,
      color: 'from-blue-500 to-cyan-500',
      badge: '정확',
      badgeColor: 'bg-blue-500'
    },
    {
      id: 'adhd' as TestType,
      title: '주의집중력 자가체크',
      subtitle: 'ADHD 증상 확인',
      description: '주의력결핍 과잉행동장애 증상을 체계적으로 진단합니다',
      cost: TOKEN_COSTS.FOCUS_CHECK,
      icon: Target,
      color: 'from-yellow-500 to-orange-500',
      badge: '정밀',
      badgeColor: 'bg-yellow-500'
    },
    {
      id: 'stress' as TestType,
      title: '마음압박지수 측정',
      subtitle: '스트레스 수준 진단',
      description: '현재 겪고 있는 스트레스 정도를 측정하고 관리법을 제시합니다',
      cost: TOKEN_COSTS.PSYCHOLOGICAL_TEST,
      icon: Brain,
      color: 'from-purple-500 to-pink-500',
      badge: '실용',
      badgeColor: 'bg-purple-500'
    },
    {
      id: 'bigfive' as TestType,
      title: '5차원 성격 분석',
      subtitle: '과학적 성격 진단',
      description: '빅파이브 이론 기반의 정밀한 성격 분석을 제공합니다',
      cost: TOKEN_COSTS.PSYCHOLOGICAL_TEST,
      icon: Sparkles,
      color: 'from-indigo-500 to-purple-500',
      badge: '과학적',
      badgeColor: 'bg-indigo-500'
    },
    {
      id: 'attachment' as TestType,
      title: '관계유형 진단',
      subtitle: '애착 스타일 분석',
      description: '대인관계에서의 애착 패턴을 분석하고 개선방향을 제시합니다',
      cost: TOKEN_COSTS.PSYCHOLOGICAL_TEST,
      icon: Heart,
      color: 'from-pink-500 to-rose-500',
      badge: '관계',
      badgeColor: 'bg-pink-500'
    },
    {
      id: 'career' as TestType,
      title: '진로흥미 탐색',
      subtitle: '나에게 맞는 직업은?',
      description: '개인의 흥미와 성향을 분석하여 적합한 진로를 제안합니다',
      cost: TOKEN_COSTS.PSYCHOLOGICAL_TEST,
      icon: Target,
      color: 'from-teal-500 to-green-500',
      badge: '진로',
      badgeColor: 'bg-teal-500'
    },
    {
      id: 'selfesteem' as TestType,
      title: '자아가치 측정',
      subtitle: '나의 자존감 수준은?',
      description: '자존감 수준을 측정하고 건강한 자아관 형성을 도움니다',
      cost: TOKEN_COSTS.PSYCHOLOGICAL_TEST,
      icon: Crown,
      color: 'from-amber-500 to-yellow-500',
      badge: '자아',
      badgeColor: 'bg-amber-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-purple-50/20 to-blue-50/20">
      <div className="container mx-auto px-6 py-12">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            AIH 심리검사
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            과학적 근거를 바탕으로 한 전문적인 심리검사를 통해 나를 더 깊이 이해해보세요
          </p>
        </div>

        {/* 검사 카드 그리드 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {assessmentTypes.map((assessment) => {
            const IconComponent = assessment.icon;
            return (
              <Card 
                key={assessment.id}
                className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary/20"
                onClick={() => onTestSelect(assessment.id)}
              >
                {/* 배경 그라디언트 */}
                <div className={`absolute inset-0 bg-gradient-to-br ${assessment.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
                
                <CardHeader className="relative">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <IconComponent className="w-6 h-6 text-primary" />
                        <Badge 
                          variant="secondary" 
                          className={`${assessment.badgeColor} text-white text-xs`}
                        >
                          {assessment.badge}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg mb-1">
                        {assessment.title}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {assessment.subtitle}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {assessment.cost}
                      </div>
                      <div className="text-xs text-muted-foreground">토큰</div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="relative">
                  <p className="text-sm text-muted-foreground mb-4">
                    {assessment.description}
                  </p>
                  
                  <Button 
                    className="w-full"
                    variant="outline"
                  >
                    검사 시작하기
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* 특별 검사 섹션 */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">특별 검사</h2>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card 
              className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-yellow-500/20"
              onClick={() => onTestSelect('dream')}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500 to-orange-500 opacity-5 group-hover:opacity-10 transition-opacity" />
              
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Sparkles className="w-8 h-8 text-yellow-500" />
                  <div>
                    <CardTitle className="text-xl">꿈 해몽 분석</CardTitle>
                    <p className="text-sm text-muted-foreground">꿈이 전하는 메시지 해석</p>
                  </div>
                  <Badge className="bg-yellow-500 text-white ml-auto">특별</Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  당신의 꿈을 AI가 분석하여 숨겨진 의미와 심리상태를 알려드립니다
                </p>
                <Button className="w-full" variant="outline">
                  꿈 해몽하기
                </Button>
              </CardContent>
            </Card>

            <Card 
              className="relative overflow-hidden group hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-red-500/20"
              onClick={() => onTestSelect('saju')}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-pink-500 opacity-5 group-hover:opacity-10 transition-opacity" />
              
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Crown className="w-8 h-8 text-red-500" />
                  <div>
                    <CardTitle className="text-xl">사주 기반 심리분석</CardTitle>
                    <p className="text-sm text-muted-foreground">전통과 현대의 만남</p>
                  </div>
                  <Badge className="bg-red-500 text-white ml-auto">전통</Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  생년월일을 바탕으로 한 사주 정보와 현대 심리학을 결합한 분석
                </p>
                <Button className="w-full" variant="outline">
                  사주 분석하기
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 하단 안내 */}
        <div className="text-center mt-12 p-6 bg-muted/20 rounded-lg max-w-2xl mx-auto">
          <p className="text-sm text-muted-foreground">
            💡 <strong>검사 안내:</strong> 모든 검사는 과학적 근거를 바탕으로 설계되었으며, 
            결과는 참고용으로 활용하시기 바랍니다. 전문적인 상담이 필요한 경우 
            전문가와 상담받으실 것을 권장합니다.
          </p>
        </div>
      </div>
    </div>
  );
};