import { Button } from '@/components/ui/button';
import { Users, Gift } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import confetti from 'canvas-confetti';

const FixedCTAButton = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true); // 즉시 표시
  const [remainingReferrals, setRemainingReferrals] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      // 프로필에서 referral_code 가져오기
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('referral_code')
        .eq('user_id', user.id)
        .limit(1);

      if (!profiles || profiles.length === 0) {
        setIsLoading(false);
        return;
      }

      const referralCode = profiles[0].referral_code;

      // 이번 달 추천 수 계산
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

      const { data: referrals, error } = await supabase
        .from('referral_records')
        .select('id')
        .eq('referrer_code', referralCode)
        .eq('reward_status', 'completed')
        .gte('created_at', startOfMonth)
        .lte('created_at', endOfMonth);

      if (error) throw error;

      const completedCount = referrals?.length || 0;
      const remaining = Math.max(0, 10 - completedCount);
      setRemainingReferrals(remaining);
    } catch (error) {
      console.error('Error fetching referral data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReferralClick = () => {
    // Confetti 효과
    const duration = 2000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval: NodeJS.Timeout = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);

    // 페이지 이동
    navigate('/referral');
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Mobile Fixed CTA - 친구 추천 강조 */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-[#5E8FFF] via-[#8FB9FF] to-[#5E8FFF] shadow-2xl safe-area-pb">
        <button
          onClick={handleReferralClick}
          className="w-full p-3 text-white"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
              <Gift className="w-5 h-5" />
            </div>
            <div className="text-left flex-1 min-w-0">
              <div className="font-bold text-base mb-0.5">
                🎉 친구 추천하고 토큰 받기!
              </div>
              <div className="text-xs opacity-90 leading-tight">
                친구도 10토큰, 나도 10토큰
                {!isLoading && remainingReferrals !== null && (
                  <span className="ml-1 text-yellow-300 font-bold">
                    ({remainingReferrals}명 남음)
                  </span>
                )}
              </div>
            </div>
            <div className="text-xl flex-shrink-0">→</div>
          </div>
        </button>
      </div>

      {/* Desktop Floating CTA - 친구 추천 강조 */}
      <div className="hidden md:block fixed bottom-8 right-8 z-50">
        <Button 
          size="lg"
          onClick={handleReferralClick}
          className="group relative px-8 py-8 bg-gradient-to-r from-[#5E8FFF] via-[#8FB9FF] to-[#5E8FFF] hover:from-[#4A7FEF] hover:via-[#7AA8EF] hover:to-[#4A7FEF] text-white text-base font-bold rounded-2xl shadow-[0_8px_30px_rgba(94,143,255,0.5)] hover:shadow-[0_12px_40px_rgba(94,143,255,0.7)] transition-all duration-300 hover:scale-105"
        >
          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <Gift className="w-6 h-6" />
              <span className="text-lg font-extrabold">친구 추천하고 토큰 받기!</span>
              {!isLoading && remainingReferrals !== null && (
                <span className="px-3 py-1 bg-white/30 backdrop-blur-sm rounded-full text-sm font-bold">
                  {remainingReferrals}명 남음
                </span>
              )}
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
