import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Crown,
  Calendar,
  Clock,
  CreditCard,
  CheckCircle,
  Star,
  MessageCircle,
  Video,
  Phone,
  FileText,
  Shield,
  Zap
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useLanguage } from '@/i18n/LanguageContext';

// Mock expert data (실제로는 props나 API에서 가져와야 함)
const mockExperts = [
  {
    id: '1',
    name: '김미영',
    specialty: ['아동발달', '언어치료'],
    credentials: ['아동발달 전문의', '언어재활사 1급'],
    rating: 4.9,
    reviews: 156,
    experience: '12년',
    hourlyPrice: 30000,
    image: '/api/placeholder/150/150',
    description: '12년간 아동발달센터에서 근무하며 수백 명의 아이들을 치료해온 경험이 있습니다.',
    languages: ['한국어'],
    consultationTypes: ['화상상담', '방문상담']
  },
  {
    id: '2',
    name: '박상훈',
    specialty: ['행동분석', '자폐스펙트럼'],
    credentials: ['BCBA 자격증', '행동분석사'],
    rating: 4.8,
    reviews: 89,
    experience: '8년',
    hourlyPrice: 25000,
    image: '/api/placeholder/150/150',
    description: 'ABA 치료 전문가로 자폐스펙트럼 아동의 행동 개선에 특화되어 있습니다.',
    languages: ['한국어'],
    consultationTypes: ['화상상담', '방문상담']
  }
];

