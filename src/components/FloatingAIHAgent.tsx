import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, X } from 'lucide-react';
import AIAgentAIH from './AIAgentAIH';

const FloatingAIHAgent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const dragRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isOpen) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart]);

  return (
    <>
      {/* 플로팅 AIH 에이전트 버튼 */}
      <div 
        ref={dragRef}
        className={`fixed z-50 ${
          isOpen 
            ? 'cursor-move' 
            : 'bottom-4 right-4 sm:bottom-6 sm:right-6'
        }`}
        style={isOpen ? {
          left: `${position.x || window.innerWidth - 400}px`,
          top: `${position.y || window.innerHeight - 520}px`,
          transform: position.x === 0 && position.y === 0 ? 'translate(-100%, -100%)' : 'none'
        } : {}}
      >
        {!isOpen ? (
          <Button
            onClick={() => setIsOpen(true)}
            className="bg-gradient-to-br from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 
                     text-white rounded-full px-4 py-3 sm:px-6 sm:py-4 shadow-xl hover:shadow-2xl 
                     transform hover:scale-105 transition-all duration-300 flex items-center gap-3 
                     text-sm sm:text-base font-medium"
          >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
              <div className="w-5 h-5 rounded-full bg-white/40 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-white"></div>
              </div>
            </div>
            <span>AIH AGENT</span>
          </Button>
        ) : (
          <div 
            className="relative select-none"
            onMouseDown={handleMouseDown}
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          >
            {/* AI 에이전트 인터페이스 */}
            <AIAgentAIH onClose={() => setIsOpen(false)} />
          </div>
        )}
      </div>
    </>
  );
};

export default FloatingAIHAgent;