import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Clock, DollarSign } from 'lucide-react';

export const CancellationPolicyInfo = () => {
  return (
    <Card className="border-yellow-200 bg-yellow-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-yellow-800">
          <AlertCircle className="w-5 h-5" />
          취소 및 환불 정책
        </CardTitle>
        <CardDescription>
          예약 취소 시 아래 정책이 적용됩니다
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-green-600 mt-0.5" />
          <div>
            <p className="font-medium text-green-800">24시간 이상 전 취소</p>
            <p className="text-sm text-muted-foreground">
              전액 환불 (100%)
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-orange-600 mt-0.5" />
          <div>
            <p className="font-medium text-orange-800">12-24시간 전 취소</p>
            <p className="text-sm text-muted-foreground">
              50% 환불
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <p className="font-medium text-red-800">12시간 미만 취소</p>
            <p className="text-sm text-muted-foreground">
              환불 불가
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-yellow-200">
          <div className="flex items-start gap-2">
            <DollarSign className="w-4 h-4 text-yellow-700 mt-0.5" />
            <p className="text-xs text-yellow-800">
              환불은 즉시 처리되며, 토큰은 사용자 계정으로 자동 반환됩니다.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
