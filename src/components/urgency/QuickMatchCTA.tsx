import { Button } from '@/components/ui/button';
import { Zap, MessageCircle, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuickMatchCTAProps {
  variant?: 'default' | 'compact';
  onMatch?: () => void;
}

export const QuickMatchCTA = ({ variant = 'default', onMatch }: QuickMatchCTAProps) => {
  const navigate = useNavigate();

  const handleQuickMatch = () => {
    if (onMatch) {
      onMatch();
    } else {
      navigate('/expert-matching');
    }
  };

  if (variant === 'compact') {
    return (
      <Button
        onClick={handleQuickMatch}
        className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold"
      >
        <Zap className="w-5 h-5 mr-2 animate-pulse" />
        지금 바로 전문가와 연결 (30% 추가 할인)
      </Button>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-2xl p-8 backdrop-blur-sm">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 bg-purple-500/20 px-4 py-2 rounded-full mb-4">
          <Zap className="w-4 h-4 text-purple-400 animate-pulse" />
          <span className="text-purple-300 font-bold text-sm">지금 연결 시 30% 추가 할인</span>
        </div>
        <h3 className="text-white font-bold text-2xl mb-2">
          10분 내 전문가와 즉시 상담
        </h3>
        <p className="text-white/70 text-sm">
          현재 {Math.floor(Math.random() * 3) + 2}명의 전문가가 대기 중입니다
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Button
          onClick={handleQuickMatch}
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-6"
        >
          <MessageCircle className="w-5 h-5 mr-2" />
          채팅 상담 시작
        </Button>
        <Button
          onClick={handleQuickMatch}
          className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-bold py-6"
        >
          <Video className="w-5 h-5 mr-2" />
          화상 상담 시작
        </Button>
      </div>

      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/60">평균 만족도</span>
          <span className="text-yellow-400 font-bold">★ 4.8/5.0</span>
        </div>
        <div className="flex items-center justify-between text-sm mt-2">
          <span className="text-white/60">오늘 상담 완료</span>
          <span className="text-green-400 font-bold">{Math.floor(Math.random() * 50) + 150}건</span>
        </div>
      </div>
    </div>
  );
};
