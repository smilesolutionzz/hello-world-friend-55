import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Moon, 
  Sun, 
  Clock, 
  TrendingUp,
  Bed,
  Eye,
  BarChart3
} from 'lucide-react';

interface SleepData {
  day: string;
  bedtime: string;
  wakeTime: string;
  duration: number;
  quality: 'poor' | 'fair' | 'good' | 'excellent';
  deepSleep: number;
}

const weeklySleep: SleepData[] = [
  { day: '월', bedtime: '23:30', wakeTime: '07:00', duration: 7.5, quality: 'good', deepSleep: 1.8 },
  { day: '화', bedtime: '23:45', wakeTime: '07:15', duration: 7.5, quality: 'fair', deepSleep: 1.5 },
  { day: '수', bedtime: '00:15', wakeTime: '07:30', duration: 7.25, quality: 'poor', deepSleep: 1.2 },
  { day: '목', bedtime: '23:15', wakeTime: '06:45', duration: 7.5, quality: 'excellent', deepSleep: 2.1 },
  { day: '금', bedtime: '23:45', wakeTime: '07:00', duration: 7.25, quality: 'good', deepSleep: 1.7 },
  { day: '토', bedtime: '00:30', wakeTime: '08:00', duration: 7.5, quality: 'fair', deepSleep: 1.4 },
  { day: '일', bedtime: '23:00', wakeTime: '07:00', duration: 8, quality: 'excellent', deepSleep: 2.3 }
];

const getQualityColor = (quality: string) => {
  switch (quality) {
    case 'poor': return 'bg-red-100 text-red-800 border-red-200';
    case 'fair': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'good': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'excellent': return 'bg-green-100 text-green-800 border-green-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getQualityText = (quality: string) => {
  switch (quality) {
    case 'poor': return '나쁨';
    case 'fair': return '보통';
    case 'good': return '좋음';
    case 'excellent': return '우수';
    default: return '알 수 없음';
  }
};

const SleepGuideChart = () => {
  const avgDuration = weeklySleep.reduce((sum, day) => sum + day.duration, 0) / weeklySleep.length;
  const avgDeepSleep = weeklySleep.reduce((sum, day) => sum + day.deepSleep, 0) / weeklySleep.length;
  const goodSleepDays = weeklySleep.filter(day => day.quality === 'good' || day.quality === 'excellent').length;
  const sleepScore = Math.round((goodSleepDays / weeklySleep.length) * 100);

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Moon className="h-5 w-5 text-blue-600" />
          </div>
          수면 패턴 분석
        </CardTitle>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-blue-600" />
            <span>수면 점수: {sleepScore}점</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-purple-600" />
            <span>평균 수면: {avgDuration.toFixed(1)}시간</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 수면 점수 */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium">수면 품질 점수</span>
            <span className="text-muted-foreground">{sleepScore}/100</span>
          </div>
          <Progress value={sleepScore} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {sleepScore >= 80 ? '우수한 수면 패턴입니다!' : 
             sleepScore >= 60 ? '수면 패턴을 개선해보세요.' : '수면 습관 개선이 필요합니다.'}
          </p>
        </div>

        {/* 일별 수면 패턴 차트 */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            주간 수면 패턴
          </h4>
          <div className="space-y-2">
            {weeklySleep.map((day, index) => (
              <div 
                key={index} 
                className="p-3 rounded-lg border bg-gradient-to-r from-slate-50 to-blue-50 border-slate-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
                      {day.day}
                    </div>
                    <div>
                      <div className="font-medium text-sm">
                        {day.duration}시간 수면
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Bed className="h-3 w-3" />
                        {day.bedtime} → {day.wakeTime}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getQualityColor(day.quality)}>
                      {getQualityText(day.quality)}
                    </Badge>
                  </div>
                </div>
                
                {/* 수면 시간 바 차트 */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>총 수면 시간</span>
                    <span>{day.duration}h</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${(day.duration / 9) * 100}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between text-xs">
                    <span>깊은 잠</span>
                    <span>{day.deepSleep}h</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-purple-600 h-1.5 rounded-full transition-all"
                      style={{ width: `${(day.deepSleep / 3) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 수면 개선 팁 */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-3">
            <Eye className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-blue-900">수면 개선 가이드</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
              <span className="text-blue-700">매일 같은 시간에 잠자리에 들어보세요</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
              <span className="text-blue-700">잠들기 2시간 전부터 스마트폰 사용을 줄여보세요</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
              <span className="text-blue-700">카페인은 오후 2시 이후 피해보세요</span>
            </div>
          </div>
        </div>

        {/* 수면 통계 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-900">{avgDuration.toFixed(1)}h</div>
            <div className="text-xs text-muted-foreground">평균 수면시간</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-900">{avgDeepSleep.toFixed(1)}h</div>
            <div className="text-xs text-muted-foreground">평균 깊은잠</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SleepGuideChart;