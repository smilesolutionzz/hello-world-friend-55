import React, { useState, useEffect } from 'react';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Crown, Zap, Star, Check } from 'lucide-react';
import { TossPaymentModal } from '@/components/payment/TossPaymentModal';
import { supabase } from '@/integrations/supabase/client';

const Subscription = () => {
  const navigate = useNavigate();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [subscriptionPlans, setSubscriptionPlans] = useState<any[]>([]);

  // 하드코딩된 플랜 사용 (DB에서 가져오는 대신)
  // useEffect(() => {
  //   const fetchSubscriptionPlans = async () => {
  //     try {
  //       const { data, error } = await supabase
  //         .from('subscription_plans')
  //         .select('*')
  //         .order('price', { ascending: true });
        
  //       if (error) throw error;
  //       setSubscriptionPlans(data || []);
  //     } catch (error) {
  //       console.error('Error fetching subscription plans:', error);
  //     }
  //   };

  //   fetchSubscriptionPlans();
  // }, []);

  const plans = [
    {
      id: 'free',
      name: '무료 체험',
      price: 0,
      period: '영구',
      description: '기본 기능을 체험해보세요',
      features: ['월 1회 심리검사', 'AIH 기본 분석', '결과 요약'],
      popular: false,
      buttonText: '현재 플랜',
      disabled: true
    },
    {
      id: 'premium-monthly',
      name: '프리미엄 월간',
      price: 9900,
      yearly_price: null,
      period: '월간',
      description: '개인 사용자를 위한 완벽한 선택',
      features: ['무제한 심리검사', 'AIH 상세 분석', '결과 저장', 'PDF 리포트', '24시간/매일 접근성'],
      popular: true,
      buttonText: '구독하기',
      disabled: false
    },
    {
      id: 'premium-yearly',
      name: '프리미엄 연간',
      price: 99000,
      yearly_price: 99000,
      period: '연간',
      description: '가족 모두를 위한 최고의 가치',
      features: ['무제한 심리검사', 'AIH 상세 분석', '결과 저장', 'PDF 리포트', '가족 관리', '우선 지원', '30% 할인'],
      popular: false,
      buttonText: '구독하기',
      disabled: false
    }
  ];

  const handlePlanSelect = (plan: any) => {
    if (plan.disabled) return;
    
    setSelectedPlan(plan);
    setIsPaymentModalOpen(true);
  };

  const handlePaymentModalClose = () => {
    setIsPaymentModalOpen(false);
    setSelectedPlan(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <UnifiedNavigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            홈으로
          </Button>
          <div>
            <h1 className="text-3xl font-bold">AIHPRO 소개</h1>
            <p className="text-muted-foreground">
              AI 기반 심리분석 플랫폼에 대해 알아보세요
            </p>
          </div>
        </div>

        {/* 창립자의 손편지 */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100 shadow-lg">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">창립자의 메시지</h2>
              <div className="w-16 h-0.5 bg-blue-500 mx-auto"></div>
            </div>
            
            <div className="prose max-w-none text-gray-700 leading-relaxed">
              <p className="text-lg mb-6 font-medium text-center text-blue-800">
                "모든 아이가 자신만의 특별함을 발견하고 꽃피울 수 있는 세상을 만들고 싶습니다."
              </p>
              
              <div className="space-y-4 text-base">
                <p>
                  안녕하세요, AIHPRO 창립자입니다.
                </p>
                
                <p>
                  저희는 단순한 기술 회사가 아닙니다. 매일 밤, 우리 아이가 잘 자라고 있는지 걱정하는 
                  모든 부모님들의 마음을 이해하는 사람들이 모여 만든 따뜻한 공간입니다.
                </p>
                
                <p>
                  AI 기술은 도구일 뿐입니다. 진짜 중요한 것은 아이 한 명 한 명의 고유한 가능성을 
                  발견하고 키워주는 것이죠. 때로는 3분의 짧은 검사가, 때로는 전문가와의 상담이 
                  한 아이의 인생을 바꿀 수 있다고 믿습니다.
                </p>
                
                <p>
                  AIHPRO는 모든 가족이 경제적 부담 없이 전문적인 도움을 받을 수 있는 세상을 
                  꿈꿉니다. 우리의 AI가 먼저 아이를 이해하고, 꼭 필요할 때만 전문가에게 연결해드립니다. 
                  이렇게 하면 비용은 줄이고, 효과는 높일 수 있거든요.
                </p>
                
                <p>
                  오늘도 어딘가에서 우리 아이를 더 잘 이해하고 싶어하는 부모님이 계실 겁니다. 
                  그 분들에게 희망이 되고 싶습니다. 함께 걸어가요.
                </p>
              </div>
              
              <div className="mt-8 text-right">
                <div className="text-lg font-semibold text-blue-800">
                  AIHPRO 창립자 드림
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  "아이들의 무한한 가능성을 믿으며"
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 서비스 소개 */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-4">AIHPRO란?</h2>
            <p className="text-lg text-muted-foreground">
              AI 기술을 활용한 전문적인 심리분석 및 발달진단 플랫폼입니다
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-primary" />
                  핵심 기능
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium">3분 심리검사</h4>
                    <p className="text-sm text-muted-foreground">빠르고 정확한 심리상태 체크</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium">AI 분석 리포트</h4>
                    <p className="text-sm text-muted-foreground">개인 맞춤형 상세 분석 결과</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium">전문가 상담</h4>
                    <p className="text-sm text-muted-foreground">AI → 전문가 연계 상담 시스템</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium">가족 케어</h4>
                    <p className="text-sm text-muted-foreground">가족 구성원 통합 관리</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary" />
                  특별한 장점
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium">AI 기반 정확성</h4>
                    <p className="text-sm text-muted-foreground">최신 AI 모델로 높은 분석 정확도</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium">24시간/매일 접근성</h4>
                    <p className="text-sm text-muted-foreground">언제든지 검사 및 상담 가능</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium">개인정보 보호</h4>
                    <p className="text-sm text-muted-foreground">철저한 데이터 암호화 및 보안</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium">합리적 비용</h4>
                    <p className="text-sm text-muted-foreground">전통적 상담 대비 경제적</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 자주 묻는 질문 */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">자주 묻는 질문</h2>
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">서비스 이용 관련</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Q. 검사는 얼마나 정확한가요?</h4>
                  <p className="text-sm text-muted-foreground">최신 AI 기술과 검증된 심리학 이론을 바탕으로 높은 정확도를 제공합니다. 다만 정확한 진단을 위해서는 전문의 상담을 권장합니다.</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Q. 몇 살부터 검사할 수 있나요?</h4>
                  <p className="text-sm text-muted-foreground">만 3세부터 성인까지 연령별 맞춤 검사를 제공합니다. 유아의 경우 보호자와 함께 진행해 주세요.</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Q. 검사 결과는 얼마나 보관되나요?</h4>
                  <p className="text-sm text-muted-foreground">검사 결과는 영구 보관되며, 언제든지 확인하실 수 있습니다. 계정 삭제 시 모든 데이터가 완전히 삭제됩니다.</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">구독 및 결제 관련</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Q. 구독은 언제 시작되나요?</h4>
                  <p className="text-sm text-muted-foreground">결제 완료 후 즉시 시작됩니다. 토큰 방식으로 원하는 만큼만 이용하실 수 있습니다.</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Q. 가족도 함께 사용할 수 있나요?</h4>
                  <p className="text-sm text-muted-foreground">네, 하나의 계정으로 가족 전체를 관리할 수 있습니다. 가족 케어 기능을 통해 체계적으로 관리하세요.</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Q. 환불이 가능한가요?</h4>
                  <p className="text-sm text-muted-foreground">미사용 토큰은 영구 보관되며 월 구독 종료만 가능합니다. 토큰은 소멸되지 않아 언제든 다시 이용하실 수 있습니다.</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">개인정보 및 보안</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Q. 개인정보는 안전한가요?</h4>
                  <p className="text-sm text-muted-foreground">모든 데이터는 암호화되어 저장되며, 개인정보보호법을 준수합니다. 제3자에게 공유되지 않습니다.</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Q. 상담 내용이 노출될 위험은 없나요?</h4>
                  <p className="text-sm text-muted-foreground">상담 내용은 종단간 암호화로 보호되며, 오직 본인만 확인할 수 있습니다.</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Q. 앱이 작동하지 않아요</h4>
                  <p className="text-sm text-muted-foreground">브라우저 새로고침을 먼저 시도해 보세요. 문제가 지속되면 고객센터로 연락해 주세요.</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Q. 어떤 기기에서 사용 가능한가요?</h4>
                  <p className="text-sm text-muted-foreground">PC, 스마트폰, 태블릿 등 인터넷이 연결된 모든 기기에서 사용 가능합니다.</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">제휴기관 & 치료사</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Q. 제휴기관 수익분배는 어떻게 되나요?</h4>
                  <p className="text-sm text-muted-foreground">상담/치료 70%, 온라인전문가리포팅 보고서작성 50%, 관찰일지리뷰 50%가 기관 수익입니다. 월 매출에 따른 성과 보너스도 추가 제공됩니다.</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Q. 개별 치료사 수익구조는 어떤가요?</h4>
                  <p className="text-sm text-muted-foreground">온라인 치료의 70%가 치료사 수익, 30%는 플랫폼 운영비입니다. 리포팅 서비스는 50:50 분배하며, 대면치료 기관 유입은 100% 기관 수익입니다.</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Q. 정산과 지급은 언제 되나요?</h4>
                  <p className="text-sm text-muted-foreground">매월 말일 정산 후 익월 10일 지급됩니다. 실시간 매출 대시보드와 투명한 정산 내역서를 제공하며, 세금계산서도 자동 발행됩니다.</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Q. 초기 투자비용이 있나요?</h4>
                  <p className="text-sm text-muted-foreground">플랫폼 입점비, 초기 설정비, 시스템 사용료 모두 무료입니다. 완전한 성과 연동형 수익 모델로 위험 부담 없이 시작하실 수 있습니다.</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Q. 성과 보너스는 어떻게 받나요?</h4>
                  <p className="text-sm text-muted-foreground">월 매출 500만원 이상 시 +2%, 고객 만족도 4.8점 이상 시 +1%, 신규 고객 10명 이상 시 +1% 추가 보너스를 지급합니다.</p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Q. 어떤 마케팅 지원을 받나요?</h4>
                  <p className="text-sm text-muted-foreground">SEO 최적화, SNS 마케팅, 구글 광고 지원, 네이버 플레이스 관리, 고객 리뷰 관리, 전문가 프로필 최적화 등 종합적인 디지털 마케팅을 지원합니다.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* 토스페이먼츠 결제 모달 */}
      <TossPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={handlePaymentModalClose}
        plan={selectedPlan}
      />
    </div>
  );
};

export default Subscription;