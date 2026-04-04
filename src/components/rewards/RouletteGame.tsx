import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, RotateCcw } from 'lucide-react';

interface RouletteGameProps {
  alreadySpun: boolean;
  onSpin: () => Promise<any>;
  isLoading: boolean;
}

const SEGMENTS = [
  { value: 10, label: '₩10', color: 'bg-sky-400', weight: 35 },
  { value: 30, label: '₩30', color: 'bg-emerald-400', weight: 30 },
  { value: 50, label: '₩50', color: 'bg-amber-400', weight: 20 },
  { value: 100, label: '₩100', color: 'bg-purple-400', weight: 10 },
  { value: 200, label: '₩200', color: 'bg-pink-400', weight: 4 },
  { value: 500, label: '₩500', color: 'bg-red-500', weight: 1 },
];

export const RouletteGame: React.FC<RouletteGameProps> = ({ alreadySpun, onSpin, isLoading }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [rotation, setRotation] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const handleSpin = async () => {
    if (isSpinning || alreadySpun) return;
    setIsSpinning(true);
    setShowResult(false);

    // 애니메이션: 빠르게 돌리기
    const spins = 5 + Math.random() * 3;
    const randomDeg = Math.random() * 360;
    const totalRotation = rotation + spins * 360 + randomDeg;
    setRotation(totalRotation);

    // API 호출
    const spinResult = await onSpin();

    // 3초 후 결과 표시
    setTimeout(() => {
      setIsSpinning(false);
      if (spinResult?.points_won) {
        setResult(spinResult.points_won);
        setShowResult(true);
      }
    }, 3000);
  };

  return (
    <div className="bg-card border rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">행운의 룰렛 🎰</h3>
          <p className="text-sm text-muted-foreground">하루 1회! 최대 ₩500 획득</p>
        </div>
        {alreadySpun && (
          <span className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">
            내일 다시 도전!
          </span>
        )}
      </div>

      {/* 룰렛 휠 */}
      <div className="relative flex flex-col items-center">
        <div className="relative w-56 h-56">
          {/* 포인터 */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 z-10">
            <div className="w-0 h-0 border-l-[10px] border-r-[10px] border-t-[16px] border-l-transparent border-r-transparent border-t-red-500" />
          </div>
          
          {/* 휠 */}
          <motion.div
            className="w-full h-full rounded-full border-4 border-amber-300 shadow-xl overflow-hidden relative"
            animate={{ rotate: rotation }}
            transition={{ duration: 3, ease: [0.32, 0.72, 0, 1] }}
          >
            {SEGMENTS.map((seg, i) => {
              const angle = (360 / SEGMENTS.length) * i;
              const skew = 90 - 360 / SEGMENTS.length;
              return (
                <div
                  key={seg.value}
                  className={`absolute top-0 left-1/2 h-1/2 origin-bottom-left ${seg.color}`}
                  style={{
                    width: '50%',
                    transform: `rotate(${angle}deg) skewY(-${skew}deg)`,
                  }}
                >
                  <span
                    className="absolute text-white font-bold text-xs"
                    style={{
                      top: '30%',
                      left: '20%',
                      transform: `skewY(${skew}deg) rotate(${360 / SEGMENTS.length / 2}deg)`,
                    }}
                  >
                    {seg.label}
                  </span>
                </div>
              );
            })}
            {/* 중심 원 */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center z-10">
              <Sparkles className="w-5 h-5 text-amber-500" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* 결과 팝업 */}
      <AnimatePresence>
        {showResult && result && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="text-center py-3"
          >
            <div className="text-sm text-muted-foreground">축하합니다! 🎉</div>
            <div className="text-3xl font-extrabold text-orange-500">₩{result.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">포인트 획득!</div>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        onClick={handleSpin}
        disabled={alreadySpun || isSpinning || isLoading}
        className={`w-full h-12 text-base font-bold rounded-xl ${
          alreadySpun
            ? 'bg-muted text-muted-foreground'
            : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-200'
        }`}
      >
        <RotateCcw className={`w-5 h-5 mr-2 ${isSpinning ? 'animate-spin' : ''}`} />
        {alreadySpun ? '내일 다시 도전!' : isSpinning ? '돌리는 중...' : '룰렛 돌리기'}
      </Button>
    </div>
  );
};
