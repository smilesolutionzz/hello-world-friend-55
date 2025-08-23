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
        console.log('🔍 모바일 인증 상태 확인 시작');
        
        // 로컬스토리지에서 세션 정보 확인
        const storedSession = localStorage.getItem('sb-hrcqxjetmzxoephgyjlb-auth-token');
        console.log('📱 저장된 세션 토큰:', storedSession ? '존재함' : '없음');
        
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('🔐 세션 상태:', session?.user?.id ? `로그인됨 (${session.user.email})` : '비로그인');
        
        if (error) {
          console.error('❌ 세션 확인 오류:', error);
          
          // JWT 토큰 관련 에러 감지
          if (error.message.includes('invalid claim') || error.message.includes('bad_jwt')) {
            console.log('🧹 JWT 토큰 오류 감지, 세션 정리:', error.message);
            await supabase.auth.signOut();
            if (mounted) {
              setAuthenticated(false);
              setUser(null);
            }
            return;
          }
        }
        
        if (!mounted) return;
        
        if (error || !session?.user) {
          console.log('📤 인증되지 않은 상태');
          setAuthenticated(false);
          setUser(null);
        } else {
          console.log('✅ 인증 성공:', session.user.email);
          setUser(session.user);
          setAuthenticated(true);
        }
      } catch (error) {
        console.error('💥 Auth check error:', error);
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
        console.log('🔄 Auth state change:', event, session?.user?.id);
        console.log('📱 모바일 세션 상태:', {
          event,
          hasSession: !!session,
          userId: session?.user?.id,
          email: session?.user?.email,
          expiresAt: session?.expires_at
        });
        
        if (!mounted) return;
        
        // 페이지 새로고침 시에도 세션 유지
        if (event === 'INITIAL_SESSION' && session) {
          console.log('🔄 초기 세션 복원:', session.user.email);
          setUser(session.user);
          setAuthenticated(true);
        } else if (event === 'SIGNED_OUT' || !session) {
          console.log('📤 로그아웃 처리');
          setAuthenticated(false);
          setUser(null);
        } else if (event === 'SIGNED_IN' && session) {
          console.log('✅ 로그인 성공:', session.user.email);
          setUser(session.user);
          setAuthenticated(true);
        } else if (event === 'TOKEN_REFRESHED' && session) {
          console.log('🔄 토큰 갱신 성공:', session.user.email);
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