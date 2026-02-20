import { useState, useEffect } from 'react';
import { Sparkles, Clock, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';

interface PromotionBannerProps {
  variant?: 'hero' | 'subscription';
}

export const PromotionBanner = ({ variant = 'hero' }: PromotionBannerProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      
      const diff = endOfDay.getTime() - now.getTime();
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeLeft({ hours, minutes, seconds });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, []);

  if (variant === 'hero') {
    return (
      <div className="bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white py-3 px-4 sm:py-4 sm:px-6 rounded-2xl shadow-[0_8px_32px_rgba(255,107,0,0.4)] border-2 border-white/20">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-white/20 rounded-full p-1.5 sm:p-2">
              <Gift className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold">{t.promotion.todayOnly}</div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 sm:gap-2 bg-white/20 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg">
              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="font-mono font-bold text-sm sm:text-base">
                {String(timeLeft.hours).padStart(2, '0')}:
                {String(timeLeft.minutes).padStart(2, '0')}:
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
            </div>
            <Button 
              onClick={() => navigate('/token-purchase?tokens=400')}
              size="sm"
              className="bg-white text-red-600 hover:bg-white/90 font-bold shadow-lg text-xs sm:text-sm px-3 sm:px-4"
            >
              {t.promotion.getItNow}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white py-8 px-6 rounded-3xl shadow-2xl border-4 border-yellow-300">
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 via-orange-400/20 to-red-400/20 animate-pulse" />
      
      <div className="relative z-10 text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Sparkles className="w-8 h-8 animate-spin" />
          <h3 className="text-3xl font-black">{t.promotion.launchSpecial}</h3>
          <Sparkles className="w-8 h-8 animate-spin" />
        </div>
        
        <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 inline-block">
          <div className="text-5xl font-black mb-2">{t.promotion.discount50}</div>
          <div className="text-xl font-bold">{t.promotion.bonusTokens}</div>
        </div>
        
        <div className="flex items-center justify-center gap-3 text-2xl font-bold">
          <Clock className="w-6 h-6 animate-pulse" />
          <span>{t.promotion.timeLeft}</span>
          <div className="bg-white/30 rounded-lg px-4 py-2 font-mono">
            {String(timeLeft.hours).padStart(2, '0')}:
            {String(timeLeft.minutes).padStart(2, '0')}:
            {String(timeLeft.seconds).padStart(2, '0')}
          </div>
        </div>
        
        <div className="text-sm opacity-90">
          {t.promotion.validToday}
        </div>
      </div>
    </div>
  );
};
