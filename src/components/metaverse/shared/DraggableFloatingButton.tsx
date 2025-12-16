import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { GripVertical } from 'lucide-react';

interface DraggableFloatingButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  initialPosition?: { x: number; y: number };
  variant?: 'default' | 'outline' | 'ghost';
}

export const DraggableFloatingButton = ({
  onClick,
  children,
  className,
  initialPosition = { x: 50, y: 80 }, // percentage from left, percentage from top
  variant = 'default',
}: DraggableFloatingButtonProps) => {
  const [position, setPosition] = useState(initialPosition);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const elementStartPos = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const deltaX = e.clientX - dragStartPos.current.x;
      const deltaY = e.clientY - dragStartPos.current.y;
      
      const newX = elementStartPos.current.x + (deltaX / window.innerWidth) * 100;
      const newY = elementStartPos.current.y + (deltaY / window.innerHeight) * 100;
      
      // Keep within bounds (5% to 95%)
      setPosition({
        x: Math.max(5, Math.min(95, newX)),
        y: Math.max(5, Math.min(95, newY)),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      
      const touch = e.touches[0];
      const deltaX = touch.clientX - dragStartPos.current.x;
      const deltaY = touch.clientY - dragStartPos.current.y;
      
      const newX = elementStartPos.current.x + (deltaX / window.innerWidth) * 100;
      const newY = elementStartPos.current.y + (deltaY / window.innerHeight) * 100;
      
      setPosition({
        x: Math.max(5, Math.min(95, newX)),
        y: Math.max(5, Math.min(95, newY)),
      });
    };

    const handleTouchEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging]);

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDragging(true);
    
    if ('touches' in e) {
      dragStartPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else {
      dragStartPos.current = { x: e.clientX, y: e.clientY };
    }
    elementStartPos.current = position;
  };

  const handleClick = (e: React.MouseEvent) => {
    // Only trigger click if we weren't dragging
    if (!isDragging) {
      onClick();
    }
  };

  return (
    <div
      ref={dragRef}
      className={cn(
        "fixed z-50 flex items-center gap-1 transition-transform",
        isDragging && "cursor-grabbing scale-105",
      )}
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {/* Drag handle */}
      <div
        onMouseDown={handleDragStart}
        onTouchStart={handleDragStart}
        className={cn(
          "p-2 rounded-l-lg cursor-grab bg-black/60 hover:bg-black/80 text-white/70 hover:text-white transition-colors",
          isDragging && "cursor-grabbing"
        )}
      >
        <GripVertical className="w-4 h-4" />
      </div>
      
      {/* Button */}
      <Button
        onClick={handleClick}
        variant={variant}
        className={cn(
          "rounded-l-none shadow-lg",
          variant === 'default' && "bg-primary hover:bg-primary/90",
          className
        )}
      >
        {children}
      </Button>
    </div>
  );
};

