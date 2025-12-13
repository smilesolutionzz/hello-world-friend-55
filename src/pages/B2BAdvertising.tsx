import React, { useState } from 'react';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  Building2, 
  BarChart3, 
  Users, 
  Star, 
  CheckCircle2,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Zap,
  TrendingUp,
  Eye,
  MousePointer
} from 'lucide-react';

const institutionTypes = [
  { value: 'development_center', label: '발달센터' },
  { value: 'counseling_center', label: '심리상담센터' },
  { value: 'oriental_medicine', label: '한의원' },
  { value: 'hospital', label: '병원/클리닉' },
  { value: 'academy', label: '학원/교육기관' },
  { value: 'other', label: '기타' },
];

const adPlans = [
  {
    id: 'banner_basic',
    type: 'banner',
    name: '베이직 배너',
    price: '월 10만원',
    features: ['홈 하단 배너 노출', '월 최대 10,000 노출', '기본 통계 제공'],
    icon: Eye,
    popular: false,
  },
  {
    id: 'banner_premium',
    type: 'banner',
    name: '프리미엄 배너',
    price: '월 30만원',
    features: ['홈 상단 + 검사결과 배너', '월 최대 50,000 노출', '상세 분석 리포트', 'A/B 테스트 지원'],
    icon: Eye,
    popular: true,
  },
  {
    id: 'recommend_basic',
    type: 'recommendation',
    name: '추천 리스트 베이직',
    price: '월 20만원',
    features: ['검사결과 추천 목록 노출', '클릭당 과금 옵션', '지역 타겟팅'],
    icon: MousePointer,
    popular: false,
  },
  {
    id: 'recommend_premium',
    type: 'recommendation',
    name: '추천 리스트 프리미엄',
    price: '월 50만원',
    features: ['최상단 추천 노출', '상세 기관 소개', '리뷰 노출', '예약 연동'],
    icon: MousePointer,
    popular: true,
  },
  {
    id: 'profile_basic',
    type: 'premium_profile',
    name: '프리미엄 프로필 베이직',
    price: '월 15만원',
    features: ['전용 프로필 페이지', '사진 갤러리', '서비스 소개', '연락처 노출'],
    icon: Building2,
    popular: false,
  },
  {
    id: 'profile_plus',
    type: 'premium_profile',
    name: '프리미엄 프로필 플러스',
    price: '월 40만원',
    features: ['전용 프로필 페이지', '검색 우선순위', '온라인 예약 연동', '리뷰 관리', '통계 대시보드'],
    icon: Building2,
    popular: true,
  },
];

