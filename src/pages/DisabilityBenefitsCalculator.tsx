import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Calculator, Heart, Home, GraduationCap, Car, Utensils } from 'lucide-react';
import { toast } from 'sonner';

interface BenefitResult {
  name: string;
  amount: string;
  description: string;
  eligibility: string;
  icon: React.ReactNode;
  category: 'money' | 'service' | 'discount';
}

const DisabilityBenefitsCalculator = () => {
  const [formData, setFormData] = useState({
    childAge: '',
    disabilityGrade: '',
    householdIncome: '',
    region: '',
    hasCaregiver: false,
    needsSpecialEducation: false,
    needsTherapy: false,
    isWorkingParent: false
  });

  const [results, setResults] = useState<BenefitResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  const calculateBenefits = () => {
    if (!formData.childAge || !formData.disabilityGrade || !formData.householdIncome) {
      toast.error('필수 정보를 모두 입력해주세요');
      return;
    }

    const benefits: BenefitResult[] = [];

    // 기본 급여
    if (parseInt(formData.disabilityGrade) <= 3) {
      benefits.push({
        name: '장애아동수당',
        amount: '월 20만원',
        description: '중증 장애아동 대상 기본수당',
        eligibility: '만 18세 미만, 1-3급 장애',
        icon: <Heart className="w-5 h-5" />,
        category: 'money'
      });
    }

    if (parseInt(formData.disabilityGrade) <= 6) {
      benefits.push({
        name: '장애인연금',
        amount: '월 32만원',
        description: '만 18세 이상 중증장애인 기초연금',
        eligibility: '만 18세 이상, 1-3급 장애',
        icon: <Heart className="w-5 h-5" />,
        category: 'money'
      });
    }

    // 특수교육비
    if (formData.needsSpecialEducation) {
      benefits.push({
        name: '특수교육비 지원',
        amount: '월 50-100만원',
        description: '특수교육기관 이용료 지원',
        eligibility: '특수교육 대상자',
        icon: <GraduationCap className="w-5 h-5" />,
        category: 'service'
      });
    }

    // 치료비 지원
    if (formData.needsTherapy) {
      benefits.push({
        name: '발달재활서비스',
        amount: '월 22만원',
        description: '언어치료, 인지치료 등 바우처',
        eligibility: '만 18세 미만 장애아동',
        icon: <Heart className="w-5 h-5" />,
        category: 'service'
      });
    }

    // 주거 지원
    benefits.push({
      name: '장애인 주택개조비',
      amount: '최대 380만원',
      description: '장애인 편의시설 설치비용',
      eligibility: '주택 소유 장애인 가구',
      icon: <Home className="w-5 h-5" />,
      category: 'service'
    });

    // 교통비 할인
    benefits.push({
      name: '교통비 할인',
      amount: '50-100% 할인',
      description: '지하철, 버스, KTX 할인',
      eligibility: '장애인 등록증 소지자',
      icon: <Car className="w-5 h-5" />,
      category: 'discount'
    });

    // 통신비 할인
    benefits.push({
      name: '통신비 할인',
      amount: '월 1-3만원 할인',
      description: '휴대폰, 인터넷 요금 할인',
      eligibility: '장애인 등록증 소지자',
      icon: <Car className="w-5 h-5" />,
      category: 'discount'
    });

    // 급식비 지원
    benefits.push({
      name: '급식비 지원',
      amount: '월 13만원',
      description: '특수학교 급식비 지원',
      eligibility: '특수학교 재학생',
      icon: <Utensils className="w-5 h-5" />,
      category: 'service'
    });

    setResults(benefits);
    setShowResults(true);
    
    toast.success(`${benefits.length}개의 혜택을 찾았습니다!`);
  };

  const getTotalMonthlyAmount = () => {
    return results.filter(r => r.category === 'money')
      .reduce((total, benefit) => {
        const amount = benefit.amount.match(/\d+/)?.[0];
        return total + (amount ? parseInt(amount) : 0);
      }, 0);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Calculator className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">장애인 혜택 계산기</h1>
          </div>
          <p className="text-gray-600">
            우리 아이가 받을 수 있는 모든 지원금과 혜택을 한눈에 확인하세요
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>기본 정보 입력</CardTitle>
            <CardDescription>
              정확한 혜택 계산을 위해 아래 정보를 입력해주세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="childAge">자녀 나이</Label>
                <Input
                  id="childAge"
                  type="number"
                  placeholder="예: 8"
                  value={formData.childAge}
                  onChange={(e) => setFormData({...formData, childAge: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="disabilityGrade">장애 등급</Label>
                <Select onValueChange={(value) => setFormData({...formData, disabilityGrade: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="등급 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1급 (중증)</SelectItem>
                    <SelectItem value="2">2급 (중증)</SelectItem>
                    <SelectItem value="3">3급 (중증)</SelectItem>
                    <SelectItem value="4">4급 (경증)</SelectItem>
                    <SelectItem value="5">5급 (경증)</SelectItem>
                    <SelectItem value="6">6급 (경증)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="income">가구 월소득</Label>
                <Input
                  id="income"
                  type="number"
                  placeholder="만원 단위로 입력"
                  value={formData.householdIncome}
                  onChange={(e) => setFormData({...formData, householdIncome: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="region">거주지역</Label>
                <Select onValueChange={(value) => setFormData({...formData, region: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="지역 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="seoul">서울특별시</SelectItem>
                    <SelectItem value="busan">부산광역시</SelectItem>
                    <SelectItem value="daegu">대구광역시</SelectItem>
                    <SelectItem value="incheon">인천광역시</SelectItem>
                    <SelectItem value="gwangju">광주광역시</SelectItem>
                    <SelectItem value="daejeon">대전광역시</SelectItem>
                    <SelectItem value="ulsan">울산광역시</SelectItem>
                    <SelectItem value="gyeonggi">경기도</SelectItem>
                    <SelectItem value="other">기타 지역</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <Label>추가 정보 (해당사항 체크)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="caregiver"
                    checked={formData.hasCaregiver}
                    onCheckedChange={(checked) => setFormData({...formData, hasCaregiver: checked as boolean})}
                  />
                  <Label htmlFor="caregiver">주 돌봄자가 있음</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="specialed"
                    checked={formData.needsSpecialEducation}
                    onCheckedChange={(checked) => setFormData({...formData, needsSpecialEducation: checked as boolean})}
                  />
                  <Label htmlFor="specialed">특수교육 필요</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="therapy"
                    checked={formData.needsTherapy}
                    onCheckedChange={(checked) => setFormData({...formData, needsTherapy: checked as boolean})}
                  />
                  <Label htmlFor="therapy">치료서비스 필요</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="working"
                    checked={formData.isWorkingParent}
                    onCheckedChange={(checked) => setFormData({...formData, isWorkingParent: checked as boolean})}
                  />
                  <Label htmlFor="working">부모 직장인</Label>
                </div>
              </div>
            </div>

            <Button onClick={calculateBenefits} className="w-full" size="lg">
              <Calculator className="w-5 h-5 mr-2" />
              혜택 계산하기
            </Button>
          </CardContent>
        </Card>

        {showResults && (
          <div className="space-y-6">
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-800">계산 결과</CardTitle>
                <CardDescription className="text-green-600">
                  예상 월 수령액: <span className="text-2xl font-bold">{getTotalMonthlyAmount().toLocaleString()}만원</span>
                </CardDescription>
              </CardHeader>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map((benefit, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {benefit.icon}
                        <CardTitle className="text-lg">{benefit.name}</CardTitle>
                      </div>
                      <Badge variant={benefit.category === 'money' ? 'default' : 'secondary'}>
                        {benefit.category === 'money' ? '현금' : benefit.category === 'service' ? '서비스' : '할인'}
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">{benefit.amount}</div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-2">{benefit.description}</p>
                    <p className="text-xs text-gray-500">자격요건: {benefit.eligibility}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="text-center space-y-2">
                  <h3 className="text-lg font-semibold text-blue-800">💡 이런 혜택 놓치고 계시지 않았나요?</h3>
                  <p className="text-blue-600">
                    많은 부모님들이 모르고 지나치는 혜택들을 친구들과 공유해보세요!
                  </p>
                  <Button variant="outline" className="border-blue-300 text-blue-700">
                    결과 공유하기
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default DisabilityBenefitsCalculator;