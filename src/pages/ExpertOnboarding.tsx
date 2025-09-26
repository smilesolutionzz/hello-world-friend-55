import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  ArrowRight, 
  CheckCircle, 
  Stethoscope, 
  GraduationCap, 
  Award,
  Users,
  FileText,
  Target,
  Star
} from "lucide-react";

interface ExpertProfile {
  specialization: string[];
  license: string;
  experience: string;
  workPlace: string;
  targetAge: string[];
  expertiseArea: string[];
  introduction: string;
  availableHours: string;
}

export default function ExpertOnboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [expertProfile, setExpertProfile] = useState<ExpertProfile>({
    specialization: [],
    license: '',
    experience: '',
    workPlace: '',
    targetAge: [],
    expertiseArea: [],
    introduction: '',
    availableHours: ''
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  const steps = [
    {
      title: '전문 분야',
      description: '귀하의 전문 분야를 선택해주세요',
      component: <SpecializationStep profile={expertProfile} setProfile={setExpertProfile} />
    },
    {
      title: '자격 정보',
      description: '자격증 및 경력 정보를 입력해주세요',
      component: <QualificationStep profile={expertProfile} setProfile={setExpertProfile} />
    },
    {
      title: '상담 대상',
      description: '주로 상담하시는 연령대와 영역을 선택해주세요',
      component: <TargetStep profile={expertProfile} setProfile={setExpertProfile} />
    },
    {
      title: '프로필 완성',
      description: '전문가 프로필을 완성해주세요',
      component: <ProfileStep profile={expertProfile} setProfile={setExpertProfile} />
    }
  ];

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

  const progress = ((currentStep + 1) / steps.length) * 100;

  const saveExpertProfile = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { error } = await supabase
        .from('expert_profiles' as any)
        .upsert({
          user_id: user.user.id,
          specialization: expertProfile.specialization,
          license_info: expertProfile.license,
          experience_years: expertProfile.experience,
          workplace: expertProfile.workPlace,
          target_age_groups: expertProfile.targetAge,
          expertise_areas: expertProfile.expertiseArea,
          introduction: expertProfile.introduction,
          available_hours: expertProfile.availableHours,
          status: 'pending_approval'
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('전문가 프로필 저장 오류:', error);
        toast({
          title: "오류",
          description: "프로필 저장 중 오류가 발생했습니다.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "프로필 등록 완료!",
          description: "검토 후 전문가 승인이 이루어집니다.",
        });
        navigate('/expert-dashboard');
      }
    } catch (error) {
      console.error('전문가 프로필 저장 실패:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center mx-auto mb-4">
          <Stethoscope className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold mb-2 text-foreground">전문가 프로필 설정</h1>
        <p className="text-muted-foreground mb-4">
          전문가로서의 정보를 입력하여 맞춤형 서비스를 제공받으세요
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
                onClick={saveExpertProfile}
                className="flex items-center gap-2"
              >
                프로필 등록
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

function SpecializationStep({ profile, setProfile }: { 
  profile: ExpertProfile, 
  setProfile: (profile: ExpertProfile) => void 
}) {
  const specializations = [
    { id: 'clinical_psychologist', label: '임상심리사', icon: <Stethoscope className="w-5 h-5" /> },
    { id: 'counseling_psychologist', label: '상담심리사', icon: <Users className="w-5 h-5" /> },
    { id: 'child_psychologist', label: '아동심리전문가', icon: <GraduationCap className="w-5 h-5" /> },
    { id: 'psychiatrist', label: '정신과의사', icon: <Award className="w-5 h-5" /> },
    { id: 'social_worker', label: '정신보건사회복지사', icon: <Users className="w-5 h-5" /> },
    { id: 'educational_counselor', label: '전문상담교사', icon: <GraduationCap className="w-5 h-5" /> }
  ];

  const toggleSpecialization = (spec: string) => {
    const newSpecs = profile.specialization.includes(spec)
      ? profile.specialization.filter(s => s !== spec)
      : [...profile.specialization, spec];
    setProfile({ ...profile, specialization: newSpecs });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {specializations.map((spec) => (
          <Card 
            key={spec.id}
            className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
              profile.specialization.includes(spec.id) 
                ? 'ring-2 ring-primary border-primary bg-primary/5' 
                : ''
            }`}
            onClick={() => toggleSpecialization(spec.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                {spec.icon}
                <span className="font-medium">{spec.label}</span>
                {profile.specialization.includes(spec.id) && (
                  <CheckCircle className="w-4 h-4 text-primary ml-auto" />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function QualificationStep({ profile, setProfile }: { 
  profile: ExpertProfile, 
  setProfile: (profile: ExpertProfile) => void 
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="license">자격증 정보</Label>
        <Input
          id="license"
          placeholder="예: 임상심리사 1급, 상담심리사 1급"
          value={profile.license}
          onChange={(e) => setProfile({ ...profile, license: e.target.value })}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="experience">경력 기간</Label>
        <RadioGroup 
          value={profile.experience} 
          onValueChange={(value) => setProfile({ ...profile, experience: value })}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="1-3" id="exp1" />
            <Label htmlFor="exp1">1-3년</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="4-7" id="exp2" />
            <Label htmlFor="exp2">4-7년</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="8-15" id="exp3" />
            <Label htmlFor="exp3">8-15년</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="15+" id="exp4" />
            <Label htmlFor="exp4">15년 이상</Label>
          </div>
        </RadioGroup>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="workplace">근무지/소속</Label>
        <Input
          id="workplace"
          placeholder="예: OO병원, OO상담센터, 개인상담소"
          value={profile.workPlace}
          onChange={(e) => setProfile({ ...profile, workPlace: e.target.value })}
        />
      </div>
    </div>
  );
}

function TargetStep({ profile, setProfile }: { 
  profile: ExpertProfile, 
  setProfile: (profile: ExpertProfile) => void 
}) {
  const ageGroups = [
    { id: 'infant', label: '영유아 (0-5세)' },
    { id: 'child', label: '아동 (6-12세)' },
    { id: 'teen', label: '청소년 (13-18세)' },
    { id: 'adult', label: '성인 (19-64세)' },
    { id: 'senior', label: '노인 (65세+)' }
  ];

  const expertiseAreas = [
    { id: 'depression', label: '우울증' },
    { id: 'anxiety', label: '불안장애' },
    { id: 'adhd', label: 'ADHD/주의력결핍' },
    { id: 'trauma', label: '트라우마/PTSD' },
    { id: 'development', label: '발달장애' },
    { id: 'relationship', label: '대인관계' },
    { id: 'family', label: '가족상담' },
    { id: 'career', label: '진로상담' }
  ];

  const toggleAge = (age: string) => {
    const newAges = profile.targetAge.includes(age)
      ? profile.targetAge.filter(a => a !== age)
      : [...profile.targetAge, age];
    setProfile({ ...profile, targetAge: newAges });
  };

  const toggleExpertise = (area: string) => {
    const newAreas = profile.expertiseArea.includes(area)
      ? profile.expertiseArea.filter(a => a !== area)
      : [...profile.expertiseArea, area];
    setProfile({ ...profile, expertiseArea: newAreas });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-3">주요 상담 연령대</h3>
        <div className="grid grid-cols-2 gap-2">
          {ageGroups.map((age) => (
            <div key={age.id} className="flex items-center space-x-2">
              <Checkbox 
                id={age.id}
                checked={profile.targetAge.includes(age.id)}
                onCheckedChange={() => toggleAge(age.id)}
              />
              <Label htmlFor={age.id} className="text-sm">{age.label}</Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">전문 상담 영역</h3>
        <div className="grid grid-cols-2 gap-2">
          {expertiseAreas.map((area) => (
            <div key={area.id} className="flex items-center space-x-2">
              <Checkbox 
                id={area.id}
                checked={profile.expertiseArea.includes(area.id)}
                onCheckedChange={() => toggleExpertise(area.id)}
              />
              <Label htmlFor={area.id} className="text-sm">{area.label}</Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProfileStep({ profile, setProfile }: { 
  profile: ExpertProfile, 
  setProfile: (profile: ExpertProfile) => void 
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="introduction">자기소개</Label>
        <Textarea
          id="introduction"
          placeholder="상담 철학, 전문 경험, 내담자에게 전하고 싶은 메시지 등을 작성해주세요."
          value={profile.introduction}
          onChange={(e) => setProfile({ ...profile, introduction: e.target.value })}
          rows={6}
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="hours">상담 가능 시간</Label>
        <RadioGroup 
          value={profile.availableHours} 
          onValueChange={(value) => setProfile({ ...profile, availableHours: value })}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="morning" id="morning" />
            <Label htmlFor="morning">오전 (9-12시)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="afternoon" id="afternoon" />
            <Label htmlFor="afternoon">오후 (13-17시)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="evening" id="evening" />
            <Label htmlFor="evening">저녁 (18-21시)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="flexible" id="flexible" />
            <Label htmlFor="flexible">협의 가능</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="bg-muted/50 p-4 rounded-lg">
        <h4 className="font-semibold mb-2">프로필 요약</h4>
        <div className="text-sm space-y-1">
          <p><strong>전문분야:</strong> {profile.specialization.length}개 선택</p>
          <p><strong>상담대상:</strong> {profile.targetAge.length}개 연령대</p>
          <p><strong>전문영역:</strong> {profile.expertiseArea.length}개 영역</p>
        </div>
      </div>
    </div>
  );
}