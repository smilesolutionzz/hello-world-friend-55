import React from 'react';
import { Button } from '@/components/ui/button';
import { Brain, Sparkles, Heart, ArrowRight, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const SimplifiedCoreServices = () => {
  const navigate = useNavigate();

  const services = [
    {
      step: 1,
      icon: Brain,
      title: '관찰일지',
      badge: '무료',
      description: '일상 행동을 기록하면 AI가 즉시 분석',
      features: ['30초 작성', '무료 AI 분석', '회원가입 불필요'],
      gradient: 'from-violet-500 to-purple-500',
      route: '/observation'
    },
    {
      step: 2,
      icon: Sparkles,
      title: 'AI 분석',
      badge: '베이직',
      description: 'ADHD, 스트레스 등 전문 심리검사',
      features: ['3분 심리검사', '전문가급 분석', '맞춤 가이드'],
      gradient: 'from-blue-500 to-cyan-500',
      route: '/assessment'
    },
    {
      step: 3,
      icon: Heart,
      title: '전문가 상담',
      badge: '프리미엄',
      description: '실시간 전문가 매칭 & 1:1 상담',
      features: ['24시간 매칭', '화상/채팅', '지속 케어'],
      gradient: 'from-rose-500 to-pink-500',
      route: '/expert-matching'
    }
  ];

  return (
    <section className="relative py-20 md:py-28 overflow-hidden bg-gradient-to-b from-slate-800 via-slate-900 to-slate-900">
      {/* Gradient orbs */}
      <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-violet-500/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-20 left-0 w-[400px] h-[400px] bg-pink-500/10 rounded-full blur-[120px]" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/10 border border-violet-500/20 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span className="text-sm font-semibold text-violet-300">3분이면 충분해요</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-3">
            간단한 3단계 케어
          </h2>
          <p className="text-white/60 text-sm md:text-base">
            무료 체험부터 전문가 상담까지
          </p>
        </motion.div>

        {/* Service Cards */}
        <div className="grid md:grid-cols-3 gap-4 md:gap-6 max-w-5xl mx-auto">
          {services.map((service, index) => (
            <motion.div
              key={service.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="group relative"
            >
              <div className="relative h-full bg-slate-800/50 backdrop-blur-sm border border-white/5 rounded-2xl p-5 md:p-6 hover:border-white/10 transition-all duration-300">
                {/* Step badge */}
                <div className="absolute -top-3 -right-3 w-10 h-10 bg-slate-700 border border-white/10 rounded-xl flex items-center justify-center">
                  <span className={`text-lg font-bold bg-gradient-to-r ${service.gradient} bg-clip-text text-transparent`}>
                    {service.step}
                  </span>
                </div>

                {/* Icon */}
                <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${service.gradient} mb-4`}>
                  <service.icon className="w-6 h-6 text-white" />
                </div>

                {/* Content */}
                <div className="space-y-3 mb-5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">{service.title}</h3>
                    <span className="text-[10px] font-medium px-2 py-0.5 bg-white/10 rounded-full text-white/70">
                      {service.badge}
                    </span>
                  </div>
                  <p className="text-sm text-white/50">{service.description}</p>
                </div>

                {/* Features */}
                <div className="space-y-2 mb-5">
                  {service.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                      <span className="text-xs text-white/70">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <Button
                  onClick={() => navigate(service.route)}
                  className={`w-full bg-gradient-to-r ${service.gradient} text-white font-medium py-5 rounded-xl border-0`}
                >
                  시작하기
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SimplifiedCoreServices;
