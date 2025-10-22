import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle } from 'lucide-react';

interface TestPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  tokenAmount: number;
  onSuccess: () => void;
  onFail: () => void;
}

const TestPaymentModal: React.FC<TestPaymentModalProps> = ({
  open,
  onOpenChange,
  amount,
  tokenAmount,
  onSuccess,
  onFail,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>테스트 결제</DialogTitle>
          <DialogDescription>실제 결제 없이 흐름만 확인합니다.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg border p-4 bg-muted/40">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">구매 토큰</span>
              <span className="font-semibold">{tokenAmount} 개</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-muted-foreground">결제 금액(가상)</span>
              <span className="font-bold text-lg">₩{amount.toLocaleString()}</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            아래 버튼으로 결제 성공/실패를 시뮬레이션할 수 있습니다.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <Button onClick={onSuccess} className="w-full" size="lg">
              <CheckCircle2 className="w-4 h-4 mr-2" /> 성공으로 테스트
            </Button>
            <Button onClick={onFail} variant="destructive" className="w-full" size="lg">
              <XCircle className="w-4 h-4 mr-2" /> 실패로 테스트
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TestPaymentModal;
