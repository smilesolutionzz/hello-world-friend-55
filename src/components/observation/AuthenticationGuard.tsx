import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ShieldAlert, LogIn } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface AuthenticationGuardProps {
  children: React.ReactNode;
  fallbackMessage?: string;
  redirectPath?: string;
}

export const AuthenticationGuard: React.FC<AuthenticationGuardProps> = ({ 
  children, 
  fallbackMessage = "이 기능을 사용하려면 로그인이 필요합니다.",
  redirectPath = "/auth"
}) => {
  const [authState, setAuthState] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthentication();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setAuthState('authenticated');
      } else if (event === 'SIGNED_OUT' || !session) {
        setAuthState('unauthenticated');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAuthentication = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        setAuthState('unauthenticated');
      } else {
        // Additional check: verify the session is valid
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setAuthState('authenticated');
        } else {
          setAuthState('unauthenticated');
        }
      }
    } catch (error) {
      console.error('Authentication check failed:', error);
      setAuthState('unauthenticated');
    }
  };

  const handleLogin = () => {
    navigate(redirectPath);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  if (authState === 'loading') {
    return (
      <Card className="w-full max-w-md mx-auto mt-8">
        <CardContent className="flex items-center justify-center p-8">
          <div className="flex items-center gap-3">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="text-muted-foreground">인증 확인 중...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (authState === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary-subtle via-background to-accent/20">
        {/* Floating Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        </div>

        <Card className="w-full max-w-lg relative card-glass">
          <CardHeader className="text-center space-y-4 pb-2">
            <div className="flex justify-center">
              <div className="p-4 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl">
                <ShieldAlert className="h-12 w-12 text-primary" />
              </div>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                로그인이 필요합니다
              </CardTitle>
              <p className="text-muted-foreground">
                {fallbackMessage}
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <Alert className="border-primary/20 bg-primary/5">
              <LogIn className="h-4 w-4 text-primary" />
              <AlertDescription className="text-foreground">
                로그인 후 모든 프리미엄 기능을 이용하실 수 있습니다
              </AlertDescription>
            </Alert>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleLogin} 
                className="flex-1 bg-gradient-to-r from-primary to-primary-glow hover:opacity-90 transition-all"
                size="lg"
              >
                <LogIn className="h-4 w-4 mr-2" />
                로그인하기
              </Button>
              <Button 
                variant="outline" 
                onClick={handleRefresh} 
                className="flex-1 border-primary/20 hover:bg-primary/5"
                size="lg"
              >
                새로고침
              </Button>
            </div>
            
            <div className="text-center pt-2">
              <p className="text-sm text-muted-foreground">
                간편하게 시작하고 전문적인 분석을 받아보세요
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Authenticated - render children
  return <>{children}</>;
};

export default AuthenticationGuard;