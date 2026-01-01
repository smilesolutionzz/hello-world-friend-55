import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const GUEST_SESSION_KEY = 'aihpro_guest_session';
const GUEST_RESULTS_KEY = 'aihpro_guest_results';

export interface GuestResult {
  id: string;
  testType: string;
  testTitle: string;
  results: any;
  createdAt: string;
  ageGroup?: string;
}

export interface GuestSession {
  id: string;
  createdAt: string;
  results: GuestResult[];
}

export const useGuestSession = () => {
  const [isGuest, setIsGuest] = useState<boolean>(false);
  const [guestResults, setGuestResults] = useState<GuestResult[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { toast } = useToast();

  // 인증 상태 확인
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      setIsGuest(!session);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
      setIsGuest(!session);

      // 로그인 시 게스트 데이터 마이그레이션 안내
      if (event === 'SIGNED_IN' && session) {
        const pendingResults = getGuestResults();
        if (pendingResults.length > 0) {
          migrateGuestData(session.user.id);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // localStorage에서 게스트 결과 로드
  useEffect(() => {
    const results = getGuestResults();
    setGuestResults(results);
  }, []);

  // 게스트 결과 가져오기
  const getGuestResults = (): GuestResult[] => {
    try {
      const stored = localStorage.getItem(GUEST_RESULTS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  // 게스트 결과 저장
  const saveGuestResult = useCallback((
    testType: string,
    testTitle: string,
    results: any,
    ageGroup?: string
  ): GuestResult => {
    const newResult: GuestResult = {
      id: crypto.randomUUID(),
      testType,
      testTitle,
      results,
      createdAt: new Date().toISOString(),
      ageGroup
    };

    const existingResults = getGuestResults();
    const updatedResults = [...existingResults, newResult];
    
    localStorage.setItem(GUEST_RESULTS_KEY, JSON.stringify(updatedResults));
    setGuestResults(updatedResults);

    console.log('📝 게스트 결과 저장됨:', testType);
    return newResult;
  }, []);

  // 게스트 데이터를 DB로 마이그레이션
  const migrateGuestData = async (userId: string) => {
    const pendingResults = getGuestResults();
    if (pendingResults.length === 0) return;

    try {
      // 프로필 정보 가져오기
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', userId)
        .single();

      if (!profile) {
        console.error('프로필을 찾을 수 없습니다');
        return;
      }

      let migratedCount = 0;

      for (const result of pendingResults) {
        try {
          // assessments 테이블에 저장 (기존 테이블 활용)
          const { error } = await supabase
            .from('assessments')
            .insert({
              user_id: userId,
              profile_id: profile.id,
              age_group: result.ageGroup || 'adult',
              results: {
                testType: result.testType,
                testTitle: result.testTitle,
                ...result.results
              },
              risk_level: result.results?.severity || result.results?.level || 'normal'
            });

          if (!error) {
            migratedCount++;
          } else {
            console.error('결과 마이그레이션 실패:', error);
          }
        } catch (err) {
          console.error('개별 결과 마이그레이션 오류:', err);
        }
      }

      // 마이그레이션 완료 후 로컬 데이터 삭제
      if (migratedCount > 0) {
        localStorage.removeItem(GUEST_RESULTS_KEY);
        localStorage.removeItem(GUEST_SESSION_KEY);
        setGuestResults([]);

        toast({
          title: "🎉 검사 결과 저장 완료!",
          description: `${migratedCount}개의 검사 결과가 계정에 저장되었습니다.`,
        });
      }
    } catch (error) {
      console.error('게스트 데이터 마이그레이션 오류:', error);
    }
  };

  // 게스트 세션 초기화
  const clearGuestSession = useCallback(() => {
    localStorage.removeItem(GUEST_RESULTS_KEY);
    localStorage.removeItem(GUEST_SESSION_KEY);
    setGuestResults([]);
  }, []);

  // 게스트 결과 개수
  const pendingResultsCount = guestResults.length;

  // 게스트 상태에서 결과가 있는지
  const hasPendingResults = isGuest && pendingResultsCount > 0;

  return {
    isGuest,
    isAuthenticated,
    guestResults,
    pendingResultsCount,
    hasPendingResults,
    saveGuestResult,
    migrateGuestData,
    clearGuestSession,
    getGuestResults
  };
};

export default useGuestSession;
