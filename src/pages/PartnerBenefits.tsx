import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Building2,
  Baby,
  GraduationCap,
  Heart,
  School,
  CheckCircle,
  Star,
  TrendingUp,
  FileText,
  Users,
  BarChart3,
  Shield,
  Sparkles,
  ArrowRight,
  Crown,
  Zap,
  Clock,
  MessageCircle,
  Video,
  Brain,
  Gift
} from 'lucide-react';

const PartnerBenefits = () => {
  const navigate = useNavigate();

  const institutionTypes = [
    {
      id: 'developmental',
      name: '발달센터',
      icon: <Baby className="w-6 h-6" />,
      description: '아동 발달 전문기관',
      benefits: [
        { title: '치료 변화 객관적 추적', desc: 'AI 영상분석으로 치료 전후 변화를 수치화', highlight: true },
        { title: '자동 리포트 생성', desc: '부모 상담용 보고서 자동 생성으로 업무 경감' },
        { title: '22종+ 발달검사 도구', desc: '표준화된 발달검사 무제한 제공' },
        { title: '관찰일지 시스템', desc: '아동별 행동 관찰 기록 및 추이 분석' },
        { title: '바우처 연동 지원', desc: '정부 발달바우처 대상자 관리 시스템' }
      ],
      stats: { users: '3,200+', satisfaction: '4.9' }
    },
    {
      id: 'counseling',
      name: '상담센터',
      icon: <Heart className="w-6 h-6" />,
      description: '심리상담 전문기관',
      benefits: [
        { title: '심리검사 비용 절감', desc: '1인당 검사 비용 70% 이상 절감', highlight: true },
        { title: '내담자 사전 스크리닝', desc: 'AI 기반 초기 상태 평가로 상담 효율화' },
        { title: '상담 전후 변화 측정', desc: '객관적 지표로 상담 효과 입증' },
        { title: '가족 통합 관리', desc: '부모-자녀 관계 분석 및 가족상담 지원' },
        { title: '전문가 네트워크 연결', desc: '플랫폼 내 전문가 매칭 우선권' }
      ],
      stats: { users: '1,800+', satisfaction: '4.8' }
    },
    {
      id: 'kindergarten',
      name: '어린이집/유치원',
      icon: <School className="w-6 h-6" />,
      description: '영유아 보육/교육기관',
      benefits: [
        { title: '발달 지연 조기 발견', desc: 'AI가 놓치기 쉬운 발달 신호 자동 감지', highlight: true },
        { title: '학부모 상담 자료', desc: '발달 상태 리포트로 전문적인 상담 지원' },
        { title: '교사용 관찰 도구', desc: '간편한 행동 체크리스트 및 기록 시스템' },
        { title: '특수교육 연계', desc: '필요시 전문기관 연계 가이드 제공' },
        { title: '집단 발달 분석', desc: '반별/연령별 발달 현황 대시보드' }
      ],
      stats: { users: '2,500+', satisfaction: '4.7' }
    },
    {
      id: 'special_school',
      name: '특수학교',
      icon: <GraduationCap className="w-6 h-6" />,
      description: '특수교육 전문기관',
      benefits: [
        { title: 'IEP 목표 설정 지원', desc: '개별화교육계획 수립을 위한 객관적 데이터', highlight: true },
        { title: '행동 변화 추적', desc: '중재 효과를 수치로 문서화' },
        { title: '학부모 소통 강화', desc: '정기 리포트로 가정 연계 교육 지원' },
        { title: '전문 검사 도구', desc: '장애 유형별 맞춤 평가 도구 제공' },
        { title: '교사 연수 지원', desc: 'AI 도구 활용 교육 및 워크샵' }
      ],
      stats: { users: '800+', satisfaction: '4.9' }
    }
  ];

  const pricingTiers = [
    {
      name: '무료 파트너',
      price: '0',
      period: '월',
      description: '플랫폼 노출 + 기본 도구',
      features: [
        { text: '기관 프로필 등록 및 노출', included: true },
        { text: '기본 심리검사 10종', included: true },
        { text: '월 50건 AI 분석', included: true },
        { text: '기본 리포트 생성', included: true },
        { text: '전문가 매칭 요청', included: true },
        { text: '고급 영상분석', included: false },
        { text: '기관 전용 대시보드', included: false },
        { text: '바우처 연동', included: false },
        { text: '우선 노출 배치', included: false },
        { text: '전담 매니저', included: false }
      ],
      cta: '무료로 시작하기',
      popular: false,
      color: 'gray'
    },
    {
      name: '프로 파트너',
      price: '99,000',
      period: '월',
      description: '성장하는 기관을 위한 플랜',
      features: [
        { text: '기관 프로필 등록 및 노출', included: true },
        { text: '전체 심리검사 22종+', included: true },
        { text: '월 500건 AI 분석', included: true },
        { text: '전문가급 리포트 생성', included: true },
        { text: '전문가 매칭 우선권', included: true },
        { text: '고급 영상분석 (월 100건)', included: true },
        { text: '기관 전용 대시보드', included: true },
        { text: '바우처 연동', included: false },
        { text: '우선 노출 배치', included: false },
        { text: '전담 매니저', included: false }
      ],
      cta: '프로 시작하기',
      popular: true,
      color: 'blue'
    },
    {
      name: '프리미엄 파트너',
      price: '299,000',
      period: '월',
      description: '대형 기관을 위한 완전 솔루션',
      features: [
        { text: '기관 프로필 등록 및 노출', included: true },
        { text: '전체 심리검사 22종+', included: true },
        { text: '무제한 AI 분석', included: true },
        { text: '전문가급 리포트 생성', included: true },
        { text: '전문가 매칭 최우선권', included: true },
        { text: '무제한 영상분석', included: true },
        { text: '기관 전용 대시보드', included: true },
        { text: '바우처 연동', included: true },
        { text: '우선 노출 배치', included: true },
        { text: '전담 매니저', included: true }
      ],
      cta: '프리미엄 문의하기',
      popular: false,
      color: 'purple'
    }
  ];

  const valuePropositions = [
    {
      icon: <TrendingUp className="w-8 h-8 text-green-600" />,
      title: '매출 증가',
      description: '플랫폼 15,000+ 이용자에게 노출되어 신규 내담자 유입',
      stat: '평균 +30%'
    },
    {
      icon: <Clock className="w-8 h-8 text-blue-600" />,
      title: '업무 시간 절감',
      description: '자동 리포트 생성으로 서류 작업 시간 대폭 감소',
      stat: '주당 5시간+'
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-purple-600" />,
      title: '검사 비용 절감',
      description: '외부 심리검사 의뢰 비용 없이 자체 검사 가능',
      stat: '연간 200만원+'
    },
    {
      icon: <Shield className="w-8 h-8 text-orange-600" />,
      title: '전문성 강화',
      description: 'AI 기반 객관적 분석으로 신뢰도 향상',
      stat: '만족도 4.8+'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* 히어로 섹션 */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10" />
        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-blue-100 text-blue-700 border-blue-200">
              <Building2 className="w-4 h-4 mr-1" />
              기관 파트너십
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              AIHPRO와 함께 성장하세요
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              발달센터, 상담센터, 어린이집, 특수학교를 위한<br />
              <span className="text-blue-600 font-semibold">AI 기반 통합 심리분석 파트너십</span>
            </p>
          </div>

          {/* 핵심 가치 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {valuePropositions.map((item, index) => (
              <Card key={index} className="text-center p-4 hover:shadow-lg transition-shadow">
                <div className="flex justify-center mb-3">{item.icon}</div>
                <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-xs text-gray-500 mb-2">{item.description}</p>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  {item.stat}
                </Badge>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 기관 유형별 혜택 */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">기관 유형별 맞춤 혜택</h2>
            <p className="text-gray-600">각 기관의 특성에 맞는 최적화된 솔루션을 제공합니다</p>
          </div>

          <Tabs defaultValue="developmental" className="w-full">
            <TabsList className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-8 h-auto bg-transparent">
              {institutionTypes.map((type) => (
                <TabsTrigger 
                  key={type.id} 
                  value={type.id}
                  className="flex items-center gap-2 py-3 px-4 data-[state=active]:bg-blue-600 data-[state=active]:text-white rounded-lg border"
                >
                  {type.icon}
                  <span className="hidden md:inline">{type.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {institutionTypes.map((type) => (
              <TabsContent key={type.id} value={type.id}>
                <Card className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-white rounded-xl shadow-sm">
                          {type.icon}
                        </div>
                        <div>
                          <CardTitle className="text-2xl">{type.name}</CardTitle>
                          <p className="text-gray-600">{type.description}</p>
                        </div>
                      </div>
                      <div className="text-right hidden md:block">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="text-sm text-gray-500">이용 기관</p>
                            <p className="text-xl font-bold text-blue-600">{type.stats.users}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">만족도</p>
                            <div className="flex items-center gap-1">
                              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                              <span className="text-xl font-bold">{type.stats.satisfaction}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      {type.benefits.map((benefit, index) => (
                        <div 
                          key={index} 
                          className={`flex items-start gap-3 p-4 rounded-lg ${
                            benefit.highlight ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                          }`}
                        >
                          <CheckCircle className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                            benefit.highlight ? 'text-blue-600' : 'text-green-600'
                          }`} />
                          <div>
                            <h4 className={`font-semibold ${benefit.highlight ? 'text-blue-700' : 'text-gray-900'}`}>
                              {benefit.title}
                            </h4>
                            <p className="text-sm text-gray-600">{benefit.desc}</p>
                          </div>
                          {benefit.highlight && (
                            <Badge className="bg-blue-600 text-white ml-auto">핵심</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* 가격 정책 */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">파트너십 플랜</h2>
            <p className="text-gray-600">기관 규모와 필요에 맞는 플랜을 선택하세요</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {pricingTiers.map((tier, index) => (
              <Card 
                key={index} 
                className={`relative overflow-hidden ${
                  tier.popular ? 'border-2 border-blue-500 shadow-xl scale-105' : ''
                }`}
              >
                {tier.popular && (
                  <div className="absolute top-0 right-0 bg-blue-600 text-white px-4 py-1 text-sm font-semibold">
                    인기
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <CardTitle className="text-xl mb-2">{tier.name}</CardTitle>
                  <div className="mb-2">
                    <span className="text-4xl font-bold">₩{tier.price}</span>
                    <span className="text-gray-500">/{tier.period}</span>
                  </div>
                  <p className="text-sm text-gray-600">{tier.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {tier.features.map((feature, fIndex) => (
                      <li key={fIndex} className="flex items-center gap-2">
                        {feature.included ? (
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                        )}
                        <span className={feature.included ? 'text-gray-900' : 'text-gray-400'}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${
                      tier.popular 
                        ? 'bg-blue-600 hover:bg-blue-700' 
                        : tier.color === 'purple'
                        ? 'bg-purple-600 hover:bg-purple-700'
                        : 'bg-gray-800 hover:bg-gray-900'
                    }`}
                    onClick={() => navigate('/b2b-inquiry')}
                  >
                    {tier.cta}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* 제공 기능 상세 */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">파트너 전용 기능</h2>
            <p className="text-gray-600">협력기관만을 위한 특별한 기능들</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Video className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">AI 영상 분석</h3>
              <p className="text-gray-600 text-sm mb-4">
                아동 행동 영상을 AI가 분석하여 발달 상태를 객관적으로 평가합니다. 
                치료 전후 변화를 수치화하여 효과를 입증할 수 있습니다.
              </p>
              <Badge variant="secondary">프로 이상</Badge>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">자동 리포트 생성</h3>
              <p className="text-gray-600 text-sm mb-4">
                검사 결과를 바탕으로 전문가급 분석 리포트를 자동 생성합니다.
                부모 상담, 기관 보고용으로 즉시 활용 가능합니다.
              </p>
              <Badge variant="secondary">모든 플랜</Badge>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">기관 대시보드</h3>
              <p className="text-gray-600 text-sm mb-4">
                이용자 현황, 검사 통계, 발달 추이 등을 한눈에 파악할 수 있는
                기관 전용 관리 대시보드를 제공합니다.
              </p>
              <Badge variant="secondary">프로 이상</Badge>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">전문가 매칭</h3>
              <p className="text-gray-600 text-sm mb-4">
                플랫폼 내 15,000+ 이용자와의 연결을 통해 
                신규 내담자를 유치할 수 있습니다.
              </p>
              <Badge variant="secondary">모든 플랜</Badge>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-pink-100 rounded-xl flex items-center justify-center mb-4">
                <Gift className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">바우처 연동</h3>
              <p className="text-gray-600 text-sm mb-4">
                정부 발달재활바우처, 언어발달바우처 등 
                공공 지원 프로그램과 연동하여 관리합니다.
              </p>
              <Badge variant="secondary">프리미엄</Badge>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center mb-4">
                <MessageCircle className="w-6 h-6 text-cyan-600" />
              </div>
              <h3 className="font-bold text-lg mb-2">전담 매니저</h3>
              <p className="text-gray-600 text-sm mb-4">
                프리미엄 파트너에게는 전담 계정 매니저가 배정되어
                맞춤형 지원을 제공합니다.
              </p>
              <Badge variant="secondary">프리미엄</Badge>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA 섹션 */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <Crown className="w-16 h-16 mx-auto mb-6 opacity-80" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            지금 파트너가 되세요
          </h2>
          <p className="text-xl opacity-90 mb-8">
            40+ 협력기관이 이미 AIHPRO와 함께 성장하고 있습니다
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              className="bg-white text-blue-600 hover:bg-gray-100"
              onClick={() => navigate('/b2b-inquiry')}
            >
              파트너십 문의하기
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="border-white text-white hover:bg-white/10"
              onClick={() => window.open('https://open.kakao.com/o/sHLdK3Ch', '_blank')}
            >
              카카오톡 상담
              <MessageCircle className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PartnerBenefits;
