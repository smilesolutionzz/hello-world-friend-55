import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lock, CheckCircle, Crown, Sparkles, ArrowRight, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GuestResult } from '@/hooks/useGuestSession';

interface SignupPromptModalProps {
  open: boolean;
  onClose: () => void;
  pendingResults?: GuestResult[];
  currentResult?: {
    testTitle: string;
    score?: number;
    level?: string;
  };
}

export const SignupPromptModal: React.FC<SignupPromptModalProps> = ({
  open,
  onClose,
  pendingResults = [],
  currentResult
}) => {
  const navigate = useNavigate();

  const handleSignup = () => {
    // 현재 URL을 리다이렉트 경로로 저장
    localStorage.setItem('auth_redirect_after', window.location.pathname);
    onClose();
    navigate('/auth?mode=signup');
  };

  const handleLogin = () => {
    localStorage.setItem('auth_redirect_after', window.location.pathname);
    onClose();
    navigate('/auth');
  };

  const handleContinueAsGuest = () => {
    onClose();
  };

  const benefits = [
    { icon: Shield, text: '개인 맞춤형 분석을 위해 나만의 데이터가 축적됩니다' },
    { icon: Sparkles, text: '검사 기록과 리포트가 영구 보관되어 변화를 추적할 수 있어요' },
    { icon: Crown, text: '가족이라도 각자 계정이 있어야 정확한 개인 분석이 가능합니다' },
  ];

  // 가입 유도 강화를 위한 긴급성 요소
  const urgencyText = '지금 가입하면 프리미엄 분석 무료 제공!';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center space-y-3">
          <div className="flex justify-center">
            <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl">
              <Lock className="h-8 w-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-xl font-bold">
            검사 완료! 나만의 데이터를 만들어보세요
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            개인 계정이 있어야 검사 결과가 축적되고, 더 정확한 맞춤 분석이 가능합니다
          </DialogDescription>
          {/* 긴급성 배지 */}
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 rounded-full text-xs font-medium text-amber-600 dark:text-amber-400">
            <Sparkles className="h-3 w-3" />
            {urgencyText}
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 현재 결과 미리보기 */}
          {currentResult && (
            <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">{currentResult.testTitle}</p>
                    {currentResult.score !== undefined && (
                      <p className="text-sm text-muted-foreground">
                        점수: {currentResult.score}점
                      </p>
                    )}
                  </div>
                  {currentResult.level && (
                    <Badge variant="secondary">{currentResult.level}</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 저장되지 않은 결과 개수 */}
          {pendingResults.length > 0 && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <Sparkles className="h-5 w-5 text-amber-600" />
              <span className="text-sm text-amber-800 dark:text-amber-200">
                <strong>{pendingResults.length}개</strong>의 검사 결과가 저장 대기 중
              </span>
            </div>
          )}

          {/* 가입 혜택 */}
          <div className="space-y-2">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center gap-3 p-2">
                <div className="p-1.5 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-sm text-foreground">{benefit.text}</span>
              </div>
            ))}
          </div>

          {/* CTA 버튼들 */}
          <div className="space-y-2 pt-2">
            <Button 
              onClick={handleSignup}
              className="w-full bg-gradient-to-r from-primary to-primary-glow hover:opacity-90"
              size="lg"
            >
              무료 가입하고 결과 저장
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            
            <Button 
              variant="outline"
              onClick={handleLogin}
              className="w-full"
            >
              이미 계정이 있어요
            </Button>

            <button
              onClick={handleContinueAsGuest}
              className="w-full text-center text-sm text-muted-foreground hover:text-foreground py-2 underline-offset-4 hover:underline"
            >
              나중에 할게요 (결과가 저장되지 않습니다)
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SignupPromptModal;
