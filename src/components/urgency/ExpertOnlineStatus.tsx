import { useState, useEffect } from 'react';
import { Users, Clock, TrendingUp } from 'lucide-react';

export const ExpertOnlineStatus = () => {
  const [onlineExperts, setOnlineExperts] = useState(0);
  const [urgentSlots, setUrgentSlots] = useState(0);

  useEffect(() => {
    const calculateOnlineUsers = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(0, 0, 0, 0);
      
      // 자정부터 경과한 밀리초
      const elapsed = now.getTime() - midnight.getTime();
      // 하루 전체 밀리초 (24시간)
      const totalDay = 24 * 60 * 60 * 1000;
      
      // 0에서 1000까지 선형 증가
      const baseCount = Math.floor((elapsed / totalDay) * 1000);
      
      // ±30명의 자연스러운 변동 추가
      const variance = Math.floor(Math.random() * 61) - 30;
      const finalCount = Math.max(0, Math.min(1000, baseCount + variance));
      
      setOnlineExperts(finalCount);
      // 긴급 슬롯은 전체의 5~10% 정도로 설정
      setUrgentSlots(Math.floor(finalCount * (0.05 + Math.random() * 0.05)));
    };

    // 초기 계산
    calculateOnlineUsers();

    // 30초마다 업데이트
    const interval = setInterval(calculateOnlineUsers, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-2xl p-6 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
        <h3 className="text-gray-900 dark:text-white font-bold text-lg">실시간 전문가 대기중</h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-green-400" />
          <div>
            <p className="text-gray-700 dark:text-gray-300 text-xs font-medium">온라인 전문가</p>
            <p className="text-gray-900 dark:text-white font-bold text-xl">{onlineExperts}명</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-yellow-400" />
          <div>
            <p className="text-gray-700 dark:text-gray-300 text-xs font-medium">10분 내 응답</p>
            <p className="text-gray-900 dark:text-white font-bold text-xl">{urgentSlots}명</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-blue-400" />
          <div>
            <p className="text-gray-700 dark:text-gray-300 text-xs font-medium">평균 응답시간</p>
            <p className="text-gray-900 dark:text-white font-bold text-xl">8분</p>
          </div>
        </div>
      </div>
    </div>
  );
};
