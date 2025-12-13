import { useState } from 'react';
import { 
  Brain, FileText, ArrowRight, Heart, Target, TrendingUp, 
  Users, Lightbulb, Shield, Sparkles, Zap, ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const DataDrivenReportSection = () => {
  const navigate = useNavigate();
  const [showReports, setShowReports] = useState(false);

  const reports = [
    { icon: Brain, title: "발달 종합 평가", color: "text-purple-400", bg: "bg-purple-500/10" },
    { icon: Heart, title: "심리 상태 분석", color: "text-pink-400", bg: "bg-pink-500/10" },
    { icon: Target, title: "강점/약점 분석", color: "text-blue-400", bg: "bg-blue-500/10" },
    { icon: Lightbulb, title: "맞춤형 활동 제안", color: "text-yellow-400", bg: "bg-yellow-500/10" },
    { icon: TrendingUp, title: "발달 로드맵", color: "text-green-400", bg: "bg-green-500/10" },
    { icon: Users, title: "또래 비교 분석", color: "text-orange-400", bg: "bg-orange-500/10" },
    { icon: Shield, title: "전문가 소견서", color: "text-red-400", bg: "bg-red-500/10" },
    { icon: FileText, title: "가족 지원 가이드", color: "text-indigo-400", bg: "bg-indigo-500/10" },
    { icon: Sparkles, title: "장기 발달 예측", color: "text-cyan-400", bg: "bg-cyan-500/10" }
  ];

  return (
    <section className="relative py-20 md:py-28 overflow-hidden bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Gradient orbs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[150px]" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[150px]" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full mb-4">
            <Zap className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-semibold text-blue-300">데이터 기반 분석</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-3">
            9가지 전문 리포트 자동 생성
          </h2>
          <p className="text-white/60 text-sm md:text-base max-w-xl mx-auto">
            한 번의 분석으로 전문가급 종합 리포트를 무료로 받아보세요
          </p>
        </motion.div>

        {/* Reports Grid Toggle */}
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setShowReports(!showReports)}
            className="w-full flex items-center justify-center gap-2 py-4 text-white/70 hover:text-white transition-colors mb-6"
          >
            <span className="text-sm font-medium">리포트 종류 보기</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${showReports ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showReports && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-3 md:grid-cols-3 gap-3 md:gap-4 mb-8">
                  {reports.map((report, index) => {
                    const Icon = report.icon;
                    return (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex flex-col items-center p-4 bg-slate-800/50 backdrop-blur-sm border border-white/5 rounded-xl hover:border-white/10 transition-all"
                      >
                        <div className={`w-10 h-10 ${report.bg} rounded-lg flex items-center justify-center mb-2`}>
                          <Icon className={`w-5 h-5 ${report.color}`} />
                        </div>
                        <span className="text-xs md:text-sm text-white/80 text-center font-medium">{report.title}</span>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* CTA */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <div className="inline-flex flex-col items-center gap-3 px-6 py-5 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-white/5 rounded-2xl mb-6">
              <Sparkles className="w-6 h-6 text-amber-400" />
              <p className="text-white font-medium">추가 비용 없이 모든 리포트 무료</p>
              <p className="text-white/50 text-xs">데이터가 쌓일수록 더 정확한 분석</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => navigate('/pmf-onboarding')}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold px-8 py-6 rounded-xl"
              >
                <Brain className="w-5 h-5 mr-2" />
                3분 분석 시작
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default DataDrivenReportSection;
