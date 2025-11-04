import React from 'react';
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
      gradient: 'from-violet-500/90 via-purple-500/90 to-fuchsia-500/90',
      hoverGradient: 'hover:from-violet-600 hover:via-purple-600 hover:to-fuchsia-600',
      glowColor: 'shadow-[0_0_80px_rgba(139,92,246,0.3)]',
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
      gradient: 'from-cyan-500/90 via-blue-500/90 to-indigo-500/90',
      hoverGradient: 'hover:from-cyan-600 hover:via-blue-600 hover:to-indigo-600',
      glowColor: 'shadow-[0_0_80px_rgba(59,130,246,0.3)]',
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
      gradient: 'from-rose-500/90 via-pink-500/90 to-red-500/90',
      hoverGradient: 'hover:from-rose-600 hover:via-pink-600 hover:to-red-600',
      glowColor: 'shadow-[0_0_80px_rgba(244,63,94,0.3)]',
      route: '/expert-matching',
      cta: '상담 신청하기',
      badge: '프리미엄'
    }
  ];

  return (
    <section className="relative py-32 overflow-hidden">
      {/* 배경 그라데이션 */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />
      
      {/* 배경 장식 요소 */}
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />

      <div className="container relative mx-auto px-6">
        {/* 섹션 헤더 */}
        <div className="text-center mb-20 space-y-6 animate-fade-in">
          <Badge className="text-base px-6 py-2 bg-primary/10 hover:bg-primary/20 transition-colors">
            <Clock className="w-5 h-5 mr-2" />
            3분이면 충분합니다
          </Badge>
          <h2 className="text-5xl md:text-6xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-primary via-purple-500 to-primary bg-clip-text text-transparent">
              간단한 3단계
            </span>
            <br />
            <span className="text-foreground">당신만의 케어 여정</span>
          </h2>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            무료 체험부터 전문가 상담까지, 단계별로 필요한 케어를 제공합니다
          </p>
        </div>

        {/* 서비스 카드 */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-10 max-w-7xl mx-auto mb-20">
          {services.map((service, index) => (
            <div
              key={service.id}
              className="group relative"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* 글로우 효과 */}
              <div className={`absolute -inset-1 bg-gradient-to-r ${service.gradient} rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-all duration-500 ${service.glowColor}`} />
              
              {/* 카드 본체 */}
              <div className="relative h-full backdrop-blur-xl bg-card/50 border border-border/50 rounded-3xl p-8 transition-all duration-500 hover:border-primary/50 hover:shadow-2xl hover:-translate-y-2">
                {/* 스텝 번호 배지 */}
                <div className="absolute -top-4 -right-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-background to-muted border-2 border-primary/20 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <span className="text-2xl font-black bg-gradient-to-br from-primary to-purple-600 bg-clip-text text-transparent">
                    {index + 1}
                  </span>
                </div>

                {/* 아이콘 */}
                <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${service.gradient} mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                  <service.icon className="w-10 h-10 text-white" />
                </div>

                {/* 헤더 */}
                <div className="mb-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <h3 className="text-3xl font-bold text-foreground">
                      {service.title}
                    </h3>
                    <Badge variant="secondary" className="text-xs font-semibold">
                      {service.badge}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">
                    {service.subtitle}
                  </p>
                  <p className="text-base text-muted-foreground leading-relaxed">
                    {service.description}
                  </p>
                </div>

                {/* 기능 리스트 */}
                <div className="space-y-3 mb-8">
                  {service.features.map((feature, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center gap-3 text-sm group/item hover:translate-x-1 transition-transform duration-200"
                    >
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                        <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                      </div>
                      <span className="text-foreground/90 font-medium">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA 버튼 */}
                <Button
                  onClick={() => navigate(service.route)}
                  className={`w-full group/btn bg-gradient-to-r ${service.gradient} ${service.hoverGradient} text-white font-bold text-base py-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border-0`}
                  size="lg"
                >
                  <span>{service.cta}</span>
                  <ArrowRight className="w-5 h-5 ml-2 group-hover/btn:translate-x-2 transition-transform duration-300" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* 사용자 여정 플로우 */}
        <div className="relative mt-24 p-10 bg-gradient-to-br from-primary/10 via-purple-500/10 to-primary/5 backdrop-blur-xl rounded-3xl border border-primary/20 max-w-5xl mx-auto shadow-2xl overflow-hidden">
          {/* 장식 요소 */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-500/20 to-transparent rounded-full blur-3xl" />
          
          <div className="relative">
            <h3 className="text-center text-2xl md:text-3xl font-bold mb-10 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              📍 추천 사용 여정
            </h3>
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 text-center">
              <div className="flex-1 space-y-4 group hover:scale-105 transition-transform duration-300">
                <div className="text-5xl mb-3 animate-bounce">1️⃣</div>
                <p className="text-base md:text-lg font-bold text-foreground">무료 관찰일지로</p>
                <p className="text-base md:text-lg font-bold text-primary">AI 체험</p>
              </div>
              <ArrowRight className="w-8 h-8 text-primary/60 rotate-90 md:rotate-0 flex-shrink-0 animate-pulse" />
              <div className="flex-1 space-y-4 group hover:scale-105 transition-transform duration-300">
                <div className="text-5xl mb-3 animate-bounce" style={{ animationDelay: '100ms' }}>2️⃣</div>
                <p className="text-base md:text-lg font-bold text-foreground">정밀 검사로</p>
                <p className="text-base md:text-lg font-bold text-primary">정확한 분석</p>
              </div>
              <ArrowRight className="w-8 h-8 text-primary/60 rotate-90 md:rotate-0 flex-shrink-0 animate-pulse" style={{ animationDelay: '200ms' }} />
              <div className="flex-1 space-y-4 group hover:scale-105 transition-transform duration-300">
                <div className="text-5xl mb-3 animate-bounce" style={{ animationDelay: '200ms' }}>3️⃣</div>
                <p className="text-base md:text-lg font-bold text-foreground">전문가 상담으로</p>
                <p className="text-base md:text-lg font-bold text-primary">지속 케어</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SimplifiedCoreServices;
