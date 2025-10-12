import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CTABannerSection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-32 bg-gradient-to-br from-[#0A0E1A] to-[#1B2333] relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#5E8FFF]/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 container mx-auto px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full">
            <Sparkles className="w-4 h-4 text-white/90" />
            <span className="text-sm font-medium text-white/90">지금 바로 시작하세요</span>
          </div>

          <h2 className="text-2xl sm:text-4xl md:text-6xl font-bold text-white leading-tight">
            AI하이라이트PRO와 함께<br />
            당신의 회복을 시작하세요
          </h2>
          
          <p className="text-2xl text-white/80 font-medium">
            3분이면 충분합니다
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Button 
              size="lg"
              onClick={() => navigate('/pmf-onboarding')}
              className="group w-full sm:w-auto px-12 py-7 bg-white hover:bg-white/90 text-[#0A0E1A] text-lg font-bold rounded-xl shadow-[0_8px_30px_rgba(255,255,255,0.3)] hover:shadow-[0_12px_40px_rgba(255,255,255,0.4)] transition-all duration-300"
            >
              <span className="flex items-center gap-2">
                무료 체험 시작
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
        </div>
      </div>
    </section>
  );
};

export default CTABannerSection;
