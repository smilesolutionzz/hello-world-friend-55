import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, Sparkles, Heart, ArrowRight, CheckCircle, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SimplifiedCoreServices = () => {
  const navigate = useNavigate();

  const services = [
    {
      id: 'observation',
      icon: Brain,
      title: '관찰일지',
      subtitle: '무료 체험',
      description: '일상 행동을 기록하면 AI가 즉시 분석해드립니다',
      features: [
        '30초만에 작성 가능',
        '무료 AI 분석 1회 제공',
        '회원가입 불필요'
      ],
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      route: '/observation',
      cta: '무료 체험하기',
      badge: '완전 무료'
    },
    {
      id: 'analysis',
      icon: Sparkles,
      title: 'AI 분석 리포트',
      subtitle: '유료 서비스',
      description: 'ADHD, 스트레스 등 전문적인 심리검사 & 분석',
      features: [
        '3분 심리검사',
        '전문가급 AI 분석',
        '맞춤형 개선 가이드'
      ],
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      route: '/assessment',
      cta: '검사 시작하기',
      badge: '베이직'
    },
    {
      id: 'expert',
      icon: Heart,
      title: '전문가 상담',
      subtitle: '프리미엄',
      description: '실시간 전문가 매칭 & 1:1 맞춤 상담',
      features: [
        '24시간 전문가 매칭',
        '화상/채팅 상담',
        '지속적인 케어'
      ],
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      route: '/expert-matching',
      cta: '상담 신청하기',
      badge: '프리미엄'
    }
  ];

  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-6">
        {/* 섹션 헤더 */}
        <div className="text-center mb-16 space-y-4">
          <Badge className="text-sm px-4 py-2">
            <Clock className="w-4 h-4 mr-2" />
            3분이면 충분합니다
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold">
            <span className="text-foreground">간단한 3단계 여정</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            무료 체험부터 전문가 상담까지, 단계별로 필요한 케어를 제공합니다
          </p>
        </div>

        {/* 서비스 카드 */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {services.map((service, index) => (
            <Card 
              key={service.id}
              className="relative overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2"
            >
              {/* 배경 그라데이션 */}
              <div className={`absolute top-0 left-0 right-0 h-32 bg-gradient-to-br ${service.color} opacity-10`} />
              
              <CardContent className="relative p-8 space-y-6">
                {/* 헤더 */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${service.color}`}>
                      <service.icon className="w-8 h-8 text-white" />
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {service.badge}
                    </Badge>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-2xl font-bold">{service.title}</h3>
                      <span className="text-sm text-muted-foreground">
                        {service.subtitle}
                      </span>
                    </div>
                    <p className="text-muted-foreground">
                      {service.description}
                    </p>
                  </div>
                </div>

                {/* 기능 리스트 */}
                <div className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA 버튼 */}
                <Button
                  onClick={() => navigate(service.route)}
                  className={`w-full group bg-gradient-to-r ${service.color} hover:opacity-90`}
                  size="lg"
                >
                  <span>{service.cta}</span>
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>

                {/* 스텝 번호 */}
                <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm border-2 flex items-center justify-center">
                  <span className="text-xl font-bold text-muted-foreground">
                    {index + 1}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* 사용자 여정 플로우 */}
        <div className="mt-16 p-8 bg-gradient-to-r from-primary/5 to-primary/10 rounded-3xl border border-primary/20 max-w-4xl mx-auto">
          <h3 className="text-center text-xl font-bold mb-6">📍 추천 사용 여정</h3>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-center">
            <div className="flex-1">
              <div className="text-2xl mb-2">1️⃣</div>
              <p className="text-sm font-medium">무료 관찰일지로<br />AI 체험</p>
            </div>
            <ArrowRight className="w-6 h-6 text-muted-foreground rotate-90 md:rotate-0" />
            <div className="flex-1">
              <div className="text-2xl mb-2">2️⃣</div>
              <p className="text-sm font-medium">정밀 검사로<br />정확한 분석</p>
            </div>
            <ArrowRight className="w-6 h-6 text-muted-foreground rotate-90 md:rotate-0" />
            <div className="flex-1">
              <div className="text-2xl mb-2">3️⃣</div>
              <p className="text-sm font-medium">전문가 상담으로<br />지속 케어</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SimplifiedCoreServices;
