import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Brain, Users, ArrowRight, Sparkles, CheckCircle2, ChevronRight, Download, Share2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

const CurationReportSection = () => {
  const navigate = useNavigate();
  
  const flowSteps = [
    {
      step: 1,
      icon: Brain,
      title: '자가검사',
      subtitle: '3분 AI 심리분석',
      description: 'ADHD, 우울증, 스트레스 등 30종 이상의 검증된 검사',
      color: 'from-blue-500 to-cyan-400',
    },
    {
      step: 2,
      icon: FileText,
      title: '전문가급 리포트',
      subtitle: '세계 최고 수준 분석',
      description: '최신 연구 기반, 9개 섹션 심층 분석 리포트 생성',
      color: 'from-purple-500 to-pink-400',
    },
    {
      step: 3,
      icon: Users,
      title: '전문가 연결',
      subtitle: '맞춤 케어 시작',
      description: '검증된 심리상담사, 발달전문가와 1:1 상담 연결',
      color: 'from-emerald-500 to-teal-400',
    },
  ];

  const reportFeatures = [
    { icon: Download, text: 'PDF/TXT 다운로드' },
    { icon: Share2, text: '카카오톡 공유' },
    { icon: Mail, text: '가족 이메일 전송' },
  ];

  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-rose-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Header with badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <motion.span
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-400 to-orange-400 text-slate-900 font-bold text-sm mb-6 shadow-lg shadow-yellow-400/20"
          >
            <Sparkles className="w-4 h-4" />
            무료배포
          </motion.span>
          
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
            나만의 큐레이션
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-orange-400">
              분석 리포트 2025
            </span>
          </h2>
          
          <p className="text-lg text-slate-300 max-w-2xl mx-auto">
            AI가 당신만을 위해 맞춤 분석한 전문가급 심층 리포트를 지금 바로 받아보세요
          </p>
        </motion.div>

        {/* Report Preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="max-w-4xl mx-auto mb-16"
        >
          <Card className="relative overflow-hidden bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-white/10 shadow-2xl">
            <div className="p-8 md:p-12">
              {/* Floating report cards */}
              <div className="relative flex justify-center items-center mb-8">
                <motion.div
                  animate={{ 
                    rotateY: [0, 5, 0, -5, 0],
                    y: [0, -5, 0, 5, 0]
                  }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="relative"
                >
                  {/* Stacked report effect */}
                  <div className="absolute -left-4 -bottom-2 w-44 md:w-56 h-56 md:h-72 bg-gradient-to-br from-rose-600/60 to-rose-700/60 rounded-xl transform rotate-[-8deg] shadow-xl border border-rose-500/20" />
                  <div className="absolute -left-2 -bottom-1 w-44 md:w-56 h-56 md:h-72 bg-gradient-to-br from-rose-500/70 to-rose-600/70 rounded-xl transform rotate-[-4deg] shadow-xl border border-rose-400/20" />
                  <div className="relative w-44 md:w-56 h-56 md:h-72 bg-gradient-to-br from-rose-500 to-red-600 rounded-xl shadow-2xl shadow-rose-500/30 p-4 md:p-5 text-white border border-rose-400/30">
                    <div className="text-xs opacity-80 mb-2 font-medium">AIHPRO 리포트</div>
                    <div className="text-base md:text-xl font-bold mb-1">나만의 심층</div>
                    <div className="text-base md:text-xl font-bold mb-3">분석 리포트</div>
                    <div className="text-[10px] md:text-xs opacity-70 mb-2">탐색 행동과 성향 패턴</div>
                    <div className="mt-4 md:mt-6 space-y-1 text-[10px] md:text-xs opacity-80">
                      <div>조사 대상 | 본인 맞춤 분석</div>
                      <div>분석 기간 | 2025년 최신</div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Feature badges */}
              <div className="flex flex-wrap justify-center gap-3 mb-6">
                {reportFeatures.map((feature, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur border border-white/10 rounded-full"
                  >
                    <feature.icon className="w-4 h-4 text-rose-400" />
                    <span className="text-sm font-medium text-slate-200">{feature.text}</span>
                  </motion.div>
                ))}
              </div>

              {/* CTA Button */}
              <div className="text-center">
                <Button
                  onClick={() => navigate('/report-generator')}
                  size="lg"
                  className="bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-600 hover:to-orange-600 text-white font-bold px-8 py-6 text-lg rounded-xl shadow-lg shadow-rose-500/25 hover:shadow-xl hover:shadow-rose-500/30 transition-all border-0"
                >
                  무료 리포트 받기
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Flow Steps */}
        <div className="mb-12">
          <motion.h3
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-2xl font-bold text-white mb-8"
          >
            이렇게 활용하세요
          </motion.h3>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {flowSteps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative"
              >
                <Card 
                  className="h-full p-6 bg-white/5 backdrop-blur border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all group cursor-pointer"
                  onClick={() => {
                    if (step.step === 1) navigate('/tests');
                    if (step.step === 2) navigate('/report-generator');
                    if (step.step === 3) navigate('/expert-hiring');
                  }}
                >
                  {/* Step number */}
                  <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r ${step.color} text-white font-bold text-sm mb-4`}>
                    {step.step}
                  </div>
                  
                  {/* Icon */}
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${step.color} text-white mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                    <step.icon className="w-6 h-6" />
                  </div>
                  
                  <h4 className="text-lg font-bold text-white mb-1">{step.title}</h4>
                  <p className="text-sm font-medium text-slate-400 mb-2">{step.subtitle}</p>
                  <p className="text-sm text-slate-500">{step.description}</p>
                  
                  {/* Arrow between steps */}
                  {index < 2 && (
                    <div className="hidden md:flex absolute -right-3 top-1/2 transform -translate-y-1/2 z-10">
                      <div className="w-6 h-6 rounded-full bg-slate-700 border border-white/10 shadow-md flex items-center justify-center">
                        <ArrowRight className="w-3 h-3 text-slate-300" />
                      </div>
                    </div>
                  )}
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Benefits list */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto"
        >
          <Card className="p-6 bg-white/5 backdrop-blur border border-white/10">
            <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-400" />
              AIHPRO 리포트 특별 혜택
            </h4>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                '최신 연구 기반 9개 섹션 심층 분석',
                'Perplexity AI로 실시간 학술 검색',
                'Firecrawl로 관련 기관 정보 수집',
                'PDF/TXT 다운로드 및 인쇄 지원',
                '카카오톡, 이메일로 쉬운 공유',
                '검증된 전문가와 바로 상담 연결',
              ].map((benefit, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span className="text-sm text-slate-300">{benefit}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default CurationReportSection;
