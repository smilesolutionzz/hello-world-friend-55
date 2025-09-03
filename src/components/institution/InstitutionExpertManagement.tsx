import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  UserPlus, 
  Search, 
  Star, 
  MapPin, 
  Clock, 
  DollarSign,
  Users,
  MessageCircle,
  CheckCircle,
  XCircle,
  Calendar,
  UserCheck,
  Award,
  Building
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Expert {
  id: string;
  full_name: string;
  professional_title: string;
  specializations: string[];
  hourly_rate: number;
  years_experience: number;
  average_rating: number;
  total_sessions: number;
  is_verified: boolean;
  is_available: boolean;
  bio?: string;
  profile_image_url?: string;
  languages: string[];
  consultation_methods: string[];
}

interface InstitutionExpert {
  id: string;
  expert_id: string;
  position: string;
  hourly_rate: number;
  employment_type: string;
  years_at_institution: number;
  is_primary_contact: boolean;
  available_days: string[];
  available_hours: string;
  created_at: string;
  expert?: Expert;
}

interface InstitutionExpertManagementProps {
  institutionId: string;
}

export function InstitutionExpertManagement({ institutionId }: InstitutionExpertManagementProps) {
  const { toast } = useToast();
  const [experts, setExperts] = useState<Expert[]>([]);
  const [institutionExperts, setInstitutionExperts] = useState<InstitutionExpert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showHireDialog, setShowHireDialog] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [activeTab, setActiveTab] = useState('current');

  // 고용 폼 상태
  const [hireForm, setHireForm] = useState({
    position: '',
    hourly_rate: 0,
    employment_type: 'part_time',
    is_primary_contact: false,
    available_days: [] as string[],
    available_hours: ''
  });

  useEffect(() => {
    if (institutionId) {
      loadData();
    }
  }, [institutionId]);

  const loadData = async () => {
    setLoading(true);
    await Promise.all([
      loadAvailableExperts(),
      loadInstitutionExperts()
    ]);
    setLoading(false);
  };

  const loadAvailableExperts = async () => {
    try {
      const { data, error } = await supabase
        .from('experts')
        .select('*')
        .eq('is_verified', true)
        .eq('is_available', true)
        .order('average_rating', { ascending: false });

      if (error) throw error;
      setExperts(data || []);
    } catch (error: any) {
      console.error('Error loading experts:', error);
      toast({
        title: "전문가 목록 로딩 실패",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const loadInstitutionExperts = async () => {
    try {
      // 먼저 기관 전문가 목록 가져오기
      const { data: institutionExpertsData, error: institutionError } = await supabase
        .from('institution_experts')
        .select('*')
        .eq('institution_id', institutionId);

      if (institutionError) throw institutionError;

      if (!institutionExpertsData || institutionExpertsData.length === 0) {
        setInstitutionExperts([]);
        return;
      }

      // 전문가 ID 목록으로 전문가 정보 가져오기
      const expertIds = institutionExpertsData.map(ie => ie.expert_id);
      const { data: expertsData, error: expertsError } = await supabase
        .from('experts')
        .select('*')
        .in('id', expertIds);

      if (expertsError) throw expertsError;

      // 데이터 결합
      const combinedData = institutionExpertsData.map(institutionExpert => {
        const expert = expertsData?.find(e => e.id === institutionExpert.expert_id);
        return {
          ...institutionExpert,
          expert: expert || undefined
        };
      });

      setInstitutionExperts(combinedData);
    } catch (error: any) {
      console.error('Error loading institution experts:', error);
      toast({
        title: "기관 전문가 목록 로딩 실패",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleHireExpert = async () => {
    if (!selectedExpert) return;

    try {
      const { error } = await supabase
        .from('institution_experts')
        .insert({
          institution_id: institutionId,
          expert_id: selectedExpert.id,
          position: hireForm.position,
          hourly_rate: hireForm.hourly_rate,
          employment_type: hireForm.employment_type,
          is_primary_contact: hireForm.is_primary_contact,
          available_days: hireForm.available_days,
          available_hours: hireForm.available_hours,
          specializations: selectedExpert.specializations,
          years_at_institution: 0
        });

      if (error) throw error;

      toast({
        title: "전문가 고용 성공",
        description: `${selectedExpert.full_name} 전문가를 성공적으로 고용했습니다.`,
      });

      setShowHireDialog(false);
      setSelectedExpert(null);
      setHireForm({
        position: '',
        hourly_rate: 0,
        employment_type: 'part_time',
        is_primary_contact: false,
        available_days: [],
        available_hours: ''
      });

      await loadInstitutionExperts();
    } catch (error: any) {
      console.error('Error hiring expert:', error);
      toast({
        title: "전문가 고용 실패",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRemoveExpert = async (institutionExpertId: string) => {
    try {
      const { error } = await supabase
        .from('institution_experts')
        .delete()
        .eq('id', institutionExpertId);

      if (error) throw error;

      toast({
        title: "전문가 해제 성공",
        description: "전문가를 성공적으로 해제했습니다.",
      });

      await loadInstitutionExperts();
    } catch (error: any) {
      console.error('Error removing expert:', error);
      toast({
        title: "전문가 해제 실패",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const openHireDialog = (expert: Expert) => {
    setSelectedExpert(expert);
    setHireForm({
      ...hireForm,
      hourly_rate: expert.hourly_rate
    });
    setShowHireDialog(true);
  };

  const filteredExperts = experts.filter(expert =>
    expert.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expert.specializations.some(spec => 
      spec.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const weekDays = [
    { value: 'monday', label: '월요일' },
    { value: 'tuesday', label: '화요일' },
    { value: 'wednesday', label: '수요일' },
    { value: 'thursday', label: '목요일' },
    { value: 'friday', label: '금요일' },
    { value: 'saturday', label: '토요일' },
    { value: 'sunday', label: '일요일' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <UserCheck className="h-6 w-6" />
            전문가 고용 관리
          </h2>
          <p className="text-muted-foreground">
            기관에서 직접 전문가를 고용하고 관리하세요
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="current">현재 고용된 전문가</TabsTrigger>
          <TabsTrigger value="available">고용 가능한 전문가</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                현재 고용된 전문가 ({institutionExperts.length}명)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {institutionExperts.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">고용된 전문가가 없습니다</h3>
                  <p className="text-muted-foreground mb-4">
                    전문가를 고용하여 기관의 서비스를 확장하세요
                  </p>
                  <Button onClick={() => setActiveTab('available')}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    전문가 고용하기
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {institutionExperts.map((institutionExpert) => (
                    <Card key={institutionExpert.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={institutionExpert.expert?.profile_image_url} />
                            <AvatarFallback>
                              {institutionExpert.expert?.full_name?.[0] || 'X'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium">{institutionExpert.expert?.full_name || '전문가 정보 없음'}</h4>
                            <p className="text-sm text-muted-foreground">
                              {institutionExpert.position} • {institutionExpert.employment_type}
                            </p>
                            {institutionExpert.expert && (
                              <>
                                <div className="flex items-center gap-2 mt-1">
                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                  <span className="text-sm">{institutionExpert.expert.average_rating}</span>
                                  <span className="text-sm text-muted-foreground">
                                    ({institutionExpert.expert.total_sessions}회 상담)
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {institutionExpert.expert.specializations.map((spec) => (
                                    <Badge key={spec} variant="secondary" className="text-xs">
                                      {spec}
                                    </Badge>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            {institutionExpert.hourly_rate.toLocaleString()}원/시간
                          </p>
                          <p className="text-sm text-muted-foreground">
                            근무일: {institutionExpert.available_days?.join(', ') || '미설정'}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            시간: {institutionExpert.available_hours || '미설정'}
                          </p>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="mt-2"
                            onClick={() => handleRemoveExpert(institutionExpert.id)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            해제
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="available" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                고용 가능한 전문가
              </CardTitle>
              <CardDescription>
                검증된 전문가들을 기관에 고용할 수 있습니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <Input
                    placeholder="전문가 이름이나 전문분야로 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4">
                {filteredExperts.map((expert) => (
                  <Card key={expert.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={expert.profile_image_url} />
                          <AvatarFallback>{expert.full_name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <h4 className="font-medium flex items-center gap-2">
                            {expert.full_name}
                            {expert.is_verified && (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {expert.professional_title} • {expert.years_experience}년 경력
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm">{expert.average_rating}</span>
                            <span className="text-sm text-muted-foreground">
                              ({expert.total_sessions}회 상담)
                            </span>
                          </div>
                          {expert.bio && (
                            <p className="text-sm text-muted-foreground mt-1 max-w-md">
                              {expert.bio}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-1 mt-2">
                            {expert.specializations.map((spec) => (
                              <Badge key={spec} variant="secondary" className="text-xs">
                                {spec}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {expert.hourly_rate.toLocaleString()}원/시간
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {expert.languages.join(', ')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {expert.consultation_methods.join(', ')}
                        </p>
                        <Button
                          className="mt-2"
                          onClick={() => openHireDialog(expert)}
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          고용하기
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 전문가 고용 다이얼로그 */}
      <Dialog open={showHireDialog} onOpenChange={setShowHireDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>전문가 고용</DialogTitle>
            <DialogDescription>
              {selectedExpert?.full_name} 전문가의 고용 조건을 설정하세요
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="position">직책/역할</Label>
                <Input
                  id="position"
                  placeholder="예: 수석 상담사, 언어치료사"
                  value={hireForm.position}
                  onChange={(e) => setHireForm({
                    ...hireForm,
                    position: e.target.value
                  })}
                />
              </div>
              <div>
                <Label htmlFor="hourly_rate">시급 (원)</Label>
                <Input
                  id="hourly_rate"
                  type="number"
                  value={hireForm.hourly_rate}
                  onChange={(e) => setHireForm({
                    ...hireForm,
                    hourly_rate: parseInt(e.target.value) || 0
                  })}
                />
              </div>
            </div>

            <div>
              <Label>고용 형태</Label>
              <Select
                value={hireForm.employment_type}
                onValueChange={(value) => setHireForm({
                  ...hireForm,
                  employment_type: value
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_time">정규직</SelectItem>
                  <SelectItem value="part_time">시간제</SelectItem>
                  <SelectItem value="contract">계약직</SelectItem>
                  <SelectItem value="freelance">프리랜서</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>근무 가능 요일</Label>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {weekDays.map((day) => (
                  <div key={day.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={day.value}
                      checked={hireForm.available_days.includes(day.value)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setHireForm({
                            ...hireForm,
                            available_days: [...hireForm.available_days, day.value]
                          });
                        } else {
                          setHireForm({
                            ...hireForm,
                            available_days: hireForm.available_days.filter(d => d !== day.value)
                          });
                        }
                      }}
                    />
                    <Label htmlFor={day.value} className="text-sm">
                      {day.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="available_hours">근무 시간</Label>
              <Input
                id="available_hours"
                placeholder="예: 09:00-18:00"
                value={hireForm.available_hours}
                onChange={(e) => setHireForm({
                  ...hireForm,
                  available_hours: e.target.value
                })}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_primary_contact"
                checked={hireForm.is_primary_contact}
                onCheckedChange={(checked) => setHireForm({
                  ...hireForm,
                  is_primary_contact: checked as boolean
                })}
              />
              <Label htmlFor="is_primary_contact">
                주요 담당자로 설정
              </Label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowHireDialog(false)}
              >
                취소
              </Button>
              <Button onClick={handleHireExpert}>
                고용하기
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}