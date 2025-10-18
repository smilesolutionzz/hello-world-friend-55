import { useState, useEffect } from 'react';
import { Users, Clock, TrendingUp } from 'lucide-react';

export const ExpertOnlineStatus = () => {
  const [onlineExperts, setOnlineExperts] = useState(5);
  const [urgentSlots, setUrgentSlots] = useState(3);

  useEffect(() => {
    // 실시간 느낌을 주기 위한 랜덤 변화
    const interval = setInterval(() => {
      setOnlineExperts(Math.floor(Math.random() * 5) + 3);
      setUrgentSlots(Math.floor(Math.random() * 3) + 1);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-2xl p-6 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
        <h3 className="text-white font-bold text-lg">실시간 전문가 대기중</h3>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-green-400" />
          <div>
            <p className="text-white/60 text-xs">온라인 전문가</p>
            <p className="text-white font-bold text-xl">{onlineExperts}명</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-yellow-400" />
          <div>
            <p className="text-white/60 text-xs">10분 내 응답</p>
            <p className="text-white font-bold text-xl">{urgentSlots}명</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-blue-400" />
          <div>
            <p className="text-white/60 text-xs">평균 응답시간</p>
            <p className="text-white font-bold text-xl">8분</p>
          </div>
        </div>
      </div>
    </div>
  );
};
