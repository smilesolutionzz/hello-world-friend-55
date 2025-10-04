import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Lock, Zap, TrendingUp } from 'lucide-react';
import { FREE_PLAN_FEATURES } from '@/utils/betaTest';

interface FreePlanLimitsProps {
  currentUsage: {
    basicTests: number;
    observations: number;
  };
}

export default function FreePlanLimits({ currentUsage }: FreePlanLimitsProps) {
  const navigate = useNavigate();

  const isBasicTestsLimitReached = currentUsage.basicTests >= FREE_PLAN_FEATURES.basicTests;
  const isObservationsLimitReached = currentUsage.observations >= FREE_PLAN_FEATURES.observations;

  return (
    <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="w-5 h-5 text-orange-600" />
          무료 플랜 이용 현황
        </CardTitle>
        <CardDescription>
          프리미엄으로 업그레이드하고 무제한으로 이용하세요
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">기본 검사</span>
            <span className={`text-sm font-bold ${isBasicTestsLimitReached ? 'text-red-600' : 'text-gray-700'}`}>
              {currentUsage.basicTests} / {FREE_PLAN_FEATURES.basicTests}회
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all ${isBasicTestsLimitReached ? 'bg-red-500' : 'bg-blue-500'}`}
              style={{ width: `${Math.min((currentUsage.basicTests / FREE_PLAN_FEATURES.basicTests) * 100, 100)}%` }}
            />
          </div>

          <div className="flex justify-between items-center mt-4">
            <span className="text-sm font-medium">관찰일지</span>
            <span className={`text-sm font-bold ${isObservationsLimitReached ? 'text-red-600' : 'text-gray-700'}`}>
              {currentUsage.observations} / {FREE_PLAN_FEATURES.observations}회
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all ${isObservationsLimitReached ? 'bg-red-500' : 'bg-green-500'}`}
              style={{ width: `${Math.min((currentUsage.observations / FREE_PLAN_FEATURES.observations) * 100, 100)}%` }}
            />
          </div>
        </div>

        {(isBasicTestsLimitReached || isObservationsLimitReached) && (
          <Alert className="bg-red-50 border-red-200">
            <AlertDescription className="text-red-800">
              이번 달 무료 사용량을 모두 소진했습니다. 프리미엄으로 업그레이드하시겠습니까?
            </AlertDescription>
          </Alert>
        )}

        <div className="bg-white rounded-lg p-4 space-y-2 border border-gray-200">
          <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            프리미엄 플랜의 혜택
          </p>
          <ul className="text-xs space-y-1 text-gray-600">
            <li>✅ 모든 검사 무제한 이용</li>
            <li>✅ AI 분석 무제한</li>
            <li>✅ 월 1회 전문가 상담</li>
            <li>✅ 무제한 데이터 보관</li>
            <li>✅ 프리미엄 검사 14종 모두 이용</li>
          </ul>
        </div>

        <Button 
          onClick={() => navigate('/subscription')} 
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          프리미엄으로 업그레이드
        </Button>
      </CardContent>
    </Card>
  );
}
