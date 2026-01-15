import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Clock, Users, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const CTABannerSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-20 md:py-28 overflow-hidden bg-gradient-to-b from-slate-800 to-slate-900">
      {/* Gradient orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[150px]" />
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[100px]" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto text-center space-y-6"
        >
          {/* Urgency Badge */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <motion.div 
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full"
            >
              <Clock className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-xs font-bold text-orange-300">🔥 론칭 특가 50% 할인</span>
            </motion.div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
              <Users className="w-3 h-3 text-green-400" />
              <span className="text-xs text-green-300">387명 신청</span>
            </div>
          </div>

          {/* Headline */}
          <h2 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white leading-tight">
            AIHumanPro와 함께<br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              당신의 회복을 시작하세요
            </span>
          </h2>
          
          <p className="text-lg md:text-xl text-white/70 font-medium">
            3분이면 충분합니다
          </p>

          {/* Social Proof */}
          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6 text-white/60 text-sm">
            <span>⭐⭐⭐⭐⭐ 4.8/5.0</span>
            <span className="hidden sm:inline">·</span>
            <span>💬 1,247명 후기</span>
            <span className="hidden sm:inline">·</span>
            <span className="text-amber-400">
              <Gift className="w-4 h-4 inline mr-1" />
              무료 10토큰
            </span>
          </div>

          {/* CTA Buttons - 회원가입 강조 */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button 
              size="lg"
              onClick={() => navigate('/auth?mode=signup')}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-lg font-bold px-10 py-7 rounded-xl shadow-lg shadow-amber-500/25"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              무료 회원가입
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            
            <Button 
              size="lg"
              onClick={() => navigate('/premium-assessment')}
              variant="outline"
              className="bg-white/5 border-white/10 text-white text-lg font-medium px-8 py-7 rounded-xl hover:bg-white/10"
            >
              먼저 검사해보기
            </Button>
          </div>

          {/* Trust - 가입 혜택 강조 */}
          <div className="pt-4 space-y-2">
            <p className="text-white/40 text-xs">
              ✓ 30초 가입 · ✓ 신용카드 불필요 · ✓ 영구 무료
            </p>
            <p className="text-amber-400/80 text-sm font-medium">
              🎁 지금 가입하면 프리미엄 분석 1회 무료!
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTABannerSection;
