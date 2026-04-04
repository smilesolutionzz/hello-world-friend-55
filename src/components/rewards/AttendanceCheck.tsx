import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, Gift } from 'lucide-react';

interface AttendanceCheckProps {
  checkedToday: boolean;
  currentStreak: number;
  weekAttendance: boolean[];
  onCheck: () => void;
  isLoading: boolean;
}

const DAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'];
const STREAK_REWARDS = [
  { day: 1, points: 10 },
  { day: 2, points: 10 },
  { day: 3, points: 20 },
  { day: 4, points: 20 },
  { day: 5, points: 30 },
  { day: 6, points: 30 },
  { day: 7, points: 50 },
];

export const AttendanceCheck: React.FC<AttendanceCheckProps> = ({
  checkedToday,
  currentStreak,
  weekAttendance,
  onCheck,
  isLoading,
}) => {
  return (
    <div className="bg-card border rounded-2xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">출석 체크</h3>
          <p className="text-sm text-muted-foreground">매일 출석하고 포인트 받기!</p>
        </div>
        <div className="text-right">
          <span className="text-xs text-muted-foreground">연속 출석</span>
          <div className="text-2xl font-bold text-orange-500">{currentStreak}일</div>
        </div>
      </div>

      {/* 7일 출석 달력 */}
      <div className="flex gap-2 justify-between">
        {STREAK_REWARDS.map((reward, i) => {
          const checked = weekAttendance[i];
          const isToday = i === 6;
          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                checked 
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-200' 
                  : isToday 
                    ? 'bg-orange-100 text-orange-500 ring-2 ring-orange-300 animate-pulse' 
                    : 'bg-muted text-muted-foreground'
              }`}>
                {checked ? <Check className="w-4 h-4" /> : `₩${reward.points}`}
              </div>
              <span className="text-[10px] text-muted-foreground">{DAY_LABELS[i]}</span>
            </div>
          );
        })}
      </div>

      <Button
        onClick={onCheck}
        disabled={checkedToday || isLoading}
        className={`w-full h-12 text-base font-bold rounded-xl transition-all ${
          checkedToday
            ? 'bg-muted text-muted-foreground'
            : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg shadow-orange-200'
        }`}
      >
        {checkedToday ? (
          <><Check className="w-5 h-5 mr-2" /> 오늘 출석 완료!</>
        ) : (
          <><Gift className="w-5 h-5 mr-2" /> 출석하기</>
        )}
      </Button>
    </div>
  );
};
