import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Lock, UserPlus, Sparkles, Shield, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface LoginRequiredOverlayProps {
  children: React.ReactNode;
  message?: string;
}

export const LoginRequiredOverlay: React.FC<LoginRequiredOverlayProps> = ({ 
  children, 
  message = "로그인 필요"
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setIsAuthenticated(true);
      } else if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
  };

  const handleLogin = () => {
    localStorage.setItem('auth_redirect_after', window.location.pathname);
    navigate('/auth');
  };

  const handleSignup = () => {
    localStorage.setItem('auth_redirect_after', window.location.pathname);
    navigate('/auth?mode=signup');
  };

  // Still loading
  if (isAuthenticated === null) {
    return <>{children}</>;
  }

  // Authenticated - show normal content
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Not authenticated - show enhanced overlay
  return (
    <div className="relative">
      {/* Blurred content */}
      <div className="blur-md pointer-events-none select-none opacity-40">
        {children}
      </div>
      
      {/* Enhanced Overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-background/80 via-background/60 to-background/80 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-card/95 backdrop-blur-md border border-border/50 rounded-2xl p-6 max-w-sm mx-4 shadow-2xl"
        >
          {/* 아이콘 */}
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl">
              <Lock className="h-8 w-8 text-primary" />
            </div>
          </div>
          
          {/* 타이틀 */}
          <h3 className="text-lg font-bold text-center text-foreground mb-2">
            심층 분석을 위해 로그인이 필요해요
          </h3>
          <p className="text-sm text-muted-foreground text-center mb-4">
            가입하면 모든 검사 결과를 영구 저장할 수 있어요
          </p>
          
          {/* 혜택 리스트 */}
          <div className="space-y-2 mb-5">
            {[
              '전문가급 상세 분석 리포트',
              '검사 결과 영구 저장',
              '맞춤 추천 & 추적 관리'
            ].map((benefit, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span className="text-foreground/80">{benefit}</span>
              </div>
            ))}
          </div>
          
          {/* CTA 버튼들 */}
          <div className="space-y-2">
            <Button 
              onClick={handleSignup}
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:opacity-90 font-semibold py-5"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              무료 회원가입
              <Sparkles className="h-4 w-4 ml-2" />
            </Button>
            
            <Button 
              onClick={handleLogin}
              variant="outline"
              className="w-full py-5"
            >
              <Lock className="h-4 w-4 mr-2" />
              로그인하기
            </Button>
          </div>
          
          {/* 신뢰 배지 */}
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-3 w-3" />
            <span>가입 30초 · 완전 무료</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginRequiredOverlay;
