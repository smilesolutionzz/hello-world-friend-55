import React from 'react';
import { MessageCircle } from 'lucide-react';

const KakaoTalkWidget: React.FC = () => {
  const handleKakaoClick = () => {
    window.open('https://open.kakao.com/o/sHLdK3Ch', '_blank');
  };

  return (
    <div 
      className="fixed bottom-6 right-6 z-50 cursor-pointer group"
      onClick={handleKakaoClick}
    >
      <div className="bg-yellow-400 hover:bg-yellow-500 text-black rounded-full p-4 shadow-lg transition-all duration-300 transform hover:scale-110">
        <div className="flex items-center justify-center w-6 h-6">
          💬
        </div>
      </div>
      
      {/* Tooltip */}
      <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-black text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
        카카오톡 상담하기
        <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-black"></div>
      </div>
    </div>
  );
};

export default KakaoTalkWidget;