const B2BAdvertising = () => {
  const [formData, setFormData] = useState({
    institutionName: '',
    institutionType: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    budgetRange: '',
    message: '',
  });
  const [selectedPlans, setSelectedPlans] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePlanToggle = (planId: string) => {
    setSelectedPlans(prev => 
      prev.includes(planId) 
        ? prev.filter(p => p !== planId)
        : [...prev, planId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.institutionName || !formData.institutionType || !formData.contactName || !formData.contactEmail || !formData.contactPhone) {
      toast.error('필수 정보를 모두 입력해주세요.');
      return;
    }

    if (selectedPlans.length === 0) {
      toast.error('관심있는 광고 상품을 1개 이상 선택해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('b2b_ad_inquiries').insert({
        institution_name: formData.institutionName,
        institution_type: formData.institutionType,
        contact_name: formData.contactName,
        contact_email: formData.contactEmail,
        contact_phone: formData.contactPhone,
        budget_range: formData.budgetRange,
        message: formData.message,
        interested_plans: selectedPlans,
      });

      if (error) throw error;

      toast.success('문의가 접수되었습니다. 빠른 시일 내에 연락드리겠습니다.');
      setFormData({
        institutionName: '',
        institutionType: '',
        contactName: '',
        contactEmail: '',
        contactPhone: '',
        budgetRange: '',
        message: '',
      });
      setSelectedPlans([]);
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      toast.error('문의 접수 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <UnifiedNavigation />
      
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-primary/20 text-primary border-primary/30">
              B2B 파트너십
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              AIHPRO에서 <br className="md:hidden" />
              <span className="text-primary">기관 홍보</span>하세요
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              발달센터, 심리상담센터, 한의원 등 전문 기관을 위한 맞춤형 광고 솔루션.<br />
              월 5만+ 사용자에게 기관을 효과적으로 알리세요.
            </p>
            <div className="flex flex-wrap justify-center gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-primary">50,000+</div>
                <div className="text-sm text-muted-foreground">월간 사용자</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">30,000+</div>
                <div className="text-sm text-muted-foreground">검사 완료</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">95%</div>
                <div className="text-sm text-muted-foreground">높은 참여율</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">왜 AIHPRO인가요?</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>정확한 타겟층</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  심리검사, 발달검사를 찾는 사용자들에게 직접 노출됩니다. 
                  관심있는 고객에게 효과적으로 도달하세요.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>측정 가능한 성과</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  노출수, 클릭수, 전환율 등 상세한 통계를 제공합니다. 
                  광고 효과를 정확히 측정하세요.
                </p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>유연한 광고 옵션</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  배너, 추천 리스트, 프리미엄 프로필 등 다양한 광고 상품 중 
                  기관에 맞는 옵션을 선택하세요.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Ad Plans Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">광고 상품</h2>
          <p className="text-center text-muted-foreground mb-12">기관에 맞는 광고 상품을 선택하세요</p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {adPlans.map((plan) => (
              <Card 
                key={plan.id}
                className={`relative cursor-pointer transition-all ${
                  selectedPlans.includes(plan.id) 
                    ? 'border-primary ring-2 ring-primary/20' 
                    : 'hover:border-primary/50'
                }`}
                onClick={() => handlePlanToggle(plan.id)}
              >
                {plan.popular && (
                  <Badge className="absolute -top-2 left-4 bg-primary text-primary-foreground">
                    인기
                  </Badge>
                )}
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <plan.icon className="w-5 h-5 text-primary" />
                    </div>
                    <Checkbox 
                      checked={selectedPlans.includes(plan.id)}
                      onCheckedChange={() => handlePlanToggle(plan.id)}
                    />
                  </div>
                  <CardTitle className="mt-4">{plan.name}</CardTitle>
                  <CardDescription className="text-2xl font-bold text-foreground">
                    {plan.price}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Inquiry Form Section */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">광고 문의하기</h2>
            <p className="text-center text-muted-foreground mb-8">
              아래 양식을 작성해주시면 담당자가 빠르게 연락드립니다.
            </p>
            
            <Card>
              <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="institutionName">기관명 *</Label>
                      <Input
                        id="institutionName"
                        placeholder="예: OO발달센터"
                        value={formData.institutionName}
                        onChange={(e) => setFormData(prev => ({ ...prev, institutionName: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="institutionType">기관 유형 *</Label>
                      <Select
                        value={formData.institutionType}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, institutionType: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="선택해주세요" />
                        </SelectTrigger>
                        <SelectContent>
                          {institutionTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactName">담당자명 *</Label>
                      <Input
                        id="contactName"
                        placeholder="홍길동"
                        value={formData.contactName}
                        onChange={(e) => setFormData(prev => ({ ...prev, contactName: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactPhone">연락처 *</Label>
                      <Input
                        id="contactPhone"
                        placeholder="010-1234-5678"
                        value={formData.contactPhone}
                        onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contactEmail">이메일 *</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        placeholder="example@email.com"
                        value={formData.contactEmail}
                        onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="budgetRange">예산 범위</Label>
                      <Select
                        value={formData.budgetRange}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, budgetRange: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="선택해주세요" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="under_20">월 20만원 미만</SelectItem>
                          <SelectItem value="20_50">월 20-50만원</SelectItem>
                          <SelectItem value="50_100">월 50-100만원</SelectItem>
                          <SelectItem value="over_100">월 100만원 이상</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {selectedPlans.length > 0 && (
                    <div className="p-4 bg-primary/5 rounded-lg">
                      <p className="text-sm font-medium mb-2">선택한 광고 상품:</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedPlans.map(planId => {
                          const plan = adPlans.find(p => p.id === planId);
                          return plan ? (
                            <Badge key={planId} variant="secondary">
                              {plan.name}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="message">추가 문의사항</Label>
                    <Textarea
                      id="message"
                      placeholder="광고에 대해 궁금한 점이나 요청사항을 적어주세요."
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      rows={4}
                    />
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? '제출 중...' : '문의하기'}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-8">직접 문의하기</h2>
            <div className="flex flex-wrap justify-center gap-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <div className="text-sm text-muted-foreground">전화 문의</div>
                  <div className="font-medium">02-1234-5678</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div className="text-left">
                  <div className="text-sm text-muted-foreground">이메일</div>
                  <div className="font-medium">b2b@aihpro.com</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default B2BAdvertising;
