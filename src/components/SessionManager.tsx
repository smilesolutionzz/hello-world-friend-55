import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const SessionManager = () => {
  const { toast } = useToast();
  const lastCheckTime = useRef<number>(0);

  useEffect(() => {
    // 페이지 포커스 시 세션 갱신 체크 (모바일에서 앱 전환 후 복귀 시)
    const handleFocus = async () => {
      // 최소 30초 간격으로 체크 (성능 최적화)
      const now = Date.now();
      if (now - lastCheckTime.current < 30000) {
        return;
      }
      lastCheckTime.current = now;
      try {
        console.log('📱 페이지 포커스 - 세션 상태 확인');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ 포커스 시 세션 확인 오류:', error);
          return;
        }
        
        if (session) {
          console.log('✅ 포커스 시 세션 유지됨:', session.user.email);
          
          // 토큰 만료 시간 확인
          const expiresAt = session.expires_at ? new Date(session.expires_at * 1000) : null;
          const now = new Date();
          
          if (expiresAt && expiresAt > now) {
            const timeUntilExpiry = expiresAt.getTime() - now.getTime();
            console.log(`⏰ 토큰 만료까지: ${Math.round(timeUntilExpiry / 1000 / 60)}분`);
            
            // 30분 이내 만료 시 자동 갱신
            if (timeUntilExpiry < 30 * 60 * 1000) {
              console.log('🔄 토큰 자동 갱신 시도');
              await supabase.auth.refreshSession();
            }
          }
        } else {
          console.log('📤 포커스 시 세션 없음');
        }
      } catch (error) {
        console.error('💥 포커스 처리 오류:', error);
      }
    };

    // 페이지 가시성 변경 감지 (모바일 브라우저용)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        handleFocus();
      }
    };

    // 온라인/오프라인 상태 변경 감지
    const handleOnline = () => {
      console.log('🌐 온라인 상태 복원');
      handleFocus();
    };

    // 브라우저 저장소 변경 감지 (다른 탭에서 로그아웃 시)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key?.includes('supabase') && e.newValue === null) {
        console.log('🔄 다른 탭에서 로그아웃 감지');
        window.location.reload();
      }
    };

    // 이벤트 리스너 등록 (focus 제거 - visibilitychange만 사용)
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('online', handleOnline);
    window.addEventListener('storage', handleStorageChange);

    // 초기 세션 상태 로깅
    const logInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('🚀 SessionManager 초기화:', {
          hasSession: !!session,
          email: session?.user?.email,
          userAgent: navigator.userAgent,
          isMobile: /Mobi|Android/i.test(navigator.userAgent)
        });
      } catch (error) {
        console.error('초기 세션 로깅 오류:', error);
      }
    };

    logInitialSession();

    // 정리
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [toast]);

  return null; // UI를 렌더링하지 않는 유틸리티 컴포넌트
};