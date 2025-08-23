import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface AuthGuardReturn {
  authenticated: boolean;
  loading: boolean;
  user: any;
}

export const useAuthGuard = (): AuthGuardReturn => {
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        // JWT 토큰 관련 에러 감지
        if (error && (error.message.includes('invalid claim') || error.message.includes('bad_jwt'))) {
          console.log('JWT 토큰 오류 감지, 세션 정리:', error.message);
          await supabase.auth.signOut();
          if (mounted) {
            setAuthenticated(false);
            setUser(null);
          }
          return;
        }
        
        if (!mounted) return;
        
        if (error || !session?.user) {
          setAuthenticated(false);
          setUser(null);
        } else {
          setUser(session.user);
          setAuthenticated(true);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        if (mounted) {
          setAuthenticated(false);
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Auth state listener 설정
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.id);
        
        if (!mounted) return;
        
        if (event === 'SIGNED_OUT' || !session) {
          setAuthenticated(false);
          setUser(null);
        } else if (event === 'SIGNED_IN' && session) {
          setUser(session.user);
          setAuthenticated(true);
        } else if (event === 'TOKEN_REFRESHED' && session) {
          setUser(session.user);
          setAuthenticated(true);
        }
      }
    );

    checkAuth();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  return { authenticated, loading, user };
};