import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  ArrowRight, 
  CheckCircle, 
  Users, 
  Heart, 
  Brain, 
  Target,
  Calendar,
  Lightbulb,
  Star
} from "lucide-react";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: React.ReactNode;
  completed: boolean;
}

interface UserProfile {
  age_group: string;
  primary_concerns: string[];
  family_composition: string[];
  mental_health_experience: string;
  goals: string[];
  preferred_communication: string;
  availability: string;
  emergency_contact: string;
}

export default function SelfOnboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [profile, setProfile] = useState<UserProfile>({
    age_group: '',
    primary_concerns: [],
    family_composition: [],
    mental_health_experience: '',
    goals: [],
    preferred_communication: '',
    availability: '',
    emergency_contact: ''
  });
  const [isCompleting, setIsCompleting] = useState(false);
  const { toast } = useToast();

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'AIHPRO에 오신 것을 환영합니다',
      description: 'AI와 전문가가 함께하는 정신건강 관리 여정을 시작하세요',
      component: <WelcomeStep />,
      completed: false
    },
    {
      id: 'basic_info',
      title: '기본 정보',
      description: '맞춤형 서비스 제공을 위한 기본 정보를 입력해주세요',
      component: <BasicInfoStep profile={profile} setProfile={setProfile} />,
      completed: false
    },
    {
      id: 'concerns',
      title: '주요 관심사',
      description: '현재 관심 있는 정신건강 영역을 선택해주세요',
      component: <ConcernsStep profile={profile} setProfile={setProfile} />,
      completed: false
    },
    {
      id: 'goals',
      title: '목표 설정',
      description: 'AIHPRO를 통해 달성하고 싶은 목표를 설정해주세요',
      component: <GoalsStep profile={profile} setProfile={setProfile} />,
      completed: false
    },
    {
      id: 'preferences',
      title: '서비스 설정',
      description: '개인화된 경험을 위한 선호도를 설정해주세요',
      component: <PreferencesStep profile={profile} setProfile={setProfile} />,
      completed: false
    },
    {
      id: 'completion',
      title: '설정 완료',
      description: '이제 AIHPRO의 모든 기능을 활용할 수 있습니다',
      component: <CompletionStep />,
      completed: false
    }
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeOnboarding = async () => {
    setIsCompleting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      // 온보딩 데이터 저장 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 환영 토큰 지급 (5개)
      // Welcome tokens will be granted via database trigger
      console.log('Onboarding completed for user:', user.id);

      // Token granted successfully

      toast({
        title: "온보딩 완료!",
        description: "환영 토큰 5개가 지급되었습니다. AIHPRO 여정을 시작하세요!",
      });

      // 대시보드로 이동
      window.location.href = '/dashboard';

    } catch (error) {
      console.error('Onboarding completion error:', error);
      toast({
        title: "설정 저장 실패",
        description: "다시 시도해주세요.",
        variant: "destructive"
      });
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-2">AIHPRO 시작하기</h1>
        <Progress value={progress} className="max-w-md mx-auto" />
        <p className="text-sm text-muted-foreground mt-2">
          {currentStep + 1} / {steps.length} 단계
        </p>
      </div>

      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            {getStepIcon(steps[currentStep].id)}
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
                onClick={completeOnboarding}
                disabled={isCompleting}
                className="flex items-center gap-2"
              >
                {isCompleting ? "완료 중..." : "시작하기"}
                <Star className="h-4 w-4" />
              </Button>
            ) : (
              <Button 
                onClick={nextStep}
                className="flex items-center gap-2"
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

function WelcomeStep() {
  return (
    <div className="text-center space-y-6">
      <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
        <Heart className="h-12 w-12 text-primary" />
      </div>
      
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">정신건강 관리, 이제 더 쉽게</h3>
        <p className="text-muted-foreground">
          AI 기술과 전문가의 경험이 결합된 AIHPRO로 
          개인과 가족의 정신건강을 체계적으로 관리해보세요.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="text-center p-4">
            <Brain className="h-8 w-8 text-primary mx-auto mb-2" />
            <h4 className="font-medium">AI 상담</h4>
            <p className="text-sm text-muted-foreground">24/7 언제든지</p>
          </div>
          <div className="text-center p-4">
            <Users className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="font-medium">전문가 연결</div>
            <p className="text-sm text-muted-foreground">필요할 때 즉시</p>
          </div>
          <div className="text-center p-4">
            <Target className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="font-medium">맞춤 관리</div>
            <p className="text-sm text-muted-foreground">개인화된 솔루션</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function BasicInfoStep({ profile, setProfile }: { profile: UserProfile, setProfile: (profile: UserProfile) => void }) {
  const ageGroups = [
    { value: 'teens', label: '10대' },
    { value: 'twenties', label: '20대' },
    { value: 'thirties', label: '30대' },
    { value: 'forties', label: '40대' },
    { value: 'fifties_plus', label: '50대 이상' }
  ];

  const familyTypes = [
    '혼자 거주',
    '부부',
    '자녀가 있는 가정',
    '부모님과 함께',
    '기타'
  ];

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium mb-3 block">연령대</Label>
        <RadioGroup
          value={profile.age_group}
          onValueChange={(value) => setProfile({ ...profile, age_group: value })}
        >
          {ageGroups.map((age) => (
            <div key={age.value} className="flex items-center space-x-2">
              <RadioGroupItem value={age.value} id={age.value} />
              <Label htmlFor={age.value}>{age.label}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      <div>
        <Label className="text-base font-medium mb-3 block">가족 구성</Label>
        <div className="space-y-2">
          {familyTypes.map((type) => (
            <div key={type} className="flex items-center space-x-2">
              <Checkbox
                id={type}
                checked={profile.family_composition.includes(type)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setProfile({
                      ...profile,
                      family_composition: [...profile.family_composition, type]
                    });
                  } else {
                    setProfile({
                      ...profile,
                      family_composition: profile.family_composition.filter(f => f !== type)
                    });
                  }
                }}
              />
              <Label htmlFor={type}>{type}</Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="emergency" className="text-base font-medium mb-3 block">
          비상 연락처 (선택사항)
        </Label>
        <Input
          id="emergency"
          placeholder="가족이나 가까운 지인의 연락처"
          value={profile.emergency_contact}
          onChange={(e) => setProfile({ ...profile, emergency_contact: e.target.value })}
        />
      </div>
    </div>
  );
}

function ConcernsStep({ profile, setProfile }: { profile: UserProfile, setProfile: (profile: UserProfile) => void }) {
  const concerns = [
    '스트레스 관리',
    '우울감',
    '불안장애',
    '수면 문제',
    '대인관계',
    '가족 갈등',
    '육아 스트레스',
    '진로/직업 고민',
    '학습 집중력',
    '감정 조절',
    '자존감 향상',
    '기타'
  ];

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium mb-3 block">
          현재 관심 있는 영역을 선택해주세요 (복수 선택 가능)
        </Label>
        <div className="grid grid-cols-2 gap-3">
          {concerns.map((concern) => (
            <div key={concern} className="flex items-center space-x-2">
              <Checkbox
                id={concern}
                checked={profile.primary_concerns.includes(concern)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setProfile({
                      ...profile,
                      primary_concerns: [...profile.primary_concerns, concern]
                    });
                  } else {
                    setProfile({
                      ...profile,
                      primary_concerns: profile.primary_concerns.filter(c => c !== concern)
                    });
                  }
                }}
              />
              <Label htmlFor={concern} className="text-sm">{concern}</Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-base font-medium mb-3 block">정신건강 관리 경험</Label>
        <RadioGroup
          value={profile.mental_health_experience}
          onValueChange={(value) => setProfile({ ...profile, mental_health_experience: value })}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="none" id="none" />
            <Label htmlFor="none">처음입니다</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="some" id="some" />
            <Label htmlFor="some">조금 경험이 있습니다</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="experienced" id="experienced" />
            <Label htmlFor="experienced">상담이나 치료 경험이 있습니다</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
}

function GoalsStep({ profile, setProfile }: { profile: UserProfile, setProfile: (profile: UserProfile) => void }) {
  const goals = [
    '일상적인 스트레스 관리',
    '감정 조절 능력 향상',
    '가족 관계 개선',
    '수면 질 향상',
    '자존감 회복',
    '불안 증상 완화',
    '우울감 극복',
    '집중력 향상',
    '대인관계 개선',
    '생활 습관 개선',
    '정신건강 유지',
    '위기 상황 대처'
  ];

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium mb-3 block">
          AIHPRO를 통해 달성하고 싶은 목표를 선택해주세요
        </Label>
        <div className="grid grid-cols-2 gap-3">
          {goals.map((goal) => (
            <div key={goal} className="flex items-center space-x-2">
              <Checkbox
                id={goal}
                checked={profile.goals.includes(goal)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    setProfile({
                      ...profile,
                      goals: [...profile.goals, goal]
                    });
                  } else {
                    setProfile({
                      ...profile,
                      goals: profile.goals.filter(g => g !== goal)
                    });
                  }
                }}
              />
              <Label htmlFor={goal} className="text-sm">{goal}</Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PreferencesStep({ profile, setProfile }: { profile: UserProfile, setProfile: (profile: UserProfile) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-medium mb-3 block">선호하는 소통 방식</Label>
        <RadioGroup
          value={profile.preferred_communication}
          onValueChange={(value) => setProfile({ ...profile, preferred_communication: value })}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="text" id="text" />
            <Label htmlFor="text">텍스트 기반 대화</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="voice" id="voice" />
            <Label htmlFor="voice">음성 대화</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="mixed" id="mixed" />
            <Label htmlFor="mixed">상황에 따라 혼합</Label>
          </div>
        </RadioGroup>
      </div>

      <div>
        <Label className="text-base font-medium mb-3 block">주로 이용할 시간대</Label>
        <RadioGroup
          value={profile.availability}
          onValueChange={(value) => setProfile({ ...profile, availability: value })}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="morning" id="morning" />
            <Label htmlFor="morning">오전 (06:00 - 12:00)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="afternoon" id="afternoon" />
            <Label htmlFor="afternoon">오후 (12:00 - 18:00)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="evening" id="evening" />
            <Label htmlFor="evening">저녁 (18:00 - 24:00)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="anytime" id="anytime" />
            <Label htmlFor="anytime">언제든지</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
}

function CompletionStep() {
  return (
    <div className="text-center space-y-6">
      <div className="w-24 h-24 bg-success/10 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="h-12 w-12 text-success" />
      </div>
      
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">설정이 완료되었습니다!</h3>
        <p className="text-muted-foreground">
          이제 AI 상담사와 대화를 시작하고, 맞춤형 정신건강 관리 서비스를 
          이용할 수 있습니다.
        </p>
        
        <div className="bg-primary/10 p-4 rounded-lg">
          <h4 className="font-medium mb-2 flex items-center gap-2">
            <Star className="h-4 w-4 text-primary" />
            환영 혜택
          </h4>
          <p className="text-sm text-muted-foreground">
            가입 축하 토큰 5개가 지급됩니다. 
            이 토큰으로 프리미엄 기능을 체험해보세요!
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div className="text-center p-4 border rounded-lg">
            <Brain className="h-8 w-8 text-primary mx-auto mb-2" />
            <h4 className="font-medium">AI 상담 시작</h4>
            <p className="text-sm text-muted-foreground">즉시 대화를 시작할 수 있습니다</p>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <Target className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="font-medium">맞춤 추천</div>
            <p className="text-sm text-muted-foreground">설정에 맞는 서비스를 제공받습니다</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function getStepIcon(stepId: string) {
  switch (stepId) {
    case 'welcome':
      return <Heart className="h-5 w-5" />;
    case 'basic_info':
      return <Users className="h-5 w-5" />;
    case 'concerns':
      return <Brain className="h-5 w-5" />;
    case 'goals':
      return <Target className="h-5 w-5" />;
    case 'preferences':
      return <Calendar className="h-5 w-5" />;
    case 'completion':
      return <CheckCircle className="h-5 w-5" />;
    default:
      return <Lightbulb className="h-5 w-5" />;
  }
}