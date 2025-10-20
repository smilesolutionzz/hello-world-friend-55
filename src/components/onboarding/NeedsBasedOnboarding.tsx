import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  ArrowRight, 
  CheckCircle, 
  Users, 
  Heart, 
  Brain, 
  Target,
  Clock,
  Star,
  Crown,
  FileText,
  MessageCircle,
  UserCheck,
  Home,
  Briefcase,
  Baby,
  GraduationCap,
  Shield,
  Lightbulb
} from "lucide-react";

interface UserNeeds {
  primaryConcern: string;
  urgencyLevel: string;
  targetGroup: string;
  experienceLevel: string;
  preferredStyle: string;
  timeAvailability: string;
}

interface TestRecommendation {
  id: string;
  title: string;
  description: string;
  tokenCost: string;
  duration: string;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  icon: React.ReactNode;
  route: string;
  badge: string;
  badgeType: string;
  suitableFor: string[];
}

export default function NeedsBasedOnboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [userNeeds, setUserNeeds] = useState<UserNeeds>({
    primaryConcern: '',
    urgencyLevel: '',
    targetGroup: '',
    experienceLevel: '',
    preferredStyle: '',
    timeAvailability: ''
  });
  const [recommendations, setRecommendations] = useState<TestRecommendation[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  const testDatabase: TestRecommendation[] = [
    {
      id: 'quick-assessment',
      title: '3분 심리검사',
      description: '빠른 기본 심리상태 체크',
      tokenCost: '2토큰',
      duration: '3분',
      difficulty: 'basic',
      icon: <Clock className="w-5 h-5" />,
      route: '/assessment',
      badge: '시작',
      badgeType: 'popular',
      suitableFor: ['스트레스', '우울감', '불안', '일반적인 고민', '처음 이용']
    },
    {
      id: 'depression-test',
      title: '우울증 선별검사',
      description: '전문적인 우울증 진단 도구',
      tokenCost: '2토큰',
      duration: '10분',
      difficulty: 'intermediate',
      icon: <Heart className="w-5 h-5" />,
      route: '/assessment?type=depression',
      badge: '전문',
      badgeType: 'recommended',
      suitableFor: ['우울감', '기분장애', '정서문제', '중급자']
    },
    {
      id: 'anxiety-test',
      title: '불안장애 검사',
      description: '불안 증상 정도 측정',
      tokenCost: '2토큰',
      duration: '8분',
      difficulty: 'intermediate',
      icon: <Shield className="w-5 h-5" />,
      route: '/assessment?type=panic',
      badge: '필수',
      badgeType: 'hot',
      suitableFor: ['불안', '공황', '사회불안', '중급자']
    },
    {
      id: 'adhd-test',
      title: 'ADHD 자가진단',
      description: '주의력결핍 과잉행동장애 검사',
      tokenCost: '3토큰',
      duration: '12분',
      difficulty: 'intermediate',
      icon: <Brain className="w-5 h-5" />,
      route: '/assessment?type=adhd',
      badge: '집중력',
      badgeType: 'new',
      suitableFor: ['집중력 문제', '과잉행동', '아동', '성인ADHD']
    },
    {
      id: 'language-development',
      title: '언어발달 검사',
      description: '아동 언어 발달 평가',
      tokenCost: '3토큰',
      duration: '15분',
      difficulty: 'intermediate',
      icon: <GraduationCap className="w-5 h-5" />,
      route: '/assessment?type=language',
      badge: '발달',
      badgeType: 'package',
      suitableFor: ['언어발달', '아동', '육아']
    },
    {
      id: 'premium-comprehensive',
      title: '프리미엄 종합테스트',
      description: '전문가급 상세 심리분석',
      tokenCost: '8토큰',
      duration: '30분',
      difficulty: 'advanced',
      icon: <Crown className="w-5 h-5" />,
      route: '/premium-assessment',
      badge: '심화분석',
      badgeType: 'premium',
      suitableFor: ['심화분석', '종합평가', '전문상담 준비', '고급자']
    },
    {
      id: 'observation-log',
      title: '관찰일지 작성',
      description: '체계적인 행동 관찰 기록',
      tokenCost: '3토큰',
      duration: '지속적',
      difficulty: 'intermediate',
      icon: <FileText className="w-5 h-5" />,
      route: '/observation',
      badge: '습관형성',
      badgeType: 'new',
      suitableFor: ['행동관찰', '습관개선', '장기관리']
    },
    {
      id: 'ai-counselor',
      title: 'AI 상담사',
      description: '24시간 AI 심리상담',
      tokenCost: '무료',
      duration: '30분',
      difficulty: 'basic',
      icon: <MessageCircle className="w-5 h-5" />,
      route: '/ai-counselor',
      badge: '추천',
      badgeType: 'recommended',
      suitableFor: ['즉시상담', '대화치료', '감정지지', '모든 수준']
    }
  ];

  const generateRecommendations = (needs: UserNeeds) => {
    let recommended: TestRecommendation[] = [];
    
    // 1. 기본 3분 검사는 항상 추천 (처음 이용자)
    if (needs.experienceLevel === 'beginner') {
      recommended.push(testDatabase.find(t => t.id === 'quick-assessment')!);
    }

    // 2. 주요 관심사별 맞춤 추천
    switch (needs.primaryConcern) {
      case 'depression':
        recommended.push(
          testDatabase.find(t => t.id === 'depression-test')!,
          testDatabase.find(t => t.id === 'ai-counselor')!
        );
        break;
      case 'anxiety':
        recommended.push(
          testDatabase.find(t => t.id === 'anxiety-test')!,
          testDatabase.find(t => t.id === 'ai-counselor')!
        );
        break;
      case 'adhd':
        recommended.push(
          testDatabase.find(t => t.id === 'adhd-test')!,
          testDatabase.find(t => t.id === 'observation-log')!
        );
        break;
      case 'child-development':
        recommended.push(
          testDatabase.find(t => t.id === 'language-development')!,
          testDatabase.find(t => t.id === 'observation-log')!
        );
        break;
      case 'comprehensive':
        recommended.push(
          testDatabase.find(t => t.id === 'premium-comprehensive')!
        );
        break;
    }

    // 3. 긴급도에 따른 추가 추천
    if (needs.urgencyLevel === 'urgent') {
      if (!recommended.find(r => r.id === 'ai-counselor')) {
        recommended.push(testDatabase.find(t => t.id === 'ai-counselor')!);
      }
    }

    // 4. 경험 수준에 따른 조정
    if (needs.experienceLevel === 'advanced' && 
        !recommended.find(r => r.id === 'premium-comprehensive')) {
      recommended.push(testDatabase.find(t => t.id === 'premium-comprehensive')!);
    }

    // 중복 제거
    recommended = Array.from(new Set(recommended));
    
    return recommended.slice(0, 4); // 최대 4개 추천
  };

  const steps = [
    {
      title: '주요 관심사',
      description: '현재 가장 관심 있는 영역을 선택해주세요',
      component: <ConcernStep userNeeds={userNeeds} setUserNeeds={setUserNeeds} />
    },
    {
      title: '대상 그룹',
      description: '누구를 위한 검사인가요?',
      component: <TargetGroupStep userNeeds={userNeeds} setUserNeeds={setUserNeeds} />
    },
    {
      title: '경험 수준',
      description: '심리검사 경험이 어느 정도인가요?',
      component: <ExperienceStep userNeeds={userNeeds} setUserNeeds={setUserNeeds} />
    },
    {
      title: '맞춤 추천',
      description: '당신을 위한 최적의 테스트 패키지입니다',
      component: <RecommendationStep recommendations={recommendations} />
    }
  ];

  const nextStep = () => {
    if (currentStep === steps.length - 2) {
      // 추천 생성
      const newRecommendations = generateRecommendations(userNeeds);
      setRecommendations(newRecommendations);
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  const saveUserPreferences = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const preferences = {
        primary_concerns: [userNeeds.primaryConcern],
        health_goals: [userNeeds.primaryConcern], // 관심사를 목표로도 설정
        lifestyle_preferences: {
          target_group: userNeeds.targetGroup,
          experience_level: userNeeds.experienceLevel,
          urgency_level: userNeeds.urgencyLevel,
          preferred_style: userNeeds.preferredStyle,
          time_availability: userNeeds.timeAvailability
        },
        assessment_history: {}
      };

      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.user.id,
          ...preferences
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('사용자 선호도 저장 오류:', error);
      } else {
        console.log('✅ 사용자 선호도 저장 완료');
        toast({
          title: "설정 완료!",
          description: "맞춤형 미션이 준비됩니다.",
        });
      }
    } catch (error) {
      console.error('사용자 선호도 저장 실패:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2 text-foreground">맞춤형 테스트 추천</h1>
        <p className="text-muted-foreground mb-4">
          당신의 니즈에 맞는 최적의 심리검사를 찾아드립니다
        </p>
        <Progress value={progress} className="max-w-md mx-auto" />
        <p className="text-sm text-muted-foreground mt-2">
          {currentStep + 1} / {steps.length} 단계
        </p>
      </div>

      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Target className="w-6 h-6 text-primary" />
            {steps[currentStep].title}
          </CardTitle>
          <CardDescription>
            {steps[currentStep].description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {steps[currentStep].component}
          
          <div className="flex justify-between mt-8">
            <Button 
              onClick={prevStep} 
              disabled={currentStep === 0}
              variant="outline"
            >
              이전
            </Button>
            
            {currentStep === steps.length - 1 ? (
              <Button 
                onClick={async () => {
                  await saveUserPreferences();
                  navigate('/dashboard');
                }}
                className="flex items-center gap-2"
              >
                시작하기
                <Star className="h-4 w-4" />
              </Button>
            ) : (
              <Button 
                onClick={nextStep}
                className="flex items-center gap-2"
                disabled={!isStepComplete(currentStep, userNeeds)}
              >
                다음
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ConcernStep({ userNeeds, setUserNeeds }: { 
  userNeeds: UserNeeds, 
  setUserNeeds: (needs: UserNeeds) => void 
}) {
  const concerns = [
    {
      id: 'depression',
      title: '우울감',
      description: '기분이 우울하고 무기력해요',
      icon: <Heart className="w-6 h-6" />,
      color: 'bg-red-50 border-red-200 text-red-700'
    },
    {
      id: 'anxiety',
      title: '불안·걱정',
      description: '불안하고 걱정이 많아요',
      icon: <Shield className="w-6 h-6" />,
      color: 'bg-orange-50 border-orange-200 text-orange-700'
    },
    {
      id: 'stress',
      title: '스트레스',
      description: '일상적인 스트레스 관리가 필요해요',
      icon: <Brain className="w-6 h-6" />,
      color: 'bg-blue-50 border-blue-200 text-blue-700'
    },
    {
      id: 'adhd',
      title: '집중력 문제',
      description: '집중이 안 되고 산만해요',
      icon: <Target className="w-6 h-6" />,
      color: 'bg-purple-50 border-purple-200 text-purple-700'
    },
    {
      id: 'child-development',
      title: '아동 발달',
      description: '아이의 발달이 궁금해요',
      icon: <Baby className="w-6 h-6" />,
      color: 'bg-green-50 border-green-200 text-green-700'
    },
    {
      id: 'comprehensive',
      title: '종합 분석',
      description: '전반적인 통합건강 상태를 알고 싶어요',
      icon: <Crown className="w-6 h-6" />,
      color: 'bg-violet-50 border-violet-200 text-violet-700'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {concerns.map((concern) => (
        <Card 
          key={concern.id}
          className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
            userNeeds.primaryConcern === concern.id 
              ? 'ring-2 ring-primary border-primary' 
              : ''
          } ${concern.color}`}
          onClick={() => setUserNeeds({ ...userNeeds, primaryConcern: concern.id })}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                {concern.icon}
              </div>
              <div>
                <h3 className="font-semibold mb-1">{concern.title}</h3>
                <p className="text-sm opacity-80">{concern.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function TargetGroupStep({ userNeeds, setUserNeeds }: { 
  userNeeds: UserNeeds, 
  setUserNeeds: (needs: UserNeeds) => void 
}) {
  const groups = [
    {
      id: 'self',
      title: '본인',
      description: '나 자신을 위한 검사',
      icon: <UserCheck className="w-6 h-6" />
    },
    {
      id: 'child',
      title: '자녀 (유아/아동)',
      description: '5-12세 아이',
      icon: <Baby className="w-6 h-6" />
    },
    {
      id: 'teen',
      title: '자녀 (청소년)',
      description: '13-18세 청소년',
      icon: <GraduationCap className="w-6 h-6" />
    },
    {
      id: 'family',
      title: '가족 전체',
      description: '가족 구성원 모두',
      icon: <Users className="w-6 h-6" />
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {groups.map((group) => (
        <Card 
          key={group.id}
          className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
            userNeeds.targetGroup === group.id 
              ? 'ring-2 ring-primary border-primary' 
              : ''
          }`}
          onClick={() => setUserNeeds({ ...userNeeds, targetGroup: group.id })}
        >
          <CardContent className="p-6 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="text-primary">
                {group.icon}
              </div>
              <div>
                <h3 className="font-semibold mb-1">{group.title}</h3>
                <p className="text-sm text-muted-foreground">{group.description}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ExperienceStep({ userNeeds, setUserNeeds }: { 
  userNeeds: UserNeeds, 
  setUserNeeds: (needs: UserNeeds) => void 
}) {
  const experiences = [
    {
      id: 'beginner',
      title: '처음이에요',
      description: '심리검사를 처음 해봅니다',
      badge: '시작'
    },
    {
      id: 'intermediate',
      title: '조금 알아요',
      description: '간단한 검사 경험이 있습니다',
      badge: '중급'
    },
    {
      id: 'advanced',
      title: '경험이 많아요',
      description: '전문적인 검사를 원합니다',
      badge: '고급'
    }
  ];

  return (
    <RadioGroup
      value={userNeeds.experienceLevel}
      onValueChange={(value) => setUserNeeds({ ...userNeeds, experienceLevel: value })}
      className="space-y-3"
    >
      {experiences.map((exp) => (
        <Card key={exp.id} className="p-4">
          <div className="flex items-center space-x-3">
            <RadioGroupItem value={exp.id} id={exp.id} />
            <Label htmlFor={exp.id} className="flex-1 cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{exp.title}</h3>
                  <p className="text-sm text-muted-foreground">{exp.description}</p>
                </div>
                <Badge variant="outline">{exp.badge}</Badge>
              </div>
            </Label>
          </div>
        </Card>
      ))}
    </RadioGroup>
  );
}

function RecommendationStep({ recommendations }: { recommendations: TestRecommendation[] }) {
  const navigate = useNavigate();

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'hot': return 'bg-red-500 text-white';
      case 'new': return 'bg-green-500 text-white';
      case 'popular': return 'bg-blue-500 text-white';
      case 'recommended': return 'bg-purple-500 text-white';
      case 'premium': return 'bg-gradient-to-r from-purple-500 to-blue-500 text-white';
      case 'package': return 'bg-pink-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'basic': return 'text-green-600';
      case 'intermediate': return 'text-orange-600';
      case 'advanced': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold mb-2">🎯 맞춤 추천 결과</h3>
        <p className="text-muted-foreground">
          당신의 니즈에 최적화된 {recommendations.length}가지 테스트를 추천드립니다
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendations.map((test, index) => (
          <Card 
            key={test.id}
            className="hover:shadow-lg transition-all duration-200 cursor-pointer hover-glow"
            onClick={() => navigate(test.route)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="text-primary">
                    {test.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{test.title}</h4>
                    <p className="text-xs text-muted-foreground">{test.duration}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge className={`text-xs ${getBadgeVariant(test.badgeType)}`}>
                    {test.badge}
                  </Badge>
                  {index === 0 && (
                    <Badge variant="outline" className="text-xs">
                      최고 추천
                    </Badge>
                  )}
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground mb-3">
                {test.description}
              </p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-primary">
                    {test.tokenCost}
                  </span>
                  <span className={`text-xs ${getDifficultyColor(test.difficulty)}`}>
                    {test.difficulty === 'basic' ? '기초' : 
                     test.difficulty === 'intermediate' ? '중급' : '고급'}
                  </span>
                </div>
                <Button size="sm" variant="outline" className="text-xs">
                  시작하기
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 p-4 bg-muted/30 rounded-lg">
        <h4 className="font-medium mb-2 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-yellow-500" />
          추천 가이드
        </h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• 처음이신 분은 <strong>3분 검사</strong>부터 시작해보세요</li>
          <li>• 특정 증상이 있다면 <strong>전문 검사</strong>를 받아보세요</li>
          <li>• 종합적인 분석이 필요하다면 <strong>프리미엄 검사</strong>를 추천합니다</li>
          <li>• 지속적인 관리가 필요하다면 <strong>관찰일지</strong>를 활용하세요</li>
        </ul>
      </div>
    </div>
  );
}

function isStepComplete(step: number, userNeeds: UserNeeds): boolean {
  switch (step) {
    case 0: return !!userNeeds.primaryConcern;
    case 1: return !!userNeeds.targetGroup;
    case 2: return !!userNeeds.experienceLevel;
    case 3: return true;
    default: return false;
  }
}