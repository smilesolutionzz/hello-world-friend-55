import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Dumbbell, 
  Clock, 
  Target, 
  TrendingUp,
  Calendar,
  Activity
} from 'lucide-react';

interface ExerciseData {
  day: string;
  exercise: string;
  duration: number;
  intensity: 'low' | 'medium' | 'high';
  calories: number;
  completed?: boolean;
}

const weeklyPlan: ExerciseData[] = [
  { day: '월', exercise: '전신 스트레칭', duration: 20, intensity: 'low', calories: 60, completed: true },
  { day: '화', exercise: '상체 근력 운동', duration: 30, intensity: 'medium', calories: 120, completed: true },
  { day: '수', exercise: '유산소 운동', duration: 25, intensity: 'high', calories: 180, completed: false },
  { day: '목', exercise: '하체 근력 운동', duration: 35, intensity: 'medium', calories: 140, completed: false },
  { day: '금', exercise: '요가 & 명상', duration: 30, intensity: 'low', calories: 80, completed: false },
  { day: '토', exercise: '전신 서킷', duration: 40, intensity: 'high', calories: 200, completed: false },
  { day: '일', exercise: '휴식 / 가벼운 산책', duration: 15, intensity: 'low', calories: 40, completed: false }
];

const getIntensityColor = (intensity: string) => {
  switch (intensity) {
    case 'low': return 'bg-green-100 text-green-800 border-green-200';
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'high': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const ExercisePlanChart = () => {
  const completedDays = weeklyPlan.filter(day => day.completed).length;
  const completionRate = Math.round((completedDays / weeklyPlan.length) * 100);
  const totalCalories = weeklyPlan.reduce((sum, day) => sum + (day.completed ? day.calories : 0), 0);
  const maxCalories = Math.max(...weeklyPlan.map(day => day.calories));

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <Dumbbell className="h-5 w-5 text-green-600" />
          </div>
          주간 운동 계획
        </CardTitle>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span>완료율: {completionRate}%</span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-orange-600" />
            <span>소모 칼로리: {totalCalories}kcal</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 주간 진행률 */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="font-medium">주간 진행률</span>
            <span className="text-muted-foreground">{completedDays}/7일</span>
          </div>
          <Progress value={completionRate} className="h-2" />
        </div>

        {/* 일별 운동 계획 차트 */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            일별 운동 계획
          </h4>
          <div className="space-y-2">
            {weeklyPlan.map((day, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-lg border transition-all ${
                  day.completed 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      day.completed ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {day.day}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{day.exercise}</div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {day.duration}분
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={getIntensityColor(day.intensity)}>
                      {day.intensity === 'low' ? '낮음' : day.intensity === 'medium' ? '보통' : '높음'}
                    </Badge>
                    <span className="text-xs font-medium text-muted-foreground">
                      {day.calories}kcal
                    </span>
                  </div>
                </div>
                
                {/* 칼로리 바 차트 */}
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className={`h-1.5 rounded-full transition-all ${
                      day.completed ? 'bg-green-600' : 'bg-orange-400'
                    }`}
                    style={{ width: `${(day.calories / maxCalories) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 운동 목표 */}
        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-4 w-4 text-green-600" />
            <span className="font-medium text-green-900">이번 주 목표</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-green-700">운동 빈도</div>
              <div className="font-medium text-green-900">주 5회 이상</div>
            </div>
            <div>
              <div className="text-green-700">목표 칼로리</div>
              <div className="font-medium text-green-900">820kcal</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExercisePlanChart;