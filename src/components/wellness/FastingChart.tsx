import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Timer, 
  Play, 
  Pause, 
  RotateCcw,
  Target,
  TrendingUp,
  Calendar,
  Clock
} from 'lucide-react';

interface FastingSession {
  date: string;
  duration: number;
  goal: number;
  completed: boolean;
}

const FastingChart = () => {
  const [isActive, setIsActive] = useState(false);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [goalHours] = useState(16); // 16:8 간헐적 단식

  // 최근 7일간의 단식 기록 (예시 데이터)
  const fastingHistory: FastingSession[] = [
    { date: '12/18', duration: 16.5, goal: 16, completed: true },
    { date: '12/19', duration: 15.2, goal: 16, completed: false },
    { date: '12/20', duration: 17.1, goal: 16, completed: true },
    { date: '12/21', duration: 16.8, goal: 16, completed: true },
    { date: '12/22', duration: 14.5, goal: 16, completed: false },
    { date: '12/23', duration: 16.3, goal: 16, completed: true },
    { date: '12/24', duration: elapsed / 3600, goal: 16, completed: false }
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && startTime) {
      interval = setInterval(() => {
        setElapsed(Date.now() - startTime);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, startTime]);

  const handleStartPause = () => {
    if (!isActive) {
      setStartTime(Date.now() - elapsed);
      setIsActive(true);
    } else {
      setIsActive(false);
    }
  };

  const handleReset = () => {
    setIsActive(false);
    setElapsed(0);
    setStartTime(null);
  };

  const formatTime = (ms: number) => {
    const hours = Math.floor(ms / 3600000);
    const minutes = Math.floor((ms % 3600000) / 60000);
    return `${hours}시간 ${minutes}분`;
  };

  const currentHours = elapsed / 3600000;
  const progressPercentage = Math.min((currentHours / goalHours) * 100, 100);
  const completedSessions = fastingHistory.filter(session => session.completed).length;
  const avgDuration = fastingHistory.slice(0, -1).reduce((sum, session) => sum + session.duration, 0) / (fastingHistory.length - 1);

  const getPhaseInfo = (hours: number) => {
    if (hours < 12) return { phase: '초기 단계', color: 'text-blue-600', description: '글리코겐 소모 중' };
    if (hours < 16) return { phase: '지방 연소', color: 'text-orange-600', description: '케톤 생성 시작' };
    if (hours < 24) return { phase: '오토파지', color: 'text-green-600', description: '세포 재생 활성화' };
    return { phase: '깊은 케토시스', color: 'text-purple-600', description: '최적 지방 연소' };
  };

  const phaseInfo = getPhaseInfo(currentHours);

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
            <Timer className="h-5 w-5 text-orange-600" />
          </div>
          간헐적 단식 트래커
        </CardTitle>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span>성공률: {Math.round((completedSessions / (fastingHistory.length - 1)) * 100)}%</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-purple-600" />
            <span>평균: {avgDuration.toFixed(1)}시간</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 현재 단식 타이머 */}
        <div className="text-center space-y-4">
          <div className="relative w-32 h-32 mx-auto">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* 배경 원 */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="8"
              />
              {/* 진행률 원 */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="url(#orangeGradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(progressPercentage * 251.2) / 100} 251.2`}
                className="transition-all duration-500"
              />
              <defs>
                <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#ea580c" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-2xl font-bold text-gray-900">
                {Math.floor(currentHours)}h
              </div>
              <div className="text-sm text-muted-foreground">
                {Math.floor((currentHours % 1) * 60)}m
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-lg font-semibold">{formatTime(elapsed)}</div>
            <Badge variant="outline" className={`${phaseInfo.color} border-current`}>
              {phaseInfo.phase}
            </Badge>
            <p className="text-sm text-muted-foreground">{phaseInfo.description}</p>
          </div>

          <div className="flex gap-3 justify-center">
            <Button 
              onClick={handleStartPause}
              variant={isActive ? "outline" : "default"}
              size="sm"
              className="flex items-center gap-2"
            >
              {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isActive ? '일시정지' : '시작'}
            </Button>
            <Button 
              onClick={handleReset}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              리셋
            </Button>
          </div>
        </div>

        {/* 목표 진행률 */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium">목표 진행률 ({goalHours}시간)</span>
            <span className="text-muted-foreground">{progressPercentage.toFixed(1)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* 주간 단식 기록 차트 */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            주간 단식 기록
          </h4>
          <div className="space-y-2">
            {fastingHistory.map((session, index) => (
              <div 
                key={index}
                className={`p-3 rounded-lg border transition-all ${
                  session.completed 
                    ? 'bg-green-50 border-green-200' 
                    : session.duration > 0 
                      ? 'bg-orange-50 border-orange-200'
                      : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      session.completed 
                        ? 'bg-green-600 text-white' 
                        : session.duration > 0
                          ? 'bg-orange-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                    }`}>
                      {session.date.split('/')[1]}
                    </div>
                    <div>
                      <div className="font-medium text-sm">
                        {session.duration > 0 ? `${session.duration.toFixed(1)}시간` : '진행 중'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        목표: {session.goal}시간
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {session.completed && (
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                        완료
                      </Badge>
                    )}
                  </div>
                </div>
                
                {/* 단식 시간 바 차트 */}
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full transition-all ${
                      session.completed ? 'bg-green-600' : 'bg-orange-400'
                    }`}
                    style={{ width: `${Math.min((session.duration / session.goal) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 단식 혜택 정보 */}
        <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-4 w-4 text-orange-600" />
            <span className="font-medium text-orange-900">16:8 단식의 혜택</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-orange-600 rounded-full mt-2 flex-shrink-0" />
              <span className="text-orange-700">체중 감량 및 체지방 감소</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-orange-600 rounded-full mt-2 flex-shrink-0" />
              <span className="text-orange-700">인슐린 민감성 개선</span>
            </div>
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 bg-orange-600 rounded-full mt-2 flex-shrink-0" />
              <span className="text-orange-700">세포 재생 및 노화 방지</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FastingChart;