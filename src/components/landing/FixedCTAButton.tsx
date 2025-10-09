import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const FixedCTAButton = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show button after scrolling 300px
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <>
      {/* Mobile Fixed CTA */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-2xl safe-area-pb">
        <Button 
          size="lg"
          onClick={() => navigate('/pmf-onboarding')}
          className="w-full py-6 bg-[#5E8FFF] hover:bg-[#4A7FEF] text-white text-lg font-bold rounded-xl shadow-[0_4px_20px_rgba(94,143,255,0.4)]"
        >
          <span className="flex items-center justify-center gap-2">
            무료 테스트 시작하기
            <ArrowRight className="w-5 h-5" />
          </span>
        </Button>
      </div>

      {/* Desktop Floating CTA */}
      <div className="hidden md:block fixed bottom-8 right-8 z-50">
        <Button 
          size="lg"
          onClick={() => navigate('/pmf-onboarding')}
          className="group px-8 py-6 bg-[#5E8FFF] hover:bg-[#4A7FEF] text-white text-base font-bold rounded-full shadow-[0_8px_30px_rgba(94,143,255,0.5)] hover:shadow-[0_12px_40px_rgba(94,143,255,0.6)] transition-all duration-300 hover:scale-105"
        >
          <span className="flex items-center gap-2">
            무료 테스트 시작
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </span>
        </Button>
      </div>
    </>
  );
};

export default FixedCTAButton;
