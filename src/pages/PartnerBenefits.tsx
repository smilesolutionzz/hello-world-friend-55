import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Building2,
  Baby,
  Heart,
  School,
  CheckCircle,
  Star,
  Users,
  ArrowRight,
  Sparkles,
  Eye,
  MessageCircle,
  TrendingUp,
  Home
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const PartnerBenefits = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    institution_name: '',
    institution_type: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    specializations: '',
    message: ''
  });

  const benefits = [
    {
      icon: <Eye className="w-8 h-8 text-blue-600" />,
      title: '무료 노출',
      description: '15,000+ 플랫폼 이용자에게 기관이 노출됩니다'
    },
    {
      icon: <MessageCircle className="w-8 h-8 text-green-600" />,
      title: '상담 연결',
      description: '이용자들이 직접 상담을 요청합니다'
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-purple-600" />,
      title: '신규 고객 유입',
      description: '플랫폼을 통해 새로운 내담자를 만나세요'
    }
  ];

  const institutionTypes = [
    { value: 'developmental', label: '발달센터', icon: <Baby className="w-5 h-5" /> },
    { value: 'counseling', label: '상담센터', icon: <Heart className="w-5 h-5" /> },
    { value: 'kindergarten', label: '어린이집/유치원', icon: <School className="w-5 h-5" /> },
    { value: 'special_school', label: '특수학교', icon: <Building2 className="w-5 h-5" /> }
  ];

  const howItWorks = [
    { step: 1, title: '무료 등록', desc: '기관 정보와 전문 분야를 등록합니다' },
    { step: 2, title: '플랫폼 노출', desc: '15,000+ 이용자에게 기관이 노출됩니다' },
    { step: 3, title: '상담 요청 수신', desc: '관심 있는 이용자가 상담을 요청합니다' },
    { step: 4, title: '직접 상담 진행', desc: '기관에서 직접 상담을 진행합니다' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('b2b_partner_institutions')
        .insert({
          institution_name: formData.institution_name,
          institution_type: formData.institution_type,
          email: formData.contact_email,
          phone: formData.contact_phone,
          description: formData.message,
          specializations: formData.specializations ? formData.specializations.split(',').map(s => s.trim()) : [],
          is_active: false, // 관리자 승인 후 활성화
          is_verified: false
        });

      if (error) throw error;

      toast.success('파트너 등록 신청이 완료되었습니다! 검토 후 연락드리겠습니다.');
      setFormData({
        institution_name: '',
        institution_type: '',
        contact_name: '',
        contact_email: '',
        contact_phone: '',
        specializations: '',
        message: ''
      });
    } catch (error) {
      console.error('Partner registration error:', error);
      toast.error('등록 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* 헤더 */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-blue-600" />
            <span className="font-bold text-lg">AIHPRO</span>
            <Badge variant="outline" className="ml-2">파트너</Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <Home className="w-4 h-4 mr-2" />
            홈으로
          </Button>
        </div>
      </nav>

      {/* 히어로 */}
      <section className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200">
            무료 파트너십
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            전문가로 등록하고<br />
            <span className="text-blue-600">새로운 내담자를 만나세요</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            AIHPRO 플랫폼에 기관을 무료로 등록하면<br />
            15,000+ 이용자에게 노출되고 상담 요청을 받을 수 있습니다
          </p>
          <Button 
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => document.getElementById('register-form')?.scrollIntoView({ behavior: 'smooth' })}
          >
            무료로 등록하기
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* 핵심 혜택 */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-center mb-4">{benefit.icon}</div>
                <h3 className="font-bold text-lg mb-2">{benefit.title}</h3>
                <p className="text-gray-600 text-sm">{benefit.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 이용 방법 */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">이용 방법</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {howItWorks.map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 font-bold text-lg">
                  {item.step}
                </div>
                <h4 className="font-semibold mb-1">{item.title}</h4>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 등록 폼 */}
      <section id="register-form" className="py-16 px-4 bg-white">
        <div className="max-w-xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">파트너 등록 신청</h2>
            <p className="text-gray-600">무료로 등록하고 새로운 내담자를 만나세요</p>
          </div>

          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label>기관명 *</Label>
                  <Input
                    value={formData.institution_name}
                    onChange={(e) => setFormData({ ...formData, institution_name: e.target.value })}
                    placeholder="예: 행복발달센터"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>기관 유형 *</Label>
                  <Select 
                    value={formData.institution_type}
                    onValueChange={(value) => setFormData({ ...formData, institution_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="선택하세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {institutionTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            {type.icon}
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>담당자 이름 *</Label>
                    <Input
                      value={formData.contact_name}
                      onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                      placeholder="홍길동"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>연락처 *</Label>
                    <Input
                      value={formData.contact_phone}
                      onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                      placeholder="010-1234-5678"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>이메일 *</Label>
                  <Input
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    placeholder="example@center.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>전문 분야</Label>
                  <Input
                    value={formData.specializations}
                    onChange={(e) => setFormData({ ...formData, specializations: e.target.value })}
                    placeholder="예: 언어치료, 놀이치료, ADHD (쉼표로 구분)"
                  />
                </div>

                <div className="space-y-2">
                  <Label>기관 소개</Label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="기관에 대한 간단한 소개를 작성해주세요"
                    rows={3}
                  />
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700" 
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? '등록 중...' : '무료로 등록 신청하기'}
                </Button>

                <p className="text-xs text-center text-gray-500 mt-4">
                  등록 신청 후 검토를 거쳐 1-2일 내에 연락드립니다
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 신뢰 지표 */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex flex-wrap justify-center gap-8">
            <div className="flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" />
              <span className="font-semibold">40+ 제휴 기관</span>
            </div>
            <div className="flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-500" />
              <span className="font-semibold">평균 만족도 4.8</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <span className="font-semibold">15,000+ 이용자</span>
            </div>
          </div>
        </div>
      </section>

      {/* 푸터 */}
      <footer className="py-8 px-4 border-t border-gray-200">
        <div className="max-w-4xl mx-auto text-center text-sm text-gray-500">
          <p>© 2024 AIHPRO. 전문가 매칭 플랫폼</p>
        </div>
      </footer>
    </div>
  );
};

export default PartnerBenefits;
