import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Mic, Sparkles, X } from 'lucide-react';
import { useState } from 'react';

export const MetaverseBanner = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <>
      {/* 데스크톱 배너 */}
      <div className="hidden sm:block relative bg-gradient-to-r from-cyan-500/90 via-blue-500/90 to-indigo-500/90 py-4 px-6 overflow-hidden animate-fade-in">
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
            <div className="flex items-center gap-4 flex-1">
              {/* 아이콘 */}
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm animate-pulse flex-shrink-0">
                <Mic className="w-6 h-6 text-white" />
              </div>
              
              {/* 메시지 */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center px-3 py-1 bg-white/30 backdrop-blur-sm rounded-full text-xs font-bold text-white shadow-lg animate-scale-in">
                    🎭 NEW
                  </span>
                  <h3 className="text-white font-bold text-lg">AI 메타버스 상담실 오픈!</h3>
                </div>
                <p className="text-white/90 text-sm">
                  가상공간에서 AI 상담사와 실시간 음성 대화를 경험해보세요 ✨
                </p>
              </div>
            </div>

            {/* 버튼들 */}
            <div className="flex items-center gap-2">
              <Button
                onClick={() => navigate('/metaverse-voice')}
                className="bg-white hover:bg-white/90 text-blue-600 font-bold px-6 py-2 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 whitespace-nowrap"
              >
                <Mic className="w-4 h-4 mr-2" />
                지금 체험하기
              </Button>
              
              <button
                onClick={() => setIsVisible(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="배너 닫기"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 모바일 플로팅 버튼 */}
      <button
        onClick={() => navigate('/metaverse-voice')}
        className="sm:hidden fixed bottom-20 right-4 z-50 flex items-center gap-2 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 text-white px-4 py-3 rounded-full shadow-2xl hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-110 animate-fade-in group"
        aria-label="AI 메타버스 상담실"
      >
        <div className="relative">
          <Mic className="w-5 h-5 animate-pulse" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
          </span>
        </div>
        <span className="text-xs font-bold whitespace-nowrap">AI 상담</span>
        <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
      </button>
    </>
  );
};
