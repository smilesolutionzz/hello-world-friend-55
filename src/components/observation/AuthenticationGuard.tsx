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
      <Card className="w-full max-w-lg mx-auto mt-8">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <ShieldAlert className="h-12 w-12 text-orange-500" />
          </div>
          <CardTitle className="text-xl">로그인이 필요합니다</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <LogIn className="h-4 w-4" />
            <AlertDescription>
              {fallbackMessage}
            </AlertDescription>
          </Alert>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={handleLogin} className="flex-1">
              <LogIn className="h-4 w-4 mr-2" />
              로그인하기
            </Button>
            <Button variant="outline" onClick={handleRefresh} className="flex-1">
              새로고침
            </Button>
          </div>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              로그인 후 모든 기능을 이용하실 수 있습니다.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Authenticated - render children
  return <>{children}</>;
};

export default AuthenticationGuard;