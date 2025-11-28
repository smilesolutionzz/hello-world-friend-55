import { useEffect, useRef, useState } from 'react';

interface VirtualJoystickProps {
  onMove: (x: number, y: number) => void;
  onJump: () => void;
}

export const VirtualJoystick = ({ onMove, onJump }: VirtualJoystickProps) => {
  const joystickRef = useRef<HTMLDivElement>(null);
  const stickRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const touchId = useRef<number | null>(null);
  const centerRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!joystickRef.current) return;
    
    const rect = joystickRef.current.getBoundingClientRect();
    centerRef.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
  }, []);

  const handleStart = (clientX: number, clientY: number, id?: number) => {
    if (!joystickRef.current || !stickRef.current) return;
    
    setIsDragging(true);
    if (id !== undefined) touchId.current = id;
    
    const rect = joystickRef.current.getBoundingClientRect();
    centerRef.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging || !stickRef.current) return;

    const deltaX = clientX - centerRef.current.x;
    const deltaY = clientY - centerRef.current.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const maxDistance = 50; // 더 큰 범위로 증가

    let x = deltaX;
    let y = deltaY;

    if (distance > maxDistance) {
      x = (deltaX / distance) * maxDistance;
      y = (deltaY / distance) * maxDistance;
    }

    stickRef.current.style.transform = `translate(${x}px, ${y}px)`;

    // 정규화된 값 (-1 ~ 1), 민감도 증가
    const normalizedX = Math.min(Math.max(x / maxDistance * 1.5, -1), 1);
    const normalizedY = Math.min(Math.max(y / maxDistance * 1.5, -1), 1);

    onMove(normalizedX, normalizedY);
  };

  const handleEnd = () => {
    setIsDragging(false);
    touchId.current = null;
    
    if (stickRef.current) {
      stickRef.current.style.transform = 'translate(0px, 0px)';
    }
    
    onMove(0, 0);
  };

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (!joystickRef.current) return;
      const touch = Array.from(e.touches).find(t => {
        const target = t.target as HTMLElement;
        return joystickRef.current?.contains(target);
      });
      
      if (touch) {
        e.preventDefault();
        e.stopPropagation();
        handleStart(touch.clientX, touch.clientY, touch.identifier);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || touchId.current === null) return;
      
      const touch = Array.from(e.touches).find(t => t.identifier === touchId.current);
      if (touch) {
        e.preventDefault();
        e.stopPropagation();
        handleMove(touch.clientX, touch.clientY);
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (touchId.current !== null) {
        const touch = Array.from(e.changedTouches).find(t => t.identifier === touchId.current);
        if (touch) {
          e.preventDefault();
          e.stopPropagation();
          handleEnd();
        }
      }
    };

    // passive: false로 설정하여 preventDefault 가능하게
    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });
    document.addEventListener('touchcancel', handleTouchEnd, { passive: false });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('touchcancel', handleTouchEnd);
    };
  }, [isDragging]);

  return (
    <div className="fixed bottom-6 left-0 right-0 flex justify-between items-end px-6 pointer-events-none z-50">
      {/* 조이스틱 - 크기 증가 및 터치 영역 확대 */}
      <div className="pointer-events-auto">
        <div
          ref={joystickRef}
          className="relative w-36 h-36 bg-black/40 backdrop-blur-md rounded-full border-4 border-white/30 flex items-center justify-center shadow-2xl active:scale-95 transition-all"
          style={{ touchAction: 'none' }}
        >
          <div className="absolute w-24 h-24 bg-white/10 rounded-full" />
          <div
            ref={stickRef}
            className="absolute w-20 h-20 bg-gradient-to-br from-primary via-primary to-primary/90 rounded-full shadow-2xl transition-transform"
            style={{ willChange: 'transform' }}
          />
          <div className="absolute text-white/70 text-sm font-bold pointer-events-none">이동</div>
        </div>
      </div>

      {/* 버튼들 - 크기 증가 */}
      <div className="flex flex-col gap-4 pointer-events-auto">
        {/* 점프 버튼 */}
        <button
          onTouchStart={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onJump();
          }}
          className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-full shadow-2xl border-4 border-white/40 flex flex-col items-center justify-center text-white font-bold active:scale-90 transition-transform"
          style={{ touchAction: 'none' }}
        >
          <span className="text-3xl">⬆️</span>
          <span className="text-xs mt-1">점프</span>
        </button>
      </div>
    </div>
  );
};
