import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  ArrowRight, 
  Building, 
  School, 
  Hospital, 
  Users,
  Target,
  Star
} from "lucide-react";

interface InstitutionProfile {
  institutionType: string;
  institutionName: string;
  department: string;
  role: string;
  targetPopulation: string[];
  serviceType: string[];
  userCount: string;
  description: string;
}

export default function InstitutionOnboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [institutionProfile, setInstitutionProfile] = useState<InstitutionProfile>({
    institutionType: '',
    institutionName: '',
    department: '',
    role: '',
    targetPopulation: [],
    serviceType: [],
    userCount: '',
    description: ''
  });
  const { toast } = useToast();
  const navigate = useNavigate();

  const steps = [
    {
      title: '기관 정보',
      description: '소속 기관 정보를 입력해주세요',
      component: <InstitutionInfoStep profile={institutionProfile} setProfile={setInstitutionProfile} />
    },
    {
      title: '담당 업무',
      description: '귀하의 역할과 담당 업무를 알려주세요',
      component: <RoleStep profile={institutionProfile} setProfile={setInstitutionProfile} />
    },
    {
      title: '서비스 대상',
      description: '서비스 대상과 규모를 설정해주세요',
      component: <ServiceStep profile={institutionProfile} setProfile={setInstitutionProfile} />
    },
    {
      title: '활용 목적',
      description: '서비스 활용 목적을 상세히 설명해주세요',
      component: <PurposeStep profile={institutionProfile} setProfile={setInstitutionProfile} />
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

  const saveInstitutionProfile = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { error } = await supabase
        .from('institution_profiles')
        .upsert({
          user_id: user.user.id,
          institution_type: institutionProfile.institutionType,
          institution_name: institutionProfile.institutionName,
          department: institutionProfile.department,
          role: institutionProfile.role,
          target_population: institutionProfile.targetPopulation,
          service_types: institutionProfile.serviceType,
          expected_user_count: institutionProfile.userCount,
          usage_description: institutionProfile.description,
          status: 'pending_approval'
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('기관 프로필 저장 오류:', error);
        toast({
          title: "오류",
          description: "프로필 저장 중 오류가 발생했습니다.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "프로필 등록 완료!",
          description: "검토 후 기관용 서비스가 활성화됩니다.",
        });
        navigate('/institution-dashboard');
      }
    } catch (error) {
      console.error('기관 프로필 저장 실패:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-glow rounded-full flex items-center justify-center mx-auto mb-4">
          <Building className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold mb-2 text-foreground">기관 프로필 설정</h1>
        <p className="text-muted-foreground mb-4">
          기관 맞춤형 서비스를 위한 정보를 입력해주세요
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
                onClick={saveInstitutionProfile}
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

function InstitutionInfoStep({ profile, setProfile }: { 
  profile: InstitutionProfile, 
  setProfile: (profile: InstitutionProfile) => void 
}) {
  const institutionTypes = [
    { id: 'school', label: '교육기관', icon: <School className="w-5 h-5" />, desc: '초중고등학교, 대학교' },
    { id: 'hospital', label: '의료기관', icon: <Hospital className="w-5 h-5" />, desc: '병원, 클리닉' },
    { id: 'counseling', label: '상담센터', icon: <Users className="w-5 h-5" />, desc: '상담센터, 복지관' },
    { id: 'government', label: '공공기관', icon: <Building className="w-5 h-5" />, desc: '보건소, 시청, 구청' },
    { id: 'company', label: '기업', icon: <Building className="w-5 h-5" />, desc: '일반기업, 복리후생' },
    { id: 'other', label: '기타', icon: <Building className="w-5 h-5" />, desc: '기타 기관' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-semibold">기관 유형</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
          {institutionTypes.map((type) => (
            <Card 
              key={type.id}
              className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
                profile.institutionType === type.id 
                  ? 'ring-2 ring-primary border-primary bg-primary/5' 
                  : ''
              }`}
              onClick={() => setProfile({ ...profile, institutionType: type.id })}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {type.icon}
                  <div>
                    <div className="font-medium">{type.label}</div>
                    <div className="text-sm text-muted-foreground">{type.desc}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="institutionName">기관명</Label>
          <Input
            id="institutionName"
            placeholder="예: OO초등학교, OO병원"
            value={profile.institutionName}
            onChange={(e) => setProfile({ ...profile, institutionName: e.target.value })}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="department">소속 부서/과</Label>
          <Input
            id="department"
            placeholder="예: 상담실, 정신건강의학과"
            value={profile.department}
            onChange={(e) => setProfile({ ...profile, department: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}

function RoleStep({ profile, setProfile }: { 
  profile: InstitutionProfile, 
  setProfile: (profile: InstitutionProfile) => void 
}) {
  const roles = [
    { id: 'counselor', label: '상담사/상담교사' },
    { id: 'psychologist', label: '심리사' },
    { id: 'doctor', label: '의료진' },
    { id: 'teacher', label: '교사' },
    { id: 'social_worker', label: '사회복지사' },
    { id: 'administrator', label: '관리자/책임자' },
    { id: 'researcher', label: '연구원' },
    { id: 'other', label: '기타' }
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-base font-semibold">담당 역할</Label>
        <RadioGroup 
          value={profile.role} 
          onValueChange={(value) => setProfile({ ...profile, role: value })}
        >
          <div className="grid grid-cols-2 gap-4">
            {roles.map((role) => (
              <div key={role.id} className="flex items-center space-x-2">
                <RadioGroupItem value={role.id} id={role.id} />
                <Label htmlFor={role.id} className="text-sm">{role.label}</Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      </div>
    </div>
  );
}

function ServiceStep({ profile, setProfile }: { 
  profile: InstitutionProfile, 
  setProfile: (profile: InstitutionProfile) => void 
}) {
  const populations = [
    { id: 'children', label: '아동 (5-12세)' },
    { id: 'adolescents', label: '청소년 (13-18세)' },
    { id: 'adults', label: '성인' },
    { id: 'families', label: '가족' },
    { id: 'employees', label: '직원/교직원' },
    { id: 'patients', label: '환자' }
  ];

  const serviceTypes = [
    { id: 'screening', label: '선별검사' },
    { id: 'assessment', label: '심리평가' },
    { id: 'counseling', label: '상담 서비스' },
    { id: 'education', label: '교육/연수' },
    { id: 'research', label: '연구 목적' },
    { id: 'monitoring', label: '정기 모니터링' }
  ];

  const togglePopulation = (pop: string) => {
    const newPops = profile.targetPopulation.includes(pop)
      ? profile.targetPopulation.filter(p => p !== pop)
      : [...profile.targetPopulation, pop];
    setProfile({ ...profile, targetPopulation: newPops });
  };

  const toggleService = (service: string) => {
    const newServices = profile.serviceType.includes(service)
      ? profile.serviceType.filter(s => s !== service)
      : [...profile.serviceType, service];
    setProfile({ ...profile, serviceType: newServices });
  };

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-base font-semibold">서비스 대상</Label>
        <div className="grid grid-cols-2 gap-2 mt-3">
          {populations.map((pop) => (
            <div key={pop.id} className="flex items-center space-x-2">
              <Checkbox 
                id={pop.id}
                checked={profile.targetPopulation.includes(pop.id)}
                onCheckedChange={() => togglePopulation(pop.id)}
              />
              <Label htmlFor={pop.id} className="text-sm">{pop.label}</Label>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label className="text-base font-semibold">서비스 유형</Label>
        <div className="grid grid-cols-2 gap-2 mt-3">
          {serviceTypes.map((service) => (
            <div key={service.id} className="flex items-center space-x-2">
              <Checkbox 
                id={service.id}
                checked={profile.serviceType.includes(service.id)}
                onCheckedChange={() => toggleService(service.id)}
              />
              <Label htmlFor={service.id} className="text-sm">{service.label}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="userCount">예상 이용자 수</Label>
        <RadioGroup 
          value={profile.userCount} 
          onValueChange={(value) => setProfile({ ...profile, userCount: value })}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="10-50" id="small" />
            <Label htmlFor="small">10-50명</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="50-200" id="medium" />
            <Label htmlFor="medium">50-200명</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="200-500" id="large" />
            <Label htmlFor="large">200-500명</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="500+" id="extra_large" />
            <Label htmlFor="extra_large">500명 이상</Label>
          </div>
        </RadioGroup>
      </div>
    </div>
  );
}

function PurposeStep({ profile, setProfile }: { 
  profile: InstitutionProfile, 
  setProfile: (profile: InstitutionProfile) => void 
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="description">서비스 활용 목적 및 계획</Label>
        <Textarea
          id="description"
          placeholder="서비스를 어떻게 활용하실 계획인지, 기대하는 효과는 무엇인지 구체적으로 작성해주세요."
          value={profile.description}
          onChange={(e) => setProfile({ ...profile, description: e.target.value })}
          rows={8}
        />
      </div>

      <div className="bg-muted/50 p-4 rounded-lg">
        <h4 className="font-semibold mb-2">설정 요약</h4>
        <div className="text-sm space-y-1">
          <p><strong>기관:</strong> {profile.institutionName || '미입력'}</p>
          <p><strong>서비스 대상:</strong> {profile.targetPopulation.length}개 그룹</p>
          <p><strong>서비스 유형:</strong> {profile.serviceType.length}개 선택</p>
          <p><strong>예상 이용자:</strong> {profile.userCount || '미선택'}</p>
        </div>
      </div>
    </div>
  );
}