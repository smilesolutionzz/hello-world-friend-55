import React from 'react';
import { Button } from '@/components/ui/button';
import { Lock, UserPlus, LogIn, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface BlurredReportOverlayProps {
  children: React.ReactNode;
  isAuthenticated: boolean;
  blurAfterIndex?: number; // 이 인덱스 이후 섹션은 블러 처리
  totalSections?: number;
}

export const BlurredReportOverlay: React.FC<BlurredReportOverlayProps> = ({
  children,
  isAuthenticated,
  blurAfterIndex = 4, // 기본값: 5번째 섹션부터 블러
  totalSections = 9
}) => {
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <>{children}</>;
  }

  const handleSignup = () => {
    localStorage.setItem('redirectAfterAuth', '/report-generator');
    navigate('/auth?mode=signup');
  };

  const handleLogin = () => {
    localStorage.setItem('redirectAfterAuth', '/report-generator');
    navigate('/auth');
  };

  return (
    <div className="relative">
      {/* 상단 콘텐츠 (블러 없이 보여줌) */}
      {children}
      
      {/* 블러 오버레이 - 하단 50% 부분 */}
      <div className="absolute bottom-0 left-0 right-0 h-[55%] pointer-events-none">
        {/* 그라데이션 페이드 */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/70 to-white dark:via-slate-900/70 dark:to-slate-900" />
        
        {/* 블러 효과 */}
        <div className="absolute inset-0 backdrop-blur-md" />
      </div>
      
      {/* 가입 유도 CTA */}
      <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center pb-12 pointer-events-auto">
        <div className="bg-gradient-to-br from-purple-900/95 via-indigo-900/95 to-blue-900/95 p-8 rounded-2xl shadow-2xl shadow-purple-500/30 border-2 border-purple-400/40 max-w-lg mx-4 backdrop-blur-xl">
          <div className="text-center space-y-5">
            <div className="inline-flex items-center justify-center p-4 bg-purple-500/20 rounded-full">
              <Lock className="w-8 h-8 text-purple-300" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-white">
                나머지 {totalSections - blurAfterIndex}개 섹션을 확인하세요
              </h3>
              <p className="text-purple-200 text-sm leading-relaxed">
                무료 회원가입 후 전체 분석 결과를 저장하고<br />
                언제든지 다시 확인할 수 있습니다
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 py-3">
              <div className="flex items-center gap-2 text-xs text-emerald-300">
                <Sparkles className="w-4 h-4" />
                <span>무료 가입</span>
              </div>
              <div className="w-1 h-1 bg-purple-400 rounded-full" />
              <div className="flex items-center gap-2 text-xs text-emerald-300">
                <span>결과 영구 저장</span>
              </div>
              <div className="w-1 h-1 bg-purple-400 rounded-full" />
              <div className="flex items-center gap-2 text-xs text-emerald-300">
                <span>PDF 다운로드</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleSignup}
                size="lg"
                className="flex-1 h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold shadow-lg shadow-purple-500/30"
              >
                <UserPlus className="w-5 h-5 mr-2" />
                무료 회원가입
              </Button>
              <Button
                onClick={handleLogin}
                variant="outline"
                size="lg"
                className="flex-1 h-12 border-purple-400/50 text-purple-200 hover:bg-purple-900/50"
              >
                <LogIn className="w-5 h-5 mr-2" />
                로그인
              </Button>
            </div>

            <p className="text-xs text-purple-300/70">
              이미 계정이 있으신가요? 로그인하면 이 결과가 자동 저장됩니다
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlurredReportOverlay;
