import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function useMetaverseSession() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [hasEntered, setHasEntered] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  // 인증 확인 - visibility 변경 시 리다이렉트 방지
  useEffect(() => {
    let isRedirecting = false;
    
    const checkAuth = async () => {
      // 이미 리다이렉트 중이면 무시
      if (isRedirecting) return;
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // 세션 복원 대기 후 재확인
        await new Promise(resolve => setTimeout(resolve, 500));
        const { data: { session: retrySession } } = await supabase.auth.getSession();
        
        if (!retrySession) {
          isRedirecting = true;
          toast({
            title: "로그인이 필요합니다",
            description: "메타버스 상담실은 로그인 후 이용 가능합니다",
            variant: "destructive",
          });
          navigate('/auth');
        }
      }
    };

    checkAuth();
  }, [navigate, toast]);

  // 사용자 ID 가져오기
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
      } else {
        // 익명 사용자의 경우 세션 기반 ID 생성
        const sessionId = sessionStorage.getItem('anonymous_user_id') || crypto.randomUUID();
        sessionStorage.setItem('anonymous_user_id', sessionId);
        setCurrentUserId(sessionId);
      }
    };
    getUser();
  }, []);

  const handleEnter = () => {
    setHasEntered(true);
  };

  const handleExit = () => {
    toast({
      title: "퇴장",
      description: "메타버스 상담실을 나갑니다",
    });
    navigate(-1);
  };

  return {
    hasEntered,
    currentUserId,
    handleEnter,
    handleExit,
  };
}
