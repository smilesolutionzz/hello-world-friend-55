import { useState, useEffect } from 'react';

interface LiveStats {
  visitors: number;
  online: number;
  testsInProgress: number;
}

export function useLiveStats() {
  const [stats, setStats] = useState<LiveStats>({
    visitors: 3000,
    online: 0,
    testsInProgress: 170
  });

  useEffect(() => {
    // 오늘 날짜의 시작 시간 (00:00:00)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // 현재 시간과의 차이 (분 단위)
    const now = new Date();
    const minutesPassedToday = Math.floor((now.getTime() - today.getTime()) / (1000 * 60));
    
    // 시간에 따라 증가하는 검사 진행 수 계산
    // 170부터 시작해서 시간당 평균 10-15명씩 증가
    const baseTests = 170;
    const hoursPassed = minutesPassedToday / 60;
    const increment = Math.floor(hoursPassed * (12 + Math.random() * 3));
    
    // 방문자 수는 3000부터 시작해서 시간당 평균 50-100명씩 증가
    const baseVisitors = 3000;
    const visitorIncrement = Math.floor(hoursPassed * (75 + Math.random() * 25));
    
    // 온라인 사용자는 검사 진행 중의 60-80%
    const onlinePercentage = 0.6 + Math.random() * 0.2;
    
    setStats({
      visitors: baseVisitors + visitorIncrement,
      online: Math.floor((baseTests + increment) * onlinePercentage),
      testsInProgress: baseTests + increment
    });

    // 5분마다 업데이트
    const interval = setInterval(() => {
      const currentTime = new Date();
      const currentMinutes = Math.floor((currentTime.getTime() - today.getTime()) / (1000 * 60));
      const currentHours = currentMinutes / 60;
      
      const currentIncrement = Math.floor(currentHours * (12 + Math.random() * 3));
      const currentVisitorIncrement = Math.floor(currentHours * (75 + Math.random() * 25));
      const currentOnlinePercentage = 0.6 + Math.random() * 0.2;
      
      setStats({
        visitors: baseVisitors + currentVisitorIncrement,
        online: Math.floor((baseTests + currentIncrement) * currentOnlinePercentage),
        testsInProgress: baseTests + currentIncrement
      });
    }, 5 * 60 * 1000); // 5분마다 업데이트

    return () => clearInterval(interval);
  }, []);

  return stats;
}
