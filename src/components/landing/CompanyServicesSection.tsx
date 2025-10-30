import React from 'react';
import { BookHeart, Zap, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import aihproLogo from '@/assets/aihpro-logo.png';

const CompanyServicesSection = () => {
  const services = [
    {
      name: 'Memolegacy',
      description: 'AI와 함께 만드는 가족 추억 보존 서비스',
      icon: BookHeart,
      iconBg: 'bg-slate-800',
      iconColor: 'text-orange-500',
      url: 'https://memolegacy.com',
      buttonText: '현재 서비스',
      buttonColor: 'bg-orange-500 hover:bg-orange-600'
    },
    {
      name: 'AIH PRO',
      description: '3분 만에 받는 AI 심리 발달 케어',
      icon: Zap,
      iconBg: 'bg-slate-800',
      iconColor: 'text-blue-500',
      url: '/',
      buttonText: '서비스 바로가기 →',
      buttonColor: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      name: 'Make One Project',
      description: '비개발자를 위한 1주일 MVP 제작',
      icon: Sparkles,
      iconBg: 'bg-slate-800',
      iconColor: 'text-pink-500',
      url: 'https://makeoneproject.com',
      buttonText: '서비스 바로가기 →',
      buttonColor: 'bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600'
    }
  ];

  return (
    <section className="relative py-20 px-4 bg-slate-950 overflow-hidden">
      <div className="container mx-auto max-w-6xl relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img 
              src={aihproLogo} 
              alt="AIH PRO Logo" 
              className="w-16 h-16 object-contain"
            />
            <h2 className="text-4xl md:text-5xl font-bold">
              <span className="text-white">AIH </span>
              <span className="text-orange-500">PRO</span>
            </h2>
          </div>
          <p className="text-lg text-slate-400">
            AI 기술로 더 나은 삶을 만드는 혁신 서비스
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={index}
                className="relative rounded-2xl bg-slate-900/80 border border-slate-800 p-8 hover:border-slate-700 transition-all duration-300"
              >
                {/* Icon */}
                <div className={`inline-flex p-3 rounded-xl ${service.iconBg} mb-6`}>
                  <Icon className={`w-6 h-6 ${service.iconColor}`} />
                </div>

                {/* Content */}
                <div className="space-y-3 mb-8">
                  <h3 className="text-xl font-bold text-white">
                    {service.name}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed">
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
                    className={`w-full ${service.buttonColor} text-white font-semibold rounded-xl py-6`}
                  >
                    {service.buttonText}
                  </Button>
                </a>
              </div>
            );
          })}
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-slate-800 mb-8" />

        {/* Footer with Logo */}
        <div className="text-center space-y-4">
          <img 
            src={aihproLogo} 
            alt="AIH PRO Logo" 
            className="w-12 h-12 object-contain mx-auto"
          />
          <div className="space-y-2 text-sm text-slate-500">
            <p>© 2025 AIH PRO. All rights reserved.</p>
            <p>AI시대에 Human touch는 필수입니다.</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CompanyServicesSection;
