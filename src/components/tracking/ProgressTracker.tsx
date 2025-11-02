import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Minus, Calendar, Brain, Heart, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

interface TestResult {
  id: string;
  test_type: string;
  score: number;
  date: string;
  category: string;
}

interface ProgressTrackerProps {
  results: TestResult[];
  category: string;
}

export const ProgressTracker = ({ results, category }: ProgressTrackerProps) => {
  const navigate = useNavigate();
  
  if (results.length < 2) {
    return (
      <Card className="border-2 border-dashed border-primary/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            변화 추적이 시작됩니다
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            같은 검사를 2회 이상 진행하면 변화를 추적할 수 있습니다.
          </p>
          <Button 
            onClick={() => navigate('/assessment')}
            className="w-full"
          >
            지금 검사하기
          </Button>
        </CardContent>
      </Card>
    );
  }

  const sortedResults = [...results].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  
  const latestResult = sortedResults[0];
  const previousResult = sortedResults[1];
  const scoreDiff = latestResult.score - previousResult.score;
  const percentChange = ((scoreDiff / previousResult.score) * 100).toFixed(1);

  const getTrendIcon = () => {
    if (scoreDiff > 0) return <TrendingUp className="w-5 h-5 text-green-500" />;
    if (scoreDiff < 0) return <TrendingDown className="w-5 h-5 text-red-500" />;
    return <Minus className="w-5 h-5 text-gray-500" />;
  };

  const getTrendMessage = () => {
    if (category === 'depression' || category === 'anxiety') {
      // 우울/불안은 점수가 낮아지는 게 좋음
      if (scoreDiff < 0) return { text: '개선되었습니다! 🎉', color: 'text-green-600' };
      if (scoreDiff > 0) return { text: '주의가 필요합니다', color: 'text-orange-600' };
      return { text: '유지되고 있습니다', color: 'text-gray-600' };
    } else {
      // 일반적으로 점수가 높아지는 게 좋음
      if (scoreDiff > 0) return { text: '향상되었습니다! 🎉', color: 'text-green-600' };
      if (scoreDiff < 0) return { text: '주의가 필요합니다', color: 'text-orange-600' };
      return { text: '유지되고 있습니다', color: 'text-gray-600' };
    }
  };

  const trendMessage = getTrendMessage();

  return (
    <Card className="border-2 border-primary/20 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-primary" />
          변화 추적 리포트
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-6">
        {/* 최신 vs 이전 비교 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">이전 검사</div>
            <div className="text-3xl font-bold text-blue-600">{previousResult.score}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {new Date(previousResult.date).toLocaleDateString('ko-KR')}
            </div>
          </div>
          
          <div className="text-center p-4 bg-primary/10 rounded-lg">
            <div className="text-sm text-muted-foreground mb-1">최근 검사</div>
            <div className="text-3xl font-bold text-primary">{latestResult.score}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {new Date(latestResult.date).toLocaleDateString('ko-KR')}
            </div>
          </div>
        </div>

        {/* 변화 요약 */}
        <div className="flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg">
          {getTrendIcon()}
          <div className="text-center">
            <div className={`text-xl font-bold ${trendMessage.color}`}>
              {trendMessage.text}
            </div>
            <div className="text-sm text-muted-foreground">
              {Math.abs(Number(percentChange))}% {scoreDiff >= 0 ? '증가' : '감소'}
            </div>
          </div>
        </div>

        {/* 히스토리 */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium">검사 히스토리 ({results.length}회)</span>
          </div>
          
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {sortedResults.map((result, index) => (
              <div 
                key={result.id}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <Badge variant={index === 0 ? 'default' : 'secondary'}>
                    {index === 0 ? '최신' : `${index + 1}회`}
                  </Badge>
                  <span className="text-sm">
                    {new Date(result.date).toLocaleDateString('ko-KR')}
                  </span>
                </div>
                <div className="font-bold">{result.score}점</div>
              </div>
            ))}
          </div>
        </div>

        {/* 다음 검사 권장 */}
        <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-200">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-orange-500" />
            <span className="font-bold text-orange-700">다음 검사 권장</span>
          </div>
          <p className="text-sm text-orange-600 mb-3">
            지속적인 변화 추적을 위해 7일 후 재검사를 권장합니다.
          </p>
          <Button 
            onClick={() => navigate('/assessment')}
            className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
          >
            1주일 후 알림 받기
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
