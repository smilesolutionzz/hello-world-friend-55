import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shuffle, Trophy, Clock } from 'lucide-react';

interface PuzzleGameProps {
  onComplete?: () => void;
  gridSize?: number;
}

export const PuzzleGame = ({ onComplete, gridSize = 3 }: PuzzleGameProps) => {
  const totalTiles = gridSize * gridSize;
  const [tiles, setTiles] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSolved, setIsSolved] = useState(false);

  // 타이머
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && !isSolved) {
      interval = setInterval(() => {
        setTime(t => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isSolved]);

  // 퍼즐 초기화
  const initPuzzle = () => {
    const initialTiles = Array.from({ length: totalTiles }, (_, i) => i);
    const shuffled = shufflePuzzle(initialTiles);
    setTiles(shuffled);
    setMoves(0);
    setTime(0);
    setIsPlaying(true);
    setIsSolved(false);
  };

  // 섞기 (해결 가능한 상태만 생성)
  const shufflePuzzle = (arr: number[]): number[] => {
    const shuffled = [...arr];
    // Fisher-Yates 알고리즘
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    
    // 해결 불가능한 퍼즐인 경우 마지막 두 타일 교환
    if (!isSolvable(shuffled, gridSize)) {
      const lastTwo = shuffled.length - 2;
      [shuffled[lastTwo], shuffled[lastTwo + 1]] = [shuffled[lastTwo + 1], shuffled[lastTwo]];
    }
    
    return shuffled;
  };

  // 해결 가능성 검사
  const isSolvable = (puzzle: number[], size: number): boolean => {
    let inversions = 0;
    for (let i = 0; i < puzzle.length; i++) {
      for (let j = i + 1; j < puzzle.length; j++) {
        if (puzzle[i] > puzzle[j] && puzzle[i] !== 0 && puzzle[j] !== 0) {
          inversions++;
        }
      }
    }
    
    if (size % 2 === 1) {
      return inversions % 2 === 0;
    } else {
      const emptyRow = Math.floor(puzzle.indexOf(0) / size);
      return (inversions + emptyRow) % 2 === 1;
    }
  };

  // 타일 클릭
  const handleTileClick = (index: number) => {
    if (isSolved || !isPlaying) return;
    
    const emptyIndex = tiles.indexOf(0);
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    const emptyRow = Math.floor(emptyIndex / gridSize);
    const emptyCol = emptyIndex % gridSize;
    
    // 인접한 타일인지 확인
    const isAdjacent = 
      (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
      (Math.abs(col - emptyCol) === 1 && row === emptyRow);
    
    if (isAdjacent) {
      const newTiles = [...tiles];
      [newTiles[index], newTiles[emptyIndex]] = [newTiles[emptyIndex], newTiles[index]];
      setTiles(newTiles);
      setMoves(m => m + 1);
      
      // 완성 확인
      const solved = newTiles.every((tile, i) => tile === i);
      if (solved) {
        setIsSolved(true);
        setIsPlaying(false);
        onComplete?.();
      }
    }
  };

  // 시간 포맷
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 타일 색상
  const getTileColor = (num: number) => {
    if (num === 0) return 'bg-transparent';
    const hue = (num * 360) / (totalTiles - 1);
    return `bg-[hsl(${hue},70%,60%)]`;
  };

  useEffect(() => {
    initPuzzle();
  }, []);

  return (
    <Card className="bg-background/95 backdrop-blur-sm border-border p-6 max-w-md">
      <div className="space-y-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            🧩 슬라이딩 퍼즐
          </h3>
          {isSolved && (
            <div className="flex items-center gap-1 text-primary animate-bounce">
              <Trophy className="w-5 h-5" />
              완성!
            </div>
          )}
        </div>

        {/* 통계 */}
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2 flex-1 bg-muted/50 rounded-lg p-2">
            <Shuffle className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">이동:</span>
            <span className="font-medium">{moves}</span>
          </div>
          <div className="flex items-center gap-2 flex-1 bg-muted/50 rounded-lg p-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">시간:</span>
            <span className="font-medium">{formatTime(time)}</span>
          </div>
        </div>

        {/* 퍼즐 그리드 */}
        <div 
          className="grid gap-2 aspect-square"
          style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
        >
          {tiles.map((tile, index) => (
            <button
              key={index}
              onClick={() => handleTileClick(index)}
              className={`
                aspect-square rounded-lg font-bold text-white shadow-lg
                transition-all duration-200 hover:scale-105 active:scale-95
                ${getTileColor(tile)}
                ${tile === 0 ? 'cursor-default' : 'cursor-pointer'}
                ${isSolved && tile !== 0 ? 'animate-pulse' : ''}
              `}
              disabled={tile === 0 || isSolved}
            >
              {tile !== 0 && (
                <span className="text-2xl drop-shadow-lg">{tile}</span>
              )}
            </button>
          ))}
        </div>

        {/* 버튼 */}
        <Button
          onClick={initPuzzle}
          variant={isSolved ? "default" : "outline"}
          className="w-full gap-2"
        >
          <Shuffle className="w-4 h-4" />
          {isSolved ? '다시 시작' : '새로 섞기'}
        </Button>

        {isSolved && (
          <div className="text-center text-sm text-muted-foreground bg-primary/10 rounded-lg p-3">
            🎉 축하합니다! {moves}번 이동으로 {formatTime(time)}에 완성했습니다!
          </div>
        )}
      </div>
    </Card>
  );
};
