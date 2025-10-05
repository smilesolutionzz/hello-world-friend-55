import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Sparkles } from 'lucide-react';
import { isBetaPeriod, getBetaMessage } from '@/utils/betaPeriod';

export const BetaBanner = () => {
  if (!isBetaPeriod()) return null;

  return (
    <Alert className="border-2 border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
      <Sparkles className="h-5 w-5 text-purple-600" />
      <AlertTitle className="text-lg font-bold text-purple-900 dark:text-purple-100">
        {getBetaMessage()}
      </AlertTitle>
      <AlertDescription className="text-purple-800 dark:text-purple-200">
        관찰일지, 프리미엄 검사 등 모든 서비스를 무료로 체험해보세요. 🎁
      </AlertDescription>
    </Alert>
  );
};
