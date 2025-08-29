import React, { useState, useEffect } from 'react';
import { UnifiedNavigation } from '@/components/navigation/UnifiedNavigation';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Crown, Zap, Star, Check } from 'lucide-react';

import { supabase } from '@/integrations/supabase/client';

const Subscription = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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

  const handleSubscribe = async (planId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate('/auth');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: { 
          planId,
          subscriptionType: 'monthly'
        }
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      console.error('Subscription error:', error);
    } finally {
      setLoading(false);
    }
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
                "모든 사람이 자신의 진정한 가능성을 발견하고, 행복한 삶을 살아갈 권리가 있습니다."
              </p>
              
              <div className="space-y-4 text-base">
                <p>
                  안녕하세요, AIHPRO 창립자입니다.
                </p>
                
                <p>
                  우리는 모두 누군가의 소중한 사람입니다. 1세 아기부터 90세 할머니까지, 
                  각자가 가진 고민과 아픔, 그리고 꿈을 이해하고 싶었습니다.
                </p>
                
                <p>
                  마음의 병은 보이지 않습니다. 우울한 청소년, 불안한 직장인, 발달지연을 가진 아이 때문에 
                  밤잠을 설치는 엄마, 치매 걱정에 잠 못 이루는 어르신들... 모든 연령에서 심리적 어려움은 
                  찾아옵니다. 하지만 지금까지 전문적인 도움을 받기에는 비용도 부담스럽고, 기관을 방문하기에는 두려움이 컸죠.
                </p>
                
                <p>
                  <strong>AIHPRO는 이 모든 것을 바꾸고 싶었습니다.</strong> 하지만 우리는 한 가지 분명히 알고 있습니다. 
                  AI는 단지 우리 인간의 회복에 데이터를 제공할 뿐, 정서적 회복은 결국 사람만이 가능하다는 것을요. 
                </p>
                
                <p>
                  그래서 AIHPRO는 '휴먼테크'입니다. 단 3분의 검사로 당신의 마음을 정확히 파악하고, 
                  AI가 먼저 분석한 후 정말 필요할 때만 따뜻한 전문가의 손길로 연결해드립니다. 
                  기술은 차갑지만, 치유는 따뜻해야 한다고 믿습니다. 이렇게 하면 10분의 1 비용으로도 최고 수준의 심리 지원을 받을 수 있습니다.
                </p>
                
                <p>
                  우리의 꿈은 거창하지 않습니다. 그저 이 세상 모든 사람이 <strong>'나는 혼자가 아니구나'</strong>
                  라고 느낄 수 있는 세상을 만드는 것입니다. 당신의 고민이 무엇이든, 나이가 몇 살이든, 
                  AIHPRO가 함께하겠습니다.
                </p>
                
                <p className="font-semibold text-blue-800">
                  당신의 마음이 건강해질 때, 가족이 행복해집니다. 
                  가족이 행복해질 때, 세상이 더 아름다워집니다.
                </p>
              </div>
              
              <div className="mt-8 text-right">
                <div className="text-lg font-semibold text-blue-800">
                  AIHPRO 창립자 드림
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  "모든 연령, 모든 마음을 위한 따뜻한 동행"
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
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
              <p className="text-base font-medium text-blue-800">
                ⚡ <strong>지금 시작하면</strong> 무료 10토큰 + 3분만에 내 마음 상태를 정확히 알 수 있습니다!
              </p>
            </div>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2">
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-primary" />
                  핵심 기능
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium">⚡ 3분 심리검사</h4>
                    <p className="text-sm text-muted-foreground">빠르고 정확한 심리상태 체크</p>
                    <div className="text-xs text-blue-600 font-medium mt-1">
                      💡 커피 한 잔 마시는 시간에 내 마음 상태 완벽 분석!
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium">🤖 AI 분석 리포트</h4>
                    <p className="text-sm text-muted-foreground">개인 맞춤형 상세 분석 결과</p>
                    <div className="text-xs text-blue-600 font-medium mt-1">
                      🎯 나만의 맞춤 솔루션까지 제공!
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium">👨‍⚕️ 전문가 상담</h4>
                    <p className="text-sm text-muted-foreground">AI → 전문가 연계 상담 시스템</p>
                    <div className="text-xs text-blue-600 font-medium mt-1">
                      💰 필요할 때만! 10분의 1 비용으로!
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium">👨‍👩‍👧‍👦 가족 케어</h4>
                    <p className="text-sm text-muted-foreground">가족 구성원 통합 관리</p>
                    <div className="text-xs text-blue-600 font-medium mt-1">
                      🏠 온 가족의 마음 건강을 한 번에!
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-purple-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary" />
                  특별한 장점
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium">🎯 AI 기반 정확성</h4>
                    <p className="text-sm text-muted-foreground">최신 AI 모델로 높은 분석 정확도</p>
                    <div className="text-xs text-purple-600 font-medium mt-1">
                      📊 95% 이상의 놀라운 정확도!
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium">🕐 24시간/매일 접근성</h4>
                    <p className="text-sm text-muted-foreground">언제든지 검사 및 상담 가능</p>
                    <div className="text-xs text-purple-600 font-medium mt-1">
                      🌙 새벽 3시에도, 주말에도 OK!
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium">🔒 개인정보 보호</h4>
                    <p className="text-sm text-muted-foreground">철저한 데이터 암호화 및 보안</p>
                    <div className="text-xs text-purple-600 font-medium mt-1">
                      🛡️ 은행급 보안으로 100% 안전!
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium">💝 합리적 비용</h4>
                    <p className="text-sm text-muted-foreground">전통적 상담 대비 경제적</p>
                    <div className="text-xs text-purple-600 font-medium mt-1">
                      💸 병원비 20만원 → 토큰 2개 (2천원)!
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* CTA 섹션 추가 */}
          <div className="mt-12 text-center">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-8 shadow-xl">
              <h3 className="text-2xl font-bold mb-4">🚀 지금 시작하지 않으면 후회할 이유</h3>
              <div className="grid gap-4 md:grid-cols-3 mb-6">
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-xl font-bold">⏰ 3분</div>
                  <div className="text-sm">검사 시간</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-xl font-bold">💰 90% 절약</div>
                  <div className="text-sm">병원 대비</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-xl font-bold">🎯 95% 정확도</div>
                  <div className="text-sm">AI 분석</div>
                </div>
              </div>
              <p className="text-lg mb-6">
                <strong>매일 밤 "우리 아이 괜찮을까?" 걱정하는 시간에</strong><br/>
                <strong>단 3분으로 확실한 답을 얻으세요!</strong>
              </p>
              <div className="flex justify-center gap-4">
                <button 
                  onClick={() => navigate('/token-subscription')}
                  className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors"
                >
                  💎 토큰 구매하고 지금 시작하기
                </button>
                <button 
                  onClick={() => navigate('/assessment')}
                  className="border-2 border-white text-white px-8 py-3 rounded-lg font-bold hover:bg-white/10 transition-colors"
                >
                  🆓 무료로 먼저 체험하기
                </button>
              </div>
            </div>
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
                  <p className="text-sm text-muted-foreground">1세부터 성인까지 연령별 맞춤 검사를 제공합니다. 유아의 경우 보호자와 함께 진행해 주세요.</p>
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
                  <p className="text-sm text-muted-foreground">AIHPRO 자체적인 마케팅과 광고를 통해 고객 유입을 만들어 제휴기관의 신규 고객 확보 통로 역할을 합니다. 별도의 마케팅 비용 없이 플랫폼 마케팅 효과를 공유받으실 수 있습니다.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Subscription;