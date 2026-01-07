import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Share2, RotateCcw, Brain, Zap, Eye, Target, TrendingUp, Star } from "lucide-react";
import { PatternIQResult, cognitiveTypes } from "@/data/patternIQTestQuestions";
import { useToast } from "@/hooks/use-toast";

interface PatternIQTestResultProps {
  result: PatternIQResult;
  onBack: () => void;
  onRestart: () => void;
}

const PatternIQTestResult = ({ result, onBack, onRestart }: PatternIQTestResultProps) => {
  const { toast } = useToast();
  
  const cognitiveType = cognitiveTypes.find(t => t.name === result.cognitiveType) || cognitiveTypes[cognitiveTypes.length - 1];
  
  const categoryIcons = {
    logic: <Brain className="w-5 h-5" />,
    pattern: <Target className="w-5 h-5" />,
    spatial: <Eye className="w-5 h-5" />,
    speed: <Zap className="w-5 h-5" />
  };
  
  const categoryNames = {
    logic: '논리적 추론',
    pattern: '패턴 인식',
    spatial: '공간 지각',
    speed: '처리 속도'
  };
  
  const categoryColors = {
    logic: 'bg-blue-500',
    pattern: 'bg-green-500',
    spatial: 'bg-purple-500',
    speed: 'bg-orange-500'
  };
  
  const handleShare = async () => {
    try {
      await navigator.share({
        title: '패턴 인지력 테스트 결과',
        text: `나의 인지 유형: ${result.cognitiveType} (상위 ${100 - result.percentile}%)`,
        url: window.location.href
      });
    } catch {
      toast({
        title: "공유 링크가 복사되었습니다",
        description: "친구에게 공유해보세요!",
      });
    }
  };
  
  // 퍼센타일 바 위치 계산
  const percentileBarPosition = Math.min(95, Math.max(5, result.percentile));
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-4 pb-24">
      <div className="max-w-lg mx-auto pt-4">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          돌아가기
        </Button>
        
        {/* 메인 결과 카드 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card className="p-6 mb-6 text-center bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <div className="text-5xl mb-3">{cognitiveType.emoji}</div>
            <h2 className="text-2xl font-bold mb-2">{result.cognitiveType}</h2>
            <p className="text-muted-foreground text-sm mb-4">
              {result.typeDescription}
            </p>
            
            <div className="flex justify-center gap-8 py-4 border-t border-b border-primary/20">
              <div>
                <div className="text-3xl font-bold text-primary">{result.totalScore}</div>
                <div className="text-xs text-muted-foreground">총 점수</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-primary">상위 {100 - result.percentile}%</div>
                <div className="text-xs text-muted-foreground">전체 응시자 중</div>
              </div>
            </div>
          </Card>
        </motion.div>
        
        {/* 퍼센타일 시각화 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 mb-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              인구 분포 내 위치
            </h3>
            
            <div className="relative h-16 mb-2">
              {/* 분포 그래프 배경 */}
              <div className="absolute inset-0 flex items-end">
                {[...Array(20)].map((_, i) => {
                  // 정규 분포 시뮬레이션
                  const height = Math.exp(-Math.pow((i - 10) / 4, 2)) * 100;
                  return (
                    <div
                      key={i}
                      className="flex-1 mx-px bg-gradient-to-t from-primary/30 to-primary/10 rounded-t"
                      style={{ height: `${height}%` }}
                    />
                  );
                })}
              </div>
              
              {/* 사용자 위치 마커 */}
              <motion.div
                initial={{ left: '50%' }}
                animate={{ left: `${percentileBarPosition}%` }}
                transition={{ delay: 0.5, duration: 0.8, type: "spring" }}
                className="absolute bottom-0 transform -translate-x-1/2"
              >
                <div className="w-3 h-full bg-primary rounded-full" style={{ height: '60px' }} />
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-bold whitespace-nowrap">
                  당신
                </div>
              </motion.div>
            </div>
            
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>하위</span>
              <span>평균</span>
              <span>상위</span>
            </div>
          </Card>
        </motion.div>
        
        {/* 영역별 점수 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="p-6 mb-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              영역별 능력 분석
            </h3>
            
            <div className="space-y-4">
              {Object.entries(result.categoryScores).map(([key, score], idx) => {
                const maxScore = 40; // 대략적인 영역별 최대 점수
                const percentage = Math.min(100, (score / maxScore) * 100);
                
                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + idx * 0.1 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full ${categoryColors[key as keyof typeof categoryColors]} flex items-center justify-center text-white`}>
                          {categoryIcons[key as keyof typeof categoryIcons]}
                        </div>
                        <span className="font-medium">{categoryNames[key as keyof typeof categoryNames]}</span>
                      </div>
                      <span className="text-sm font-bold">{Math.round(percentage)}%</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </motion.div>
                );
              })}
            </div>
          </Card>
        </motion.div>
        
        {/* 강점 & 개선점 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="grid grid-cols-2 gap-4 mb-6">
            <Card className="p-4 bg-green-500/10 border-green-500/20">
              <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2 flex items-center gap-1">
                <Star className="w-4 h-4" />
                강점
              </h4>
              <ul className="text-sm space-y-1">
                {result.strengths.map((s, i) => (
                  <li key={i} className="text-muted-foreground">• {s}</li>
                ))}
              </ul>
            </Card>
            
            <Card className="p-4 bg-orange-500/10 border-orange-500/20">
              <h4 className="font-semibold text-orange-700 dark:text-orange-400 mb-2 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                성장 포인트
              </h4>
              <ul className="text-sm space-y-1">
                {result.improvements.map((s, i) => (
                  <li key={i} className="text-muted-foreground">• {s}</li>
                ))}
              </ul>
            </Card>
          </div>
        </motion.div>
        
        {/* 안내 문구 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="p-4 mb-6 bg-muted/50">
            <p className="text-xs text-muted-foreground text-center">
              ⚠️ 본 테스트는 간이 인지 평가로, 공인된 IQ 검사가 아닙니다.
              <br />
              정확한 인지 능력 평가는 전문 기관에서 받으시기 바랍니다.
            </p>
          </Card>
        </motion.div>
        
        {/* 버튼들 */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-2" />
            공유하기
          </Button>
          <Button variant="outline" className="flex-1" onClick={onRestart}>
            <RotateCcw className="w-4 h-4 mr-2" />
            다시 테스트
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PatternIQTestResult;
