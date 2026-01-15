import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Gift, Sparkles, ArrowRight, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';

/**
 * Exit Intent Popup - 이탈 방지 팝업
 * 사용자가 페이지를 떠나려 할 때 가입을 유도
 */
export const ExitIntentPopup: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // 인증 상태 확인
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    checkAuth();

    // 이미 팝업을 본 사용자인지 확인
    const hasSeenPopup = sessionStorage.getItem('exit_popup_shown');
    if (hasSeenPopup) return;

    // Exit intent 감지 (마우스가 화면 상단으로 이동할 때)
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !isAuthenticated && !sessionStorage.getItem('exit_popup_shown')) {
        setIsOpen(true);
        sessionStorage.setItem('exit_popup_shown', 'true');
      }
    };

    // 모바일: 스크롤 업 감지
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < lastScrollY - 100 && currentScrollY < 200 && !isAuthenticated && !sessionStorage.getItem('exit_popup_shown')) {
        setIsOpen(true);
        sessionStorage.setItem('exit_popup_shown', 'true');
      }
      lastScrollY = currentScrollY;
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isAuthenticated]);

  const handleSignup = () => {
    setIsOpen(false);
    navigate('/auth?mode=signup');
  };

  const handleTryFree = () => {
    setIsOpen(false);
    navigate('/premium-assessment');
  };

  // 이미 로그인한 사용자에게는 표시하지 않음
  if (isAuthenticated) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-0">
        {/* 상단 그라데이션 배너 */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4 text-center relative">
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute top-2 right-2 text-white/80 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Gift className="h-10 w-10 mx-auto text-white mb-2" />
          </motion.div>
          <h3 className="text-xl font-bold text-white">잠깐만요! 🎁</h3>
        </div>

        <div className="p-6 space-y-4">
          <div className="text-center">
            <h4 className="text-lg font-bold text-foreground mb-2">
              떠나시기 전에 특별 혜택을 받으세요
            </h4>
            <p className="text-sm text-muted-foreground">
              지금 가입하면 프리미엄 AI 분석을 무료로 제공해드려요
            </p>
          </div>

          {/* 혜택 리스트 */}
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                오늘만 제공되는 혜택
              </span>
            </div>
            <ul className="space-y-1.5 text-sm text-amber-700 dark:text-amber-300">
              <li>✓ 전문가급 상세 분석 리포트 무료</li>
              <li>✓ 검사 결과 영구 저장</li>
              <li>✓ AI 맞춤 추천 서비스</li>
            </ul>
          </div>

          {/* CTA 버튼 */}
          <div className="space-y-2">
            <Button 
              onClick={handleSignup}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 py-6 text-base font-bold"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              무료 가입하고 혜택 받기
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            
            <Button 
              onClick={handleTryFree}
              variant="outline"
              className="w-full py-5"
            >
              먼저 무료 검사해보기
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            가입 30초 · 신용카드 불필요 · 언제든 탈퇴 가능
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExitIntentPopup;
