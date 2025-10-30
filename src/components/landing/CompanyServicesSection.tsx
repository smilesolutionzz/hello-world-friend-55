import React from 'react';
import { BookHeart, Brain, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CompanyServicesSection = () => {
  const services = [
    {
      name: 'Memolegacy',
      description: 'AI와 함께 만드는 가족 추억 보존 서비스',
      icon: BookHeart,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-500/10',
      url: 'https://memolegacy.com',
      buttonText: '현재 서비스',
      buttonColor: 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
    },
    {
      name: 'AIH PRO',
      description: '3분 만에 받는 AI 심리 발달 케어',
      icon: Brain,
      color: 'from-primary to-blue-600',
      bgColor: 'bg-primary/10',
      url: '/',
      buttonText: '서비스 바로가기 →',
      buttonColor: 'bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700'
    },
    {
      name: 'Make One Project',
      description: '비개발자를 위한 1주일 MVP 제작',
      icon: Sparkles,
      color: 'from-pink-500 to-purple-600',
      bgColor: 'bg-pink-500/10',
      url: 'https://makeoneproject.com',
      buttonText: '서비스 바로가기 →',
      buttonColor: 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700'
    }
  ];

  return (
    <section className="relative py-20 px-4 bg-gradient-to-b from-background to-slate-950 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-white/5" />
      
      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Brain className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold">
              <span className="text-brand-gradient">AIH PRO</span>
            </h2>
          </div>
          <p className="text-lg text-muted-foreground">
            AI 기술로 더 나은 삶을 만드는 혁신 서비스
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={index}
                className="group relative rounded-2xl bg-slate-900/50 backdrop-blur-sm border border-slate-800 p-6 hover:border-slate-700 transition-all duration-300 hover:scale-[1.02]"
              >
                {/* Icon */}
                <div className={`inline-flex p-4 rounded-xl ${service.bgColor} mb-4`}>
                  <Icon className={`w-8 h-8 bg-gradient-to-r ${service.color} bg-clip-text text-transparent`} />
                </div>

                {/* Content */}
                <div className="space-y-3 mb-6">
                  <h3 className="text-xl font-bold text-foreground">
                    {service.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {service.description}
                  </p>
                </div>

                {/* Button */}
                <a
                  href={service.url}
                  target={service.url.startsWith('http') ? '_blank' : '_self'}
                  rel={service.url.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="block"
                >
                  <Button
                    className={`w-full ${service.buttonColor} text-white font-semibold shadow-lg transition-all duration-300`}
                  >
                    {service.buttonText}
                  </Button>
                </a>

                {/* Hover effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            );
          })}
        </div>

        {/* Footer text */}
        <div className="text-center space-y-2 text-sm text-muted-foreground">
          <p>© 2025 AIH PRO. All rights reserved.</p>
          <p>AI시대에 Human touch는 필수입니다.</p>
        </div>
      </div>
    </section>
  );
};

export default CompanyServicesSection;
