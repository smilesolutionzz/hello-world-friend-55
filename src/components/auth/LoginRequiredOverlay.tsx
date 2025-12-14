import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

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
    navigate('/auth');
  };

  // Still loading
  if (isAuthenticated === null) {
    return <>{children}</>;
  }

  // Authenticated - show normal content
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Not authenticated - show blurred overlay
  return (
    <div className="relative">
      {/* Blurred content */}
      <div className="blur-md pointer-events-none select-none opacity-60">
        {children}
      </div>
      
      {/* Overlay with login button */}
      <div className="absolute inset-0 flex items-center justify-center bg-background/20">
        <Button 
          onClick={handleLogin}
          className="flex items-center gap-2 bg-foreground/90 hover:bg-foreground text-background px-6 py-3 rounded-full shadow-lg"
        >
          <Lock className="h-4 w-4" />
          {message}
        </Button>
      </div>
    </div>
  );
};

export default LoginRequiredOverlay;
