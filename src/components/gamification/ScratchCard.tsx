import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, Sparkles, PartyPopper, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';

interface ScratchCardProps {
  isOpen: boolean;
  onClose: () => void;
}

const ScratchCard: React.FC<ScratchCardProps> = ({ isOpen, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScratching, setIsScratching] = useState(false);
  const [scratchPercentage, setScratchPercentage] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [isWinner, setIsWinner] = useState<boolean | null>(null);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  // 10% 당첨 확률
  useEffect(() => {
    if (isOpen && isWinner === null) {
      const random = Math.random();
      setIsWinner(random < 0.1); // 10% 확률
    }
  }, [isOpen, isWinner]);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when closed
      setScratchPercentage(0);
      setRevealed(false);
      setIsWinner(null);
      lastPos.current = null;
    }
  }, [isOpen]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isOpen) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw scratch layer
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#c0c0c0');
    gradient.addColorStop(0.5, '#d4d4d4');
    gradient.addColorStop(1, '#a8a8a8');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Add some texture
    ctx.fillStyle = '#b0b0b0';
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      ctx.beginPath();
      ctx.arc(x, y, Math.random() * 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Add text
    ctx.font = 'bold 18px sans-serif';
    ctx.fillStyle = '#888';
    ctx.textAlign = 'center';
    ctx.fillText('여기를 긁어주세요! 🎫', canvas.width / 2, canvas.height / 2);
  }, [isOpen]);

  const calculateScratchPercentage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return 0;

    const ctx = canvas.getContext('2d');
    if (!ctx) return 0;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparentPixels = 0;

    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] === 0) transparentPixels++;
    }

    return (transparentPixels / (pixels.length / 4)) * 100;
  };

  const scratch = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const canvasX = (x - rect.left) * (canvas.width / rect.width);
    const canvasY = (y - rect.top) * (canvas.height / rect.height);

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(canvasX, canvasY, 25, 0, Math.PI * 2);
    ctx.fill();

    // Draw line from last position for smoother scratching
    if (lastPos.current) {
      ctx.lineWidth = 50;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(lastPos.current.x, lastPos.current.y);
      ctx.lineTo(canvasX, canvasY);
      ctx.stroke();
    }

    lastPos.current = { x: canvasX, y: canvasY };

    const percentage = calculateScratchPercentage();
    setScratchPercentage(percentage);

    if (percentage > 50 && !revealed) {
      setRevealed(true);
      if (isWinner) {
        // Trigger confetti for winners
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isScratching) return;
    scratch(e.clientX, e.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isScratching) return;
    const touch = e.touches[0];
    scratch(touch.clientX, touch.clientY);
  };

  const handleStart = () => setIsScratching(true);
  const handleEnd = () => {
    setIsScratching(false);
    lastPos.current = null;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="relative w-full max-w-sm bg-gradient-to-br from-amber-100 via-yellow-50 to-amber-100 rounded-2xl shadow-2xl overflow-hidden border-4 border-amber-400"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 text-center relative">
            <button
              onClick={onClose}
              className="absolute right-3 top-3 p-1 hover:bg-white/20 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center justify-center gap-2 mb-1">
              <Sparkles className="w-5 h-5" />
              <span className="font-bold text-lg">🎰 행운의 즉석복권</span>
              <Sparkles className="w-5 h-5" />
            </div>
            <p className="text-sm opacity-90">리포트 생성 축하 이벤트!</p>
          </div>

          {/* Scratch Area */}
          <div className="p-6">
            <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border-2 border-dashed border-amber-400 bg-white">
              {/* Prize Content (hidden under scratch layer) */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                {isWinner ? (
                  <div className="text-center">
                    <PartyPopper className="w-12 h-12 text-amber-500 mx-auto mb-2 animate-bounce" />
                    <h3 className="text-2xl font-bold text-red-500 mb-1">🎉 당첨!</h3>
                    <p className="text-sm text-gray-700 font-medium">
                      20만원 상당<br />
                      <span className="text-lg font-bold text-primary">정식 심리검사 + 전문가 해석</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-2">무료 제공!</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Gift className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                    <h3 className="text-lg font-bold text-gray-500 mb-1">아쉽네요!</h3>
                    <p className="text-sm text-gray-500">
                      다음 기회에 도전하세요 💪
                    </p>
                  </div>
                )}
              </div>

              {/* Scratch Canvas */}
              <canvas
                ref={canvasRef}
                width={300}
                height={225}
                className="absolute inset-0 w-full h-full cursor-pointer touch-none"
                onMouseDown={handleStart}
                onMouseUp={handleEnd}
                onMouseLeave={handleEnd}
                onMouseMove={handleMouseMove}
                onTouchStart={handleStart}
                onTouchEnd={handleEnd}
                onTouchMove={handleTouchMove}
              />
            </div>

            {/* Instructions */}
            <p className="text-center text-sm text-gray-600 mt-3">
              {revealed 
                ? (isWinner 
                    ? '🎊 축하합니다! 아래 안내를 확인하세요' 
                    : '다음에 또 도전해주세요!')
                : '☝️ 손가락으로 긁어서 결과를 확인하세요!'}
            </p>

            {/* Winner Instructions */}
            {revealed && isWinner && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200"
              >
                <h4 className="font-bold text-green-700 mb-2 text-sm">🎁 당첨 수령 방법</h4>
                <ol className="text-xs text-green-800 space-y-1">
                  <li>1️⃣ 이 화면을 <strong>스크린샷</strong> 찍어주세요</li>
                  <li>2️⃣ 아래 카카오톡 문의하기 클릭</li>
                  <li>3️⃣ 스크린샷 첨부 후 문의</li>
                  <li>4️⃣ 정식 심리검사 + 해석 무료 제공!</li>
                </ol>
                <Button
                  className="w-full mt-3 bg-yellow-400 hover:bg-yellow-500 text-black font-bold"
                  onClick={() => window.open('https://open.kakao.com/o/sHLdK3Ch', '_blank')}
                >
                  💬 카카오톡 문의하기
                </Button>
              </motion.div>
            )}

            {/* Close button for non-winners */}
            {revealed && !isWinner && (
              <Button
                variant="outline"
                className="w-full mt-4"
                onClick={onClose}
              >
                닫기
              </Button>
            )}
          </div>

          {/* Footer */}
          <div className="bg-amber-50 px-4 py-2 text-center border-t border-amber-200">
            <p className="text-xs text-amber-700">
              ✨ 10명 중 1명 당첨! 행운을 빕니다 ✨
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ScratchCard;
