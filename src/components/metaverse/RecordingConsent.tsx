import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface RecordingConsentProps {
  open: boolean;
  onConsent: (consent: boolean) => void;
}

export const RecordingConsent = ({ open, onConsent }: RecordingConsentProps) => {
  const [understood, setUnderstood] = useState(false);

  const handleAccept = () => {
    if (understood) {
      onConsent(true);
    }
  };

  const handleDecline = () => {
    onConsent(false);
  };

  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="bg-background border-border">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-foreground">
            상담 세션 녹음 동의
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground space-y-3">
            <p>
              상담 세션을 녹음하고 저장하려고 합니다. 
              녹음된 내용은 다음과 같이 사용됩니다:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>상담 내용 복습 및 다시듣기</li>
              <li>개인 기록 보관 (로컬 저장)</li>
              <li>상담 품질 개선 참고</li>
            </ul>
            <p className="text-sm font-medium">
              녹음 파일은 귀하의 브라우저에만 저장되며, 
              서버로 전송되지 않습니다.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="flex items-center space-x-2 py-2">
          <Checkbox 
            id="consent" 
            checked={understood}
            onCheckedChange={(checked) => setUnderstood(checked === true)}
          />
          <Label 
            htmlFor="consent"
            className="text-sm text-foreground cursor-pointer"
          >
            위 내용을 이해했으며 녹음에 동의합니다
          </Label>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleDecline}>
            거부
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleAccept}
            disabled={!understood}
          >
            동의하고 시작
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
