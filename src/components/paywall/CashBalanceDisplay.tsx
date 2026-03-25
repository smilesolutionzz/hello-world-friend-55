import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Wallet, Plus, Crown, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTokens } from '@/hooks/useTokens';
import { useSubscription } from '@/hooks/useSubscription';
import { formatTokenAsCash } from '@/utils/tokenToCash';
import { useLanguage } from '@/i18n/LanguageContext';

interface CashBalanceDisplayProps {
  compact?: boolean;
  showSubscribeButton?: boolean;
}

export const CashBalanceDisplay = ({ 
  compact = false,
  showSubscribeButton = true 
}: CashBalanceDisplayProps) => {
  const navigate = useNavigate();
  const { isEnglish } = useLanguage();
  const { balance, loading: tokenLoading } = useTokens();
  const { isPremiumUser, isLifetimeUser, getSubscriptionLabel, loading: subLoading } = useSubscription();

  const isPremium = isPremiumUser() || isLifetimeUser();
  const isLoading = tokenLoading || subLoading;

  if (isLoading) {
    return <div className="animate-pulse bg-muted rounded-lg h-10 w-32" />;
  }

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {isPremium ? (
          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white gap-1">
            <Crown className="w-3 h-3" />
            {getSubscriptionLabel()}
          </Badge>
        ) : (
          <Button variant="outline" size="sm" onClick={() => navigate('/token-purchase')} className="h-8 gap-1 border-primary/30">
            <Wallet className="w-3 h-3 text-primary" />
            <span className="font-bold text-primary">{formatTokenAsCash(balance || 0)}</span>
            <Plus className="w-3 h-3" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-xl border border-primary/20">
      {isPremium ? (
        <>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-primary">{getSubscriptionLabel()}</p>
              <p className="text-xs text-muted-foreground">{isEnglish ? 'Unlimited access' : '무제한 이용 가능'}</p>
            </div>
          </div>
          <Badge className="ml-auto bg-green-100 text-green-700 gap-1">
            <Sparkles className="w-3 h-3" />
            ACTIVE
          </Badge>
        </>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">{isEnglish ? 'My Cash' : '내 캐시'}</p>
              <p className="text-lg font-bold text-primary">{formatTokenAsCash(balance || 0)}</p>
            </div>
          </div>
          <div className="ml-auto flex gap-2">
            <Button size="sm" onClick={() => navigate('/token-purchase?type=cash&id=cash_5000&price=5000')} className="bg-gradient-to-r from-primary to-purple-600 hover:opacity-90">
              <Plus className="w-4 h-4 mr-1" />
              {isEnglish ? 'Top Up' : '충전'}
            </Button>
            {showSubscribeButton && (
              <Button size="sm" variant="outline" onClick={() => navigate('/token-subscription')} className="border-yellow-400 text-yellow-700 hover:bg-yellow-50">
                <Crown className="w-4 h-4 mr-1" />
                {isEnglish ? 'Subscribe' : '구독'}
              </Button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CashBalanceDisplay;
