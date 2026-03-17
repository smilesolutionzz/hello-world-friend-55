import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';
import AuthenticationGuard from '@/components/observation/AuthenticationGuard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, Phone, Mail, Globe, Plus, X, CheckCircle, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const institutionTypes = [
  '발달센터', 'ABA센터', '심리상담센터', '언어발달센터', '연구소',
  '병원부설', '한의원', '학습센터', '미술치료센터', '발달상담센터',
  '주간활동서비스', '방과후서비스', '특수체육', '기타'
];

const specializationOptions = [
  '발달재활', 'ABA', '언어치료', '놀이치료', '미술치료', '인지치료',
  '감각통합', '심리상담', '사회성발달', '행동치료', '작업치료',
  '물리치료', '부모교육', '가족치료', '조음치료', '한방치료',
  '아동건강', '특수체육', '주간활동', '방과후활동'
];

const InstitutionApplication = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    institutionName: '',
    institutionType: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    websiteUrl: '',
    specializations: [] as string[],
    contactPerson: '',
    contactPhone: '',
    termsAgreed: false,
  });

  const toggleSpecialization = (spec: string) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.includes(spec)
        ? prev.specializations.filter(s => s !== spec)
        : [...prev.specializations, spec]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.institutionName || !formData.institutionType || !formData.phone) {
      toast.error('기관명, 기관 유형, 연락처는 필수입니다.');
      return;
    }
    if (!formData.termsAgreed) {
      toast.error('약관에 동의해주세요.');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('로그인이 필요합니다.');

      const { error } = await supabase
        .from('b2b_partner_institutions')
        .insert({
          user_id: user.id,
          institution_name: formData.institutionName,
          institution_type: formData.institutionType,
          description: formData.description || null,
          address: formData.address || null,
          phone: formData.phone,
          email: formData.email || null,
          website_url: formData.websiteUrl || null,
          specializations: formData.specializations.length > 0 ? formData.specializations : null,
          is_verified: false,
          is_active: false,
        });

      if (error) throw error;

      toast.success('협력기관 신청이 완료되었습니다! 검토 후 연락드리겠습니다.');
      navigate('/expert-hiring');
    } catch (err: any) {
      toast.error(err.message || '신청 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>협력기관 신청 - AIHumanPro</title>
        <meta name="description" content="AIHumanPro 협력기관으로 등록하세요. 더 많은 고객을 만나보세요." />
      </Helmet>

      <div className="min-h-screen bg-background">
        <UnifiedNavigation />
        <AuthenticationGuard fallbackMessage="협력기관 신청을 위해서는 로그인이 필요합니다.">
          <div className="container max-w-3xl mx-auto py-8 px-4">
            {/* 헤더 */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold mb-2">협력기관 신청</h1>
              <p className="text-muted-foreground">기관 정보를 등록하고 AIHPRO 네트워크에 참여하세요</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 기관 기본 정보 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Building2 className="w-5 h-5 text-primary" />
                    기관 기본 정보
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>기관명 <span className="text-destructive">*</span></Label>
                      <Input
                        value={formData.institutionName}
                        onChange={e => setFormData(prev => ({ ...prev, institutionName: e.target.value }))}
                        placeholder="예: ○○발달센터"
                        maxLength={100}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>기관 유형 <span className="text-destructive">*</span></Label>
                      <Select
                        value={formData.institutionType}
                        onValueChange={v => setFormData(prev => ({ ...prev, institutionType: v }))}
                      >
                        <SelectTrigger><SelectValue placeholder="선택하세요" /></SelectTrigger>
                        <SelectContent>
                          {institutionTypes.map(t => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>기관 소개</Label>
                    <Textarea
                      value={formData.description}
                      onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="기관에 대해 간단히 소개해주세요"
                      rows={3}
                      maxLength={500}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>주소</Label>
                    <Input
                      value={formData.address}
                      onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="예: 서울시 강남구 ..."
                      maxLength={200}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>연락처 <span className="text-destructive">*</span></Label>
                      <Input
                        value={formData.phone}
                        onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="010-0000-0000"
                        maxLength={20}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>이메일</Label>
                      <Input
                        type="email"
                        value={formData.email}
                        onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder="contact@example.com"
                        maxLength={100}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>웹사이트</Label>
                    <Input
                      value={formData.websiteUrl}
                      onChange={e => setFormData(prev => ({ ...prev, websiteUrl: e.target.value }))}
                      placeholder="https://"
                      maxLength={200}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* 담당자 정보 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">담당자 정보</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>담당자명</Label>
                      <Input
                        value={formData.contactPerson}
                        onChange={e => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
                        placeholder="홍길동"
                        maxLength={50}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>담당자 연락처</Label>
                      <Input
                        value={formData.contactPhone}
                        onChange={e => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                        placeholder="010-0000-0000"
                        maxLength={20}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 전문 분야 */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">전문 분야</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {specializationOptions.map(spec => (
                      <Badge
                        key={spec}
                        variant={formData.specializations.includes(spec) ? 'default' : 'outline'}
                        className="cursor-pointer transition-all hover:scale-105"
                        onClick={() => toggleSpecialization(spec)}
                      >
                        {formData.specializations.includes(spec) && <CheckCircle className="w-3 h-3 mr-1" />}
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 약관 동의 */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="terms"
                      checked={formData.termsAgreed}
                      onCheckedChange={(checked) =>
                        setFormData(prev => ({ ...prev, termsAgreed: checked === true }))
                      }
                    />
                    <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                      개인정보 수집·이용에 동의하며, 기관 정보가 AIHPRO 플랫폼에 노출되는 것에 동의합니다.
                      검토 후 승인 시 협력기관으로 등록됩니다. <span className="text-destructive">*</span>
                    </Label>
                  </div>
                </CardContent>
              </Card>

              <Button
                type="submit"
                size="lg"
                disabled={loading}
                className="w-full"
              >
                {loading ? '신청 중...' : '협력기관 신청하기'}
              </Button>
            </form>
          </div>
        </AuthenticationGuard>
      </div>
    </>
  );
};

export default InstitutionApplication;
