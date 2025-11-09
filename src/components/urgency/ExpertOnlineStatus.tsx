import { useState, useEffect } from 'react';
import { Users, Clock, TrendingUp } from 'lucide-react';

export const ExpertOnlineStatus = () => {
  const [onlineExperts, setOnlineExperts] = useState(0);
  const [urgentSlots, setUrgentSlots] = useState(0);

  useEffect(() => {
    const calculateOnlineUsers = () => {
      // 실시간 전문가: 1-9명 사이로 랜덤 설정
      const experts = Math.floor(Math.random() * 9) + 1;
      setOnlineExperts(experts);
      
      // 10분 내 응답: 전문가 수보다 1-2명 적게
      const slots = Math.max(1, experts - Math.floor(Math.random() * 2) - 1);
      setUrgentSlots(slots);
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
        <h3 className="text-foreground font-bold text-lg">실시간 전문가 대기중</h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-green-400" />
          <div>
            <p className="text-foreground/70 text-xs font-medium">온라인 전문가</p>
            <p className="text-foreground font-bold text-xl">{onlineExperts}명</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-yellow-400" />
          <div>
            <p className="text-foreground/70 text-xs font-medium">10분 내 응답</p>
            <p className="text-foreground font-bold text-xl">{urgentSlots}명</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-blue-400" />
          <div>
            <p className="text-foreground/70 text-xs font-medium">평균 응답시간</p>
            <p className="text-foreground font-bold text-xl">8분</p>
          </div>
        </div>
      </div>
    </div>
  );
};
