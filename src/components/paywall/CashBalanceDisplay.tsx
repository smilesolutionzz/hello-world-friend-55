import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crown, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@/hooks/useSubscription';
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
  const { isPremiumUser, isLifetimeUser, getSubscriptionLabel, loading: subLoading } = useSubscription();

  const isPremium = isPremiumUser() || isLifetimeUser();

  if (subLoading) {
    return <div className="animate-pulse bg-muted rounded-lg h-10 w-32" />;
  }

  if (isPremium) {
    return (
      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white gap-1">
        <Crown className="w-3 h-3" />
        {getSubscriptionLabel()}
      </Badge>
    );
  }

  if (!showSubscribeButton) return null;

  return (
    <Button size="sm" variant="outline" onClick={() => navigate('/subscription')} className="border-yellow-400 text-yellow-700 hover:bg-yellow-50">
      <Crown className="w-4 h-4 mr-1" />
      {isEnglish ? 'Subscribe' : '구독'}
    </Button>
  );
};

export default CashBalanceDisplay;
