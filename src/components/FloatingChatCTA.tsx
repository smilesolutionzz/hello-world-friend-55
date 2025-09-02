import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, X } from 'lucide-react';
import AIPlatformChat from './AIPlatformChat';

const FloatingChatCTA = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* 플로팅 CTA 버튼 */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
        {!isOpen ? (
          <Button
            onClick={() => setIsOpen(true)}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 
                     text-white rounded-full px-4 py-2 sm:px-6 sm:py-3 shadow-lg hover:shadow-xl transform hover:scale-105 
                     transition-all duration-300 flex items-center gap-2 text-sm sm:text-base"
          >
            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="font-medium hidden lg:inline">질문 있나요?</span>
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