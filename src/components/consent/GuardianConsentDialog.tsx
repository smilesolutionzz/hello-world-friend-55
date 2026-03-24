import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Shield, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

interface GuardianConsentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConsent: () => void;
  childAge?: number;
}

export const GuardianConsentDialog: React.FC<GuardianConsentDialogProps> = ({
  open,
  onOpenChange,
  onConsent,
  childAge,
}) => {
  const [agreed, setAgreed] = useState(false);
  const [agreedPrivacy, setAgreedPrivacy] = useState(false);

  const handleConsent = () => {
    if (agreed && agreedPrivacy) {
      onConsent();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <DialogTitle>보호자 동의 확인</DialogTitle>
          </div>
          <DialogDescription>
            {childAge && childAge < 14
              ? '14세 미만 아동의 검사를 위해 법정대리인(보호자)의 동의가 필요합니다.'
              : '아동·청소년 검사를 위해 보호자의 동의가 필요합니다.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground space-y-2">
            <p>• 검사 결과는 보호자에게 제공되며, 의료적 진단을 대체하지 않습니다.</p>
            <p>• 수집된 정보는 검사 분석 목적으로만 사용됩니다.</p>
            <p>• 보호자는 언제든 아동의 정보 열람·삭제를 요청할 수 있습니다.</p>
          </div>

          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox
                checked={agreed}
                onCheckedChange={(checked) => setAgreed(checked === true)}
                className="mt-0.5"
              />
              <span className="text-sm">
                보호자로서 아동의 검사 진행에 동의합니다.{' '}
                <Link to="/terms" className="text-primary underline inline-flex items-center gap-0.5" target="_blank">
                  이용약관 <ExternalLink className="w-3 h-3" />
                </Link>
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox
                checked={agreedPrivacy}
                onCheckedChange={(checked) => setAgreedPrivacy(checked === true)}
                className="mt-0.5"
              />
              <span className="text-sm">
                아동의 개인정보 수집·이용에 동의합니다.{' '}
                <Link to="/privacy" className="text-primary underline inline-flex items-center gap-0.5" target="_blank">
                  개인정보처리방침 <ExternalLink className="w-3 h-3" />
                </Link>
              </span>
            </label>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            취소
          </Button>
          <Button 
            className="flex-1" 
            disabled={!agreed || !agreedPrivacy}
            onClick={handleConsent}
          >
            동의 후 검사 시작
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GuardianConsentDialog;
