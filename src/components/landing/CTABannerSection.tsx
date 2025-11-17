import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Sparkles, Clock, Users, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ctaBannerBg from '@/assets/cta-banner-bg.jpg';

const CTABannerSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background Image with Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${ctaBannerBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A0E1A]/95 via-[#1B2333]/90 to-[#0A0E1A]/95" />
      </div>

      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#5E8FFF]/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 container mx-auto px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Urgency Badge */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500/20 backdrop-blur-md border border-orange-500/40 rounded-full">
              <Clock className="w-4 h-4 text-orange-300" />
              <span className="text-sm font-bold text-white">🔥 론칭 특가 <span className="text-orange-300">50% 할인</span> - 선착순 500명!</span>
            </div>
            <Badge className="bg-green-500/20 text-green-300 border-green-500/40 text-sm px-4 py-2">
              <Users className="w-3 h-3 mr-1" />
              현재 387명 신청
            </Badge>
          </div>

          <h2 className="text-2xl sm:text-4xl md:text-6xl font-bold text-white leading-tight">
            AIHumanPro와 함께<br />
            당신의 회복을 시작하세요
          </h2>
          
          <p className="text-2xl text-white/80 font-medium">
            3분이면 충분합니다
          </p>

          {/* Social Proof */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-white/80">
            <div className="flex items-center gap-2">
              <span className="text-yellow-400 text-sm">⭐⭐⭐⭐⭐</span>
              <span className="text-sm font-medium">4.8/5.0 평점</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-white/30"></div>
            <div className="text-sm font-medium">
              💬 1,247명의 실제 후기
            </div>
            <div className="hidden sm:block w-px h-4 bg-white/30"></div>
            <div className="text-sm font-medium">
              <Gift className="w-4 h-4 inline mr-1 text-[#FFD93D]" />
              가입 시 <span className="text-[#FFD93D] font-bold">무료 10토큰</span> 제공
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Button 
              size="lg"
              onClick={() => navigate('/pmf-onboarding')}
              className="group relative w-full sm:w-auto px-12 py-7 bg-gradient-to-r from-[#5E8FFF] to-[#8FB9FF] hover:from-[#4A7FEF] hover:to-[#7FA9EF] text-white text-lg font-bold rounded-xl shadow-[0_8px_30px_rgba(94,143,255,0.5)] hover:shadow-[0_12px_40px_rgba(94,143,255,0.6)] transition-all duration-300 overflow-hidden"
            >
              <span className="absolute inset-0 bg-white/20 animate-pulse"></span>
              <span className="relative flex items-center gap-2">
                🎁 무료로 시작하기
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
            </Button>
            
            <Button 
              size="lg"
              onClick={() => navigate('/expert-hiring')}
              className="w-full sm:w-auto px-12 py-7 bg-white/10 backdrop-blur-md border-2 border-white/30 text-white text-lg font-semibold rounded-xl hover:bg-white/20 transition-all duration-300"
            >
              전문가 상담 연결
            </Button>
          </div>

          {/* Trust Indicators */}
          <div className="pt-8 border-t border-white/10">
            <p className="text-white/60 text-xs sm:text-sm">
              ✓ 회원가입 없이 즉시 시작 &nbsp;·&nbsp; ✓ 신용카드 불필요 &nbsp;·&nbsp; ✓ 언제든 무료 체험
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTABannerSection;
