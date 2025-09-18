import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, X } from 'lucide-react';
import AIAgentAIH from './AIAgentAIH';

const FloatingAIHAgent = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* 플로팅 AIH 에이전트 버튼 */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
        {!isOpen ? (
          <Button
            onClick={() => setIsOpen(true)}
            className="bg-gradient-to-br from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 
                     text-white rounded-full w-14 h-14 shadow-xl hover:shadow-2xl 
                     transform hover:scale-105 transition-all duration-300 flex items-center justify-center 
                     p-0"
          >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <div className="w-5 h-5 rounded-full bg-white/40 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white"></div>
              </div>
            </div>
          </Button>
        ) : (
          <div className="relative">
            {/* AI 에이전트 인터페이스 */}
            <AIAgentAIH onClose={() => setIsOpen(false)} />
          </div>
        )}
      </div>
    </>
  );
};

export default FloatingAIHAgent;