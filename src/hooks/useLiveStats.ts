import { useState, useEffect } from 'react';

interface LiveStats {
  visitors: number;
  online: number;
  testsInProgress: number;
}

/**
 * 실시간으로 증가하는 라이브 통계를 제공합니다
 * 오늘 검사는 170명 이상부터 시작하며, 시간이 지날수록 증가합니다
 * 누적 방문자는 3000명 이상으로 설정됩니다
 */
export function useLiveStats(): LiveStats {
  const [stats, setStats] = useState<LiveStats>({
    visitors: 0,
    online: 0,
    testsInProgress: 0
  });

  useEffect(() => {
    // 서비스 시작 날짜 (2024년 1월 1일)
    const launchDate = new Date('2024-01-01');
    const today = new Date();
    
    // 경과 일수 계산
    const daysSinceLaunch = Math.floor(
      (today.getTime() - launchDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    // 누적 방문자 수 (3200+ 시작)
    const baseVisitors = 3200;
    const dailyVisitorGrowth = 8;
    const calculatedVisitors = baseVisitors + (daysSinceLaunch * dailyVisitorGrowth);
    
    // 오늘 검사 진행 중 (170+ 시작, 시간대별로 변동)
    const currentHour = today.getHours();
    let hourlyMultiplier = 1.0;
    
    // 활동이 많은 시간대
    if ((currentHour >= 9 && currentHour <= 12) || (currentHour >= 20 && currentHour <= 23)) {
      hourlyMultiplier = 1.5;
    } else if (currentHour >= 13 && currentHour <= 19) {
      hourlyMultiplier = 1.2;
    } else if (currentHour >= 0 && currentHour <= 6) {
      hourlyMultiplier = 0.7;
    }
    
    // 요일별 보정
    const dayOfWeek = today.getDay();
    const weekendMultiplier = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.3 : 1.0;
    
    // 오늘 검사 진행 중 (최소 170명 보장)
    const baseTestsInProgress = 180;
    const calculatedTestsInProgress = Math.max(
      170,
      Math.floor(
        baseTestsInProgress * hourlyMultiplier * weekendMultiplier + 
        Math.random() * 30
      )
    );
    
    // 온라인 사용자 (검사 진행 중의 60-80%)
    const calculatedOnline = Math.floor(
      calculatedTestsInProgress * (0.6 + Math.random() * 0.2)
    );
    
    setStats({
      visitors: calculatedVisitors,
      online: calculatedOnline,
      testsInProgress: calculatedTestsInProgress
    });
    
    // 5분마다 업데이트
    const interval = setInterval(() => {
      const currentHour = new Date().getHours();
      let hourlyMultiplier = 1.0;
      
      if ((currentHour >= 9 && currentHour <= 12) || (currentHour >= 20 && currentHour <= 23)) {
        hourlyMultiplier = 1.5;
      } else if (currentHour >= 13 && currentHour <= 19) {
        hourlyMultiplier = 1.2;
      } else if (currentHour >= 0 && currentHour <= 6) {
        hourlyMultiplier = 0.7;
      }
      
      const dayOfWeek = new Date().getDay();
      const weekendMultiplier = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.3 : 1.0;
      
      const updatedTestsInProgress = Math.max(
        170,
        Math.floor(
          baseTestsInProgress * hourlyMultiplier * weekendMultiplier + 
          Math.random() * 30
        )
      );
      
      const updatedOnline = Math.floor(
        updatedTestsInProgress * (0.6 + Math.random() * 0.2)
      );
      
      setStats(prev => ({
        ...prev,
        online: updatedOnline,
        testsInProgress: updatedTestsInProgress
      }));
    }, 300000); // 5분마다
    
    return () => clearInterval(interval);
  }, []);

  return stats;
}
