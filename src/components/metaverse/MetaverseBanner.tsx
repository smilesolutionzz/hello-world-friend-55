import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Mic, Sparkles, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export const MetaverseBanner = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="relative bg-gradient-to-r from-cyan-500/90 via-blue-500/90 to-indigo-500/90 py-4 px-6 overflow-hidden animate-fade-in">
      {/* 배경 애니메이션 효과 */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20" />
      
      {/* 떠다니는 별 효과 */}
      <div className="absolute top-2 left-10 animate-pulse">
        <Sparkles className="w-4 h-4 text-white/60" />
      </div>
      <div className="absolute top-3 right-20 animate-pulse" style={{ animationDelay: '0.5s' }}>
        <Sparkles className="w-3 h-3 text-white/40" />
      </div>
      <div className="absolute bottom-2 left-1/4 animate-pulse" style={{ animationDelay: '1s' }}>
        <Sparkles className="w-3 h-3 text-white/50" />
      </div>

      <div className="container mx-auto relative z-10">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* 아이콘 */}
            <div className="hidden sm:flex items-center justify-center w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm animate-pulse flex-shrink-0">
              <Mic className="w-6 h-6 text-white" />
            </div>
            
            {/* 메시지 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="inline-flex items-center px-2 py-0.5 bg-white/30 backdrop-blur-sm rounded-full text-xs font-bold text-white shadow-lg animate-scale-in flex-shrink-0">
                  🎭 NEW
                </span>
                <h3 className="text-white font-bold text-sm sm:text-lg whitespace-nowrap">AI 메타버스 상담실 오픈!</h3>
              </div>
              <p className="text-white/90 text-xs hidden sm:block">
                가상공간에서 AI 상담사와 실시간 음성 대화를 경험해보세요 ✨
              </p>
            </div>
          </div>

          {/* 버튼들 */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <Button
              onClick={() => navigate('/metaverse-voice')}
              className="bg-white hover:bg-white/90 text-blue-600 font-bold px-3 py-1.5 sm:px-6 sm:py-2 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 whitespace-nowrap text-sm"
            >
              <Mic className="w-3 h-3 sm:w-4 sm:h-4 sm:mr-2" />
              <span className="hidden sm:inline">지금 체험하기</span>
              <span className="sm:hidden">체험</span>
            </Button>
            
            <button
              onClick={() => setIsVisible(false)}
              className="p-1.5 sm:p-2 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
              aria-label="배너 닫기"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
