import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Heart, 
  AlertTriangle, 
  CheckCircle, 
  Download,
  Share2,
  Home,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

interface CounselingResultProps {
  result: {
    severity: 'low' | 'medium' | 'high';
    mainConcerns: string[];
    positiveAspects: string[];
    recommendation: string;
    answers: Array<{
      question: string;
      answer: string;
      score: number;
    }>;
    ageGroup: string;
    character: string;
    timestamp: Date;
  };
  onRestart: () => void;
  onExit: () => void;
}

export const CounselingResult = ({ result, onRestart, onExit }: CounselingResultProps) => {
  const getSeverityColor = () => {
    switch (result.severity) {
      case 'high': return 'text-red-500 bg-red-500/10 border-red-500/30';
      case 'medium': return 'text-amber-500 bg-amber-500/10 border-amber-500/30';
      default: return 'text-green-500 bg-green-500/10 border-green-500/30';
    }
  };

  const getSeverityIcon = () => {
    switch (result.severity) {
      case 'high': return <AlertTriangle className="w-8 h-8" />;
      case 'medium': return <Heart className="w-8 h-8" />;
      default: return <CheckCircle className="w-8 h-8" />;
    }
  };

  const getSeverityText = () => {
    switch (result.severity) {
      case 'high': return '전문가 상담 권장';
      case 'medium': return '관심이 필요해요';
      default: return '건강하게 잘 지내고 있어요';
    }
  };

  const getOverallScore = () => {
    if (!result.answers || result.answers.length === 0) return 70;
    const avg = result.answers.reduce((sum, a) => sum + a.score, 0) / result.answers.length;
    return Math.round(avg);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-background/95 backdrop-blur p-6 space-y-6">
        {/* 헤더 */}
        <div className="text-center space-y-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${getSeverityColor()}`}
          >
            {getSeverityIcon()}
          </motion.div>
          <h2 className="text-2xl font-bold">상담 결과</h2>
          <p className={`text-lg font-medium ${result.severity === 'high' ? 'text-red-500' : result.severity === 'medium' ? 'text-amber-500' : 'text-green-500'}`}>
            {getSeverityText()}
          </p>
        </div>

        {/* 전체 점수 */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">심리 건강 점수</span>
            <span className="font-bold text-lg">{getOverallScore()}점</span>
          </div>
          <Progress 
            value={getOverallScore()} 
            className="h-3"
          />
        </div>

        {/* 긍정적 측면 */}
        {result.positiveAspects && result.positiveAspects.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              긍정적인 부분
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.positiveAspects.map((aspect, index) => (
                <Badge key={index} variant="secondary" className="bg-green-500/10 text-green-600">
                  {aspect}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* 관심이 필요한 부분 */}
        {result.mainConcerns && result.mainConcerns.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <Heart className="w-4 h-4 text-amber-500" />
              관심이 필요한 부분
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.mainConcerns.map((concern, index) => (
                <Badge key={index} variant="secondary" className="bg-amber-500/10 text-amber-600">
                  {concern}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* 추천사항 */}
        <Card className="p-4 bg-primary/5 border-primary/20">
          <h3 className="font-semibold mb-2 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-primary" />
            추천 사항
          </h3>
          <p className="text-sm text-muted-foreground">
            {result.recommendation}
          </p>
        </Card>

        {/* 답변 요약 */}
        {result.answers && result.answers.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-semibold">응답 요약 ({result.answers.length}개 질문)</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {result.answers.slice(0, 5).map((answer, index) => (
                <div key={index} className="text-sm p-2 rounded bg-muted/50">
                  <p className="text-muted-foreground truncate">{answer.question}</p>
                  <p className="font-medium truncate">{answer.answer}</p>
                </div>
              ))}
              {result.answers.length > 5 && (
                <p className="text-xs text-muted-foreground text-center">
                  +{result.answers.length - 5}개 더 있음
                </p>
              )}
            </div>
          </div>
        )}

        {/* 액션 버튼 */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
          <Button onClick={onRestart} variant="outline" className="flex-1">
            <RefreshCw className="w-4 h-4 mr-2" />
            다시 상담하기
          </Button>
          <Button onClick={onExit} className="flex-1">
            <Home className="w-4 h-4 mr-2" />
            대시보드로 이동
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground">
          * 본 결과는 전문가 지식 기반으로 작성되었으며, 전문 진단을 대체하지 않습니다.
        </p>
      </Card>
    </motion.div>
  );
};
