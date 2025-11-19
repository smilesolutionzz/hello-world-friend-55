import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { EmotionType } from '@/utils/EmotionDetector';
import { Activity, TrendingUp } from 'lucide-react';

interface EmotionDataPoint {
  timestamp: Date;
  emotion: EmotionType;
  intensity: number;
}

interface EmotionTrendChartProps {
  emotionHistory: EmotionDataPoint[];
}

export const EmotionTrendChart = ({ emotionHistory }: EmotionTrendChartProps) => {
  // 감정을 숫자로 매핑 (시각화용)
  const emotionToScore = (emotion: EmotionType): number => {
    const scores: Record<EmotionType, number> = {
      happy: 5,
      neutral: 3,
      sad: 1,
      angry: 0,
      surprised: 4,
      fearful: 2,
      thinking: 3
    };
    return scores[emotion] || 3;
  };

  const emotionColors: Record<EmotionType, string> = {
    happy: '#10B981',
    neutral: '#6B7280',
    sad: '#3B82F6',
    angry: '#EF4444',
    surprised: '#8B5CF6',
    fearful: '#F59E0B',
    thinking: '#6366F1'
  };

  // 차트 데이터 포맷팅
  const chartData = emotionHistory.map((point, index) => ({
    time: point.timestamp.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
    score: emotionToScore(point.emotion),
    intensity: typeof point.intensity === 'number' && !isNaN(point.intensity) ? point.intensity * 100 : 0,
    emotion: point.emotion,
    index
  }));

  // 평균 감정 점수 계산
  const avgScore = chartData.length > 0
    ? (chartData.reduce((sum, d) => sum + (typeof d.score === 'number' && !isNaN(d.score) ? d.score : 0), 0) / chartData.length).toFixed(1)
    : '0.0';

  // 감정 분포 계산
  const emotionDistribution = emotionHistory.reduce((acc, point) => {
    acc[point.emotion] = (acc[point.emotion] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalCount = emotionHistory.length;

  return (
    <Card className="bg-background border-border p-6 max-w-2xl shadow-2xl">
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">감정 트렌드</h3>
              <p className="text-sm text-muted-foreground">실시간 감정 변화 추이</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">{avgScore}</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              평균 점수
            </div>
          </div>
        </div>

        {/* 차트 */}
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorIntensity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--secondary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--secondary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
              <XAxis 
                dataKey="time" 
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: '12px' }}
                domain={[0, 5]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  padding: '8px'
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                itemStyle={{ color: 'hsl(var(--muted-foreground))' }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="score"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#colorScore)"
                name="감정 점수"
              />
              <Area
                type="monotone"
                dataKey="intensity"
                stroke="hsl(var(--secondary))"
                strokeWidth={2}
                fill="url(#colorIntensity)"
                name="강도 (%)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[200px] flex items-center justify-center text-muted-foreground">
            아직 감정 데이터가 없습니다
          </div>
        )}

        {/* 감정 분포 */}
        {totalCount > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground mb-3">감정 분포</div>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(emotionDistribution).map(([emotion, count]) => {
                const percentage = ((count / totalCount) * 100).toFixed(0);
                const emotionLabels: Record<string, string> = {
                  happy: '😊 행복',
                  neutral: '😐 중립',
                  sad: '😢 슬픔',
                  angry: '😠 화남',
                  surprised: '😲 놀람',
                  fearful: '😰 두려움',
                  thinking: '🤔 생각'
                };
                
                return (
                  <div key={emotion} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: emotionColors[emotion as EmotionType] }}
                    />
                    <span className="text-xs flex-1">{emotionLabels[emotion]}</span>
                    <span className="text-xs font-medium">{percentage}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
