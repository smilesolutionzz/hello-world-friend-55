import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Crown, 
  TrendingUp, 
  Target, 
  Users, 
  BarChart3,
  Zap,
  Star,
  Eye,
  MessageCircle,
  Calendar,
  CheckCircle,
  ArrowRight,
  Award,
  Globe,
  Shield
} from "lucide-react";

export function InstitutionMarketingPresentation() {
  const plans = [
    {
      name: 'BASIC',
      price: '무료',
      subtitle: '기본 노출 서비스',
      features: [
        '기본 기관 정보 등록',
        '검색 결과 일반 노출',
        '기본 연락처 정보 제공',
        '월 5회 문의 알림'
      ],
      limitations: [
        '검색 우선순위 낮음',
        '분석 데이터 제한',
        '마케팅 도구 없음'
      ],
      color: 'border-gray-200',
      bgColor: 'bg-gray-50'
    },
    {
      name: 'STANDARD',
      price: '월 100,000원',
      subtitle: '우선 노출 & 기본 마케팅',
      features: [
        '🔥 검색 결과 우선 노출',
        '📊 월간 성과 분석 리포트',
        '⭐ "추천 기관" 배지 표시',
        '🎯 타겟 고객 매칭 시스템',
        '📞 빠른 상담 문의 기능',
        '📈 실시간 방문자 통계',
        '💬 리뷰 관리 도구',
        '📱 모바일 최적화 프로필'
      ],
      benefits: [
        '검색 노출 300% 증가',
        '문의량 평균 150% 상승',
        '신규 고객 획득률 250% 향상'
      ],
      color: 'border-blue-300',
      bgColor: 'bg-blue-50',
      recommended: true
    },
    {
      name: 'PREMIUM',
      price: '월 200,000원',
      subtitle: '최우선 노출 & 전문 마케팅',
      features: [
        '👑 최우선 검색 노출 (상단 고정)',
        '🎯 AI 기반 고객 매칭',
        '📊 실시간 분석 대시보드',
        '🏆 "프리미엄 인증" 배지',
        '🎬 기관 소개 영상 업로드',
        '📅 온라인 예약 시스템 연동',
        '💼 전담 계정 매니저 지원',
        '📱 카카오톡 상담 연동',
        '🎨 맞춤형 프로필 디자인',
        '📈 경쟁사 분석 리포트'
      ],
      benefits: [
        '검색 노출 500% 증가',
        '문의량 평균 400% 상승',
        '신규 고객 획득률 600% 향상',
        '고객 전환율 80% 개선'
      ],
      color: 'border-yellow-400',
      bgColor: 'bg-gradient-to-br from-yellow-50 to-orange-50'
    }
  ];

  const hsoValues = [
    {
      icon: Users,
      title: '접근성 확대',
      description: '더 많은 가족들이 필요한 서비스를 쉽게 찾을 수 있도록 지원',
      impact: '지역사회 서비스 접근성 300% 향상'
    },
    {
      icon: Target,
      title: '서비스 매칭 최적화',
      description: '각 가족의 특성에 맞는 최적의 기관을 AI가 추천',
      impact: '서비스-고객 매칭 정확도 85% 달성'
    },
    {
      icon: BarChart3,
      title: '데이터 기반 개선',
      description: '실시간 분석을 통한 서비스 품질 지속 개선',
      impact: '서비스 만족도 평균 4.8/5.0 유지'
    },
    {
      icon: Shield,
      title: '신뢰성 보장',
      description: '검증된 기관만 등록하여 서비스 신뢰도 확보',
      impact: '기관 신뢰도 95% 이상 유지'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full text-sm font-medium">
            <Crown className="w-4 h-4" />
            제휴기관 프리미엄 서비스 소개
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            더 많은 가족과 만나세요
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            HSO(Human Service Organization) 관점에서 설계된 우리의 프리미엄 서비스는 
            <span className="font-semibold text-blue-600"> 더 많은 가족들에게 필요한 서비스를 제공</span>하고, 
            <span className="font-semibold text-purple-600"> 기관의 사회적 가치를 극대화</span>합니다.
          </p>
        </div>

        {/* HSO 가치 섹션 */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Human Service Organization의 핵심 가치 실현</h2>
            <p className="text-lg text-muted-foreground">
              사회복지기관으로서 더 많은 가족에게 도움이 되는 서비스 전달을 위한 혁신
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {hsoValues.map((value, index) => (
              <Card key={index} className="text-center p-6 hover:shadow-lg transition-all">
                <CardContent className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                    <value.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    {value.impact}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* 플랜 비교 */}
        <section className="space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">서비스 플랜별 고객 유치 효과</h2>
            <p className="text-lg text-muted-foreground">
              실제 데이터 기반으로 검증된 고객 유치 성과를 확인하세요
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {plans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.color} ${plan.bgColor} hover:shadow-xl transition-all duration-300`}>
                {plan.recommended && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1">
                      <Star className="w-4 h-4 mr-1" />
                      추천 플랜
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <div className="text-3xl font-bold text-primary">{plan.price}</div>
                  <p className="text-sm text-muted-foreground">{plan.subtitle}</p>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* 주요 기능 */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      포함 기능
                    </h4>
                    <ul className="space-y-2">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="text-sm flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 예상 효과 */}
                  {plan.benefits && (
                    <div className="bg-white/60 rounded-lg p-4">
                      <h4 className="font-semibold mb-3 flex items-center gap-2 text-green-700">
                        <TrendingUp className="w-4 h-4" />
                        예상 고객 유치 효과
                      </h4>
                      <ul className="space-y-2">
                        {plan.benefits.map((benefit, idx) => (
                          <li key={idx} className="text-sm font-medium text-green-700 flex items-center gap-2">
                            <ArrowRight className="w-3 h-3" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 제한사항 (기본 플랜만) */}
                  {plan.limitations && (
                    <div className="bg-orange-50 rounded-lg p-4 border-l-4 border-orange-200">
                      <h4 className="font-semibold mb-2 text-orange-700">현재 제한사항</h4>
                      <ul className="space-y-1">
                        {plan.limitations.map((limitation, idx) => (
                          <li key={idx} className="text-sm text-orange-600">
                            • {limitation}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <Button 
                    className={`w-full ${plan.name === 'PREMIUM' ? 'bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600' : ''}`}
                    variant={plan.name === 'BASIC' ? 'outline' : 'default'}
                  >
                    {plan.name === 'BASIC' ? '현재 플랜' : `${plan.name} 시작하기`}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* 성공 사례 */}
        <section className="bg-white rounded-2xl p-8 shadow-lg">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">실제 제휴기관 성공 사례</h2>
            <p className="text-lg text-muted-foreground">
              프리미엄 서비스를 통해 실제로 더 많은 가족들과 연결된 기관들의 이야기
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-center p-6">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
                  <Award className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold">○○ 발달센터</h3>
                <p className="text-sm text-muted-foreground">
                  STANDARD 플랜 도입 후 3개월 만에 신규 가족 상담 250% 증가
                </p>
                <Badge className="bg-blue-50 text-blue-700">월 150% 문의 증가</Badge>
              </CardContent>
            </Card>

            <Card className="text-center p-6">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center">
                  <Globe className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold">△△ 언어치료센터</h3>
                <p className="text-sm text-muted-foreground">
                  PREMIUM 플랜으로 지역 내 1위 검색 노출, 대기자 명단 생성
                </p>
                <Badge className="bg-purple-50 text-purple-700">월 400% 예약 증가</Badge>
              </CardContent>
            </Card>

            <Card className="text-center p-6">
              <CardContent className="space-y-4">
                <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold">□□ 종합복지관</h3>
                <p className="text-sm text-muted-foreground">
                  다양한 서비스 노출로 지역사회 인지도 대폭 상승, 프로그램 참여율 300% 증가
                </p>
                <Badge className="bg-green-50 text-green-700">지역 만족도 1위</Badge>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl p-12">
          <h2 className="text-3xl font-bold mb-4">더 많은 가족들과 만날 준비가 되셨나요?</h2>
          <p className="text-xl mb-8 opacity-90">
            우리의 프리미엄 서비스로 기관의 사회적 가치를 극대화하고, 
            더 많은 가족들에게 필요한 도움을 제공하세요.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="outline" className="bg-white text-blue-600 hover:bg-gray-50">
              <MessageCircle className="w-5 h-5 mr-2" />
              상담 문의하기
            </Button>
            <Button size="lg" className="bg-yellow-400 text-black hover:bg-yellow-300">
              <Zap className="w-5 h-5 mr-2" />
              무료 체험 시작하기
            </Button>
          </div>

          <p className="text-sm mt-6 opacity-75">
            14일 무료 체험 • 계약 없음 • 언제든 취소 가능
          </p>
        </section>

        {/* 연락처 */}
        <section className="text-center">
          <div className="inline-flex items-center gap-4 bg-white rounded-lg p-6 shadow-md">
            <div className="text-left">
              <h3 className="font-semibold">마케팅팀 직통 연락처</h3>
              <p className="text-sm text-muted-foreground">
                📞 1588-0000 | 📧 marketing@company.com
              </p>
            </div>
            <Button variant="outline">
              지금 연락하기
            </Button>
          </div>
        </section>

      </div>
    </div>
  );
}