import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Timer, Target, Brain, Gamepad2, ArrowLeft } from "lucide-react";
import { childAssessmentGames } from "@/data/assessmentQuestions";
import { AssessmentGame } from "@/types/assessment";

interface ChildAssessmentProps {
  age: number;
  onComplete: (results: Record<string, number>) => void;
  onBack: () => void;
}

const ChildAssessment = ({ age, onComplete, onBack }: ChildAssessmentProps) => {
  // 모든 게임을 평면화
  const allGames: AssessmentGame[] = [
    ...childAssessmentGames.attentionGames,
    ...childAssessmentGames.socialEmotional,
    ...childAssessmentGames.cognitiveTests
  ];

  const [currentGameIndex, setCurrentGameIndex] = useState(0);
  const [gameResults, setGameResults] = useState<Record<string, number>>({});
  const [isGameActive, setIsGameActive] = useState(false);
  const [gameTimer, setGameTimer] = useState(0);
  const [gameScore, setGameScore] = useState(0);

  const currentGame = allGames[currentGameIndex];
  const progress = ((currentGameIndex + 1) / allGames.length) * 100;
  const isLastGame = currentGameIndex === allGames.length - 1;

  // 게임 타이머
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGameActive && gameTimer < currentGame.duration) {
      interval = setInterval(() => {
        setGameTimer(prev => prev + 1);
      }, 1000);
    } else if (gameTimer >= currentGame.duration && isGameActive) {
      // 게임 종료
      completeGame();
    }
    return () => clearInterval(interval);
  }, [isGameActive, gameTimer, currentGame.duration]);

  const startGame = () => {
    setIsGameActive(true);
    setGameTimer(0);
    setGameScore(0);
  };

  const completeGame = () => {
    setIsGameActive(false);
    const finalScore = calculateGameScore();
    const newResults = {
      ...gameResults,
      [currentGame.name]: finalScore
    };
    setGameResults(newResults);

    if (isLastGame) {
      onComplete(newResults);
    } else {
      setTimeout(() => {
        setCurrentGameIndex(prev => prev + 1);
        setGameTimer(0);
        setGameScore(0);
      }, 2000);
    }
  };

  const calculateGameScore = () => {
    // 기본 점수 계산 (실제 게임에서는 더 복잡한 로직 적용)
    const baseScore = Math.min(100, (gameScore / gameTimer) * 100);
    return Math.round(baseScore);
  };

  const handleGameAction = () => {
    // 간단한 게임 액션 시뮬레이션
    if (isGameActive) {
      setGameScore(prev => prev + 10);
    }
  };

  const getCategoryIcon = (gameName: string) => {
    if (gameName.includes('주의') || gameName.includes('스트룹') || gameName.includes('기억')) {
      return Brain;
    } else if (gameName.includes('표정') || gameName.includes('상황')) {
      return Target;
    } else {
      return Gamepad2;
    }
  };

  const getGameDemo = (gameName: string) => {
    const demos = {
      "색깔 스트룹 테스트": (
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-6xl font-bold text-red-500 mb-4">파랑</div>
            <p className="text-sm text-muted-foreground">글자의 색깔을 선택하세요 (의미가 아닌 색깔)</p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Button 
              onClick={handleGameAction}
              className="h-16 bg-red-500 hover:bg-red-600 text-white"
              disabled={!isGameActive}
            >
              빨강
            </Button>
            <Button 
              onClick={handleGameAction}
              className="h-16 bg-blue-500 hover:bg-blue-600 text-white"
              disabled={!isGameActive}
            >
              파랑
            </Button>
            <Button 
              onClick={handleGameAction}
              className="h-16 bg-green-500 hover:bg-green-600 text-white"
              disabled={!isGameActive}
            >
              초록
            </Button>
          </div>
        </div>
      ),
      "작업기억 숫자게임": (
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-4">
              {isGameActive ? "3 7 2 9" : "숫자를 기억하세요"}
            </div>
            <p className="text-sm text-muted-foreground">
              {isGameActive ? "잠시 후 거꾸로 입력하세요" : "시작하면 숫자가 나타납니다"}
            </p>
          </div>
          {isGameActive && (
            <div className="grid grid-cols-4 gap-2">
              {[1,2,3,4,5,6,7,8,9,0].map(num => (
                <Button 
                  key={num}
                  onClick={handleGameAction}
                  variant="outline"
                  className="h-12"
                >
                  {num}
                </Button>
              ))}
            </div>
          )}
        </div>
      ),
      "표정 인식 게임": (
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-8xl mb-4">😊</div>
            <p className="text-sm text-muted-foreground">이 표정의 감정을 선택하세요</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {["기쁨", "슬픔", "화남", "놀람"].map(emotion => (
              <Button 
                key={emotion}
                onClick={handleGameAction}
                variant="outline"
                className="h-12"
                disabled={!isGameActive}
              >
                {emotion}
              </Button>
            ))}
          </div>
        </div>
      )
    };
    
    return demos[gameName as keyof typeof demos] || (
      <div className="text-center p-8">
        <Gamepad2 className="w-16 h-16 mx-auto text-primary mb-4" />
        <p className="text-muted-foreground">게임 준비 중...</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-calm-blue/20 to-soft-mint/30 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-calm-blue/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-32 right-16 w-96 h-96 bg-soft-mint/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 container mx-auto px-6 pt-8 pb-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            뒤로가기
          </Button>
          
          <div className="text-center">
            <div className="text-lg font-semibold text-brand-gradient">
              아동청소년 게임검사 ({age}세)
            </div>
            <div className="text-sm text-muted-foreground">
              {currentGameIndex + 1} / {allGames.length}
            </div>
          </div>
          
          <div className="w-20" /> {/* Spacer */}
        </div>

        {/* Progress Bar */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">진행률</span>
            <span className="text-sm font-semibold text-primary">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        {/* Game Card */}
        <div className="max-w-4xl mx-auto">
          <Card className="overflow-hidden hover-glow">
            <div className="p-8 space-y-6">
              {/* Game Info */}
              <div className="flex items-center gap-4">
                {React.createElement(getCategoryIcon(currentGame.name), {
                  className: "w-8 h-8 text-primary"
                })}
                <div>
                  <h2 className="text-2xl font-bold text-foreground">{currentGame.name}</h2>
                  <p className="text-muted-foreground">{currentGame.description}</p>
                </div>
              </div>

              {/* Game Timer */}
              <div className="flex items-center justify-between bg-primary/10 p-4 rounded-xl">
                <div className="flex items-center gap-2">
                  <Timer className="w-5 h-5 text-primary" />
                  <span className="font-semibold text-primary">
                    {gameTimer} / {currentGame.duration}초
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">현재 점수</div>
                  <div className="text-xl font-bold text-primary">{gameScore}</div>
                </div>
              </div>

              {/* Clinical Info */}
              <div className="bg-soft-mint/20 p-4 rounded-xl">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">측정 영역</h4>
                    <div className="flex flex-wrap gap-2">
                      {currentGame.measurement.map((measure, index) => (
                        <span key={index} className="bg-soft-mint text-soft-mint-foreground px-2 py-1 rounded text-sm">
                          {measure}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">임상적 가치</h4>
                    <p className="text-sm text-muted-foreground">{currentGame.clinicalValue}</p>
                  </div>
                </div>
              </div>

              {/* Game Interface */}
              <div className="bg-background/50 p-6 rounded-xl border-2 border-dashed border-primary/30">
                {!isGameActive && gameTimer === 0 ? (
                  <div className="text-center space-y-4">
                    <h3 className="text-xl font-semibold text-foreground">게임 준비</h3>
                    <p className="text-muted-foreground">
                      {currentGame.duration}초 동안 진행되는 게임입니다. 준비되면 시작 버튼을 눌러주세요.
                    </p>
                    <Button onClick={startGame} className="btn-brand">
                      게임 시작
                    </Button>
                  </div>
                ) : (
                  <div>
                    {gameTimer >= currentGame.duration ? (
                      <div className="text-center space-y-4">
                        <h3 className="text-xl font-semibold text-green-600">게임 완료!</h3>
                        <p className="text-muted-foreground">
                          최종 점수: {calculateGameScore()}점
                        </p>
                      </div>
                    ) : (
                      getGameDemo(currentGame.name)
                    )}
                  </div>
                )}
              </div>

              {/* Age Norms */}
              {currentGame.ageNorms && (
                <div className="bg-calm-blue/20 p-4 rounded-xl">
                  <h4 className="font-semibold text-foreground mb-2">연령별 평균</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                    {Object.entries(currentGame.ageNorms).map(([ageRange, norm]) => (
                      <div key={ageRange} className="text-muted-foreground">
                        <span className="font-medium">{ageRange}:</span> {norm}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ChildAssessment;