import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSmartBack } from '@/hooks/useSmartBack';
import { useRewards } from '@/hooks/useRewards';
import { RewardPointsHeader } from '@/components/rewards/RewardPointsHeader';
import { AttendanceCheck } from '@/components/rewards/AttendanceCheck';
import { RouletteGame } from '@/components/rewards/RouletteGame';
import { RewardMissions } from '@/components/rewards/RewardMissions';
import { RewardExchange } from '@/components/rewards/RewardExchange';
import { RewardHistory } from '@/components/rewards/RewardHistory';

const RewardsPage = () => {
  const navigate = useNavigate();
  const goBack = useSmartBack('/');
  const {
    points,
    attendance,
    rouletteSpunToday,
    history,
    isLoading,
    checkAttendance,
    spinRoulette,
  } = useRewards();

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/50 via-background to-background">
      <div className="container max-w-md mx-auto px-4 py-6 space-y-5">
        {/* 헤더 */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={goBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold">리워드 센터</h1>
        </div>

        {/* 포인트 잔액 */}
        <RewardPointsHeader balance={points.balance} totalEarned={points.totalEarned} />

        {/* 출석 체크 */}
        <AttendanceCheck
          checkedToday={attendance.checkedToday}
          currentStreak={attendance.currentStreak}
          weekAttendance={attendance.weekAttendance}
          onCheck={checkAttendance}
          isLoading={isLoading}
        />

        {/* 룰렛 */}
        <RouletteGame
          alreadySpun={rouletteSpunToday}
          onSpin={spinRoulette}
          isLoading={isLoading}
        />

        {/* 미션 */}
        <RewardMissions />

        {/* 교환소 */}
        <RewardExchange balance={points.balance} />

        {/* 히스토리 */}
        <RewardHistory history={history} />

        <div className="text-center text-xs text-muted-foreground pb-6">
          포인트는 검사 이용권, 리포트 이용권, 구독 할인으로 교환할 수 있습니다.
        </div>
      </div>
    </div>
  );
};

export default RewardsPage;
