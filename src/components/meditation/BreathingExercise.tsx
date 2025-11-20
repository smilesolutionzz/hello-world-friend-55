import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface BreathingCircleProps {
  phase: 'inhale' | 'hold' | 'exhale' | 'idle';
  duration: number;
}

export const BreathingCircle: React.FC<BreathingCircleProps> = ({ phase, duration }) => {
  const getCircleStyle = () => {
    const baseStyle = 'transition-all ease-in-out';
    
    switch (phase) {
      case 'inhale':
        return `${baseStyle} w-64 h-64 bg-gradient-to-br from-blue-400 to-purple-500`;
      case 'hold':
        return `${baseStyle} w-64 h-64 bg-gradient-to-br from-purple-400 to-pink-500`;
      case 'exhale':
        return `${baseStyle} w-32 h-32 bg-gradient-to-br from-green-400 to-blue-500`;
      default:
        return `${baseStyle} w-48 h-48 bg-gradient-to-br from-gray-400 to-gray-500`;
    }
  };

  const getPhaseText = () => {
    switch (phase) {
      case 'inhale':
        return '들이마시기';
      case 'hold':
        return '멈추기';
      case 'exhale':
        return '내쉬기';
      default:
        return '준비하세요';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-8 py-12">
      <div
        className={`${getCircleStyle()} rounded-full shadow-2xl flex items-center justify-center`}
        style={{ transitionDuration: `${duration}ms` }}
      >
        <span className="text-white text-2xl font-bold">{getPhaseText()}</span>
      </div>
      
      {phase !== 'idle' && (
        <div className="text-center">
          <p className="text-lg text-muted-foreground">
            {phase === 'inhale' && '코로 천천히 숨을 들이마세요'}
            {phase === 'hold' && '숨을 잠시 멈추세요'}
            {phase === 'exhale' && '입으로 천천히 숨을 내쉬세요'}
          </p>
        </div>
      )}
    </div>
  );
};

interface BreathingExerciseProps {
  pattern: {
    inhale: number;
    hold: number;
    exhale: number;
  };
  cycles: number;
  onComplete?: () => void;
}

export const BreathingExercise: React.FC<BreathingExerciseProps> = ({
  pattern,
  cycles,
  onComplete
}) => {
  const [isActive, setIsActive] = useState(false);
  const [currentCycle, setCurrentCycle] = useState(0);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'idle'>('idle');
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!isActive) return;

    const runCycle = async () => {
      // Inhale
      setPhase('inhale');
      setTimeLeft(pattern.inhale);
      await new Promise(resolve => setTimeout(resolve, pattern.inhale * 1000));

      if (!isActive) return;

      // Hold
      setPhase('hold');
      setTimeLeft(pattern.hold);
      await new Promise(resolve => setTimeout(resolve, pattern.hold * 1000));

      if (!isActive) return;

      // Exhale
      setPhase('exhale');
      setTimeLeft(pattern.exhale);
      await new Promise(resolve => setTimeout(resolve, pattern.exhale * 1000));

      if (!isActive) return;

      setCurrentCycle(prev => {
        const next = prev + 1;
        if (next >= cycles) {
          setIsActive(false);
          setPhase('idle');
          onComplete?.();
          return 0;
        }
        return next;
      });
    };

    runCycle();
  }, [isActive, currentCycle, pattern, cycles, onComplete]);

  useEffect(() => {
    if (!isActive || phase === 'idle') return;

    const interval = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, phase]);

  const start = () => {
    setIsActive(true);
    setCurrentCycle(0);
  };

  const pause = () => {
    setIsActive(false);
    setPhase('idle');
  };

  const reset = () => {
    setIsActive(false);
    setCurrentCycle(0);
    setPhase('idle');
    setTimeLeft(0);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">호흡 가이드</CardTitle>
      </CardHeader>
      <CardContent>
        <BreathingCircle 
          phase={phase} 
          duration={
            phase === 'inhale' ? pattern.inhale * 1000 :
            phase === 'hold' ? pattern.hold * 1000 :
            phase === 'exhale' ? pattern.exhale * 1000 :
            1000
          }
        />

        <div className="text-center space-y-4 mt-8">
          <div className="text-sm text-muted-foreground">
            <p>사이클: {currentCycle + 1} / {cycles}</p>
            {phase !== 'idle' && <p>남은 시간: {timeLeft}초</p>}
          </div>

          <div className="flex justify-center gap-3">
            {!isActive ? (
              <Button onClick={start} size="lg">
                <Play className="w-5 h-5 mr-2" />
                시작
              </Button>
            ) : (
              <Button onClick={pause} variant="secondary" size="lg">
                <Pause className="w-5 h-5 mr-2" />
                일시정지
              </Button>
            )}
            
            <Button onClick={reset} variant="outline" size="lg">
              <RotateCcw className="w-5 h-5 mr-2" />
              초기화
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
