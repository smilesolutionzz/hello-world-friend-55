import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { GESTURES, type GestureType } from '@/utils/GestureSystem';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface GestureQuickMenuProps {
  onGesture: (gesture: GestureType) => void;
}

export const GestureQuickMenu = ({ onGesture }: GestureQuickMenuProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const gestureList = Object.entries(GESTURES) as [GestureType, typeof GESTURES[keyof typeof GESTURES]][];

  return (
    <div className="fixed bottom-32 right-4 z-50">
      {/* 토글 버튼 */}
      <Button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-xl border-2 border-white/30 p-0"
      >
        {isExpanded ? <ChevronDown className="w-6 h-6" /> : <ChevronUp className="w-6 h-6" />}
      </Button>

      {/* 제스처 메뉴 */}
      {isExpanded && (
        <div className="absolute bottom-16 right-0 bg-black/80 backdrop-blur-xl rounded-2xl p-3 shadow-2xl border border-white/20 animate-fade-in max-h-96 overflow-y-auto">
          <div className="text-white text-xs font-bold mb-2 text-center">
            💃 제스처
          </div>
          <div className="grid grid-cols-2 gap-2">
            {gestureList.map(([key, gesture]) => (
              <button
                key={key}
                onClick={() => {
                  onGesture(key);
                  setIsExpanded(false);
                }}
                className="flex flex-col items-center gap-1 p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-all active:scale-95"
              >
                <span className="text-2xl">{gesture.icon}</span>
                <span className="text-white text-xs font-medium whitespace-nowrap">
                  {gesture.name}
                </span>
                <span className="text-white/50 text-[10px]">
                  {gesture.key}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
