import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    const MAX_RETRIES = 3;

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
          
          // JWT 토큰 관련 에러 감지 - 자동 재로그인 시도
          if (error.message.includes('invalid claim') || error.message.includes('bad_jwt')) {
            console.log('🔄 JWT 토큰 오류 감지, 재로그인 시도 중...');
            
            if (retryCount < MAX_RETRIES) {
              retryCount++;
              // 세션 갱신 시도
              const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession();
              
              if (!refreshError && refreshedSession) {
                console.log('✅ 세션 갱신 성공');
                if (mounted) {
                  setUser(refreshedSession.user);
                  setAuthenticated(true);
                  toast({
                    title: "세션 복구됨",
                    description: "자동으로 다시 로그인되었습니다.",
                    duration: 3000,
                  });
                }
                return;
              }
            }
            
            // 재시도 실패 시 로그아웃
            console.log('🧹 재로그인 실패, 세션 정리');
            await supabase.auth.signOut();
            if (mounted) {
              setAuthenticated(false);
              setUser(null);
              toast({
                title: "세션 만료",
                description: "다시 로그인해주세요.",
                variant: "destructive",
                duration: 5000,
              });
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

    // 페이지 포커스 시 세션 확인 및 복구
    const handleVisibilityChange = async () => {
      if (!document.hidden && mounted) {
        console.log('📱 페이지 포커스 - 세션 상태 확인');
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.log('📤 포커스 시 세션 없음 - 자동 복구 시도');
          // 세션 갱신 시도
          const { data: { session: refreshedSession }, error } = await supabase.auth.refreshSession();
          
          if (!error && refreshedSession) {
            console.log('✅ 포커스 시 세션 복구 성공');
            setUser(refreshedSession.user);
            setAuthenticated(true);
          }
        } else {
          console.log('✅ 포커스 시 세션 유지됨');
          setUser(session.user);
          setAuthenticated(true);
        }
      }
    };

    // 페이지 가시성 변경 이벤트 리스너
    document.addEventListener('visibilitychange', handleVisibilityChange);

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
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  return { authenticated, loading, user };
};