import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { MessageCircle, X } from 'lucide-react';
import AIPlatformChat from './AIPlatformChat';

const FloatingChatCTA = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  
  // 결과 페이지와 메타버스 페이지에서는 숨김
  const hideOnRoutes = ['/fun-test-result', '/han-medicine-test', '/metaverse-voice'];
  if (hideOnRoutes.some(route => location.pathname.includes(route))) {
    return null;
  }

  return (
    <>
      {/* 플로팅 CTA 버튼 */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 lg:hidden">
        {!isOpen ? (
          <Button
            onClick={() => setIsOpen(true)}
            size="icon"
            className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-full w-12 h-12 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            <MessageCircle className="w-5 h-5" />
          </Button>
        ) : (
          <div className="relative">
            {/* 닫기 버튼 */}
            <Button
              onClick={() => setIsOpen(false)}
              variant="outline"
              size="icon"
              className="absolute -top-2 -right-2 z-10 bg-white shadow-md rounded-full w-8 h-8"
            >
              <X className="w-4 h-4" />
            </Button>
            
            {/* AI 채팅 인터페이스 */}
            <AIPlatformChat onClose={() => setIsOpen(false)} />
          </div>
        )}
      </div>
    </>
  );
};

export default FloatingChatCTA;