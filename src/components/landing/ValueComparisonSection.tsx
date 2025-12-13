import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, X, Sparkles, ArrowRight, Heart, Shield, Users, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const ValueComparisonSection = () => {
  const navigate = useNavigate();

  const problems = [
    { icon: Building2, title: "병원 방문이 부담스러워요", desc: "두려움과 낙인 때문에 망설이게 돼요" },
    { icon: Shield, title: "예방적 관리가 필요해요", desc: "심각해지기 전에 조기 발견이 중요해요" },
    { icon: Heart, title: "케어가 복잡해요", desc: "어디서부터 시작해야 할지 막막해요" },
    { icon: Users, title: "전문가 연결이 어려워요", desc: "맞는 전문가 찾기도, 비용도 부담이에요" }
  ];

  const comparison = [
    { feature: "이용 방법", traditional: "예약 필요 (1~2주 대기)", ours: "지금 바로 시작 (0분)" },
    { feature: "소요 시간", traditional: "50분 + 이동 시간", ours: "3분 완료" },
    { feature: "비용", traditional: "회당 10~20만원", ours: "무료 체험 → 월 2.9만원" },
    { feature: "접근성", traditional: "오프라인 방문 필수", ours: "24시간 모바일 접속" },
    { feature: "프라이버시", traditional: "대면 상담", ours: "완전 익명" }
  ];

  return (
    <section className="relative py-20 md:py-28 overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-800">
      {/* Subtle gradient orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px]" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-semibold text-emerald-300">왜 AIHumanPro인가요?</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-3">
            이런 고민, 있으셨죠?
          </h2>
          <p className="text-white/60 text-sm md:text-base">
            저희가 해결해 드릴게요
          </p>
        </motion.div>

        {/* Problems Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-12">
          {problems.map((problem, index) => {
            const Icon = problem.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-4 md:p-5 bg-slate-800/50 backdrop-blur-sm border border-white/5 rounded-2xl hover:border-emerald-500/30 transition-all"
              >
                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-sm md:text-base font-bold text-white mb-1">{problem.title}</h3>
                <p className="text-xs md:text-sm text-white/50">{problem.desc}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Comparison Table */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-slate-800/50 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-3 gap-2 p-4 border-b border-white/5 bg-slate-700/30">
              <div className="text-xs font-medium text-white/40"></div>
              <div className="text-xs font-medium text-white/60 text-center">기존 상담</div>
              <div className="text-xs font-medium text-emerald-400 text-center">AIHumanPro</div>
            </div>
            
            {/* Table Body */}
            {comparison.map((item, index) => (
              <div key={index} className="grid grid-cols-3 gap-2 p-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                <div className="text-sm font-medium text-white">{item.feature}</div>
                <div className="flex items-center justify-center gap-1.5">
                  <X className="w-3.5 h-3.5 text-red-400/70 shrink-0" />
                  <span className="text-xs text-white/50 text-center">{item.traditional}</span>
                </div>
                <div className="flex items-center justify-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="text-xs text-emerald-300 font-medium text-center">{item.ours}</span>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-8 text-center">
            <Button 
              onClick={() => navigate('/pmf-onboarding')}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-bold px-8 py-6 rounded-xl shadow-lg shadow-emerald-500/25"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              무료로 시작하기
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <p className="text-white/40 text-xs mt-3">신용카드 불필요 · 언제든 해지 가능</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ValueComparisonSection;
