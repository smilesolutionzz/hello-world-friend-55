import { Button } from '@/components/ui/button';
import { Users, Gift } from 'lucide-react';
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
      {/* Mobile Fixed CTA - 친구 추천 강조 */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-[#5E8FFF] via-[#8FB9FF] to-[#5E8FFF] shadow-2xl safe-area-pb animate-pulse">
        <button
          onClick={() => navigate('/referral')}
          className="w-full p-4 text-white"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                <Gift className="w-6 h-6 animate-bounce" />
              </div>
              <div className="text-left flex-1">
                <div className="text-sm font-bold">🎉 친구 추천하고 토큰 받기!</div>
                <div className="text-xs opacity-90">친구도 10토큰, 나도 10토큰 (매달 10명)</div>
              </div>
            </div>
            <div className="text-2xl">→</div>
          </div>
        </button>
      </div>

      {/* Desktop Floating CTA - 친구 추천 강조 */}
      <div className="hidden md:block fixed bottom-8 right-8 z-50">
        <Button 
          size="lg"
          onClick={() => navigate('/referral')}
          className="group relative px-8 py-8 bg-gradient-to-r from-[#5E8FFF] via-[#8FB9FF] to-[#5E8FFF] hover:from-[#4A7FEF] hover:via-[#7AA8EF] hover:to-[#4A7FEF] text-white text-base font-bold rounded-2xl shadow-[0_8px_30px_rgba(94,143,255,0.5)] hover:shadow-[0_12px_40px_rgba(94,143,255,0.7)] transition-all duration-300 hover:scale-105 animate-pulse"
        >
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <Gift className="w-6 h-6 animate-bounce" />
              <span className="text-lg font-extrabold">친구 추천하고 토큰 받기!</span>
            </div>
            <div className="text-xs opacity-90 font-normal">
              친구도 10토큰, 나도 10토큰 • 매달 10명까지
            </div>
          </div>
        </Button>
      </div>
    </>
  );
};

export default FixedCTAButton;