const ExpertContract = () => {
  const { expertId } = useParams();
  const navigate = useNavigate();
  const { isEnglish } = useLanguage();
  const navigate = useNavigate();
  
  const [expert, setExpert] = useState<any>(null);
  const [contractType, setContractType] = useState('monthly');
  const [sessionsPerWeek, setSessionsPerWeek] = useState(2);
  const [contractStartDate, setContractStartDate] = useState('');
  const [additionalServices, setAdditionalServices] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadExpert = async () => {
      if (!expertId) return;
      
      try {
        // 먼저 Supabase에서 전문가 정보 가져오기
        const { data: dbExpert, error } = await supabase
          .from('experts')
          .select('*')
          .eq('id', expertId)
          .maybeSingle();
        
        if (error) {
          console.error('Error loading expert:', error);
        }
        
        if (dbExpert) {
          // Supabase 데이터를 기존 형식으로 변환
          setExpert({
            id: dbExpert.id,
            name: dbExpert.full_name,
            specialty: dbExpert.specializations || [],
            credentials: dbExpert.certifications || [],
            rating: dbExpert.average_rating || 4.5,
            reviews: dbExpert.total_sessions || 0,
            experience: `${dbExpert.years_experience || 0}${isEnglish ? ' yrs' : '년'}`,
            hourlyPrice: dbExpert.hourly_rate || 25000,
            image: dbExpert.profile_image_url || '/api/placeholder/150/150',
            description: dbExpert.bio || '',
            languages: dbExpert.languages || [isEnglish ? 'Korean' : '한국어'],
            consultationTypes: dbExpert.consultation_methods || [isEnglish ? 'Video' : '화상상담']
          });
        } else {
          // Mock 데이터 fallback
          const foundExpert = mockExperts.find(e => e.id === expertId);
          setExpert(foundExpert);
        }
        
        // 내일 날짜를 기본값으로 설정
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        setContractStartDate(tomorrow.toISOString().split('T')[0]);
      } catch (error) {
        console.error('Error in loadExpert:', error);
      }
    };
    
    loadExpert();
  }, [expertId]);

  const contractOptions = [
    { value: 'monthly', label: isEnglish ? '1 Month' : '1개월', months: 1, discount: 0 },
    { value: 'quarterly', label: isEnglish ? '3 Months' : '3개월', months: 3, discount: 5 },
    { value: 'semi_annual', label: isEnglish ? '6 Months' : '6개월', months: 6, discount: 10 }
  ];

  const additionalServiceOptions = [
    { id: 'emergency_support', label: isEnglish ? '24/7 Emergency Support' : '24시간 긴급 상담 지원', price: 25000 },
    { id: 'family_education', label: isEnglish ? 'Family Education Program' : '가족 교육 프로그램', price: 15000 },
    { id: 'progress_report', label: isEnglish ? 'Monthly Progress Report' : '월간 진전 리포트', price: 10000 },
    { id: 'group_session', label: isEnglish ? 'Group Session Access' : '그룹 세션 참여 권한', price: 15000 }
  ];

  const getCurrentContract = () => {
    return contractOptions.find(option => option.value === contractType);
  };

  const calculateTotalCost = () => {
    if (!expert) return 0;
    
    const contract = getCurrentContract();
    if (!contract) return 0;

    const baseMonthlyPrice = sessionsPerWeek * expert.hourlyPrice * 4; // 주당 세션 * 시간당 요금 * 4주
    const totalBasePrice = baseMonthlyPrice * contract.months;
    
    // 할인 적용
    const discountAmount = totalBasePrice * (contract.discount / 100);
    const discountedPrice = totalBasePrice - discountAmount;
    
    // 추가 서비스 비용
    const additionalCost = additionalServices.reduce((total, serviceId) => {
      const service = additionalServiceOptions.find(s => s.id === serviceId);
      return total + (service ? service.price * contract.months : 0);
    }, 0);
    
    return discountedPrice + additionalCost;
  };

  const getMonthlyPrice = () => {
    return calculateTotalCost() / (getCurrentContract()?.months || 1);
  };

  const handleAdditionalServiceChange = (serviceId: string, checked: boolean) => {
    if (checked) {
      setAdditionalServices([...additionalServices, serviceId]);
    } else {
      setAdditionalServices(additionalServices.filter(id => id !== serviceId));
    }
  };

  const handleCreateContract = () => {
    // 카카오톡 오픈채팅으로 바로 연결
    window.open('https://open.kakao.com/o/sq57G6Th', '_blank');
    toast.success(isEnglish ? 'Redirecting to consultation chat.' : '카카오톡 상담창으로 이동합니다. 전문가와 계약 상담을 진행해주세요.');
  };

  if (!expert) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">{isEnglish ? 'Expert not found' : '전문가를 찾을 수 없습니다'}</h2>
          <Button onClick={() => navigate('/expert-hiring')}>
            {isEnglish ? 'Back to Expert List' : '전문가 목록으로 돌아가기'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5">
      <UnifiedNavigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Crown className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold">{isEnglish ? 'Expert Contract' : '전문가 고용 계약'}</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            {isEnglish ? 'Get ongoing professional services through a long-term contract' : '전문가와 장기 계약을 통해 지속적인 전문 서비스를 받아보세요'}
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* 전문가 정보 */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  {isEnglish ? 'Selected Expert' : '선택된 전문가'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={expert.image} />
                    <AvatarFallback>{expert.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-xl font-semibold">{expert.name}</h3>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm">{expert.rating}</span>
                      <span className="text-sm text-muted-foreground">
                        ({expert.reviews}{isEnglish ? ' reviews' : '개 후기'})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {expert.specialty.map((spec: string) => (
                      <Badge key={spec} variant="secondary">
                        {spec}
                      </Badge>
                    ))}
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    <div>{isEnglish ? 'Experience' : '경력'}: {expert.experience}</div>
                    <div className="text-lg font-semibold text-primary mt-2">
                      ₩{expert.hourlyPrice.toLocaleString()}/{isEnglish ? 'hr' : '시간'}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">{isEnglish ? 'Credentials' : '자격증'}</h4>
                  <ul className="text-sm space-y-1">
                    {expert.credentials.map((cred: string, index: number) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        {cred}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold">{isEnglish ? 'Consultation Type' : '상담 방식'}</h4>
                  <div className="flex gap-2">
                    {(expert.consultationTypes.includes('화상상담') || expert.consultationTypes.includes('Video')) && (
                      <Badge variant="outline" className="gap-1">
                        <Video className="w-3 h-3" />
                        {isEnglish ? 'Video' : '화상'}
                      </Badge>
                    )}
                    {(expert.consultationTypes.includes('방문상담') || expert.consultationTypes.includes('In-person')) && (
                      <Badge variant="outline" className="gap-1">
                        <MessageCircle className="w-3 h-3" />
                        {isEnglish ? 'In-person' : '방문'}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 계약 설정 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 계약 기간 선택 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  {isEnglish ? 'Contract Period' : '계약 기간 선택'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {contractOptions.map((option) => (
                    <div
                      key={option.value}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        contractType === option.value
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setContractType(option.value)}
                    >
                      <div className="text-center">
                        <h3 className="font-semibold">{option.label}</h3>
                        {option.discount > 0 && (
                          <Badge className="mt-1 bg-green-500">
                            {option.discount}% {isEnglish ? 'off' : '할인'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 서비스 설정 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  {isEnglish ? 'Service Settings' : '서비스 설정'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="sessions">{isEnglish ? 'Sessions per Week' : '주당 상담 횟수'}</Label>
                    <Select value={sessionsPerWeek.toString()} onValueChange={(value) => setSessionsPerWeek(parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">{isEnglish ? '1x/week' : '주 1회'}</SelectItem>
                        <SelectItem value="2">{isEnglish ? '2x/week (recommended)' : '주 2회 (권장)'}</SelectItem>
                        <SelectItem value="3">{isEnglish ? '3x/week' : '주 3회'}</SelectItem>
                        <SelectItem value="4">{isEnglish ? '4x/week' : '주 4회'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="start-date">{isEnglish ? 'Start Date' : '계약 시작일'}</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={contractStartDate}
                      onChange={(e) => setContractStartDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                {/* 추가 서비스 */}
                <div className="space-y-4">
                  <h3 className="font-semibold">추가 서비스 (선택사항)</h3>
                  <div className="grid gap-3">
                    {additionalServiceOptions.map((service) => (
                      <div key={service.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <Checkbox
                          id={service.id}
                          checked={additionalServices.includes(service.id)}
                          onCheckedChange={(checked) => 
                            handleAdditionalServiceChange(service.id, checked as boolean)
                          }
                        />
                        <div className="flex-1">
                          <Label htmlFor={service.id} className="font-medium">
                            {service.label}
                          </Label>
                          <div className="text-sm text-muted-foreground">
                            월 +₩{service.price.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 특별 요청사항 */}
                <div className="space-y-2">
                  <Label htmlFor="notes">특별 요청사항 (선택사항)</Label>
                  <Textarea
                    id="notes"
                    placeholder="전문가에게 전달하고 싶은 특별한 요청사항이나 참고사항을 입력해주세요..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 비용 계산 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  비용 계산
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>기본 서비스 ({sessionsPerWeek}회/주)</span>
                    <span>₩{(sessionsPerWeek * expert.hourlyPrice * 4).toLocaleString()}/월</span>
                  </div>
                  
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>→ 회당 비용</span>
                    <span>₩{expert.hourlyPrice.toLocaleString()}/회</span>
                  </div>
                  
                  {additionalServices.length > 0 && (
                    <>
                      <Separator />
                      <div className="text-sm font-medium mb-2">추가 서비스</div>
                      {additionalServices.map((serviceId) => {
                        const service = additionalServiceOptions.find(s => s.id === serviceId);
                        return service ? (
                          <div key={serviceId} className="flex justify-between text-sm">
                            <span>{service.label}</span>
                            <span>₩{service.price.toLocaleString()}/월</span>
                          </div>
                        ) : null;
                      })}
                    </>
                  )}
                  
                  <Separator />
                  
                  <div className="flex justify-between font-semibold text-lg">
                    <span>월 결제 금액</span>
                    <span className="text-primary">₩{getMonthlyPrice().toLocaleString()}</span>
                  </div>
                  
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <div className="flex justify-between text-sm mb-1">
                      <span>월 상담 횟수</span>
                      <span className="font-semibold">{sessionsPerWeek * 4}회</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>월 평균 회당 비용</span>
                      <span className="font-semibold text-primary">
                        ₩{Math.round(getMonthlyPrice() / (sessionsPerWeek * 4)).toLocaleString()}/회
                      </span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between text-xl font-bold">
                    <span>총 계약 금액 ({getCurrentContract()?.months}개월)</span>
                    <span className="text-primary">₩{calculateTotalCost().toLocaleString()}</span>
                  </div>
                  
                  {getCurrentContract()?.discount && getCurrentContract()!.discount > 0 && (
                    <div className="text-sm text-green-600 text-center">
                      🎉 {getCurrentContract()?.months}개월 계약으로 {getCurrentContract()?.discount}% 할인 적용!
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t">
                  <Button
                    onClick={handleCreateContract}
                    disabled={isLoading || !contractStartDate}
                    className="w-full h-12 text-lg"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        계약 생성 중...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Zap className="w-5 h-5" />
                        무통장입금으로 결제하기
                      </div>
                    )}
                  </Button>
                  
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    현재 MVP 기간으로 무통장입금만 지원됩니다.
                    <br />
                    언제든지 계약을 취소할 수 있습니다.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpertContract;